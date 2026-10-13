import { z } from 'zod';

export const CredentialRiskSchema = z.enum(['R0', 'R1', 'R2', 'R3']);
export type CredentialRisk = z.infer<typeof CredentialRiskSchema>;

export const CostClassSchema = z.enum(['FREE', 'LOW', 'POSSIBLE_CHARGE', 'HIGH_CHARGE']);
export type CostClass = z.infer<typeof CostClassSchema>;

export const ProbeCategorySchema = z.enum([
  'METADATA',
  'IDENTITY',
  'CHAT',
  'EMBEDDING',
  'RESOURCE_READ',
]);
export type ProbeCategory = z.infer<typeof ProbeCategorySchema>;

export const SideEffectClassSchema = z.enum([
  'NONE',
  'READ_ONLY',
  'SANDBOX_MUTATION',
  'REAL_WORLD_MUTATION',
]);
export type SideEffectClass = z.infer<typeof SideEffectClassSchema>;

export const ExecutionModeSchema = z.enum(['HOSTED', 'LOCAL']);
export type ExecutionMode = z.infer<typeof ExecutionModeSchema>;

export const PolicyDecisionSchema = z.enum(['ALLOW', 'ALLOW_WITH_CONSENT', 'DENY']);
export type PolicyDecision = z.infer<typeof PolicyDecisionSchema>;

export const EvidenceStrengthSchema = z.enum(['HIGH', 'MEDIUM', 'LOW']);
export type EvidenceStrength = z.infer<typeof EvidenceStrengthSchema>;

export const AuthMethodSchema = z.enum(['API_KEY', 'BEARER_TOKEN']);
export type AuthMethod = z.infer<typeof AuthMethodSchema>;

export const StepStateSchema = z.enum(['PASS', 'FAIL', 'SKIPPED', 'INCONCLUSIVE']);
export type StepState = z.infer<typeof StepStateSchema>;

export const RunStateSchema = z.enum(['COMPLETED', 'BLOCKED', 'ABORTED']);
export type RunState = z.infer<typeof RunStateSchema>;

export const OverallOutcomeSchema = z.enum(['HEALTHY', 'FAILED', 'INCONCLUSIVE', 'SKIPPED']);
export type OverallOutcome = z.infer<typeof OverallOutcomeSchema>;

export const DiagnosticStatusSchema = z.enum([
  'HEALTHY',
  'INVALID_CREDENTIAL',
  'KEY_TYPE_MISMATCH',
  'PERMISSION_DENIED',
  'INSUFFICIENT_SCOPE',
  'QUOTA_EXHAUSTED',
  'BILLING_REQUIRED',
  'MODEL_UNAVAILABLE',
  'ENDPOINT_MISCONFIGURED',
  'RATE_LIMITED',
  'ORIGIN_RESTRICTED',
  'REGION_BLOCKED',
  'NETWORK_TIMEOUT',
  'TRANSIENT_PROVIDER_ERROR',
  'REDIRECT_BLOCKED',
  'UNKNOWN',
  'UNSUPPORTED_INTENT',
]);
export type DiagnosticStatus = z.infer<typeof DiagnosticStatusSchema>;

export const ProviderLifecycleSchema = z.enum([
  'ACTIVE',
  'REVIEW',
  'DEPRECATED',
  'DISABLED',
  'REMOVED',
]);
export type ProviderLifecycle = z.infer<typeof ProviderLifecycleSchema>;

export const SupportedProviderIdSchema = z.enum([
  'openai',
  'gemini',
  'anthropic',
  'mistral',
  'groq',
  'openrouter',
  'xai',
  'deepseek',
  'cohere',
  'perplexity',
  'together',
  'fireworks',
  'cerebras',
  'huggingface',
  'stability',
  'elevenlabs',
  'github',
  'gitlab',
  'slack',
  'supabase',
  'pinecone',
  'stripe',
  'clerk',
]);
export type SupportedProviderId = z.infer<typeof SupportedProviderIdSchema>;

export const SupportedIntentIdSchema = z.enum([
  'LIST_MODELS',
  'IDENTITY',
  'CHAT_MINIMAL',
  'EMBED_MINIMAL',
  'RESOURCE_READ',
]);
export type SupportedIntentId = z.infer<typeof SupportedIntentIdSchema>;
