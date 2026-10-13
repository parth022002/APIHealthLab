import { describe, expect, it, vi } from 'vitest';
import { ControlledFetch } from '../../packages/core/src/network/controlled-fetch.js';
import { executeManifestProbe } from '../../packages/provider-kit/src/executor.js';
import { validateProviderManifest } from '../../packages/provider-kit/src/validator.js';
import {
  ALL_MANIFESTS,
  anthropicManifest,
  groqManifest,
  mistralManifest,
  openrouterManifest,
} from '../../packages/providers/src/index.js';

describe('Phase 3: All 7 Providers Manifest & Contract Tests', () => {
  const allHosts = Object.values(ALL_MANIFESTS).flatMap((m) => m.hosts);

  it('validates all provider manifests without any security or schema errors', () => {
    expect(Object.keys(ALL_MANIFESTS)).toHaveLength(23);
    for (const [id, manifest] of Object.entries(ALL_MANIFESTS)) {
      const lint = validateProviderManifest(manifest);
      expect(lint.valid, `Manifest for ${id} has errors: ${lint.errors.join('; ')}`).toBe(true);
      expect(lint.errors).toHaveLength(0);
    }
  });

  describe('Anthropic Adapter Contracts', () => {
    it('classifies successful HTTP 200 response as HEALTHY', async () => {
      const mockFetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ data: [{ id: 'claude-3-opus' }] }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      );

      const cf = new ControlledFetch(allHosts, mockFetch as unknown as typeof fetch);
      const result = await executeManifestProbe({
        manifest: anthropicManifest,
        intentId: 'LIST_MODELS',
        credential: { type: 'API_KEY', key: 'sk-ant-valid-key' },
        controlledFetch: cf,
      });

      expect(result.state).toBe('PASS');
      expect(result.status).toBe('HEALTHY');
      expect(mockFetch.mock.calls[0][1].headers['x-api-key']).toBe('sk-ant-valid-key');
    });

    it('classifies authentication_error as INVALID_CREDENTIAL', async () => {
      const mockFetch = vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: { type: 'authentication_error', message: 'invalid x-api-key' },
          }),
          { status: 401, headers: { 'content-type': 'application/json' } },
        ),
      );

      const cf = new ControlledFetch(allHosts, mockFetch as unknown as typeof fetch);
      const result = await executeManifestProbe({
        manifest: anthropicManifest,
        intentId: 'LIST_MODELS',
        credential: { type: 'API_KEY', key: 'sk-ant-invalid' },
        controlledFetch: cf,
      });

      expect(result.state).toBe('FAIL');
      expect(result.status).toBe('INVALID_CREDENTIAL');
      expect(result.reasonCode).toBe('ANTHROPIC_AUTH_ERROR');
    });

    it('classifies credit balance too low as BILLING_REQUIRED', async () => {
      const mockFetch = vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: {
              type: 'invalid_request_error',
              message: 'Your credit balance is too low to access the Claude API.',
            },
          }),
          { status: 400, headers: { 'content-type': 'application/json' } },
        ),
      );

      const cf = new ControlledFetch(allHosts, mockFetch as unknown as typeof fetch);
      const result = await executeManifestProbe({
        manifest: anthropicManifest,
        intentId: 'LIST_MODELS',
        credential: { type: 'API_KEY', key: 'sk-ant-low-balance' },
        controlledFetch: cf,
      });

      expect(result.state).toBe('FAIL');
      expect(result.status).toBe('BILLING_REQUIRED');
      expect(result.reasonCode).toBe('CREDIT_BALANCE_LOW');
    });
  });

  describe('Mistral AI Adapter Contracts', () => {
    it('classifies unauthorized as INVALID_CREDENTIAL', async () => {
      const mockFetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: 'Unauthorized' }), {
          status: 401,
          headers: { 'content-type': 'application/json' },
        }),
      );

      const cf = new ControlledFetch(allHosts, mockFetch as unknown as typeof fetch);
      const result = await executeManifestProbe({
        manifest: mistralManifest,
        intentId: 'LIST_MODELS',
        credential: { type: 'API_KEY', key: 'invalid-mistral' },
        controlledFetch: cf,
      });

      expect(result.state).toBe('FAIL');
      expect(result.status).toBe('INVALID_CREDENTIAL');
      expect(result.reasonCode).toBe('UNAUTHORIZED');
    });
  });

  describe('Groq Adapter Contracts', () => {
    it('classifies invalid_api_key as INVALID_CREDENTIAL', async () => {
      const mockFetch = vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: { message: 'Invalid API Key', code: 'invalid_api_key' },
          }),
          { status: 401, headers: { 'content-type': 'application/json' } },
        ),
      );

      const cf = new ControlledFetch(allHosts, mockFetch as unknown as typeof fetch);
      const result = await executeManifestProbe({
        manifest: groqManifest,
        intentId: 'LIST_MODELS',
        credential: { type: 'BEARER_TOKEN', token: 'gsk_invalid' },
        controlledFetch: cf,
      });

      expect(result.state).toBe('FAIL');
      expect(result.status).toBe('INVALID_CREDENTIAL');
      expect(result.reasonCode).toBe('INVALID_API_KEY');
    });
  });

  describe('OpenRouter Adapter Contracts', () => {
    it('classifies HTTP 402 payment required as BILLING_REQUIRED', async () => {
      const mockFetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: 'Payment Required: credit balance empty' }), {
          status: 402,
          headers: { 'content-type': 'application/json' },
        }),
      );

      const cf = new ControlledFetch(allHosts, mockFetch as unknown as typeof fetch);
      const result = await executeManifestProbe({
        manifest: openrouterManifest,
        intentId: 'LIST_MODELS',
        credential: { type: 'API_KEY', key: 'sk-or-unfunded' },
        controlledFetch: cf,
      });

      expect(result.state).toBe('FAIL');
      expect(result.status).toBe('BILLING_REQUIRED');
      expect(result.reasonCode).toBe('PAYMENT_REQUIRED');
    });
  });
});
