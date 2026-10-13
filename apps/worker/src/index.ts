import {
  ControlledFetch,
  CredentialInputSchema,
  DiagnosticEvent,
  evaluateExecutionPolicy,
  RedactionContext,
  SupportedIntentId,
  SupportedProviderId,
  diagnoseRawError,
} from '@api-healthlab/core';
import { executeManifestProbe } from '@api-healthlab/provider-kit';
import { ALL_MANIFESTS } from '@api-healthlab/providers';
import { getProviderCatalog, getProviderDetails } from '@api-healthlab/catalog';

export interface Env {
  PUBLIC_WEB_ORIGIN?: string;
  TURNSTILE_SECRET_KEY?: string;
  ENVIRONMENT?: string;
}

const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Cache-Control': 'no-store',
  'Permissions-Policy': 'accelerometer=(), camera=(), geolocation=(), microphone=()',
};

function resolveOrigin(request: Request, env: Env): string {
  const origin = request.headers.get('origin');
  if (env.PUBLIC_WEB_ORIGIN) {
    if (origin === env.PUBLIC_WEB_ORIGIN) {
      return origin;
    }
    return env.PUBLIC_WEB_ORIGIN;
  }
  return origin || '*';
}

function jsonResponse(data: unknown, status = 200, origin = '*'): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json',
      'access-control-allow-origin': origin,
      ...SECURITY_HEADERS,
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = resolveOrigin(request, env);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'access-control-allow-origin': origin,
          'access-control-allow-methods': 'GET, POST, OPTIONS',
          'access-control-allow-headers': 'content-type, cf-turnstile-response',
          'access-control-max-age': '86400',
          ...SECURITY_HEADERS,
        },
      });
    }

    // 1. GET /api/health
    if (url.pathname === '/api/health' && request.method === 'GET') {
      return jsonResponse({
        status: 'ok',
        version: '0.1.0',
        environment: env.ENVIRONMENT || 'production',
        timestamp: new Date().toISOString(),
      }, 200, origin);
    }

    // 2. GET /api/providers
    if (url.pathname === '/api/providers' && request.method === 'GET') {
      const catalog = getProviderCatalog();
      return jsonResponse(catalog, 200, origin);
    }

    // 3. GET /api/providers/:id
    const providerMatch = url.pathname.match(/^\/api\/providers\/([a-zA-Z0-9_-]+)$/);
    if (providerMatch && request.method === 'GET') {
      const providerId = providerMatch[1]!.toLowerCase() as SupportedProviderId;
      const details = getProviderDetails(providerId);
      if (!details) {
        return jsonResponse({ error: `Provider '${providerId}' not found.` }, 404, origin);
      }
      return jsonResponse(details, 200, origin);
    }

    // 4. POST /api/diagnose
    if (url.pathname === '/api/diagnose' && request.method === 'POST') {
      const contentType = request.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        return jsonResponse({ error: 'Content-Type must be application/json' }, 415, origin);
      }

      try {
        const bodyText = await request.text();
        if (bodyText.length > 32 * 1024) {
          return jsonResponse({ error: 'Payload too large (max 32 KiB)' }, 413, origin);
        }

        const body = JSON.parse(bodyText);
        if (!body.rawError || typeof body.rawError !== 'string') {
          return jsonResponse({ error: 'Field rawError (string) is required' }, 400, origin);
        }

        const diagnosis = diagnoseRawError({
          rawError: body.rawError,
          providerId: body.providerId as SupportedProviderId,
        });

        return jsonResponse(diagnosis, 200, origin);
      } catch (err: unknown) {
        return jsonResponse({ error: 'Invalid JSON payload' }, 400, origin);
      }
    }

    // 5. POST /api/test (Hosted Credential Test with NDJSON Streaming)
    if (url.pathname === '/api/test' && request.method === 'POST') {
      const contentType = request.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        return jsonResponse({ error: 'Content-Type must be application/json' }, 415, origin);
      }

      const bodyText = await request.text();
      if (bodyText.length > 32 * 1024) {
        return jsonResponse({ error: 'Payload too large (max 32 KiB)' }, 413, origin);
      }

      let parsedBody: unknown;
      try {
        parsedBody = JSON.parse(bodyText);
      } catch {
        return jsonResponse({ error: 'Invalid JSON payload' }, 400, origin);
      }

      const inputValidation = CredentialInputSchema.safeParse(parsedBody);
      if (!inputValidation.success) {
        return jsonResponse(
          { error: 'Validation failed', details: inputValidation.error.issues },
          400,
          origin,
        );
      }

      const input = inputValidation.data;
      const manifest = ALL_MANIFESTS[input.provider];
      if (!manifest) {
        return jsonResponse({ error: `Unsupported provider: ${input.provider}` }, 400, origin);
      }

      const reqBody = parsedBody as Record<string, unknown>;
      const intentId = (typeof reqBody.intent === 'string' ? reqBody.intent.toUpperCase() : 'LIST_MODELS') as SupportedIntentId;
      const intentConfig = manifest.intents[intentId];
      if (!intentConfig) {
        return jsonResponse({ error: `Unsupported intent '${intentId}' for ${manifest.displayName}` }, 400, origin);
      }

      // Hosted Policy Gate
      const policy = evaluateExecutionPolicy({
        risk: intentConfig.risk,
        sideEffect: intentConfig.sideEffect,
        cost: intentConfig.cost,
        mode: 'HOSTED',
        authorized: reqBody.authorized === true,
        billableAcknowledged: Boolean(reqBody.billableAcknowledged),
      });

      if (policy.decision === 'DENY') {
        return jsonResponse(
          { error: `Policy Denied: ${policy.message}`, reasonCode: policy.reasonCode },
          403,
          origin,
        );
      }

      // Set up NDJSON streaming response
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();
      const encoder = new TextEncoder();

      async function sendEvent(event: DiagnosticEvent) {
        await writer.write(encoder.encode(JSON.stringify(event) + '\n'));
      }

      // Set up redaction context immediately before stream execution
      const redactionCtx = new RedactionContext();
      redactionCtx.register(input.value, `${input.provider.toUpperCase()}_SECRET`);

      // Execute probe in background stream
      (async () => {
        let seq = 0;
        const stepId = `probe-${intentId.toLowerCase()}`;

        // 1. step_started
        await sendEvent({
          type: 'step_started',
          schemaVersion: '1.0.0',
          seq: ++seq,
          stepId,
          timestamp: new Date().toISOString(),
        });

        // 2. ControlledFetch execution
        const allHosts = Object.values(ALL_MANIFESTS).flatMap((m) => m.hosts);
        const controlledFetch = new ControlledFetch(allHosts);

        const stepResult = await executeManifestProbe({
          manifest,
          intentId,
          credential: input.method === 'BEARER_TOKEN'
            ? { type: 'BEARER_TOKEN', token: input.value }
            : { type: 'API_KEY', key: input.value },
          controlledFetch,
        });

        // 3. step_completed
        await sendEvent({
          type: 'step_completed',
          schemaVersion: '1.0.0',
          seq: ++seq,
          stepId,
          state: stepResult.state,
          status: stepResult.status,
          evidence: stepResult.evidence,
          durationMs: stepResult.durationMs,
          timestamp: new Date().toISOString(),
        });

        // 4. final
        await sendEvent({
          type: 'final',
          schemaVersion: '1.0.0',
          seq: ++seq,
          result: {
            runId: crypto.randomUUID(),
            providerId: input.provider,
            intentId,
            mode: 'HOSTED',
            runState: 'COMPLETED',
            overall: stepResult.state === 'PASS' ? 'HEALTHY' : (stepResult.state === 'FAIL' ? 'FAILED' : 'INCONCLUSIVE'),
            primaryStatus: stepResult.status,
            reasonCode: stepResult.reasonCode,
            summary: `${manifest.displayName} probe finished with status ${stepResult.status}.`,
            steps: [stepResult],
            evidence: stepResult.evidence,
            whatWasProved: stepResult.state === 'PASS' ? [`Credential can perform ${intentId} on ${manifest.displayName}`] : [],
            whatWasNotProved: ['Does not prove write or mutation permissions.', 'Does not verify unlimited quota.'],
            engineVersion: '0.1.0',
            resultSchemaVersion: '1.0.0',
            aggregationPolicyVersion: '1.0.0',
            completedAt: new Date().toISOString(),
          },
          timestamp: new Date().toISOString(),
        });

        await writer.close();
      })().catch(async (err) => {
        try {
          const rawMessage = err instanceof Error ? err.message : String(err);
          const sanitizedMessage = redactionCtx.redactString(rawMessage);
          await writer.write(encoder.encode(JSON.stringify({ error: sanitizedMessage }) + '\n'));
          await writer.close();
        } catch {
          // Stream already closed
        }
      });

      return new Response(readable, {
        headers: {
          'content-type': 'application/x-ndjson',
          'access-control-allow-origin': origin,
          ...SECURITY_HEADERS,
        },
      });
    }

    return jsonResponse({ error: 'Endpoint not found' }, 404, origin);
  },
};
