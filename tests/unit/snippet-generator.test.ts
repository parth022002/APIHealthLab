import { describe, expect, it } from 'vitest';
import { generateSnippet } from '../../packages/core/src/snippets/snippet-generator.js';
import { openaiManifest } from '../../packages/providers/src/openai.js';

describe('Deterministic Snippet Generator (FR-029)', () => {
  it('generates curl snippet with environment variable placeholder', () => {
    const curl = generateSnippet({
      manifest: openaiManifest,
      intentId: 'LIST_MODELS',
      language: 'curl',
      envVarName: 'OPENAI_API_KEY',
    });

    expect(curl).toContain('curl -X GET "https://api.openai.com/v1/models"');
    expect(curl).toContain('-H "Authorization: Bearer ${OPENAI_API_KEY}"');
    expect(curl).toContain('-H "Accept: application/json"');
    // Ensure no hardcoded raw secret
    expect(curl).not.toContain('sk-');
  });

  it('generates TypeScript snippet using native fetch and environment variables', () => {
    const ts = generateSnippet({
      manifest: openaiManifest,
      intentId: 'LIST_MODELS',
      language: 'typescript',
      envVarName: 'OPENAI_API_KEY',
    });

    expect(ts).toContain('const apiKey = process.env.OPENAI_API_KEY;');
    expect(ts).toContain('await fetch("https://api.openai.com/v1/models"');
    expect(ts).toContain('"Authorization": `Bearer ${apiKey}`');
    expect(ts).toContain('await response.json()');
  });

  it('generates Python snippet using requests library with os.environ placeholder', () => {
    const py = generateSnippet({
      manifest: openaiManifest,
      intentId: 'LIST_MODELS',
      language: 'python',
      envVarName: 'OPENAI_API_KEY',
    });

    expect(py).toContain('import os');
    expect(py).toContain('import requests');
    expect(py).toContain('api_key = os.environ.get("OPENAI_API_KEY")');
    expect(py).toContain('response = requests.get(url, headers=headers)');
  });
});
