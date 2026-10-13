import { describe, expect, it } from 'vitest';
import { validateProviderManifest } from '../../packages/provider-kit/src/validator.js';
import { openaiManifest } from '../../packages/providers/src/openai.js';

describe('P0 Security Test: Manifest Validator & Host Invariants', () => {
  it('validates official OpenAI manifest without errors', () => {
    const result = validateProviderManifest(openaiManifest);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects wildcard host specifications (*.openai.com)', () => {
    const maliciousManifest = {
      ...openaiManifest,
      hosts: ['*.openai.com'],
    };

    const result = validateProviderManifest(maliciousManifest);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Wildcards are forbidden'))).toBe(true);
  });

  it('rejects full URLs in host list (https://api.openai.com)', () => {
    const invalidManifest = {
      ...openaiManifest,
      hosts: ['https://api.openai.com'],
    };

    const result = validateProviderManifest(invalidManifest);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Host must be domain only'))).toBe(true);
  });

  it('rejects IP literals in host list (127.0.0.1, 10.0.0.1)', () => {
    const ipManifest = {
      ...openaiManifest,
      hosts: ['127.0.0.1'],
    };

    const result = validateProviderManifest(ipManifest);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('IP literals or ports are forbidden'))).toBe(true);
  });

  it('rejects insecure HTTP documentation URLs', () => {
    const insecureManifest = {
      ...openaiManifest,
      docsUrl: 'http://platform.openai.com/docs',
    };

    const result = validateProviderManifest(insecureManifest);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('docsUrl must be HTTPS'))).toBe(true);
  });
});
