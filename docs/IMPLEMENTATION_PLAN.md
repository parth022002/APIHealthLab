# Implementation Plan and Milestones

**Execution model:** CLI/shared core first, hosted product second. Do not begin broad feature implementation before Phase 0 freezes contracts and policy tests.

| Phase | Indicative estimate | Deliverables | Exit gate |
|---|---:|---|---|
| 0 — Product / vertical slice | 1–2 weeks | Pin toolchain; canonical schemas; OpenAI `LIST_MODELS`, Gemini invalid-key, GitHub identity through shared core; customer interviews | 128-case policy suite frozen; three providers work locally; interview threshold reviewed |
| 1 — Core hardening | 1.5–2.5 weeks | Credential schemas, ProbePlan, manifest validator, ControlledFetch, classifier, redactor, evidence | All P0 security tests green |
| 2 — CLI alpha | 1.5–2 weeks | Commander CLI, safe `.env` scanner, error diagnosis, snippets, JSON/text output and exit codes | Local run never contacts hosted data plane; exit contract stable |
| 3 — MVP providers | 1–1.5 weeks | Remaining manifests and fixtures for all seven providers | All adapter contract and fixture tests green |
| 4 — Hosted MVP | 2–3 weeks | React/Vite, Worker, Turnstile, DO admission, NDJSON and strict CSP/CORS | Hosted security/accessibility gates green |
| 5 — Launch hardening | 1.5–2 weeks | Threat model, DAST/manual review, legal pages, provenance, SBOM, incident runbook | All public hosted launch gates green |

Estimates are planning ranges, not commitments. Re-estimate after Phase 0; do not trade off security gates to meet a calendar estimate.

## Phase 0 — Exact tasks

1. Reconcile all contracts in `docs/CONTRACTS.md` and `docs/PROVIDER_CATALOG.md` against blueprint v2.4.
2. Select/pin Node.js and package-manager versions, add workspace configs and commit one lockfile.
3. Implement shared Zod schemas and infer TypeScript types; ensure public `CredentialInput` naming is consistent with internal auth discriminant.
4. Implement total policy function and test all 128 combinations, default deny.
5. Build a narrow vertical slice: OpenAI `LIST_MODELS`; Gemini invalid-key classification fixture; GitHub identity (local-first) via the same core abstractions.
6. Establish provider manifest validator and prove adapters cannot bypass ControlledFetch.
7. Interview 15 developers: 5 AI developers, 5 full-stack, 3 platform, 2 security. Ask about recent setup/diagnosis pain and current workaround.
8. Measure baseline time-to-diagnosis and compare the prototype. Do not build all UI first.

## Validation thresholds

- Continue after interviews if ≥10/15 report recent API setup/diagnosis pain and ≥7/15 say current workflow is inefficient.
- Compare median time-to-diagnosis versus current workflow. Record measurements and method; do not cherry-pick tasks.
- Do not ship hosted credential testing by default if fewer than 5/10 tested developers are comfortable after clear hosted secret-exposure disclosure.
- At 30 days after a controlled early release, target ≥30% repeat use before scope expansion. If below threshold, examine observed use and user feedback before adding features.
- If thresholds fail, write a decision/pivot in `PROJECT.md` and `docs/DECISIONS.md` rather than silently continuing.

## Dependency order

Contracts → policy → plan/manifest validation → ControlledFetch → classification/evidence/redaction → CLI → remaining providers → web/Worker boundary → admission/streaming → launch hardening. Keep error-only diagnosis independent so it can be delivered without credentials.

## Definition of done per phase

A phase is complete only when code, tests, docs, versioned contracts and its exit gate are reviewed. A roadmap checkbox is never proof of security correctness by itself.
