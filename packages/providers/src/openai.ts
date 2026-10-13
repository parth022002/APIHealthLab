import { ProviderManifest } from '@api-healthlab/provider-kit';

export const openaiManifest: ProviderManifest = {
  id: 'openai',
  displayName: 'OpenAI',
  lifecycle: 'ACTIVE',
  docsUrl: 'https://platform.openai.com/docs/api-reference',
  termsUrl: 'https://openai.com/policies/terms-of-use',
  verifiedOn: '2026-10-13',
  hosts: ['api.openai.com'],
  auth: {
    methods: ['API_KEY'],
    defaultHeader: 'Authorization',
    headerFormat: 'Bearer {token}',
  },
  intents: {
    LIST_MODELS: {
      category: 'METADATA',
      risk: 'R1',
      sideEffect: 'READ_ONLY',
      cost: 'FREE',
      method: 'GET',
      path: '/v1/models',
      matchers: [
        {
          statusCode: 401,
          errorCode: 'invalid_api_key',
          status: 'INVALID_CREDENTIAL',
          reasonCode: 'INVALID_API_KEY',
          description: 'Incorrect API key provided or key has been revoked.',
        },
        {
          statusCode: 429,
          errorCode: 'insufficient_quota',
          status: 'QUOTA_EXHAUSTED',
          reasonCode: 'INSUFFICIENT_QUOTA',
          description: 'You have exceeded your current quota or billing is unconfigured.',
        },
      ],
    },
    CHAT_MINIMAL: {
      category: 'CHAT',
      risk: 'R1',
      sideEffect: 'READ_ONLY',
      cost: 'LOW',
      method: 'POST',
      path: '/v1/chat/completions',
      bodyTemplate: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'health_check' }],
        max_tokens: 1,
      }),
      matchers: [],
    },
    EMBED_MINIMAL: {
      category: 'EMBEDDING',
      risk: 'R1',
      sideEffect: 'READ_ONLY',
      cost: 'LOW',
      method: 'POST',
      path: '/v1/embeddings',
      bodyTemplate: JSON.stringify({
        model: 'text-embedding-3-small',
        input: 'health_check',
      }),
      matchers: [],
    },
  },
};
