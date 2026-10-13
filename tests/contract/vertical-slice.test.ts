import { describe, expect, it, vi } from 'vitest';
import { ControlledFetch } from '../../packages/core/src/network/controlled-fetch.js';
import { executeManifestProbe } from '../../packages/provider-kit/src/executor.js';
import { geminiManifest, githubManifest, openaiManifest } from '../../packages/providers/src/index.js';

describe('Phase 0 Vertical Slice: Contract & Adapter Tests', () => {
  const allowedHosts = [
    'api.openai.com',
    'generativelanguage.googleapis.com',
    'api.github.com',
  ];

  describe('OpenAI LIST_MODELS', () => {
    it('successfully classifies HTTP 200 response as HEALTHY with allowlisted evidence', async () => {
      const mockFetch = vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            data: [{ id: 'gpt-4o' }, { id: 'gpt-4o-mini' }],
          }),
          {
            status: 200,
            headers: { 'content-type': 'application/json' },
          },
        ),
      );

      const cf = new ControlledFetch(allowedHosts, mockFetch as unknown as typeof fetch);
      const result = await executeManifestProbe({
        manifest: openaiManifest,
        intentId: 'LIST_MODELS',
        credential: { type: 'API_KEY', key: 'sk-test-valid-key' },
        controlledFetch: cf,
      });

      expect(result.state).toBe('PASS');
      expect(result.status).toBe('HEALTHY');
      expect(result.reasonCode).toBe('REQUEST_SUCCESS');
      expect(result.evidence.length).toBeGreaterThanOrEqual(2);
      expect(result.evidence[0]?.sourceLocator).toBe('http.status');
      expect(result.evidence[0]?.observedValue).toBe(200);

      // Verify the auth header was formed correctly
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[0]).toBe('https://api.openai.com/v1/models');
      expect(callArgs[1].headers.authorization).toBe('Bearer sk-test-valid-key');
    });

    it('correctly classifies invalid_api_key structured error as INVALID_CREDENTIAL', async () => {
      const mockFetch = vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: {
              message: 'Incorrect API key provided: sk-invalid. You can find your API key at ...',
              type: 'invalid_request_error',
              code: 'invalid_api_key',
            },
          }),
          {
            status: 401,
            headers: { 'content-type': 'application/json' },
          },
        ),
      );

      const cf = new ControlledFetch(allowedHosts, mockFetch as unknown as typeof fetch);
      const result = await executeManifestProbe({
        manifest: openaiManifest,
        intentId: 'LIST_MODELS',
        credential: { type: 'API_KEY', key: 'sk-invalid' },
        controlledFetch: cf,
      });

      expect(result.state).toBe('FAIL');
      expect(result.status).toBe('INVALID_CREDENTIAL');
      expect(result.reasonCode).toBe('INVALID_API_KEY');
    });
  });

  describe('Google Gemini Invalid-Key Fixture', () => {
    it('classifies Google Gemini 400 API_KEY_INVALID error correctly', async () => {
      const mockFetch = vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: {
              code: 400,
              message: 'API key not valid. Please pass a valid API key.',
              status: 'INVALID_ARGUMENT',
            },
          }),
          {
            status: 400,
            headers: { 'content-type': 'application/json' },
          },
        ),
      );

      const cf = new ControlledFetch(allowedHosts, mockFetch as unknown as typeof fetch);
      const result = await executeManifestProbe({
        manifest: geminiManifest,
        intentId: 'LIST_MODELS',
        credential: { type: 'API_KEY', key: 'AIzaSyFakeInvalidKey' },
        controlledFetch: cf,
      });

      expect(result.state).toBe('FAIL');
      expect(result.status).toBe('INVALID_CREDENTIAL');
      expect(result.reasonCode).toBe('API_KEY_INVALID');
      expect(result.evidence.some((e) => e.observedValue === 'API_KEY_INVALID')).toBe(true);

      // Verify Google Gemini uses x-goog-api-key header
      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[0]).toBe('https://generativelanguage.googleapis.com/v1beta/models');
      expect(callArgs[1].headers['x-goog-api-key']).toBe('AIzaSyFakeInvalidKey');
    });
  });

  describe('GitHub IDENTITY (Local-first)', () => {
    it('classifies HTTP 200 user profile as HEALTHY', async () => {
      const mockFetch = vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            login: 'octocat',
            id: 1,
            type: 'User',
          }),
          {
            status: 200,
            headers: { 'content-type': 'application/json' },
          },
        ),
      );

      const cf = new ControlledFetch(allowedHosts, mockFetch as unknown as typeof fetch);
      const result = await executeManifestProbe({
        manifest: githubManifest,
        intentId: 'IDENTITY',
        credential: { type: 'BEARER_TOKEN', token: 'ghp_validToken123' },
        controlledFetch: cf,
      });

      expect(result.state).toBe('PASS');
      expect(result.status).toBe('HEALTHY');
      expect(result.reasonCode).toBe('REQUEST_SUCCESS');

      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[0]).toBe('https://api.github.com/user');
      expect(callArgs[1].headers.authorization).toBe('Bearer ghp_validToken123');
    });

    it('classifies HTTP 401 Bad credentials as INVALID_CREDENTIAL', async () => {
      const mockFetch = vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            message: 'Bad credentials',
            documentation_url: 'https://docs.github.com/rest',
          }),
          {
            status: 401,
            headers: { 'content-type': 'application/json' },
          },
        ),
      );

      const cf = new ControlledFetch(allowedHosts, mockFetch as unknown as typeof fetch);
      const result = await executeManifestProbe({
        manifest: githubManifest,
        intentId: 'IDENTITY',
        credential: { type: 'BEARER_TOKEN', token: 'ghp_badToken' },
        controlledFetch: cf,
      });

      expect(result.state).toBe('FAIL');
      expect(result.status).toBe('INVALID_CREDENTIAL');
      expect(result.reasonCode).toBe('BAD_CREDENTIALS');
    });
  });

  describe('Kill-Switch & Boundary Invariants', () => {
    it('proves a DISABLED provider emits zero outbound network requests and returns SKIPPED', async () => {
      const mockFetch = vi.fn();
      const cf = new ControlledFetch(allowedHosts, mockFetch as unknown as typeof fetch);

      const disabledManifest = {
        ...openaiManifest,
        lifecycle: 'DISABLED' as const,
      };

      const result = await executeManifestProbe({
        manifest: disabledManifest,
        intentId: 'LIST_MODELS',
        credential: { type: 'API_KEY', key: 'sk-secret' },
        controlledFetch: cf,
      });

      expect(result.state).toBe('SKIPPED');
      expect(result.reasonCode).toBe('PROVIDER_DISABLED');
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });
});
