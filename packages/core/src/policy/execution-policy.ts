import {
  CostClass,
  CredentialRisk,
  ExecutionMode,
  PolicyDecision,
  SideEffectClass,
} from '../schemas/enums.js';
import { ExecutionPolicyInput, PolicyEvaluationResult } from '../schemas/policy.js';

export interface PolicyRuleParams {
  risk: CredentialRisk;
  sideEffect: SideEffectClass;
  cost: CostClass;
  mode: ExecutionMode;
}

/**
 * Evaluates the baseline static policy across the 128 (4 risk x 4 side-effect x 4 cost x 2 mode) combinations.
 * Default is DENY.
 */
export function evaluateStaticPolicy(params: PolicyRuleParams): {
  allowed: boolean;
  requiresConsent: boolean;
  requiresBillableAcknowledgement: boolean;
  reasonCode: string;
  message: string;
} {
  const { risk, sideEffect, cost, mode } = params;

  // 1. Hosted Mode Restrictions
  if (mode === 'HOSTED') {
    // Hosted MVP strictly denies R2 and R3
    if (risk === 'R2' || risk === 'R3') {
      return {
        allowed: false,
        requiresConsent: false,
        requiresBillableAcknowledgement: false,
        reasonCode: 'HOSTED_RISK_DENIED',
        message: `Hosted diagnostics do not permit ${risk} credentials. Use the local CLI.`,
      };
    }

    // Hosted MVP strictly denies mutations
    if (sideEffect === 'REAL_WORLD_MUTATION' || sideEffect === 'SANDBOX_MUTATION') {
      return {
        allowed: false,
        requiresConsent: false,
        requiresBillableAcknowledgement: false,
        reasonCode: 'HOSTED_MUTATION_DENIED',
        message: 'Hosted diagnostics do not permit side-effect mutations.',
      };
    }

    // Hosted R0 or R1 with NONE or READ_ONLY
    const requiresBillable = cost === 'POSSIBLE_CHARGE' || cost === 'HIGH_CHARGE';
    const requiresConsent = cost === 'HIGH_CHARGE' || risk === 'R1';

    return {
      allowed: true,
      requiresConsent,
      requiresBillableAcknowledgement: requiresBillable,
      reasonCode: requiresConsent ? 'HOSTED_CONSENT_REQUIRED' : 'HOSTED_ALLOWED',
      message: 'Permitted in hosted mode subject to consent and billing disclosure.',
    };
  }

  // 2. Local Mode Evaluation
  if (mode === 'LOCAL') {
    // Real-world mutations are denied in MVP
    if (sideEffect === 'REAL_WORLD_MUTATION') {
      return {
        allowed: false,
        requiresConsent: false,
        requiresBillableAcknowledgement: false,
        reasonCode: 'REAL_WORLD_MUTATION_DENIED',
        message: 'Diagnostics do not permit real-world state mutation in MVP.',
      };
    }

    // High risk R3 requires explicit consent and is only permitted for non-mutating probes
    if (risk === 'R3') {
      if (sideEffect !== 'NONE' && sideEffect !== 'READ_ONLY') {
        return {
          allowed: false,
          requiresConsent: false,
          requiresBillableAcknowledgement: false,
          reasonCode: 'R3_MUTATION_DENIED',
          message: 'R3 credentials cannot execute mutating probes.',
        };
      }
      return {
        allowed: true,
        requiresConsent: true,
        requiresBillableAcknowledgement: cost === 'POSSIBLE_CHARGE' || cost === 'HIGH_CHARGE',
        reasonCode: 'R3_CONSENT_REQUIRED',
        message: 'R3 credentials require explicit local consent.',
      };
    }

    // R2 credentials access private data or scoped resources -> allowed with consent
    if (risk === 'R2') {
      return {
        allowed: true,
        requiresConsent: true,
        requiresBillableAcknowledgement: cost === 'POSSIBLE_CHARGE' || cost === 'HIGH_CHARGE',
        reasonCode: 'R2_CONSENT_REQUIRED',
        message: 'R2 credential accesses private resource; requires local consent.',
      };
    }

    // R0 and R1 in local mode
    const isMutating = sideEffect === 'SANDBOX_MUTATION';
    const isHighCost = cost === 'HIGH_CHARGE';
    const requiresBillable = cost === 'POSSIBLE_CHARGE' || cost === 'HIGH_CHARGE';
    const requiresConsent = isMutating || isHighCost || (risk === 'R1' && cost !== 'FREE');

    return {
      allowed: true,
      requiresConsent,
      requiresBillableAcknowledgement: requiresBillable,
      reasonCode: requiresConsent ? 'LOCAL_CONSENT_REQUIRED' : 'LOCAL_ALLOWED',
      message: 'Permitted in local mode.',
    };
  }

  // Fallback closed
  return {
    allowed: false,
    requiresConsent: false,
    requiresBillableAcknowledgement: false,
    reasonCode: 'UNKNOWN_POLICY_STATE',
    message: 'Policy defaults to DENY.',
  };
}

/**
 * Full execution policy evaluator taking user consent and authorization into account.
 */
export function evaluateExecutionPolicy(input: ExecutionPolicyInput): PolicyEvaluationResult {
  // If user did not authorize the probe, immediately DENY
  if (!input.authorized) {
    return {
      decision: 'DENY',
      reasonCode: 'NOT_AUTHORIZED',
      message: 'Explicit authorization is required before probe execution.',
      requiresConsent: true,
      requiresBillableAcknowledgement: false,
    };
  }

  const staticCheck = evaluateStaticPolicy({
    risk: input.risk,
    sideEffect: input.sideEffect,
    cost: input.cost,
    mode: input.mode,
  });

  if (!staticCheck.allowed) {
    return {
      decision: 'DENY',
      reasonCode: staticCheck.reasonCode,
      message: staticCheck.message,
      requiresConsent: staticCheck.requiresConsent,
      requiresBillableAcknowledgement: staticCheck.requiresBillableAcknowledgement,
    };
  }

  // If billable acknowledgement is required but not provided
  if (staticCheck.requiresBillableAcknowledgement && !input.billableAcknowledged) {
    return {
      decision: 'ALLOW_WITH_CONSENT',
      reasonCode: 'BILLABLE_ACKNOWLEDGEMENT_REQUIRED',
      message: 'Probe may incur costs. Acknowledging potential charges is required.',
      requiresConsent: staticCheck.requiresConsent,
      requiresBillableAcknowledgement: true,
    };
  }

  // If consent is required
  if (staticCheck.requiresConsent) {
    return {
      decision: 'ALLOW_WITH_CONSENT',
      reasonCode: staticCheck.reasonCode,
      message: staticCheck.message,
      requiresConsent: true,
      requiresBillableAcknowledgement: staticCheck.requiresBillableAcknowledgement,
    };
  }

  return {
    decision: 'ALLOW',
    reasonCode: staticCheck.reasonCode,
    message: staticCheck.message,
    requiresConsent: false,
    requiresBillableAcknowledgement: false,
  };
}
