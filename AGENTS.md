# Instructions for AI Coding Agents

These instructions apply to Codex, Cursor, Antigravity and any other coding agent operating in this repository.

## 1. Required context before editing

Always read, in this order:

1. `PROJECT.md`
2. This `AGENTS.md`
3. The relevant domain document(s) in `docs/`
4. The corresponding accepted ADR(s) in `docs/DECISIONS.md`
5. For UI/visual tasks, read `docs/DESIGN_SYSTEM.md`, `docs/WEBSITE_DESIGN_RESEARCH.md` and `docs/MOTION_AND_INTERACTION.md`
6. The v2.4 reference blueprint only when detail is missing or ambiguous

Do not ask the user to restate details already recorded in the repository. If an important detail is missing or conflicting, ask one focused question before encoding an irreversible choice.

## 2. Scope discipline

- Implement only the frozen MVP in `PROJECT.md` unless the user explicitly changes scope.
- Do not add sign-in, user accounts, email delivery, AI-based error diagnosis, hosted file upload/object storage, persistent credentials, run history, batch testing, scheduled tests or arbitrary hosted URLs as unrequested “improvements.”
- Do not claim provider/auth/intent support unless a reviewed manifest or code adapter, tests and UI path all exist.
- Do not expand live auth beyond `API_KEY` and `BEARER_TOKEN` without an accepted ADR and full test coverage.
- Do not use a provider SDK in the execution path. No provider adapter may call `fetch` directly.

## 3. Architecture invariants

- `packages/core` owns domain semantics, policy evaluation, plan validation/execution, classification, aggregation, evidence allowlisting and redaction.
- `apps/web` is a presentation client; the browser never calls provider endpoints.
- `apps/worker` is the hosted trust boundary and invokes the shared core through injected ports.
- `apps/cli` is the local-first execution surface and reuses the same core contracts.
- Only the `ControlledFetch` implementation can contact external provider APIs.
- Application modules depend inward on core contracts. Core must not import React, Worker-only APIs, Commander or provider SDKs. Inject runtime-specific ports.
- Provider manifests are data/configuration, not executable code. Manifest v1 is single-step; multi-step workflows require reviewed code adapters and a bounded ProbePlan.
- Never materialize a credential until preflight, provider lifecycle, intent/schema, policy and applicable consent gates have passed.

## 4. Security rules

- Never expose or log raw credentials, derived secrets, raw provider bodies, secret-bearing URLs/headers, raw errors or environment values.
- No secret as a CLI positional argument. Supported input channels: environment variable, stdin, hidden prompt or explicit local file reference.
- Never put provider credentials in `PROJECT.md`, docs, issues, fixtures, snapshots, generated snippets, analytics, session replay or error trackers.
- Register runtime-derived secrets with `RedactionContext` immediately. The JavaScript wrapper is not a memory-erasure guarantee.
- Hosted endpoints: exact provider host allowlist, HTTPS, strict Origin/content-type/size checks, deny-by-default CORS, Turnstile server-side Siteverify, Durable Object admission, manual redirects, allowlisted headers, GET/POST only, timeout/byte/parser limits and `Cache-Control: no-store`.
- No automatic retries. Avoid provider requests unless explicit authorization exists; billable probes additionally require `billableAcknowledged` where policy says so.
- All 128 risk × side-effect × cost × mode combinations must be covered by tests. Policy defaults to DENY.
- `DISABLED` or `REMOVED` providers must be blocked before credential materialization.

## 5. Implementation workflow

For every feature:

1. Identify its requirement IDs and acceptance checks.
2. Confirm whether the change affects product scope, security, data flow, database, UI behavior, provider capabilities or external integrations.
3. If architecture/product decision changes, update `PROJECT.md`, affected docs and `docs/DECISIONS.md` with an ADR before or in the same change.
4. Write tests before/with behavior; default to offline deterministic fixtures.
5. Run formatting, lint, typecheck, unit tests, adapter contract tests and build as applicable.
6. Check logs, results, snapshots and snippets for secret leakage.
7. Summarize files changed, tests run/results, known limitations and docs updated. Never claim tests passed if they were not run.

## 6. Code quality conventions

- TypeScript strict mode; avoid `any`; parse external values as `unknown` until validated.
- Zod runtime schemas are canonical; infer types from schemas. `safeParse` untrusted boundaries.
- Use explicit return types for security-sensitive functions and exhaustive discriminated unions with `assertNever`.
- Normalize expected failures into stable `DiagnosticStatus` and `reasonCode` values. Do not display raw error objects.
- React components are accessible and presentation-focused. Credential input must not persist to localStorage/sessionStorage or be sent before explicit submit.
- For UI work, follow centralized design tokens and the `Midnight Signal Lab` direction; treat reference websites as inspiration, never copy a site pixel-for-pixel. Follow `docs/MOTION_AND_INTERACTION.md`: the Signal Core + Proof Path are the signature concepts; default to CSS/SVG; make motion state meaningful. Keep cinematic/3D effects optional, lightweight, reduced-motion-aware and absent from critical credential/result flows. Any marketing simulation must be labelled and must never imply a live provider request.
- Generate provider capability docs from validated manifests. Do not manually fork catalog truth.
- Pin GitHub Actions to full commit SHAs and use least-privilege workflow permissions.

## 7. Required completion response

At the end of each task, report:

- What changed
- Requirement/acceptance IDs addressed
- Validation commands actually run and their result
- Any unimplemented items, trade-offs or open questions
- Documentation/ADR changes
