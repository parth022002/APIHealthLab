import { z } from 'zod';
import { EvidenceStrengthSchema } from './enums.js';

export const EvidenceSourceTypeSchema = z.enum([
  'PROVIDER_RESPONSE',
  'TRANSPORT',
  'LOCAL_RUNTIME',
  'PROVIDER_STATUS',
]);
export type EvidenceSourceType = z.infer<typeof EvidenceSourceTypeSchema>;

export const EvidenceSchema = z.object({
  sourceType: EvidenceSourceTypeSchema,
  sourceLocator: z.string().max(256),
  observedValue: z.union([z.string().max(512), z.number(), z.boolean()]),
  strength: EvidenceStrengthSchema,
  observedAt: z.string().datetime(),
  description: z.string().max(256).optional(),
});
export type Evidence = z.infer<typeof EvidenceSchema>;
