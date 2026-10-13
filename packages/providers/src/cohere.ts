import { ProviderManifest } from '@api-healthlab/provider-kit';

export const cohereManifest: ProviderManifest = {
  id: 'cohere',
  displayName: 'Cohere',
  lifecycle: 'ACTIVE',
  docsUrl: 'https://docs.cohere.com',
  termsUrl: 'https://cohere.com/terms',
  verifiedOn: '2026-10-13',
  hosts: ['api.cohere.com'],
  auth: {
    methods: ['BEARER_TOKEN', 'API_KEY'],
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
          description: 'Cohere API key is invalid or expired.',
        },
      ],
    },
    CHAT_MINIMAL: {
      category: 'CHAT',
      risk: 'R1',
      sideEffect: 'READ_ONLY',
      cost: 'LOW',
      method: 'POST',
      path: '/v1/chat',
      bodyTemplate: JSON.stringify({
        message: 'health_check',
      }),
      matchers: [],
    },
    IDENTITY: {
      category: 'IDENTITY',
      risk: 'R1',
      sideEffect: 'READ_ONLY',
      cost: 'FREE',
      method: 'GET',
      path: '/v1/models',
      matchers: [],
    },
    EMBED_MINIMAL: {
      category: 'EMBEDDING',
      risk: 'R1',
      sideEffect: 'READ_ONLY',
      cost: 'FREE',
      method: 'GET',
      path: '/v1/models',
      matchers: [],
    },
    RESOURCE_READ: {
      category: 'RESOURCE_READ',
      risk: 'R1',
      sideEffect: 'READ_ONLY',
      cost: 'FREE',
      method: 'GET',
      path: '/v1/models',
      matchers: [],
    },
  },
};
