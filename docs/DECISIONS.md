# Architecture Decision Records (ADRs)

An ADR captures context, the choice, consequences, status and date. Accepted decisions are carried forward from blueprint v2.4; an implementation must not silently reverse them.

## Accepted baseline decisions

| ID | Decision | Consequence |
|---|---|---|
| ADR-001 | Local CLI/shared core is P0 | Prove semantics locally before public hosted credential handling. |
| ADR-002 | Hosted processing is explicitly disclosed | Hosted credentials transit Worker; do not say “we never see your secret.” |
| ADR-003 | Credential risk is static declared metadata | Privilege cannot be reliably inferred before provider response. |
| ADR-004 | Risk, cost, side effect and execution mode are independent axes | Each has separate UI and policy representation. |
| ADR-005 | `IntentSpec` is separate from request-time `TestRequest` | Goals are reusable; params are validated at runtime. |
| ADR-006 | ProbePlan is bounded multi-step; Manifest v1 is single-step | Complex auth flows require reviewed code adapters. |
| ADR-007 | Manifest-first provider adapters | Common provider behavior lives in validated configuration. |
| ADR-008 | Hosted secrets are header-only | Avoid secret in URLs/query/body; exceptional auth remains local-only until reviewed. |
| ADR-009 | ControlledFetch is the only network gateway | Prevent adapters bypassing URL/redirect/header/resource controls. |
| ADR-010 | Provider-code-first classification | HTTP status is fallback, not semantic truth. |
| ADR-011 | Provider health is separate from credential/intent outcome | Outages don't masquerade as invalid keys. |
| ADR-012 | No credential database in MVP | Minimize breach impact and operational complexity. |
| ADR-013 | No direct-browser provider execution as trust mode | Browser-delivered JS is not local trusted execution. |
| ADR-014 | Durable Objects for hosted admission | Coordinated low-latency rate limits; do not use KV as hot-path limiter. |
| ADR-015 | Workers Cache only for public status data | Never cache credential-bearing paths/responses. |
| ADR-016 | No provider SDK in execution path | ControlledFetch owns retry/redirect/header/timeout semantics. |
| ADR-017 | No live credentials in untrusted CI | Use fixtures and tightly protected live canaries. |
| ADR-018 | Scheduled monitoring requires a separate secret-management ADR | Scheduled secret use is a different trust architecture. |
| ADR-019 | Policy matrix is total and default-deny | All 128 combinations have deterministic tested outcomes. |
| ADR-020 | Manifest inheritance is non-widening | Children cannot weaken host/auth/method/risk/cost/side-effect restrictions. |
| ADR-021 | Evidence is allowlisted, not raw | Minimize provider response disclosure. |
| ADR-022 | Provider admission budget counts accepted attempts | Avoid an extra mandatory hot-path write per test. |
| ADR-023 | GitHub is R2/local-first by default; hosted requires review | Source-code tokens may have meaningful blast radius. |
| ADR-024 | CLI precedes hosted rollout | Prove shared core and safety before hosted exposure. |
| ADR-025 | No email, user sign-in, external AI diagnosis or hosted file storage in MVP | Do not add speculative integrations; validate need and approve an ADR first. |
| ADR-026 | No customer DB or run-history table in MVP | Only short-lived abuse/admission/idempotency state persists. |
| ADR-027 | Runtime Zod schemas become canonical after Phase 0 | Types are inferred; documentation is synchronized to code contracts. |
| ADR-028 | Use the provisional Midnight Signal Lab design direction | Cinematic, lightweight marketing visuals; restrained dark diagnostic UI; violet primary action accent; teal connection accent; status colors remain semantic; see `DESIGN_SYSTEM.md` and `WEBSITE_DESIGN_RESEARCH.md`. |
| ADR-029 | Give motion a product-specific meaning | Signal Core connects the flask/key brand mark with provider, intent and evidence; Proof Path explains the real diagnostic sequence. CSS/SVG first; reduced-motion and static fallback required; production state animation follows real events only. See `MOTION_AND_INTERACTION.md`. |
| ADR-030 | Strict Security Disclosures & Semantic Evidence Boundaries | Claims must match actual implementation: policy engine is tested across 128 combinations with deny-by-default behavior (not universal safety); JS execution is transient in-memory with zero intentional retention (not forensic RAM wiping); diagnostic results explicitly display semantic bounds (what was proved vs unselected scopes); text contrast meets WCAG AAA standards with decorative text strictly confined to hero. |

## Open decisions — resolve in Phase 0 before implementation

| ID | Question | Required resolution |
|---|---|---|
| OPEN-001 | Exact Node.js/pnpm versions | Resolved: Node.js >=20 and pnpm@12.11.2 pinned in package.json & lockfile committed. |
| OPEN-002 | Public source-code license | Resolved: MIT License selected and added to root LICENSE and package.json files. |
| OPEN-003 | CI action commit SHAs and trusted-publishing configuration | Select official actions, pin full SHAs, least privilege and protected release environment. |
| OPEN-004 | Final public domain / Turnstile hostname and action names | Configure per environment; test server-side `success`, hostname and action validation. |
| OPEN-005 | Whether public hosted MVP should be enabled at launch | Based on trust interviews, abuse tests, provider capability, free-tier capacity and launch gate. |
| OPEN-006 | Physical implementation of diagnosis limiter | Implement a separate diagnosis counter/window to meet documented independence from credential-test quota. |
| OPEN-007 | Exact UI light-theme requirement | Dark theme is baseline; defer light theme until accessibility/contrast test proves value. |

## Change protocol

When a decision changes: (1) explain why in a new ADR or update an existing open ADR, (2) update `PROJECT.md`, (3) update impacted domain docs/acceptance checks, (4) update tests and implementation plan, (5) record migration or rollout implications. Do not rewrite history; mark superseded decisions and link their replacement.
