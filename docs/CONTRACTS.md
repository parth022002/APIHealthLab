# Canonical Domain and Runtime Contracts

**Current state:** This file documents expected semantics before schemas are implemented. During Phase 0, implement Zod schemas under `packages/core/src/schemas/`, infer TypeScript types from them and use those schemas as the runtime contract source of truth.

## Domain vocabulary

- **Provider:** external service boundary, such as OpenAI or GitHub.
- **Product:** a provider surface (e.g., hosted LLM API); not the same as a model.
- **ModelCatalogEntry:** observed or curated model/resource metadata with source and verification information where applicable.
- **CredentialInput:** public request union containing typed auth material and execution context.
- **AuthCredential:** internal discriminated authentication shape; live MVP variants are `API_KEY` and `BEARER_TOKEN` only.
- **TargetContext:** non-secret request context such as model, project, deployment, region or resource identifier.
- **IntentSpec:** reusable user goal with its parameter schema, supported capabilities and safety metadata.
- **ProbePlan:** bounded sequence/DAG of steps; max 4 network steps and max 4 provider requests. Explicit dependencies only; cycles rejected.
- **Evidence:** allowlisted observed fact with source type/locator, sanitized observed value, evidence strength and verification time.
- **StepResult:** terminal state/status/evidence for one step.
- **DiagnosticStatus:** normalized root-cause classification (see below).
- **ProviderHealthSignal:** independent status signal for upstream provider health.
- **RunResult:** final aggregated result; secrets and secret intermediates never appear.
- **AggregationPolicy:** versioned mapping from step/status evidence to overall/run state.
- **ExecutionPolicy:** execution mode, credential risk, cost, side-effect, explicit authorization and billable acknowledgement.

## Enumerations

```ts
export type CredentialRisk = 'R0' | 'R1' | 'R2' | 'R3';
export type CostClass = 'FREE' | 'LOW' | 'POSSIBLE_CHARGE' | 'HIGH_CHARGE';
export type ProbeCategory = 'METADATA' | 'IDENTITY' | 'CHAT' | 'EMBEDDING' | 'RESOURCE_READ';
export type SideEffectClass = 'NONE' | 'READ_ONLY' | 'SANDBOX_MUTATION' | 'REAL_WORLD_MUTATION';
export type ExecutionMode = 'HOSTED' | 'LOCAL';
export type PolicyDecision = 'ALLOW' | 'ALLOW_WITH_CONSENT' | 'DENY';
export type EvidenceStrength = 'HIGH' | 'MEDIUM' | 'LOW';
export type AuthMethod = 'API_KEY' | 'BEARER_TOKEN'; // MVP runtime support only
export type StepState = 'PASS' | 'FAIL' | 'SKIPPED' | 'INCONCLUSIVE';
export type RunState = 'COMPLETED' | 'BLOCKED' | 'ABORTED';
```

Future auth shapes in the reference contract must not be considered implemented without adapter/UI/policy/redaction coverage.

## DiagnosticStatus and default aggregate

| Status | Meaning | Default overall |
|---|---|---|
| `HEALTHY` | Selected intent succeeded | `HEALTHY` |
| `INVALID_CREDENTIAL` | Provider evidence says credential rejected | `FAILED` |
| `KEY_TYPE_MISMATCH` | Credential method/schema mismatch | `FAILED` |
| `PERMISSION_DENIED` | Credential recognized, selected operation not authorized | `FAILED` |
| `INSUFFICIENT_SCOPE` | Explicit scope mismatch | `FAILED` |
| `QUOTA_EXHAUSTED` | Balance/quota exhausted | `FAILED` |
| `BILLING_REQUIRED` | Billing/prepay requirement blocks request | `FAILED` |
| `MODEL_UNAVAILABLE` | Model/resource absent, retired or inaccessible | `FAILED` |
| `ENDPOINT_MISCONFIGURED` | Endpoint/path/deployment/version/target is wrong | `FAILED` |
| `RATE_LIMITED` | Temporary throttling | `INCONCLUSIVE` |
| `ORIGIN_RESTRICTED` | IP/referrer/app-origin restriction mismatch | `INCONCLUSIVE` |
| `REGION_BLOCKED` | Target unavailable from current region/execution context | `INCONCLUSIVE` |
| `NETWORK_TIMEOUT` | No response within budget | `INCONCLUSIVE` |
| `TRANSIENT_PROVIDER_ERROR` | 5xx/transport error with insufficient root-cause evidence | `INCONCLUSIVE` |
| `REDIRECT_BLOCKED` | Redirect destination not approved | `INCONCLUSIVE` |
| `UNKNOWN` | Evidence insufficient to classify | `INCONCLUSIVE` |
| `UNSUPPORTED_INTENT` | Provider cannot safely test selected intent | `SKIPPED` |

Additional aggregate rules: policy refusal/missing required context → `overall=SKIPPED`, `runState=BLOCKED`; prerequisite failure skips dependents and makes run `FAILED` with root cause as primary status; provider health incident plus transient selected-intent failure → `INCONCLUSIVE` unless provider-specific evidence proves another root cause; client abort → `runState=ABORTED`, `overall=INCONCLUSIVE`, `reasonCode=CLIENT_ABORTED`; equally authoritative conflicting classifier evidence → `INCONCLUSIVE`.

## Evidence contract

Evidence source type is one of `PROVIDER_RESPONSE`, `TRANSPORT`, `LOCAL_RUNTIME`, `PROVIDER_STATUS`. A source locator can identify an allowlisted header, JSON pointer, transport field or status source. Observed values must be sanitized/allowlisted; each evidence record has `HIGH`, `MEDIUM` or `LOW` strength and observation time. Raw provider body or auth header is never evidence.

## NDJSON event contract

- `step_started`: schema version, monotonic `seq`, `stepId`.
- `step_completed`: schema version, monotonic `seq`, `stepId`, state/status and allowlisted evidence.
- `final`: result schema version, overall, runState, primaryStatus/reason, aggregation policy version, engine version, provider manifest version.
- Secrets, secret-derived intermediates, raw URLs/headers/bodies are prohibited from every event.

## Manifest and parameter contracts

- Manifest v1 is declarative and single-step; HTTP GET/POST only.
- Target params validate against the selected IntentSpec schema; no generic unchecked map.
- Host, method, auth location, headers, request body, extraction limits, semantic assertions and matcher rules are bounded and revalidated at runtime.
- Inheritance depth ≤3, cycles rejected, deterministic merge rules, and child policies cannot widen security.
- `LIST_MODELS` uses capped array extraction and optional target-model membership assertion.
- Chat/embed probes use fixed provider-reviewed request templates and explicit output caps.
