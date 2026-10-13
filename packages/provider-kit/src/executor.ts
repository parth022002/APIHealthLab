import {
  AuthCredential,
  ControlledFetch,
  DiagnosticStatus,
  Evidence,
  SecretValue,
  StepResult,
  SupportedIntentId,
  TargetContext,
} from '@api-healthlab/core';
import { ErrorMatcher, ProviderManifest } from './manifest-schema.js';

export interface ExecuteProbeParams {
  manifest: ProviderManifest;
  intentId: SupportedIntentId;
  target?: TargetContext;
  credential: AuthCredential;
  controlledFetch: ControlledFetch;
}

export function classifyResponse(
  status: number,
  bodyJson: unknown,
  matchers: ErrorMatcher[],
): { status: DiagnosticStatus; reasonCode: string; description: string } {
  // 1. Structured matcher checks
  const bodyRecord = typeof bodyJson === 'object' && bodyJson !== null ? (bodyJson as Record<string, unknown>) : null;
  const errorObj = bodyRecord && typeof bodyRecord.error === 'object' && bodyRecord.error !== null
    ? (bodyRecord.error as Record<string, unknown>)
    : null;
  const errorCode =
    errorObj && typeof errorObj.code === 'string'
      ? errorObj.code
      : errorObj && typeof errorObj.type === 'string'
        ? errorObj.type
        : bodyRecord && typeof bodyRecord.code === 'string'
          ? bodyRecord.code
          : bodyRecord && typeof bodyRecord.type === 'string'
            ? bodyRecord.type
            : undefined;

  const errorMessage =
    errorObj && typeof errorObj.message === 'string'
      ? errorObj.message
      : bodyRecord && typeof bodyRecord.message === 'string'
        ? bodyRecord.message
        : undefined;

  for (const matcher of matchers) {
    if (matcher.statusCode && matcher.statusCode !== status) continue;
    if (matcher.errorCode && matcher.errorCode !== errorCode) continue;
    if (matcher.messageRegex) {
      if (!errorMessage || !new RegExp(matcher.messageRegex, 'i').test(errorMessage)) {
        continue;
      }
    }

    return {
      status: matcher.status,
      reasonCode: matcher.reasonCode,
      description: matcher.description ?? `Matched provider error pattern: ${matcher.reasonCode}`,
    };
  }

  // 2. Generic HTTP Status Fallback
  if (status >= 200 && status < 300) {
    return {
      status: 'HEALTHY',
      reasonCode: 'REQUEST_SUCCESS',
      description: `Provider returned HTTP ${status} success.`,
    };
  }
  if (status === 401) {
    return {
      status: 'INVALID_CREDENTIAL',
      reasonCode: 'HTTP_401_UNAUTHORIZED',
      description: 'Provider rejected the credential as invalid or unauthorized.',
    };
  }
  if (status === 403) {
    return {
      status: 'PERMISSION_DENIED',
      reasonCode: 'HTTP_403_FORBIDDEN',
      description: 'The credential lacks permission for the requested operation or resource.',
    };
  }
  if (status === 404) {
    return {
      status: 'MODEL_UNAVAILABLE',
      reasonCode: 'HTTP_404_NOT_FOUND',
      description: 'The requested resource, model, or endpoint was not found.',
    };
  }
  if (status === 429) {
    return {
      status: 'RATE_LIMITED',
      reasonCode: 'HTTP_429_RATE_LIMITED',
      description: 'Rate limit reached or quota exhausted.',
    };
  }
  if (status >= 500) {
    return {
      status: 'TRANSIENT_PROVIDER_ERROR',
      reasonCode: `HTTP_${status}_SERVER_ERROR`,
      description: `Provider service returned HTTP ${status} error.`,
    };
  }

  return {
    status: 'UNKNOWN',
    reasonCode: `HTTP_${status}_UNCLASSIFIED`,
    description: `HTTP ${status} response could not be classified.`,
  };
}

export async function executeManifestProbe(params: ExecuteProbeParams): Promise<StepResult> {
  const { manifest, intentId, credential, controlledFetch } = params;
  const startTime = Date.now();

  // 1. Check provider lifecycle kill-switch BEFORE secret materialization
  if (manifest.lifecycle === 'DISABLED' || manifest.lifecycle === 'REMOVED') {
    return {
      stepId: `probe-${intentId.toLowerCase()}`,
      state: 'SKIPPED',
      status: 'UNSUPPORTED_INTENT',
      reasonCode: 'PROVIDER_DISABLED',
      evidence: [],
      durationMs: 0,
    };
  }

  // 2. Check if intent is supported
  const intentConfig = manifest.intents[intentId];
  if (!intentConfig) {
    return {
      stepId: `probe-${intentId.toLowerCase()}`,
      state: 'SKIPPED',
      status: 'UNSUPPORTED_INTENT',
      reasonCode: 'UNSUPPORTED_INTENT',
      evidence: [],
      durationMs: 0,
    };
  }

  // 3. Materialize credential safely inside auth header construction
  const rawSecret = credential.type === 'API_KEY' ? credential.key : credential.token;
  const secret = new SecretValue(rawSecret, credential.type);

  const headerName = (credential.type === 'API_KEY' && credential.headerName)
    ? credential.headerName
    : manifest.auth.defaultHeader;

  const headerValue = manifest.auth.headerFormat
    ? manifest.auth.headerFormat.replace('{token}', secret.reveal()).replace('{key}', secret.reveal())
    : secret.reveal();

  const primaryHost = manifest.hosts[0]!;
  const targetUrl = `https://${primaryHost}${intentConfig.path}`;

  try {
    const response = await controlledFetch.execute(targetUrl, {
      method: intentConfig.method,
      headers: {
        [headerName]: headerValue,
        accept: 'application/json',
      },
    });

    const durationMs = Date.now() - startTime;
    const classification = classifyResponse(response.status, response.json, intentConfig.matchers);

    // Build allowlisted evidence
    const evidence: Evidence[] = [
      {
        sourceType: 'TRANSPORT',
        sourceLocator: 'http.status',
        observedValue: response.status,
        strength: 'HIGH',
        observedAt: new Date().toISOString(),
        description: `HTTP status code: ${response.status}`,
      },
    ];

    if (classification.status === 'HEALTHY') {
      evidence.push({
        sourceType: 'PROVIDER_RESPONSE',
        sourceLocator: 'response.intent_verified',
        observedValue: true,
        strength: 'HIGH',
        observedAt: new Date().toISOString(),
        description: `${intentId} succeeded on ${manifest.displayName}`,
      });
    } else {
      evidence.push({
        sourceType: 'PROVIDER_RESPONSE',
        sourceLocator: 'provider.classification',
        observedValue: classification.reasonCode,
        strength: 'HIGH',
        observedAt: new Date().toISOString(),
        description: classification.description,
      });
    }

    const state = classification.status === 'HEALTHY'
      ? 'PASS'
      : (classification.status === 'RATE_LIMITED' || classification.status === 'TRANSIENT_PROVIDER_ERROR'
          ? 'INCONCLUSIVE'
          : 'FAIL');

    return {
      stepId: `probe-${intentId.toLowerCase()}`,
      state,
      status: classification.status,
      reasonCode: classification.reasonCode,
      evidence,
      durationMs,
    };
  } catch (err: unknown) {
    const durationMs = Date.now() - startTime;
    const msg = err instanceof Error ? err.message : String(err);
    const isTimeout = msg.includes('timeout');

    return {
      stepId: `probe-${intentId.toLowerCase()}`,
      state: 'INCONCLUSIVE',
      status: isTimeout ? 'NETWORK_TIMEOUT' : 'TRANSIENT_PROVIDER_ERROR',
      reasonCode: isTimeout ? 'NETWORK_TIMEOUT' : 'CONNECTION_ERROR',
      evidence: [
        {
          sourceType: 'LOCAL_RUNTIME',
          sourceLocator: 'runtime.error',
          observedValue: isTimeout ? 'Timeout exceeded' : 'Network failure',
          strength: 'MEDIUM',
          observedAt: new Date().toISOString(),
          description: msg.slice(0, 256),
        },
      ],
      durationMs,
    };
  }
}
