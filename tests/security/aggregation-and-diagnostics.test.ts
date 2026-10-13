import { describe, expect, it } from 'vitest';
import { diagnoseRawError } from '../../packages/core/src/diagnostics/error-diagnosis.js';
import { aggregateRunResult } from '../../packages/core/src/runner/aggregation.js';

describe('P0 Security Test: Aggregation & Error Diagnosis Engine', () => {
  describe('RunResult Aggregation Lifecycle', () => {
    it('correctly maps client abort to runState=ABORTED, overall=INCONCLUSIVE, CLIENT_ABORTED', () => {
      const result = aggregateRunResult({
        runId: '11111111-2222-3333-4444-555555555555',
        providerId: 'openai',
        intentId: 'LIST_MODELS',
        mode: 'LOCAL',
        steps: [],
        clientAborted: true,
      });

      expect(result.runState).toBe('ABORTED');
      expect(result.overall).toBe('INCONCLUSIVE');
      expect(result.reasonCode).toBe('CLIENT_ABORTED');
      expect(result.whatWasNotProved).toContain('Probe was aborted before completing verification.');
    });

    it('correctly maps policy blocked to runState=BLOCKED, overall=SKIPPED', () => {
      const result = aggregateRunResult({
        runId: '11111111-2222-3333-4444-555555555555',
        providerId: 'github',
        intentId: 'IDENTITY',
        mode: 'HOSTED',
        steps: [],
        policyBlocked: true,
        policyReasonCode: 'HOSTED_RISK_DENIED',
        policyMessage: 'Hosted diagnostics do not permit R2 credentials.',
      });

      expect(result.runState).toBe('BLOCKED');
      expect(result.overall).toBe('SKIPPED');
      expect(result.reasonCode).toBe('HOSTED_RISK_DENIED');
      expect(result.whatWasNotProved).toContain('The credential was never sent to the provider.');
    });

    it('aggregates step failure and generates actionable remediation', () => {
      const result = aggregateRunResult({
        runId: '11111111-2222-3333-4444-555555555555',
        providerId: 'openai',
        intentId: 'LIST_MODELS',
        mode: 'LOCAL',
        steps: [
          {
            stepId: 'probe-models',
            state: 'FAIL',
            status: 'INVALID_CREDENTIAL',
            reasonCode: 'INVALID_API_KEY',
            evidence: [
              {
                sourceType: 'TRANSPORT',
                sourceLocator: 'http.status',
                observedValue: 401,
                strength: 'HIGH',
                observedAt: new Date().toISOString(),
              },
            ],
            durationMs: 120,
          },
        ],
      });

      expect(result.overall).toBe('FAILED');
      expect(result.primaryStatus).toBe('INVALID_CREDENTIAL');
      expect(result.reasonCode).toBe('INVALID_API_KEY');
      expect(result.suggestedRemediation).toBeDefined();
      expect(result.suggestedRemediation?.some((r) => r.includes('revoked or expired'))).toBe(true);
    });
  });

  describe('Offline Rule-based Error Diagnosis', () => {
    it('accurately diagnoses OpenAI invalid API key', () => {
      const diagnosis = diagnoseRawError({
        rawError: 'Error: Incorrect API key provided: sk-test-1234. You can find your API key at ...',
      });

      expect(diagnosis.status).toBe('INVALID_CREDENTIAL');
      expect(diagnosis.reasonCode).toBe('INVALID_API_KEY');
      expect(diagnosis.detectedProvider).toBe('openai');
    });

    it('accurately diagnoses Google Gemini invalid key', () => {
      const diagnosis = diagnoseRawError({
        rawError: '{ "error": { "code": 400, "message": "API key not valid. Please pass a valid API key." } }',
      });

      expect(diagnosis.status).toBe('INVALID_CREDENTIAL');
      expect(diagnosis.reasonCode).toBe('API_KEY_INVALID');
      expect(diagnosis.detectedProvider).toBe('gemini');
    });

    it('accurately diagnoses Google Gemini geographic region restriction', () => {
      const diagnosis = diagnoseRawError({
        rawError: 'User location is not supported for the API use.',
      });

      expect(diagnosis.status).toBe('REGION_BLOCKED');
      expect(diagnosis.reasonCode).toBe('REGION_NOT_SUPPORTED');
    });

    it('accurately diagnoses GitHub Bad credentials', () => {
      const diagnosis = diagnoseRawError({
        rawError: '{ "message": "Bad credentials", "documentation_url": "https://docs.github.com/rest" }',
      });

      expect(diagnosis.status).toBe('INVALID_CREDENTIAL');
      expect(diagnosis.reasonCode).toBe('BAD_CREDENTIALS');
      expect(diagnosis.detectedProvider).toBe('github');
    });

    it('accurately diagnoses GitHub token scope insufficiency', () => {
      const diagnosis = diagnoseRawError({
        rawError: 'Resource not accessible by personal access token',
      });

      expect(diagnosis.status).toBe('INSUFFICIENT_SCOPE');
      expect(diagnosis.reasonCode).toBe('INSUFFICIENT_TOKEN_SCOPE');
    });
  });
});
