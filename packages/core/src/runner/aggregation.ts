import {
  DiagnosticStatus,
  Evidence,
  ExecutionMode,
  OverallOutcome,
  RunResult,
  RunState,
  StepResult,
  SupportedIntentId,
  SupportedProviderId,
} from '../schemas/index.js';

export interface AggregateRunParams {
  runId: string;
  providerId: SupportedProviderId;
  intentId: SupportedIntentId;
  mode: ExecutionMode;
  steps: StepResult[];
  clientAborted?: boolean;
  policyBlocked?: boolean;
  policyReasonCode?: string;
  policyMessage?: string;
}

export function getDefaultOverallForStatus(status: DiagnosticStatus): OverallOutcome {
  switch (status) {
    case 'HEALTHY':
      return 'HEALTHY';
    case 'INVALID_CREDENTIAL':
    case 'KEY_TYPE_MISMATCH':
    case 'PERMISSION_DENIED':
    case 'INSUFFICIENT_SCOPE':
    case 'QUOTA_EXHAUSTED':
    case 'BILLING_REQUIRED':
    case 'MODEL_UNAVAILABLE':
    case 'ENDPOINT_MISCONFIGURED':
      return 'FAILED';
    case 'RATE_LIMITED':
    case 'ORIGIN_RESTRICTED':
    case 'REGION_BLOCKED':
    case 'NETWORK_TIMEOUT':
    case 'TRANSIENT_PROVIDER_ERROR':
    case 'REDIRECT_BLOCKED':
    case 'UNKNOWN':
      return 'INCONCLUSIVE';
    case 'UNSUPPORTED_INTENT':
      return 'SKIPPED';
  }
}

export function generateRemediation(
  status: DiagnosticStatus,
  providerId: SupportedProviderId,
): string[] {
  switch (status) {
    case 'INVALID_CREDENTIAL':
      return [
        `Check if the API key for ${providerId} was revoked or expired.`,
        'Ensure the key has no extraneous spaces, newlines, or formatting characters.',
        'Regenerate a new key in the provider console and update your secret store.',
      ];
    case 'PERMISSION_DENIED':
    case 'INSUFFICIENT_SCOPE':
      return [
        `The credential is authenticated but lacks required scopes for this intent on ${providerId}.`,
        'Verify IAM roles, API key restrictions, or project permissions in the provider console.',
      ];
    case 'QUOTA_EXHAUSTED':
    case 'BILLING_REQUIRED':
      return [
        `Check your billing status and payment method in the ${providerId} dashboard.`,
        'If on a free tier, verify if the monthly or credit allowance has been reached.',
      ];
    case 'RATE_LIMITED':
      return [
        'Temporarily throttle outbound requests to respect provider rate limits.',
        'Implement exponential backoff or verify requests per minute (RPM) limits.',
      ];
    case 'NETWORK_TIMEOUT':
    case 'TRANSIENT_PROVIDER_ERROR':
      return [
        'The provider API or network connection did not complete within the timeout budget.',
        'Check upstream service status or retry from a different network connection.',
      ];
    case 'MODEL_UNAVAILABLE':
      return [
        'Check if the target model ID or endpoint path is deprecated or misspelled.',
      ];
    default:
      return ['Consult provider documentation and verify endpoint configurations.'];
  }
}

export function aggregateRunResult(params: AggregateRunParams): RunResult {
  const {
    runId,
    providerId,
    intentId,
    mode,
    steps,
    clientAborted,
    policyBlocked,
    policyReasonCode,
    policyMessage,
  } = params;

  // 1. Policy Blocked
  if (policyBlocked) {
    return {
      runId,
      providerId,
      intentId,
      mode,
      runState: 'BLOCKED',
      overall: 'SKIPPED',
      primaryStatus: 'UNSUPPORTED_INTENT',
      reasonCode: policyReasonCode ?? 'POLICY_DENIED',
      summary: policyMessage ?? 'Execution was blocked by policy gates prior to credential usage.',
      steps: [],
      evidence: [],
      whatWasProved: [],
      whatWasNotProved: ['The credential was never sent to the provider.'],
      suggestedRemediation: ['Adjust execution mode or verify required consents.'],
      engineVersion: '0.1.0',
      resultSchemaVersion: '1.0.0',
      aggregationPolicyVersion: '1.0.0',
      completedAt: new Date().toISOString(),
    };
  }

  // 2. Client Aborted
  if (clientAborted) {
    return {
      runId,
      providerId,
      intentId,
      mode,
      runState: 'ABORTED',
      overall: 'INCONCLUSIVE',
      primaryStatus: 'UNKNOWN',
      reasonCode: 'CLIENT_ABORTED',
      summary: 'Diagnostic run was cancelled by the client.',
      steps,
      evidence: steps.flatMap((s) => s.evidence),
      whatWasProved: [],
      whatWasNotProved: ['Probe was aborted before completing verification.'],
      suggestedRemediation: ['Re-run the diagnostic without cancelling.'],
      engineVersion: '0.1.0',
      resultSchemaVersion: '1.0.0',
      aggregationPolicyVersion: '1.0.0',
      completedAt: new Date().toISOString(),
    };
  }

  // 3. Collect step evidences
  const allEvidence: Evidence[] = steps.flatMap((s) => s.evidence);

  // Find root failure if any
  const failedStep = steps.find((s) => s.state === 'FAIL');
  const inconclusiveStep = steps.find((s) => s.state === 'INCONCLUSIVE');
  const skippedStep = steps.find((s) => s.state === 'SKIPPED');

  let runState: RunState = 'COMPLETED';
  let overall: OverallOutcome = 'HEALTHY';
  let primaryStatus: DiagnosticStatus = 'HEALTHY';
  let reasonCode = 'PROBE_SUCCEEDED';
  let summary = `Credential successfully performed ${intentId} on ${providerId}.`;

  if (failedStep) {
    primaryStatus = failedStep.status;
    overall = getDefaultOverallForStatus(primaryStatus);
    reasonCode = failedStep.reasonCode;
    summary = `Diagnostic failed during ${failedStep.stepId}: ${reasonCode}`;
  } else if (inconclusiveStep) {
    primaryStatus = inconclusiveStep.status;
    overall = 'INCONCLUSIVE';
    reasonCode = inconclusiveStep.reasonCode;
    summary = `Diagnostic was inconclusive during ${inconclusiveStep.stepId}: ${reasonCode}`;
  } else if (skippedStep) {
    primaryStatus = skippedStep.status;
    overall = 'SKIPPED';
    reasonCode = skippedStep.reasonCode;
    summary = `Diagnostic step was skipped: ${reasonCode}`;
  }

  const whatWasProved: string[] = [];
  const whatWasNotProved: string[] = [
    'Does not prove the credential can perform unselected or write/mutation actions.',
    'Does not prove the credential has unlimited balance or quota.',
    'Does not guarantee future provider availability or absence of IP restrictions elsewhere.',
  ];

  if (overall === 'HEALTHY') {
    whatWasProved.push(`Credential is valid for ${intentId} operations on ${providerId}.`);
    whatWasProved.push('Network transport and authentication headers were accepted.');
  } else {
    whatWasProved.push(`Observed failure root cause: ${primaryStatus} (${reasonCode}).`);
  }

  return {
    runId,
    providerId,
    intentId,
    mode,
    runState,
    overall,
    primaryStatus,
    reasonCode,
    summary,
    steps,
    evidence: allEvidence,
    whatWasProved,
    whatWasNotProved,
    suggestedRemediation: overall !== 'HEALTHY' ? generateRemediation(primaryStatus, providerId) : undefined,
    engineVersion: '0.1.0',
    resultSchemaVersion: '1.0.0',
    aggregationPolicyVersion: '1.0.0',
    completedAt: new Date().toISOString(),
  };
}
