# Requirements Specification

**Status:** Baseline from v2.4; implementation not started. Requirement IDs should be referenced in pull requests and tests.

## Product outcome

A developer chooses an API provider and intent, supplies a typed credential through a safe channel, runs one bounded probe and receives a normalized diagnosis with evidence, confidence/strength and next steps. The system must distinguish credential validity from whether that credential can perform the selected intent.

## User types and permissions

| Actor | Authentication | Allowed actions | Forbidden actions |
|---|---|---|---|
| Anonymous web visitor | No HealthLab account in MVP | Read public provider metadata; submit bounded error-only diagnosis | Operator settings, persistent history, account-only features |
| Hosted test requester | Typed `API_KEY` or `BEARER_TOKEN` plus valid Turnstile verification | One authorized R0/R1 bounded test against an exact supported provider host | Batch, arbitrary URL/custom manifest, R2/R3 hosted tests, unsafe side effects |
| Local CLI user | Local machine; approved secret channel | Run supported local probes subject to same intent/policy constraints | Raw secret in argv; unsafe unreviewed custom manifest by default |
| Operator / incident responder | Protected Cloudflare/platform account, outside public app routes | Rotate service secrets, disable hosted tests/providers, inspect safe operational metadata, rollback | Retrieve past user credentials; the platform must not store them |
| Release maintainer/CI | Protected environment and least-privilege workflow identity | Test/build/provenance/publish reviewed releases | Production secrets exposed to forks or untrusted pull requests |

## Functional requirements

### Request, policy and execution

- **FR-001** The user selects intent before entering a credential.
- **FR-002** Provider, intent, target parameters and auth method are validated against manifest-derived capabilities and canonical schemas.
- **FR-003** Required/missing/extra intent parameters are rejected before secret materialization.
- **FR-004** The policy function covers all 128 combinations of risk, side effect, cost and execution mode, defaults to DENY and returns only `ALLOW`, `ALLOW_WITH_CONSENT` or `DENY`.
- **FR-005** `authorized` and `billableAcknowledged` are separate booleans; billable acknowledgement is required where policy says so.
- **FR-006** Maximum plan size is 4 steps and maximum provider subrequests is 4; Manifest v1 stays single-step.
- **FR-007** No automatic retries. Hosted total time budget is 8 seconds; provider timeout defaults to 6 seconds.
- **FR-008** Unsupported intent returns `SKIPPED(UNSUPPORTED_INTENT)` and makes no provider request.
- **FR-009** Disabled/removed providers are rejected before credential materialization.
- **FR-010** Every result uses normalized statuses, stable reason codes, allowlisted evidence and a versioned aggregation policy.

### Provider support

- **FR-011** P0 providers are OpenAI, Google Gemini, Anthropic, Mistral, Groq, OpenRouter and GitHub.
- **FR-012** P0 intents are LIST_MODELS, IDENTITY, CHAT_MINIMAL, EMBED_MINIMAL and RESOURCE_READ, only where supported.
- **FR-013** Live MVP auth is API_KEY and BEARER_TOKEN only.
- **FR-014** Provider capabilities are generated from validated source-controlled manifests.
- **FR-015** Error matching prefers provider structured codes/body/header evidence over generic HTTP fallback; equally authoritative conflicts become INCONCLUSIVE.
- **FR-016** AI chat/embed probes use reviewed fixed JSON templates, tiny output caps and declared cost classes; arbitrary user prompt text is not inserted in MVP.

### Hosted API

- **FR-017** Hosted credential test preflight enforces POST, JSON content type, request-size limit, allowed Origin, schema and Turnstile verification before starting the stream.
- **FR-018** Turnstile verification must validate success, expected hostname and action server-side.
- **FR-019** Rate limit per source/provider is 3 credential tests per 15 minutes; diagnosis is 10 per 10 minutes per source; provider-wide admission budget is 100 accepted test attempts per 15 minutes/provider.
- **FR-020** Rate limit responses are HTTP 429 with `Retry-After`; preflight refusals do not start NDJSON streams.
- **FR-021** Accepted tests stream `step_started`, `step_completed`, and terminal `final` events using the canonical event schema.
- **FR-022** Credential-bearing responses use `Cache-Control: no-store`; CORS is deny-by-default; arbitrary browser origins are rejected.
- **FR-023** Idempotency suppresses accidental duplicate provider execution for a short window without persisting raw request bodies or credentials.

### CLI

- **FR-024** CLI reads secrets from env, stdin, hidden prompt or explicit local file reference; never from positional args.
- **FR-025** `.env` scanning reads regular files only by default, max 256 KiB; no shell expansion/evaluation; supports common KEY=value/export KEY=value syntax without executing it; rejects binary-like content and does not follow symlinks by default.
- **FR-026** Duplicate `.env` variables trigger a warning without printing values; detected env values do not mean authentication passed.
- **FR-027** Telemetry and update checks are off by default. Local CLI probes do not call the HealthLab data plane.
- **FR-028** Exit codes are stable: 0 HEALTHY; 1 DIAGNOSTIC_FAILURE; 2 INCONCLUSIVE; 3 SKIPPED_OR_POLICY_BLOCKED; 4 INVALID_INPUT; 5 USAGE_ERROR; 6 ENGINE_ERROR.
- **FR-029** Optional curl/TypeScript/Python snippets derive from a resolved request with credential placeholders only; snapshot tests are deterministic.

### Diagnosis and results

- **FR-030** Error-only diagnosis uses local deterministic rules and accepts no credential.
- **FR-031** Raw provider response bodies are never returned in MVP.
- **FR-032** Results communicate what was proved and what was not proved, show provider health separately from credential/intent outcome, and explain remediation using structured action IDs.
- **FR-033** A client-aborted run maps to `runState=ABORTED` and `overall=INCONCLUSIVE` if the final event can be emitted.

## Non-functional requirements

- **NFR-001 Security:** every provider fetch passes through ControlledFetch; exact host allowlists in hosted mode.
- **NFR-002 Privacy:** no permanent credential storage, diagnostic history, telemetry of secrets or hosted uploaded files.
- **NFR-003 Reliability:** deterministic error classification, bounded deadlines and no hidden retries.
- **NFR-004 Resource safety:** hosted request body ≤32 KiB; decoded provider response ≤128 KiB; response headers ≤128 KiB; JSON nesting ≤20; array items ≤256; extracted evidence items ≤64; extracted string length ≤512; billable probe output cap 4096 bytes.
- **NFR-005 Supply chain:** lockfile committed, CI actions pinned to full SHAs, least-privilege workflow permissions, protected release environment, provenance/SBOM/checksums.
- **NFR-006 Accessibility:** core user journey aims for WCAG 2.2 AA; keyboard navigation, visible focus and accessible forms are required.
- **NFR-007 Observability:** only security-safe operational metadata; never raw request, secrets, headers or provider response bodies.
- **NFR-008 Performance:** hosted pre-provider p95 target under controlled conditions <300 ms; whole hosted run hard budget ≤8 seconds.
- **NFR-009 Portability:** core domain semantics should not depend on UI, Worker runtime, Commander or provider SDKs.
- **NFR-010 Maintainability:** strict TypeScript, schema-first contracts, generated capability catalog and fixture-based tests.

## Acceptance and exclusions

Use `docs/TESTING.md` and `docs/IMPLEMENTATION_PLAN.md` as the launch-gate source. No login, email, external AI diagnosis, hosted file store, user credentials vault or diagnostic history should be added under these requirements.
