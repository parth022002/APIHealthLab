import { describe, expect, it } from 'vitest';
import { RedactionContext } from '../../packages/core/src/redaction/redaction-context.js';
import { SecretValue } from '../../packages/core/src/redaction/secret-value.js';

describe('SecretValue & RedactionContext', () => {
  it('prevents accidental string coercion and JSON serialization', () => {
    const secret = new SecretValue('sk-test-secret-12345', 'API_KEY');

    expect(secret.toString()).toBe('[REDACTED API_KEY]');
    expect(secret.toJSON()).toBe('[REDACTED API_KEY]');
    expect(JSON.stringify({ key: secret })).toBe('{"key":"[REDACTED API_KEY]"}');
    expect(secret.reveal()).toBe('sk-test-secret-12345');
    expect(secret.length).toBe(20);
  });

  it('redacts registered secrets from strings and nested objects', () => {
    const ctx = new RedactionContext();
    const rawSecret = 'ghp_secretTokenABCXYZ999';
    ctx.register(rawSecret, 'GITHUB_TOKEN');

    const message = `Connecting with token ${rawSecret} to endpoint`;
    const redacted = ctx.redactString(message);
    expect(redacted).not.toContain(rawSecret);
    expect(redacted).toContain('[REDACTED_GITHUB_TOKEN]');

    const obj = {
      user: 'alice',
      header: `Bearer ${rawSecret}`,
      authorization: 'Bearer secret123',
    };
    const redactedObj = ctx.redactValue(obj) as Record<string, string>;
    expect(redactedObj.header).toContain('[REDACTED_GITHUB_TOKEN]');
    expect(redactedObj.authorization).toBe('[REDACTED_FIELD]');
  });

  it('masks credentials safely for presentation', () => {
    expect(RedactionContext.maskSecret('sk-1234567890abcdef')).toBe('sk-1...cdef');
    expect(RedactionContext.maskSecret('short')).toBe('****');
  });
});
