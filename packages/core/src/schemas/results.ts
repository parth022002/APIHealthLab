import { z } from 'zod';
import {
  DiagnosticStatusSchema,
  ExecutionModeSchema,
  OverallOutcomeSchema,
  RunStateSchema,
  StepStateSchema,
  SupportedIntentIdSchema,
  SupportedProviderIdSchema,
} from './enums.js';
import { EvidenceSchema } from './evidence.js';

export const StepResultSchema = z.object({
  stepId: z.string().min(1).max(64),
  state: StepStateSchema,
  status: DiagnosticStatusSchema,
  reasonCode: z.string().max(64),
  evidence: z.array(EvidenceSchema).max(64),
  durationMs: z.number().nonnegative(),
});
export type StepResult = z.infer<typeof StepResultSchema>;

export const RunResultSchema = z.object({
  runId: z.string().uuid(),
  providerId: SupportedProviderIdSchema,
  intentId: SupportedIntentIdSchema,
  mode: ExecutionModeSchema,
  runState: RunStateSchema,
  overall: OverallOutcomeSchema,
  primaryStatus: DiagnosticStatusSchema,
  reasonCode: z.string().max(64),
  summary: z.string().max(512),
  steps: z.array(StepResultSchema),
  evidence: z.array(EvidenceSchema).max(64),
  whatWasProved: z.array(z.string().max(256)),
  whatWasNotProved: z.array(z.string().max(256)),
  suggestedRemediation: z.array(z.string().max(512)).optional(),
  engineVersion: z.string().default('0.1.0'),
  resultSchemaVersion: z.string().default('1.0.0'),
  aggregationPolicyVersion: z.string().default('1.0.0'),
  providerManifestVersion: z.string().optional(),
  completedAt: z.string().datetime(),
});
export type RunResult = z.infer<typeof RunResultSchema>;
