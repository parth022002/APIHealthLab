import { z } from 'zod';
import {
  CostClassSchema,
  CredentialRiskSchema,
  ExecutionModeSchema,
  PolicyDecisionSchema,
  SideEffectClassSchema,
} from './enums.js';

export const ExecutionPolicyInputSchema = z.object({
  risk: CredentialRiskSchema,
  sideEffect: SideEffectClassSchema,
  cost: CostClassSchema,
  mode: ExecutionModeSchema,
  authorized: z.boolean(),
  billableAcknowledged: z.boolean(),
});
export type ExecutionPolicyInput = z.infer<typeof ExecutionPolicyInputSchema>;

export const PolicyEvaluationResultSchema = z.object({
  decision: PolicyDecisionSchema,
  reasonCode: z.string(),
  message: z.string(),
  requiresConsent: z.boolean(),
  requiresBillableAcknowledgement: z.boolean(),
});
export type PolicyEvaluationResult = z.infer<typeof PolicyEvaluationResultSchema>;
