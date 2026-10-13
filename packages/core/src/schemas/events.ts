import { z } from 'zod';
import { DiagnosticStatusSchema, StepStateSchema } from './enums.js';
import { EvidenceSchema } from './evidence.js';
import { RunResultSchema } from './results.js';

export const StepStartedEventSchema = z.object({
  type: z.literal('step_started'),
  schemaVersion: z.string().default('1.0.0'),
  seq: z.number().int().nonnegative(),
  stepId: z.string().min(1).max(64),
  timestamp: z.string().datetime(),
});
export type StepStartedEvent = z.infer<typeof StepStartedEventSchema>;

export const StepCompletedEventSchema = z.object({
  type: z.literal('step_completed'),
  schemaVersion: z.string().default('1.0.0'),
  seq: z.number().int().nonnegative(),
  stepId: z.string().min(1).max(64),
  state: StepStateSchema,
  status: DiagnosticStatusSchema,
  evidence: z.array(EvidenceSchema).max(64),
  durationMs: z.number().nonnegative(),
  timestamp: z.string().datetime(),
});
export type StepCompletedEvent = z.infer<typeof StepCompletedEventSchema>;

export const FinalEventSchema = z.object({
  type: z.literal('final'),
  schemaVersion: z.string().default('1.0.0'),
  seq: z.number().int().nonnegative(),
  result: RunResultSchema,
  timestamp: z.string().datetime(),
});
export type FinalEvent = z.infer<typeof FinalEventSchema>;

export const DiagnosticEventSchema = z.discriminatedUnion('type', [
  StepStartedEventSchema,
  StepCompletedEventSchema,
  FinalEventSchema,
]);
export type DiagnosticEvent = z.infer<typeof DiagnosticEventSchema>;
