import { describe, expect, it } from 'vitest';
import { ControlledFetch } from '../../packages/core/src/network/controlled-fetch.js';

describe('P0 Security Test: SSRF, Protocol Smuggling & Payload Bounds', () => {
  const allowedHosts = ['api.openai.com', 'generativelanguage.googleapis.com', 'api.github.com'];

  it('rejects userinfo injection in URL (https://user:pass@host)', () => {
    const cf = new ControlledFetch(allowedHosts);
    expect(() => cf.validateUrl('https://admin:secret@api.openai.com/v1/models')).toThrow(
      /Userinfo credentials in URL are strictly forbidden/,
    );
  });

  it('rejects IPv6 bracketed literals', () => {
    const cf = new ControlledFetch(allowedHosts);
    expect(() => cf.validateUrl('https://[::1]/v1/models')).toThrow(/IP literals/);
  });

  it('rejects non-standard ports (e.g. port 8443 or 8080)', () => {
    const cf = new ControlledFetch(allowedHosts);
    expect(() => cf.validateUrl('https://api.openai.com:8443/v1/models')).toThrow(
      /Non-standard port forbidden/,
    );
  });

  it('strips all hop-by-hop and forbidden headers', () => {
    const cf = new ControlledFetch(allowedHosts);
    const headers = cf.sanitizeHeaders({
      Host: 'evil.com',
      Cookie: 'session=abc',
      'Set-Cookie': 'session=abc',
      Connection: 'close',
      'Transfer-Encoding': 'chunked',
      'X-Forwarded-For': '10.0.0.1',
      'X-Forwarded-Host': 'internal.lan',
      'X-Forwarded-Proto': 'https',
      Authorization: 'Bearer valid_key',
    });

    expect(headers).not.toHaveProperty('host');
    expect(headers).not.toHaveProperty('cookie');
    expect(headers).not.toHaveProperty('set-cookie');
    expect(headers).not.toHaveProperty('connection');
    expect(headers).not.toHaveProperty('transfer-encoding');
    expect(headers).not.toHaveProperty('x-forwarded-for');
    expect(headers).not.toHaveProperty('x-forwarded-host');
    expect(headers).not.toHaveProperty('x-forwarded-proto');
    expect(headers).toHaveProperty('authorization', 'Bearer valid_key');
  });

  it('enforces response payload limit (max 128 KiB) to prevent memory exhaustion', async () => {
    // Generate 200 KiB payload
    const oversizedPayload = 'X'.repeat(200 * 1024);
    const mockFetch = async () =>
      new Response(oversizedPayload, {
        status: 200,
        headers: { 'content-type': 'text/plain' },
      });

    const cf = new ControlledFetch(allowedHosts, mockFetch as unknown as typeof fetch);

    await expect(cf.execute('https://api.openai.com/v1/models')).rejects.toThrow(
      /Provider response exceeded maximum allowed payload size/,
    );
  });
});
