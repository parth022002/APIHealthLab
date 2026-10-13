import { ProviderManifest } from '@api-healthlab/provider-kit';

export const geminiManifest: ProviderManifest = {
  id: 'gemini',
  displayName: 'Google Gemini',
  lifecycle: 'ACTIVE',
  docsUrl: 'https://ai.google.dev/api/rest',
  termsUrl: 'https://ai.google.dev/terms',
  verifiedOn: '2026-10-13',
  hosts: ['generativelanguage.googleapis.com'],
  auth: {
    methods: ['API_KEY'],
    defaultHeader: 'x-goog-api-key',
    headerFormat: '{key}',
  },
  intents: {
    LIST_MODELS: {
      category: 'METADATA',
      risk: 'R1',
      sideEffect: 'READ_ONLY',
      cost: 'FREE',
      method: 'GET',
      path: '/v1beta/models',
      matchers: [
        {
          statusCode: 400,
          messageRegex: 'API key not valid',
          status: 'INVALID_CREDENTIAL',
          reasonCode: 'API_KEY_INVALID',
          description: 'The Google Gemini API key is not valid.',
        },
        {
          statusCode: 403,
          messageRegex: 'API_KEY_INVALID',
          status: 'INVALID_CREDENTIAL',
          reasonCode: 'API_KEY_INVALID',
          description: 'The Google Gemini API key is not valid.',
        },
      ],
    },
    IDENTITY: {
      category: 'IDENTITY',
      risk: 'R1',
      sideEffect: 'READ_ONLY',
      cost: 'FREE',
      method: 'GET',
      path: '/v1beta/models',
      matchers: [],
    },
    CHAT_MINIMAL: {
      category: 'CHAT',
      risk: 'R1',
      sideEffect: 'READ_ONLY',
      cost: 'FREE',
      method: 'POST',
      path: '/v1beta/models/gemini-1.5-flash:generateContent',
      bodyTemplate: JSON.stringify({
        contents: [{ parts: [{ text: 'health_check' }] }],
      }),
      matchers: [],
    },
    EMBED_MINIMAL: {
      category: 'EMBEDDING',
      risk: 'R1',
      sideEffect: 'READ_ONLY',
      cost: 'FREE',
      method: 'POST',
      path: '/v1beta/models/text-embedding-004:embedContent',
      bodyTemplate: JSON.stringify({
        content: { parts: [{ text: 'health_check' }] },
      }),
      matchers: [],
    },
    RESOURCE_READ: {
      category: 'RESOURCE_READ',
      risk: 'R1',
      sideEffect: 'READ_ONLY',
      cost: 'FREE',
      method: 'GET',
      path: '/v1beta/models',
      matchers: [],
    },
  },
};
