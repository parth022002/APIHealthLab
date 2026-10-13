import { z } from 'zod';
import { ProbeCategorySchema, SupportedIntentIdSchema, SupportedProviderIdSchema } from './enums.js';

export const ProbeStepSchema = z.object({
  id: z.string().min(1).max(64),
  description: z.string().max(256),
  category: ProbeCategorySchema,
  dependencies: z.array(z.string().max(64)).default([]),
  timeoutMs: z.number().int().min(100).max(8000).default(6000),
});
export type ProbeStep = z.infer<typeof ProbeStepSchema>;

export const ProbePlanSchema = z.object({
  providerId: SupportedProviderIdSchema,
  intentId: SupportedIntentIdSchema,
  steps: z
    .array(ProbeStepSchema)
    .min(1, 'A plan must contain at least 1 step')
    .max(4, 'A plan cannot exceed 4 steps'),
});
export type ProbePlan = z.infer<typeof ProbePlanSchema>;
