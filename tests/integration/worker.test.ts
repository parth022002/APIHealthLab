import { describe, it, expect } from 'vitest';
import worker from '../../apps/worker/src/index.js';

describe('Worker Edge Boundary Integration Tests', () => {
  it('GET /api/health returns 200 with service health info and security headers', async () => {
    const request = new Request('https://worker.internal/api/health', {
      method: 'GET',
      headers: { Origin: 'https://apihealthlab.com' },
    });

    const response = await worker.fetch(request, { ENVIRONMENT: 'test' });
    expect(response.status).toBe(200);

    // Verify security headers
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.get('access-control-allow-origin')).toBe('https://apihealthlab.com');

    const data = (await response.json()) as Record<string, unknown>;
    expect(data.status).toBe('ok');
    expect(data.version).toBe('0.1.0');
    expect(data.environment).toBe('test');
    expect(data.timestamp).toBeDefined();
  });

  it('OPTIONS preflight returns 204 with strict CORS headers', async () => {
    const request = new Request('https://worker.internal/api/probe', {
      method: 'OPTIONS',
      headers: { Origin: 'https://apihealthlab.com' },
    });

    const response = await worker.fetch(request, {});
    expect(response.status).toBe(204);
    expect(response.headers.get('access-control-allow-origin')).toBe('https://apihealthlab.com');
    expect(response.headers.get('access-control-allow-methods')).toContain('POST');
  });

  it('GET /api/providers returns all 7 MVP verified providers', async () => {
    const request = new Request('https://worker.internal/api/providers', {
      method: 'GET',
    });

    const response = await worker.fetch(request, {});
    expect(response.status).toBe(200);

    const catalog = (await response.json()) as Array<{ id: string; displayName: string }>;
    expect(Array.isArray(catalog)).toBe(true);
    expect(catalog.length).toBeGreaterThanOrEqual(7);

    const ids = catalog.map((p) => p.id);
    expect(ids).toContain('openai');
    expect(ids).toContain('anthropic');
    expect(ids).toContain('gemini');
    expect(ids).toContain('mistral');
    expect(ids).toContain('groq');
    expect(ids).toContain('openrouter');
    expect(ids).toContain('github');
  });

  it('GET /api/providers/:id returns 200 for known provider and 404 for unknown', async () => {
    const reqOk = new Request('https://worker.internal/api/providers/openai', { method: 'GET' });
    const resOk = await worker.fetch(reqOk, {});
    expect(resOk.status).toBe(200);
    const details = (await resOk.json()) as { displayName: string };
    expect(details.displayName).toBe('OpenAI');

    const reqMissing = new Request('https://worker.internal/api/providers/nonexistent', { method: 'GET' });
    const resMissing = await worker.fetch(reqMissing, {});
    expect(resMissing.status).toBe(404);
  });

  it('POST /api/diagnose diagnoses raw error strings without credentials', async () => {
    const request = new Request('https://worker.internal/api/diagnose', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        rawError: 'Incorrect API key provided: sk-proj-1234567890',
        providerId: 'openai',
      }),
    });

    const response = await worker.fetch(request, {});
    expect(response.status).toBe(200);

    const diag = (await response.json()) as { status: string; reasonCode: string };
    expect(diag.status).toBe('INVALID_CREDENTIAL');
    expect(diag.reasonCode).toBe('INVALID_API_KEY');
  });

  it('POST /api/diagnose rejects non-JSON requests with 415', async () => {
    const request = new Request('https://worker.internal/api/diagnose', {
      method: 'POST',
      headers: { 'content-type': 'text/plain' },
      body: 'bad text',
    });

    const response = await worker.fetch(request, {});
    expect(response.status).toBe(415);
  });

  it('POST /api/test rejects request when authorized is false', async () => {
    const request = new Request('https://worker.internal/api/test', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        provider: 'openai',
        method: 'API_KEY',
        value: 'sk-test',
        intent: 'LIST_MODELS',
        authorized: false,
      }),
    });

    const response = await worker.fetch(request, {});
    expect(response.status).toBe(403);
    const err = (await response.json()) as { error: string };
    expect(err.error).toContain('Policy Denied');
  });

  it('POST /api/test rejects request when provider does not exist', async () => {
    const request = new Request('https://worker.internal/api/test', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        provider: 'invalid-provider',
        method: 'API_KEY',
        value: 'test',
        authorized: true,
      }),
    });

    const response = await worker.fetch(request, {});
    expect(response.status).toBe(400);
  });
});
