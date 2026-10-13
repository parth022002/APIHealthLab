import { DiagnosticStatus, SupportedProviderId } from '../schemas/enums.js';
import { generateRemediation } from '../runner/aggregation.js';

export interface DiagnoseErrorInput {
  rawError: string;
  providerId?: SupportedProviderId;
}

export interface ErrorDiagnosisResult {
  status: DiagnosticStatus;
  reasonCode: string;
  description: string;
  remediation: string[];
  detectedProvider?: SupportedProviderId | undefined;
}

interface DiagnosisRule {
  regex: RegExp;
  status: DiagnosticStatus;
  reasonCode: string;
  description: string;
  provider?: SupportedProviderId;
}

const DIAGNOSIS_RULES: DiagnosisRule[] = [
  // OpenAI
  {
    regex: /incorrect api key provided|invalid_api_key/i,
    status: 'INVALID_CREDENTIAL',
    reasonCode: 'INVALID_API_KEY',
    description: 'The OpenAI API key provided is invalid, deleted, or revoked.',
    provider: 'openai',
  },
  {
    regex: /you exceeded your current quota|insufficient_quota/i,
    status: 'QUOTA_EXHAUSTED',
    reasonCode: 'INSUFFICIENT_QUOTA',
    description: 'OpenAI quota exhausted or billing is inactive.',
    provider: 'openai',
  },
  {
    regex: /the model .* does not exist|model_not_found/i,
    status: 'MODEL_UNAVAILABLE',
    reasonCode: 'MODEL_NOT_FOUND',
    description: 'The requested OpenAI model does not exist or you lack access to it.',
    provider: 'openai',
  },

  // Google Gemini
  {
    regex: /api key not valid|api_key_invalid/i,
    status: 'INVALID_CREDENTIAL',
    reasonCode: 'API_KEY_INVALID',
    description: 'The Google Gemini API key is invalid or unrecognized by Google AI Studio.',
    provider: 'gemini',
  },
  {
    regex: /user location is not supported|location is not supported/i,
    status: 'REGION_BLOCKED',
    reasonCode: 'REGION_NOT_SUPPORTED',
    description: 'Google Gemini is not available from your geographic region or cloud egress IP.',
    provider: 'gemini',
  },
  {
    regex: /resource has been exhausted|resource_exhausted/i,
    status: 'RATE_LIMITED',
    reasonCode: 'GEMINI_QUOTA_EXHAUSTED',
    description: 'Gemini free tier requests per minute (RPM) or daily quota reached.',
    provider: 'gemini',
  },

  // GitHub
  {
    regex: /bad credentials/i,
    status: 'INVALID_CREDENTIAL',
    reasonCode: 'BAD_CREDENTIALS',
    description: 'GitHub rejected the Personal Access Token or OAuth token as invalid/revoked.',
    provider: 'github',
  },
  {
    regex: /api rate limit exceeded for/i,
    status: 'RATE_LIMITED',
    reasonCode: 'GITHUB_RATE_LIMITED',
    description: 'GitHub API rate limit exhausted (typically 60/hr for unauthenticated, 5000/hr authenticated).',
    provider: 'github',
  },
  {
    regex: /resource not accessible by (personal access token|integration)/i,
    status: 'INSUFFICIENT_SCOPE',
    reasonCode: 'INSUFFICIENT_TOKEN_SCOPE',
    description: 'The GitHub token is valid but lacks the required permission scope for the repository/resource.',
    provider: 'github',
  },

  // Anthropic
  {
    regex: /invalid x-api-key|authentication_error/i,
    status: 'INVALID_CREDENTIAL',
    reasonCode: 'ANTHROPIC_AUTH_ERROR',
    description: 'Anthropic rejected the x-api-key credential header.',
    provider: 'anthropic',
  },
  {
    regex: /credit balance is too low/i,
    status: 'BILLING_REQUIRED',
    reasonCode: 'CREDIT_BALANCE_LOW',
    description: 'Your Anthropic account requires prepaid credits to fulfill this request.',
    provider: 'anthropic',
  },

  // Generic HTTP / Network Patterns
  {
    regex: /\b401\b.*unauthorized/i,
    status: 'INVALID_CREDENTIAL',
    reasonCode: 'HTTP_401_UNAUTHORIZED',
    description: 'Authentication failed: HTTP 401 Unauthorized.',
  },
  {
    regex: /\b403\b.*forbidden/i,
    status: 'PERMISSION_DENIED',
    reasonCode: 'HTTP_403_FORBIDDEN',
    description: 'Access denied: HTTP 403 Forbidden.',
  },
  {
    regex: /\b429\b.*too many requests/i,
    status: 'RATE_LIMITED',
    reasonCode: 'HTTP_429_TOO_MANY_REQUESTS',
    description: 'Rate limit encountered: HTTP 429 Too Many Requests.',
  },
  {
    regex: /econnrefused|enotfound|etimedout|network timeout/i,
    status: 'NETWORK_TIMEOUT',
    reasonCode: 'NETWORK_CONNECTIVITY_ISSUE',
    description: 'A socket or network connection timeout occurred before receiving a response.',
  },
];

export function diagnoseRawError(input: DiagnoseErrorInput): ErrorDiagnosisResult {
  const { rawError, providerId } = input;

  for (const rule of DIAGNOSIS_RULES) {
    if (providerId && rule.provider && rule.provider !== providerId) {
      continue;
    }

    if (rule.regex.test(rawError)) {
      const activeProvider = providerId ?? rule.provider ?? 'openai';
      return {
        status: rule.status,
        reasonCode: rule.reasonCode,
        description: rule.description,
        remediation: generateRemediation(rule.status, activeProvider),
        detectedProvider: rule.provider,
      };
    }
  }

  return {
    status: 'UNKNOWN',
    reasonCode: 'UNCLASSIFIED_ERROR',
    description: 'The error format was not recognized by rule-based diagnostic patterns.',
    remediation: ['Verify API documentation, request payload formatting, and credentials.'],
  };
}
