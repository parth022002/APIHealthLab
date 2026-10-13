import { describe, expect, it } from 'vitest';
import {
  generateCapabilityMatrixMarkdown,
  getProviderCatalog,
  getProviderDetails,
} from '../../packages/catalog/src/index.js';

describe('Provider Capability Catalog Engine (FR-014)', () => {
  it('dynamically generates catalog containing all 7 MVP providers and expanded categories', () => {
    const catalog = getProviderCatalog();
    expect(catalog.length).toBeGreaterThanOrEqual(7);

    const providerIds = catalog.map((p) => p.id);
    expect(providerIds).toContain('openai');
    expect(providerIds).toContain('anthropic');
    expect(providerIds).toContain('gemini');
    expect(providerIds).toContain('mistral');
    expect(providerIds).toContain('groq');
    expect(providerIds).toContain('openrouter');
    expect(providerIds).toContain('github');
  });

  it('retrieves detailed capability entry for a specific provider', () => {
    const details = getProviderDetails('anthropic');
    expect(details).toBeDefined();
    expect(details?.displayName).toBe('Anthropic');
    expect(details?.hosts).toContain('api.anthropic.com');
    expect(details?.authMethods).toContain('API_KEY');
    expect(details?.supportedIntents.some((i) => i.intentId === 'LIST_MODELS')).toBe(true);
  });

  it('generates markdown documentation directly from source-controlled truth', () => {
    const markdown = generateCapabilityMatrixMarkdown();
    expect(markdown).toContain('# Generated Provider Capability Matrix');
    expect(markdown).toContain('api.openai.com');
    expect(markdown).toContain('api.anthropic.com');
    expect(markdown).toContain('generativelanguage.googleapis.com');
    expect(markdown).toContain('api.github.com');
    expect(markdown).toContain('api.mistral.ai');
    expect(markdown).toContain('api.groq.com');
    expect(markdown).toContain('openrouter.ai');
  });
});
