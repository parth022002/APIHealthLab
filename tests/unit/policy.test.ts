import { describe, expect, it } from 'vitest';
import {
  CostClass,
  CredentialRisk,
  ExecutionMode,
  SideEffectClass,
} from '../../packages/core/src/schemas/enums.js';
import {
  evaluateExecutionPolicy,
  evaluateStaticPolicy,
} from '../../packages/core/src/policy/execution-policy.js';

describe('Total 128-combination Execution Policy Matrix', () => {
  const risks: CredentialRisk[] = ['R0', 'R1', 'R2', 'R3'];
  const sideEffects: SideEffectClass[] = [
    'NONE',
    'READ_ONLY',
    'SANDBOX_MUTATION',
    'REAL_WORLD_MUTATION',
  ];
  const costs: CostClass[] = ['FREE', 'LOW', 'POSSIBLE_CHARGE', 'HIGH_CHARGE'];
  const modes: ExecutionMode[] = ['HOSTED', 'LOCAL'];

  it('evaluates exactly 128 distinct combinations deterministically', () => {
    let count = 0;
    const results = new Map<string, string>();

    for (const mode of modes) {
      for (const risk of risks) {
        for (const sideEffect of sideEffects) {
          for (const cost of costs) {
            count++;
            const key = `${mode}-${risk}-${sideEffect}-${cost}`;
            const evalResult = evaluateStaticPolicy({ mode, risk, sideEffect, cost });

            expect(evalResult).toHaveProperty('allowed');
            expect(evalResult).toHaveProperty('requiresConsent');
            expect(evalResult).toHaveProperty('requiresBillableAcknowledgement');
            expect(evalResult).toHaveProperty('reasonCode');
            expect(evalResult).toHaveProperty('message');

            results.set(key, evalResult.reasonCode);
          }
        }
      }
    }

    expect(count).toBe(128);
    expect(results.size).toBe(128);
  });

  describe('Hosted mode invariants', () => {
    it('strictly denies R2 and R3 in hosted mode regardless of side effect or cost', () => {
      for (const risk of ['R2', 'R3'] as CredentialRisk[]) {
        for (const sideEffect of sideEffects) {
          for (const cost of costs) {
            const result = evaluateStaticPolicy({ mode: 'HOSTED', risk, sideEffect, cost });
            expect(result.allowed).toBe(false);
            expect(result.reasonCode).toBe('HOSTED_RISK_DENIED');
          }
        }
      }
    });

    it('strictly denies mutations in hosted mode', () => {
      for (const sideEffect of ['SANDBOX_MUTATION', 'REAL_WORLD_MUTATION'] as SideEffectClass[]) {
        for (const risk of ['R0', 'R1'] as CredentialRisk[]) {
          for (const cost of costs) {
            const result = evaluateStaticPolicy({ mode: 'HOSTED', risk, sideEffect, cost });
            expect(result.allowed).toBe(false);
            expect(result.reasonCode).toBe('HOSTED_MUTATION_DENIED');
          }
        }
      }
    });

    it('allows R0/R1 read-only probes in hosted mode with billing requirements if costly', () => {
      const freeR0 = evaluateStaticPolicy({
        mode: 'HOSTED',
        risk: 'R0',
        sideEffect: 'NONE',
        cost: 'FREE',
      });
      expect(freeR0.allowed).toBe(true);
      expect(freeR0.requiresBillableAcknowledgement).toBe(false);

      const billableR0 = evaluateStaticPolicy({
        mode: 'HOSTED',
        risk: 'R0',
        sideEffect: 'READ_ONLY',
        cost: 'POSSIBLE_CHARGE',
      });
      expect(billableR0.allowed).toBe(true);
      expect(billableR0.requiresBillableAcknowledgement).toBe(true);
    });
  });

  describe('Local mode invariants', () => {
    it('denies REAL_WORLD_MUTATION in MVP even locally', () => {
      for (const risk of risks) {
        for (const cost of costs) {
          const result = evaluateStaticPolicy({
            mode: 'LOCAL',
            risk,
            sideEffect: 'REAL_WORLD_MUTATION',
            cost,
          });
          expect(result.allowed).toBe(false);
          expect(result.reasonCode).toBe('REAL_WORLD_MUTATION_DENIED');
        }
      }
    });

    it('allows R2 access locally with consent', () => {
      const r2Local = evaluateStaticPolicy({
        mode: 'LOCAL',
        risk: 'R2',
        sideEffect: 'READ_ONLY',
        cost: 'FREE',
      });
      expect(r2Local.allowed).toBe(true);
      expect(r2Local.requiresConsent).toBe(true);
      expect(r2Local.reasonCode).toBe('R2_CONSENT_REQUIRED');
    });

    it('requires consent for R3 non-mutating probes locally', () => {
      const r3Local = evaluateStaticPolicy({
        mode: 'LOCAL',
        risk: 'R3',
        sideEffect: 'READ_ONLY',
        cost: 'FREE',
      });
      expect(r3Local.allowed).toBe(true);
      expect(r3Local.requiresConsent).toBe(true);
      expect(r3Local.reasonCode).toBe('R3_CONSENT_REQUIRED');
    });
  });

  describe('User authorization and consent enforcement', () => {
    it('denies immediately if authorized is false', () => {
      const denied = evaluateExecutionPolicy({
        mode: 'LOCAL',
        risk: 'R0',
        sideEffect: 'NONE',
        cost: 'FREE',
        authorized: false,
        billableAcknowledged: false,
      });
      expect(denied.decision).toBe('DENY');
      expect(denied.reasonCode).toBe('NOT_AUTHORIZED');
    });

    it('demands billable acknowledgement when cost requires it', () => {
      const needsAck = evaluateExecutionPolicy({
        mode: 'HOSTED',
        risk: 'R0',
        sideEffect: 'READ_ONLY',
        cost: 'POSSIBLE_CHARGE',
        authorized: true,
        billableAcknowledged: false,
      });
      expect(needsAck.decision).toBe('ALLOW_WITH_CONSENT');
      expect(needsAck.reasonCode).toBe('BILLABLE_ACKNOWLEDGEMENT_REQUIRED');

      const acked = evaluateExecutionPolicy({
        mode: 'HOSTED',
        risk: 'R0',
        sideEffect: 'READ_ONLY',
        cost: 'POSSIBLE_CHARGE',
        authorized: true,
        billableAcknowledged: true,
      });
      expect(acked.decision).toBe('ALLOW');
    });
  });
});
