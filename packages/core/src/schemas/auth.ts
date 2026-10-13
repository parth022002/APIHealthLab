import { z } from 'zod';
import { AuthMethodSchema, SupportedProviderIdSchema } from './enums.js';

export const CredentialInputSchema = z.object({
  provider: SupportedProviderIdSchema,
  method: AuthMethodSchema,
  value: z
    .string()
    .min(1, 'Credential value cannot be empty')
    .max(4096, 'Credential exceeds maximum length of 4096 characters'),
  headerName: z
    .string()
    .max(64, 'Header name exceeds maximum length of 64 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Header name can only contain alphanumeric characters, hyphens, and underscores')
    .optional(),
});
export type CredentialInput = z.infer<typeof CredentialInputSchema>;

export const ApiKeyCredentialSchema = z.object({
  type: z.literal('API_KEY'),
  key: z.string().min(1).max(4096),
  headerName: z
    .string()
    .max(64)
    .regex(/^[a-zA-Z0-9_-]+$/)
    .optional(),
});
export type ApiKeyCredential = z.infer<typeof ApiKeyCredentialSchema>;

export const BearerTokenCredentialSchema = z.object({
  type: z.literal('BEARER_TOKEN'),
  token: z.string().min(1),
});
export type BearerTokenCredential = z.infer<typeof BearerTokenCredentialSchema>;

export const AuthCredentialSchema = z.discriminatedUnion('type', [
  ApiKeyCredentialSchema,
  BearerTokenCredentialSchema,
]);
export type AuthCredential = z.infer<typeof AuthCredentialSchema>;
