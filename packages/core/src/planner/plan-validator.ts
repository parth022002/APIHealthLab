import { ProbePlan, ProbeStep } from '../schemas/probe-plan.js';

export interface PlanValidationResult {
  valid: boolean;
  errors: string[];
}

export class PlanValidationError extends Error {
  public readonly errors: string[];

  constructor(errors: string[]) {
    super(`ProbePlan validation failed:\n${errors.join('\n')}`);
    this.name = 'PlanValidationError';
    this.errors = errors;
  }
}

/**
 * Validates DAG invariants:
 * - 1 to 4 steps
 * - Unique step IDs
 * - Known dependencies only
 * - No dependency cycles (acyclic DAG)
 * - Maximum step timeout
 */
export function validateProbePlan(plan: ProbePlan): PlanValidationResult {
  const errors: string[] = [];

  if (plan.steps.length === 0) {
    errors.push('Plan must contain at least 1 step.');
  }
  if (plan.steps.length > 4) {
    errors.push(`Plan exceeds maximum allowed steps (max 4, found ${plan.steps.length}).`);
  }

  const stepIds = new Set<string>();
  const stepMap = new Map<string, ProbeStep>();

  for (const step of plan.steps) {
    if (stepIds.has(step.id)) {
      errors.push(`Duplicate step ID found: '${step.id}'. Step IDs must be unique.`);
    }
    stepIds.add(step.id);
    stepMap.set(step.id, step);

    if (step.timeoutMs > 8000) {
      errors.push(`Step '${step.id}' timeout exceeds maximum hosted budget of 8000ms.`);
    }
  }

  // Check that all dependencies point to existing steps
  for (const step of plan.steps) {
    for (const depId of step.dependencies) {
      if (depId === step.id) {
        errors.push(`Step '${step.id}' cannot depend on itself.`);
      } else if (!stepIds.has(depId)) {
        errors.push(`Step '${step.id}' has unresolved dependency on '${depId}'.`);
      }
    }
  }

  // Detect cycles via Depth First Search
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function hasCycle(stepId: string): boolean {
    visited.add(stepId);
    recursionStack.add(stepId);

    const step = stepMap.get(stepId);
    if (step) {
      for (const dep of step.dependencies) {
        if (!visited.has(dep)) {
          if (hasCycle(dep)) return true;
        } else if (recursionStack.has(dep)) {
          return true; // Cycle detected
        }
      }
    }

    recursionStack.delete(stepId);
    return false;
  }

  for (const stepId of stepIds) {
    if (!visited.has(stepId)) {
      if (hasCycle(stepId)) {
        errors.push('Circular dependency detected in ProbePlan DAG.');
        break;
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Topologically sorts the plan steps in execution order.
 */
export function getTopologicalStepOrder(plan: ProbePlan): ProbeStep[] {
  const validation = validateProbePlan(plan);
  if (!validation.valid) {
    throw new PlanValidationError(validation.errors);
  }

  const result: ProbeStep[] = [];
  const visited = new Set<string>();
  const stepMap = new Map(plan.steps.map((s) => [s.id, s]));

  function visit(stepId: string) {
    if (visited.has(stepId)) return;
    const step = stepMap.get(stepId);
    if (!step) return;

    for (const dep of step.dependencies) {
      visit(dep);
    }

    visited.add(stepId);
    result.push(step);
  }

  for (const step of plan.steps) {
    visit(step.id);
  }

  return result;
}
