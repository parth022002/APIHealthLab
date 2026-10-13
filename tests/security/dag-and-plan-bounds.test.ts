import { describe, expect, it } from 'vitest';
import {
  getTopologicalStepOrder,
  validateProbePlan,
} from '../../packages/core/src/planner/plan-validator.js';
import { ProbePlan } from '../../packages/core/src/schemas/probe-plan.js';

describe('P0 Security Test: ProbePlan DAG & Bounds Validation', () => {
  it('rejects plans exceeding maximum 4 steps', () => {
    const invalidPlan: ProbePlan = {
      providerId: 'openai',
      intentId: 'LIST_MODELS',
      steps: [
        { id: 'step-1', description: 'Step 1', category: 'METADATA', dependencies: [], timeoutMs: 1000 },
        { id: 'step-2', description: 'Step 2', category: 'METADATA', dependencies: [], timeoutMs: 1000 },
        { id: 'step-3', description: 'Step 3', category: 'METADATA', dependencies: [], timeoutMs: 1000 },
        { id: 'step-4', description: 'Step 4', category: 'METADATA', dependencies: [], timeoutMs: 1000 },
        { id: 'step-5', description: 'Step 5', category: 'METADATA', dependencies: [], timeoutMs: 1000 },
      ],
    };

    const validation = validateProbePlan(invalidPlan);
    expect(validation.valid).toBe(false);
    expect(validation.errors.some((e) => e.includes('exceeds maximum allowed steps'))).toBe(true);
  });

  it('rejects circular dependencies (cycles in DAG)', () => {
    const cyclicPlan: ProbePlan = {
      providerId: 'openai',
      intentId: 'LIST_MODELS',
      steps: [
        { id: 'step-a', description: 'Step A', category: 'METADATA', dependencies: ['step-b'], timeoutMs: 1000 },
        { id: 'step-b', description: 'Step B', category: 'METADATA', dependencies: ['step-a'], timeoutMs: 1000 },
      ],
    };

    const validation = validateProbePlan(cyclicPlan);
    expect(validation.valid).toBe(false);
    expect(validation.errors.some((e) => e.includes('Circular dependency'))).toBe(true);
  });

  it('rejects self-dependencies', () => {
    const selfDepPlan: ProbePlan = {
      providerId: 'openai',
      intentId: 'LIST_MODELS',
      steps: [
        { id: 'step-x', description: 'Step X', category: 'METADATA', dependencies: ['step-x'], timeoutMs: 1000 },
      ],
    };

    const validation = validateProbePlan(selfDepPlan);
    expect(validation.valid).toBe(false);
    expect(validation.errors.some((e) => e.includes('cannot depend on itself'))).toBe(true);
  });

  it('rejects unresolved dependency on non-existent step', () => {
    const missingDepPlan: ProbePlan = {
      providerId: 'openai',
      intentId: 'LIST_MODELS',
      steps: [
        { id: 'step-1', description: 'Step 1', category: 'METADATA', dependencies: ['step-ghost'], timeoutMs: 1000 },
      ],
    };

    const validation = validateProbePlan(missingDepPlan);
    expect(validation.valid).toBe(false);
    expect(validation.errors.some((e) => e.includes("unresolved dependency on 'step-ghost'"))).toBe(true);
  });

  it('topologically sorts valid multi-step DAG in correct dependency order', () => {
    const validDagPlan: ProbePlan = {
      providerId: 'openai',
      intentId: 'LIST_MODELS',
      steps: [
        { id: 'step-c', description: 'Step C depends on B', category: 'METADATA', dependencies: ['step-b'], timeoutMs: 2000 },
        { id: 'step-a', description: 'Step A base', category: 'METADATA', dependencies: [], timeoutMs: 2000 },
        { id: 'step-b', description: 'Step B depends on A', category: 'METADATA', dependencies: ['step-a'], timeoutMs: 2000 },
      ],
    };

    const sorted = getTopologicalStepOrder(validDagPlan);
    const orderIds = sorted.map((s) => s.id);
    expect(orderIds).toEqual(['step-a', 'step-b', 'step-c']);
  });
});
