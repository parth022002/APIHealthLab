import { z } from 'zod';
import {
  AuthMethodSchema,
  CostClassSchema,
  CredentialRiskSchema,
  DiagnosticStatusSchema,
  ProbeCategorySchema,
  ProviderLifecycleSchema,
  SideEffectClassSchema,
  SupportedIntentIdSchema,
  SupportedProviderIdSchema,
} from '@api-healthlab/core';

export const ErrorMatcherSchema = z.object({
  statusCode: z.number().int().optional(),
  errorCode: z.string().optional(),
  messageRegex: z.string().optional(),
  status: DiagnosticStatusSchema,
  reasonCode: z.string(),
  description: z.string().optional(),
});
export type ErrorMatcher = z.infer<typeof ErrorMatcherSchema>;

export const IntentProbeConfigSchema = z.object({
  category: ProbeCategorySchema,
  risk: CredentialRiskSchema,
  sideEffect: SideEffectClassSchema,
  cost: CostClassSchema,
  method: z.enum(['GET', 'POST']),
  path: z.string().startsWith('/'),
  bodyTemplate: z.string().optional(),
  matchers: z.array(ErrorMatcherSchema).default([]),
});
export type IntentProbeConfig = z.infer<typeof IntentProbeConfigSchema>;

export const ProviderManifestSchema = z.object({
  id: SupportedProviderIdSchema,
  displayName: z.string().min(1),
  lifecycle: ProviderLifecycleSchema,
  docsUrl: z.string().url(),
  termsUrl: z.string().url(),
  verifiedOn: z.string(),
  hosts: z.array(z.string().min(1)).min(1),
  auth: z.object({
    methods: z.array(AuthMethodSchema).min(1),
    defaultHeader: z.string(),
    headerFormat: z.string().default('{token}'),
  }),
  intents: z.record(SupportedIntentIdSchema, IntentProbeConfigSchema),
});
export type ProviderManifest = z.infer<typeof ProviderManifestSchema>;
