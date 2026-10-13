import { describe, expect, it } from 'vitest';
import { ControlledFetch } from '../../packages/core/src/network/controlled-fetch.js';

describe('ControlledFetch Network Boundary', () => {
  const allowedHosts = ['api.openai.com', 'generativelanguage.googleapis.com', 'api.github.com'];

  it('rejects insecure HTTP protocols', () => {
    const cf = new ControlledFetch(allowedHosts);
    expect(() => cf.validateUrl('http://api.openai.com/v1/models')).toThrow(
      /Insecure protocol/,
    );
  });

  it('rejects unapproved hosts', () => {
    const cf = new ControlledFetch(allowedHosts);
    expect(() => cf.validateUrl('https://malicious-site.example.com/api')).toThrow(
      /not in the allowlist/,
    );
  });

  it('rejects IP literals and non-standard ports', () => {
    const cf = new ControlledFetch(allowedHosts);
    expect(() => cf.validateUrl('https://192.168.1.1/v1/models')).toThrow(/IP literals/);
    expect(() => cf.validateUrl('https://api.openai.com:8080/v1/models')).toThrow(
      /Non-standard port/,
    );
  });

  it('strips forbidden headers and injects standard User-Agent', () => {
    const cf = new ControlledFetch(allowedHosts);
    const sanitized = cf.sanitizeHeaders({
      Cookie: 'session=123',
      'X-Forwarded-For': '1.2.3.4',
      Authorization: 'Bearer test-key',
      Accept: 'application/json',
    });

    expect(sanitized).toHaveProperty('user-agent', 'API-HealthLab/0.1.0');
    expect(sanitized).toHaveProperty('authorization', 'Bearer test-key');
    expect(sanitized).toHaveProperty('accept', 'application/json');
    expect(sanitized).not.toHaveProperty('cookie');
    expect(sanitized).not.toHaveProperty('x-forwarded-for');
  });

  it('executes outbound request through injected port and validates JSON payload', async () => {
    const mockFetch = async () =>
      new Response(JSON.stringify({ data: [{ id: 'gpt-4o' }] }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });

    const cf = new ControlledFetch(allowedHosts, mockFetch as unknown as typeof fetch);
    const resp = await cf.execute('https://api.openai.com/v1/models');

    expect(resp.status).toBe(200);
    expect(resp.json).toEqual({ data: [{ id: 'gpt-4o' }] });
  });
});
