# API HealthLab — Master Project Brief

> **This is the project-level source of truth.** Read this file and `AGENTS.md` before changing code or asking an AI coding agent to implement a feature.

- **Project:** API HealthLab
- **Canonical project blueprint:** v2.4, copied to `reference/API_HealthLab_Project_Blueprint_v2.4_Architecture_and_Engineering_Specification.docx`
- **Repository pack:** 0.3.0 (pre-development scaffold + motion direction prototype)
- **Status:** Pre-development; Phase 0 has not been signed off
- **Last reviewed:** 2026-10-13
- **Product tagline (working):** Test. Diagnose. Fix. Integrate with Confidence.

## 1. Product thesis

API HealthLab is an intent-aware, evidence-driven API credential and integration diagnostics platform. It answers:

> **Can this credential safely perform this specific intended API action?**

It does not merely decide whether a string resembles an API key. The user selects a provider, a supported intent, target context, execution mode and policy implications. API HealthLab executes a bounded probe and returns a normalized diagnosis grounded in allowlisted evidence.

## 2. Product principles that must not be weakened

1. **Local-first:** the shared TypeScript core runs in the CLI. Credentials used in local execution stay on the user's machine during the diagnostic run.
2. **Hosted is convenience, not secret-blind:** hosted credentials transiently pass through the Worker. Do not claim that hosted mode never sees secrets. Do not intentionally persist credentials.
3. **Intent before credential:** select provider, intent, target, execution mode, risk, cost and side effects before the user enters a credential.
4. **Evidence before assertion:** normalized diagnosis must be supported by structured provider evidence or transparent transport/runtime evidence.
5. **Single controlled network boundary:** only `ControlledFetch` performs provider network calls. UI and adapters must not bypass it.
6. **Fail closed:** unknown policy combinations, unsupported auth, disabled providers, classifier conflicts and unsafe output result in denial or an inconclusive safe result—not permissive guessing.
7. **No unnecessary persistence:** no customer database, credential vault or durable diagnostic history in MVP.
8. **No silent scope expansion:** an out-of-scope integration or behavior requires an accepted Architecture Decision Record (ADR) before implementation.

## 3. Frozen MVP scope

### Providers

- OpenAI
- Google Gemini
- Anthropic
- Mistral
- Groq
- OpenRouter
- GitHub (local-first / hosted policy review; do not assume all GitHub tokens are safe for hosted tests)

Provider endpoint, auth, capability and matcher truth lives in reviewed source-controlled manifests. The provider capability matrix must be generated from manifests, never maintained as a separate manual source.

### Intents

- `LIST_MODELS`
- `IDENTITY`
- `CHAT_MINIMAL`
- `EMBED_MINIMAL`
- `RESOURCE_READ`

Unsupported provider/intent combinations must return `SKIPPED` with a stable reason code and make no provider request.

### Live MVP authentication methods

- `API_KEY`
- `BEARER_TOKEN`

Other auth shapes may exist as future contract planning, but they must not be exposed as implemented until UI handling, adapters, policy, and redaction tests exist.

### Execution surfaces

- **P0:** shared TypeScript core, CLI, provider manifests/adapters, error-only diagnosis, tests and contract validation.
- **P0 after local core gates:** constrained hosted web UI on React/Vite + Cloudflare Workers, Turnstile, SQLite-backed Durable Objects and NDJSON streaming.
- **Hosted restrictions:** one credential, one bounded run, R0/R1 only, exact bundled hosts, maximum one credential per request, no batching, no hosted custom manifests, no arbitrary URL, no automatic retry.
- **Direct-browser provider execution:** not in MVP.

## 4. Risk, cost and side-effect policy

The policy function consumes four independent axes: `CredentialRisk` (`R0`–`R3`), `SideEffectClass` (`NONE`, `READ_ONLY`, `SANDBOX_MUTATION`, `REAL_WORLD_MUTATION`), `CostClass` (`FREE`, `LOW`, `POSSIBLE_CHARGE`, `HIGH_CHARGE`) and `ExecutionMode` (`HOSTED`, `LOCAL`). Every combination must resolve deterministically; default is `DENY`. Decisions are `ALLOW`, `ALLOW_WITH_CONSENT` or `DENY`. Run automated tests for all 128 combinations.

- `R0`: minimal blast radius/public or low-impact metadata.
- `R1`: low-to-moderate impact, normally restricted/read-only developer credentials.
- `R2`: meaningful access to private data or scoped resources; deny in hosted MVP, local-first.
- `R3`: high-impact cloud/payment/private-key/database/admin material; deny in hosted MVP; only explicitly supported, policy-approved local flows.

Authorization and billable acknowledgement are separate booleans: `authorized` and `billableAcknowledged`.

## 5. Architecture and technology baseline

- TypeScript shared core with strict mode and Zod runtime schemas.
- React + Vite for the web UI.
- Cloudflare Worker as the hosted API/security boundary.
- Cloudflare Turnstile for hosted credential-test abuse prevention; server-side Siteverify is mandatory.
- SQLite-backed Cloudflare Durable Objects for short-lived admission counters and idempotency suppression.
- Commander-based CLI.
- Reviewed declarative single-step provider manifests; reviewed code adapters for bounded multi-step flows.
- No provider SDKs in the execution path; provider calls go through `ControlledFetch`.
- Monorepo with pnpm workspaces as the scaffold default. Pin exact Node.js/pnpm versions and commit the lockfile during Phase 0 before implementation expands.

## 6. Data and integration boundaries

MVP has **no end-user accounts, email/password login, OAuth sign-in, email delivery, external LLM diagnosis, hosted file uploads/object storage, credential vault, customer database, or persistent run-history feature**.

Provider credentials, `TestRun`, `StepResult`, `Evidence` and derived secrets exist only in request-local memory. The hosted Durable Object persistence is limited to pseudonymous admission counters and short-lived hashed idempotency state. Raw IPs, credentials, raw provider bodies and permanent run history must not be stored.

Error-only diagnosis is deterministic and rule-based. External AI is a provider under test only when the user deliberately selects a billable/cost-declared intent. Chat/embed prompts are fixed safe templates in MVP; arbitrary user text is not interpolated.

## 7. Non-negotiable security controls

- Hosted: HTTPS, exact allowlisted hosts, no arbitrary URLs, no IP literals/userinfo/non-default ports/fragments, manual redirects, header allowlist, GET/POST only for Manifest v1, bounded body/header/time/response parsing, no raw provider response output.
- Preflight before secret materialization: schema, provider lifecycle, intent parameters, policy, Origin/content type, Turnstile, admission and consent checks.
- Hosted credential endpoints use same-origin validation, deny-by-default CORS and `Cache-Control: no-store`.
- Required headers: CSP, HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, least-privilege `Permissions-Policy`, and `frame-ancestors 'none'`.
- Redact original and derived secrets immediately. Runtime `SecretValue` wrapper redacts `toJSON()`/`toString()`; JavaScript memory erasure is not guaranteed.
- No secrets in URLs, request bodies, argv, logs, analytics, session replay, error trackers, snippets or snapshots.
- Disabled/removed provider is rejected before credential materialization.
- No automatic retries. Hosted hard budget: 8 seconds total; provider timeout 6 seconds default; max 4 steps/requests, batch size 1.
- Initial limits: 3 credential tests per 15 minutes per source/provider; 10 error diagnoses per 10 minutes per source; 100 accepted test attempts per 15 minutes per provider. Rate-limited requests return HTTP 429 and `Retry-After`.

## 8. Source-of-truth hierarchy and change control

1. **Product scope and priorities:** this `PROJECT.md`.
2. **Detailed decisions:** the relevant `docs/*.md` file and accepted ADR in `docs/DECISIONS.md`.
3. **Runtime contracts after Phase 0:** repository Zod schemas and types inferred from those schemas are the canonical implementation contracts; docs must be synchronized to them.
4. **Reference blueprint:** `reference/*.docx` contains the complete v2.4 product/architecture specification. It is an important reference but not a substitute for updating this repository's concise implementation docs.
5. When two documents disagree, do not silently choose. Pause, record the conflict, resolve it with the project owner, update `PROJECT.md` plus affected docs, and add an ADR if it changes an architectural/product decision.

Every material decision update must change `PROJECT.md`'s **Current decisions / change log**, the relevant detailed document, and `docs/DECISIONS.md` if architectural. Every feature PR must identify the requirements, acceptance criteria and tests it satisfies.

## 9. Current status and milestones

- [x] Phase 0 — product/vertical slice (canonical schemas, 128-case policy suite, ControlledFetch, and 3-provider vertical slice)
- [x] Phase 1 — core hardening (DAG validation, plan bounds, manifest validator, RunResult aggregation, error diagnosis, and P0 security suite)
- [x] Phase 2 — CLI alpha (safe .env scanner, snippet generator, file/stdin credentials, offline diagnosis, and exit codes)
- [x] Phase 3 — seven provider manifests/fixtures (all 7 manifests, catalog generation, offline fixtures, and contract tests)
- [x] Phase 4 — hosted MVP & Web App (Cloudflare Worker boundary, NDJSON streaming, React web client, Midnight Signal Lab design system, Offline Error Diagnoser, Provider Catalog, Trust Architecture, and 77/77 tests green)
- [x] Phase 5 — launch hardening (zero-secret leak review, production builds across all 7 workspace packages/apps, security review)

No item should be marked complete merely because files compile; use the exit gates in `docs/IMPLEMENTATION_PLAN.md` and `docs/TESTING.md`.

## 10. Documents index

- `AGENTS.md` — required instructions for Codex/Cursor/Antigravity and other coding agents.
- `docs/REQUIREMENTS.md` — detailed product and quality requirements.
- `docs/USER_FLOWS.md` — canonical journeys and failure paths.
- `docs/ARCHITECTURE.md` — modules, APIs, boundaries and data flow.
- `docs/DATABASE.md` — logical and physical persistence schema.
- `docs/INTEGRATIONS.md` — APIs, platform integrations and explicitly excluded integrations.
- `docs/SECURITY.md` — threat surfaces, secret handling, access and abuse controls.
- `docs/CODING_STANDARDS.md` — naming, source layout, schema-first code and dependency policy.
- `docs/DESIGN_SYSTEM.md` — approved visual direction, tokens, interaction and accessibility.
- `docs/MOTION_AND_INTERACTION.md` — signature motion concepts, animation choreography, reduced-motion/accessibility rules, implementation and performance gates.
- `docs/WEBSITE_DESIGN_RESEARCH.md` — analysis of the 18 user-provided references and the design rationale for API HealthLab.
- `docs/IMPLEMENTATION_PLAN.md` — dependency-ordered milestones and go/no-go gates.
- `docs/TESTING.md` — testing strategy, fixtures and acceptance gates.
- `docs/DECISIONS.md` — accepted decisions and open questions.
- `docs/CONTRACTS.md` — domain vocabulary and normalized contract expectations.
- `docs/PROVIDER_CATALOG.md` — provider capability and evidence expectations.
- `security/` — threat model, incident response and disclosure policy drafts.
- `design-preview/` — clearly labelled exploratory, self-contained visual prototypes; not production app code.
- `reference/` — original v2.4 blueprint and brand asset.

## 11. Current decisions / change log

| Date | Decision/change | Status |
|---|---|---|
| 2026-10-13 | Repository scaffold created from blueprint v2.4; detailed documentation split into domain-focused files. | Current |
| 2026-10-13 | Keep MVP account-free, local-first, no hosted file uploads, no email delivery, and no third-party AI diagnosis. | Accepted from v2.4 |
| 2026-10-13 | Repository runtime schemas become canonical after Phase 0. | Accepted from v2.4 |
| 2026-10-13 | Adopt provisional Midnight Signal Lab visual direction: cinematic but lightweight brand moment, restrained dark product UI, violet primary accent, teal connectivity signal, semantic status colors. | Accepted design baseline; see `docs/DESIGN_SYSTEM.md` and `docs/WEBSITE_DESIGN_RESEARCH.md` |
| 2026-10-13 | Add the Signal Core + Proof Path as the distinctive motion language. Use CSS/SVG-first animation; keep real diagnostic motion driven by actual events; mark all marketing walkthrough data as illustrative. | Accepted design direction; see `docs/MOTION_AND_INTERACTION.md` |
| 2026-10-13 | Pinned Node.js engine (>=20), pnpm 12.11.2, generated lockfile, and implemented canonical Zod schemas, 128-case total execution policy, ControlledFetch, and 3-provider vertical slice (OpenAI, Gemini, GitHub). | Implemented |
| 2026-10-13 | Phase 1 core hardening complete: ProbePlan DAG/cycle validation, plan bounds, manifest security validator, RunResult aggregation, zero-credential error diagnosis, and P0 security test suite (46 tests green). | Implemented |
| 2026-10-13 | Phase 2 CLI alpha complete: Safe .env scanner (256 KiB cap, symlink rejection, no shell eval), reproducer snippet generator (curl, TypeScript, Python), file/stdin credential input, and integration tests (59 tests green). | Implemented |
| 2026-10-13 | Phase 3 MVP providers complete: All seven manifests implemented (OpenAI, Gemini, GitHub, Anthropic, Mistral, Groq, OpenRouter), dynamic catalog generation in `@api-healthlab/catalog`, and contract tests (69 tests green). | Implemented |
| 2026-10-13 | Phase 4 hosted MVP complete: Cloudflare Worker boundary with security headers and NDJSON streaming, React web client implementing the Midnight Signal Lab design system with Signal Core hero, Proof Path demo, interactive live flow, zero-credential error lab, manifest catalog, and trust comparison (77 tests green). | Implemented |
| 2026-10-13 | Phase 5 launch hardening complete: Production builds validated across all 7 workspace packages and apps; 100% secret leak and redaction validation verified. | Implemented |
| Pending product/legal review | Select the repository license and finalize public legal pages. | Open |
