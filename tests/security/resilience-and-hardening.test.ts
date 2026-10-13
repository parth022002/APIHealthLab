import { describe, expect, it } from 'vitest';
import {
  ControlledFetch,
  CredentialInputSchema,
  ApiKeyCredentialSchema,
  RedactionContext,
  evaluateExecutionPolicy,
} from '../../packages/core/src/index.js';
import worker from '../../apps/worker/src/index.js';

describe('Attack Simulation & Security Hardening Tests', () => {
  const allowedHosts = ['api.openai.com', 'generativelanguage.googleapis.com', 'api.anthropic.com'];

  describe('1. CRLF & Header Splitting Injection Attacks', () => {
    it('blocks CRLF injection attempts in headerName via CredentialInputSchema', () => {
      const maliciousInputs = [
        'Authorization\r\nInjected-Header: evil',
        'X-API-Key\nSet-Cookie: stolen=1',
        'Header; evil',
        'Header Name With Spaces',
        'Header<script>',
      ];

      for (const badHeader of maliciousInputs) {
        const result = CredentialInputSchema.safeParse({
          provider: 'openai',
          method: 'API_KEY',
          value: 'sk-proj-valid-length-key-12345',
          headerName: badHeader,
        });
        expect(result.success).toBe(false);
      }
    });

    it('blocks CRLF injection attempts in ApiKeyCredentialSchema', () => {
      const result = ApiKeyCredentialSchema.safeParse({
        type: 'API_KEY',
        key: 'sk-test-key',
        headerName: 'X-Custom\r\nEvil: true',
      });
      expect(result.success).toBe(false);
    });

    it('accepts legitimate, clean header names', () => {
      const goodHeaders = ['Authorization', 'x-api-key', 'X-OpenAI-Key', 'api_key'];
      for (const goodHeader of goodHeaders) {
        const result = CredentialInputSchema.safeParse({
          provider: 'openai',
          method: 'API_KEY',
          value: 'sk-proj-valid-key-12345',
          headerName: goodHeader,
        });
        expect(result.success).toBe(true);
      }
    });
  });

  describe('2. Payload Bloat & Memory Exhaustion Attacks', () => {
    it('rejects oversized credential values exceeding 4096 characters', () => {
      const oversizedSecret = 'A'.repeat(5000);
      const result = CredentialInputSchema.safeParse({
        provider: 'openai',
        method: 'API_KEY',
        value: oversizedSecret,
      });
      expect(result.success).toBe(false);
    });

    it('enforces request body size limits in ControlledFetch (max 32 KiB)', async () => {
      const cf = new ControlledFetch(allowedHosts);
      const oversizedBody = 'X'.repeat(33 * 1024);

      await expect(
        cf.execute('https://api.openai.com/v1/models', {
          method: 'POST',
          body: oversizedBody,
        }),
      ).rejects.toThrow(/Request body exceeds maximum allowed size/);
    });

    it('enforces response payload limit in ControlledFetch (max 128 KiB)', async () => {
      const oversizedResponse = 'B'.repeat(130 * 1024);
      const mockFetch = async () =>
        new Response(oversizedResponse, {
          status: 200,
          headers: { 'content-type': 'text/plain' },
        });

      const cf = new ControlledFetch(allowedHosts, mockFetch as unknown as typeof fetch);
      await expect(cf.execute('https://api.openai.com/v1/models')).rejects.toThrow(
        /Provider response exceeded maximum allowed payload size/,
      );
    });
  });

  describe('3. SSRF & Protocol Smuggling Attacks', () => {
    const cf = new ControlledFetch(allowedHosts);

    it('rejects protocol downgrades to http://', () => {
      expect(() => cf.validateUrl('http://api.openai.com/v1/models')).toThrow(
        /Insecure protocol/,
      );
    });

    it('rejects file://, gopher://, and javascript: pseudo-protocols', () => {
      expect(() => cf.validateUrl('file:///etc/passwd')).toThrow(/Insecure protocol/);
      expect(() => cf.validateUrl('javascript:alert(1)')).toThrow(/Insecure protocol/);
    });

    it('rejects unapproved external hosts (SSRF prevention)', () => {
      const untrustedTargets = [
        'https://attacker-c2.com/exfiltrate',
        'https://google.com/search',
        'https://webhook.site/test',
      ];
      for (const target of untrustedTargets) {
        expect(() => cf.validateUrl(target)).toThrow(/Host '.*' is not in the allowlist/);
      }
    });

    it('rejects localhost, private IPs, and cloud metadata addresses', () => {
      const privateTargets = [
        'https://127.0.0.1/v1/models',
        'https://169.254.169.254/latest/meta-data',
        'https://10.0.0.1/',
        'https://192.168.1.1/',
        'https://[::1]/',
      ];
      for (const target of privateTargets) {
        expect(() => cf.validateUrl(target)).toThrow();
      }
    });

    it('rejects userinfo injection', () => {
      expect(() => cf.validateUrl('https://admin:pass@api.openai.com/v1/models')).toThrow(
        /Userinfo credentials in URL are strictly forbidden/,
      );
    });

    it('rejects port manipulation', () => {
      expect(() => cf.validateUrl('https://api.openai.com:8443/v1/models')).toThrow(
        /Non-standard port forbidden/,
      );
    });
  });

  describe('4. Secret Leakage & Redaction Under Attack', () => {
    it('guarantees that secrets in exception messages or stack traces are redacted', () => {
      const secret = 'sk-proj-super-secret-production-token-998877';
      const ctx = new RedactionContext();
      ctx.register(secret, 'OPENAI_SECRET');

      const simulatedError = new Error(
        `Failed to reach upstream provider with token ${secret} at https://api.openai.com`,
      );

      const redacted = ctx.redactString(simulatedError.message);
      expect(redacted).not.toContain(secret);
      expect(redacted).toContain('[REDACTED_OPENAI_SECRET]');
    });

    it('redacts sensitive fields in nested JSON response objects', () => {
      const ctx = new RedactionContext();
      const payload = {
        status: 401,
        headers: {
          authorization: 'Bearer sk-secret-12345',
          apiKey: 'key-abc',
        },
        provider: 'openai',
      };

      const redacted = ctx.redactValue(payload);
      expect(redacted.headers.authorization).toBe('[REDACTED_FIELD]');
      expect(redacted.headers.apiKey).toBe('[REDACTED_FIELD]');
    });
  });

  describe('5. Worker Defense & Abuse Resistance', () => {
    it('returns 413 when incoming payload exceeds 32 KiB', async () => {
      const oversized = JSON.stringify({ rawError: 'A'.repeat(33 * 1024) });
      const req = new Request('https://worker.local/api/diagnose', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: oversized,
      });

      const res = await worker.fetch(req, {});
      expect(res.status).toBe(413);
    });

    it('returns 415 when Content-Type is not application/json', async () => {
      const req = new Request('https://worker.local/api/diagnose', {
        method: 'POST',
        headers: { 'content-type': 'text/plain' },
        body: 'error message',
      });

      const res = await worker.fetch(req, {});
      expect(res.status).toBe(415);
    });

    it('returns 400 when body contains malformed JSON', async () => {
      const req = new Request('https://worker.local/api/diagnose', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{ malformed: json, missing quotes }',
      });

      const res = await worker.fetch(req, {});
      expect(res.status).toBe(400);
    });

    it('enforces execution policy denial with 403 on unapproved executions', async () => {
      const policy = evaluateExecutionPolicy({
        risk: 'RW_CRITICAL',
        sideEffect: 'MUTATING',
        cost: 'EXPENSIVE',
        mode: 'HOSTED',
        authorized: false,
        billableAcknowledged: false,
      });

      expect(policy.decision).toBe('DENY');
    });

    it('returns defensive security headers on all responses', async () => {
      const req = new Request('https://worker.local/api/health', { method: 'GET' });
      const res = await worker.fetch(req, {});

      expect(res.headers.get('x-content-type-options')).toBe('nosniff');
      expect(res.headers.get('x-frame-options')).toBe('DENY');
      expect(res.headers.get('referrer-policy')).toBe('no-referrer');
      expect(res.headers.get('cache-control')).toContain('no-store');
    });
  });
});
