# Testing Strategy and Acceptance Checks

## Test pyramid

1. **Unit tests:** Zod schemas, policy function, intent validation, manifest merging/validation, matcher ranking/ties, aggregation, redaction, response parser limits, snippets and rate-window math.
2. **Provider fixture tests:** deterministic, offline fixtures for all normalized statuses and known provider-specific structures.
3. **Adapter contract tests:** exact host/method/auth placement/header/body/output limits, semantic assertions, extraction limits, matcher correctness, kill-switch behavior and no-bypass checks.
4. **Integration tests:** core runner + injected transport/clock, Durable Object admission concurrency, idempotency and stream lifecycle.
5. **End-to-end tests:** Playwright flow, consent controls, keyboard/focus, Turnstile failure path, Origin/CORS behavior, NDJSON final event and secret-redaction assertions.
6. **Security and abuse tests:** parser bombs, large compressed bodies, secret echo/derived secret redaction, redirects, denied headers, malicious manifests, policy matrix, rate-limit races and WAF/HTML block pages.
7. **Live smoke checks:** use dedicated minimal-scope test credentials only in protected environments; never require live keys in normal CI.

## Required fixture categories

For each provider where applicable:

- Valid key / intent succeeds
- Invalid credential
- Key type mismatch
- Permission denied / insufficient scope
- Billing required / quota exhausted
- Rate limited
- Model/resource unavailable
- Endpoint/path misconfigured
- Timeout/network issue
- Redirect blocked
- Transient 5xx/provider error
- Malformed JSON
- HTML/WAF challenge response
- Conflicting classifier rules
- Provider disabled/removed

Fixtures must be synthetic and contain no live credential or personal/customer data.

## Policy and domain gates

- Exhaustively test all 128 combinations (R0–R3 × 4 side-effect values × 4 cost classes × 2 execution modes); unknown/unrecognized input defaults to DENY.
- Test `authorized` and `billableAcknowledged` independently.
- Verify intent target schema rejects extra/missing/invalid values before secret materialization.
- ProbePlan DAG rejects cycles; max 4 steps and 4 provider requests; secret intermediates never become Evidence/telemetry/RunResult.
- Ensure every DiagnosticStatus has a deterministic default aggregation; ABORTED/client-abort behavior is INCONCLUSIVE.
- Provider health must remain separate from test result.

## Network/security acceptance tests

- No provider request from web/browser.
- A static/lint/architecture test detects any provider fetch outside ControlledFetch.
- Hosted URL exact-host check rejects redirects, IP literal, userinfo, non-default port, URL fragment and arbitrary host.
- Reject forbidden/hop-by-hop headers, unexpected Origin, non-JSON test request, over-limit request, unsupported methods and invalid Turnstile.
- Enforce response-size limits during streaming and again logically before parsing; compressed body cannot evade decoded-byte cap.
- Raw and derived secrets never appear in logs, UI, NDJSON evidence, error tracker mock, snapshots or snippets.
- Durable Object admission counters are atomic under concurrent load; limits return 429 + `Retry-After`; diagnosis quota cannot affect credential-test quota.
- Duplicate Idempotency-Key cannot launch duplicate provider calls within the dedupe window.
- Disabled provider produces zero provider network calls and does not materialize credentials.
- No auto retries: assert one outbound attempt for failure fixture.

## CLI acceptance tests

- No secret positional argument accepted.
- `.env` scanner max 256 KiB; regular file only by default; symlink not followed; no shell expansion or execution; UTF-8/LF/CRLF accepted; binary-like file rejected; duplicate keys warn without printing values.
- Local test performs no HealthLab data-plane request unless explicit status lookup is requested.
- Exit codes exact: 0 HEALTHY, 1 DIAGNOSTIC_FAILURE, 2 INCONCLUSIVE, 3 SKIPPED_OR_POLICY_BLOCKED, 4 INVALID_INPUT, 5 USAGE_ERROR, 6 ENGINE_ERROR.
- Generated curl/TypeScript/Python snippets have env placeholders only and pass deterministic snapshots.

## UI and transport acceptance tests

- `step_started` precedes corresponding `step_completed`; exactly one terminal `final` where delivery permits.
- Preflight refusals use HTTP status response and do not open stream.
- Credential tests set no-store; expected security headers exist; CSP is tested against actual Turnstile embed and app functionality.
- All core forms are keyboard-accessible, labels/errors screen-reader discoverable, focus visible, status includes text/icons as well as color.
- Credential input is not stored in browser storage and is not sent before explicit submit.

## CI gates

Format check, lint, TypeScript typecheck, unit suite, all provider contract tests, redaction/security suite and build. Pin actions by full commit SHA; keep workflow permissions least-privileged. Use protected environments for release, no production credentials on untrusted pull requests.

## Launch gates

Manual security review and independent penetration test where feasible before general public hosted credential testing; threat model and incident runbook reviewed; legal pages live; provenance/SBOM/checksum release flow established; free-tier load limits tested; 99.5% availability is an objective, not a free-tier SLA.
