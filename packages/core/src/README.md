# `packages/core/src` recommended layout

```text
schemas/       Zod canonical input/result/manifest contracts
 domain/        domain types inferred from schemas, enums and helpers
 policy/        risk × side-effect × cost × mode policy
 intents/       IntentSpec and parameter validation
 planner/       ProbePlan DAG and bounds validation
 runner/        execution lifecycle, budget and cancellation
 diagnostics/   structured provider matching and fallback precedence
 evidence/      allowlisted evidence construction and aggregation
 redaction/     runtime SecretValue and RedactionContext
 network/       ControlledFetch interface/ports; actual runtime adapter injected
```

The directory is intentionally not prefilled with fake implementations. The first code PR should establish Zod schemas and their tests.
