# Security, Authentication and Data Protection

## Four separate concepts

1. **API HealthLab sign-in:** none in MVP; no user account or application session.
2. **Provider authentication:** user supplies a supported provider credential (`API_KEY` or `BEARER_TOKEN`) for one explicit test.
3. **Probe authorization:** user separately acknowledges that the selected operation is authorized; represent as `authorized: boolean`.
4. **Operator/release authentication:** controlled through Cloudflare platform access, protected GitHub environments, least-privilege CI identities and release approvals outside public routes.

Do not conflate provider key acceptance with permission to perform an operation or API HealthLab user authentication.

## Execution policy

Risk, cost, side effect and execution mode are independent axes. Policy evaluates all 128 combinations; default is DENY. Outcomes: `ALLOW`, `ALLOW_WITH_CONSENT`, `DENY`. Hosted mode supports only R0/R1, exact bundled hosts, one credential and one bounded test. Hosted R2/R3, arbitrary URLs, custom manifests, batches and real-world mutation are denied in MVP. Local mode does not automatically make an intent safe; provider and policy gates still apply.

Separate `authorized` and `billableAcknowledged` booleans. Show mode, risk, side effects and cost to the user before credential entry. `FREE`, `LOW`, `POSSIBLE_CHARGE`, `HIGH_CHARGE` are cost classes; `METADATA` is a probe category, not a cost class.

## Secret handling lifecycle

1. Read a credential from typed masked field or approved CLI channel.
2. Wrap it in runtime `SecretValue`; redact `toJSON()`/`toString()` by default.
3. Materialize only after all preflight/policy checks.
4. Only auth/request-building boundary can reveal the secret into the declared auth header.
5. Register all source and derived secrets immediately with `RedactionContext` (OAuth token, JWT assertion, SigV4 signature, session token etc. if a future reviewed adapter supports them).
6. Build evidence from allowlisted facts only; raw provider body/headers/credentials never leave the execution context.
7. On exit, drop references; do not claim guaranteed JS memory erasure.

Secrets must never appear in URLs, request bodies (MVP hosted), command arguments, shell history, logs, telemetry, analytics, session replay, error tracker, screenshots, snapshots, snippets, exported results or persistent database rows.

## Hosted trust boundary and HTTP policy

- Clear disclosure: hosted credential bytes transiently traverse the Worker; no intentional persistence.
- HTTPS only. Exact host allowlist from reviewed manifests, no arbitrary user URL; no IP literal, userinfo, non-default port, fragment or user proxy/socket/DNS settings.
- `redirect: manual`; all redirects blocked unless future reviewed destination validation exists.
- Manifest v1 HTTP verbs: GET and POST only. Hosted secrets in declared auth headers only.
- Global request header allowlist; reject Host, Content-Length, Cookie, Set-Cookie, Connection, Transfer-Encoding, Proxy-Authorization, Proxy-Connection, Forwarded, all `X-Forwarded-*`, Upgrade and hop-by-hop equivalents.
- Limits: request ≤32 KiB; decoded provider response ≤128 KiB; response headers ≤128 KiB; nesting ≤20; array items ≤256; evidence items ≤64; extracted strings ≤512 chars; provider timeout 6 seconds default; test budget ≤8 seconds; billable template output cap 4096 bytes.
- Bound decoded bytes while streaming before JSON parse; compressed responses remain bounded after decompression.
- Use honest `User-Agent: API-HealthLab/<version>`.

## Browser security

Credential endpoints require JSON content type and Origin matching deployed API HealthLab origin. CORS deny-by-default; reject unexpected origin before credential materialization. Apply request-size cap before JSON parse. Use:

- Strict Content-Security-Policy with only required same-origin/Turnstile allowances
- Strict-Transport-Security
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: no-referrer`
- Least-privilege `Permissions-Policy`
- `frame-ancestors 'none'`
- `Cache-Control: no-store` on credential-bearing API responses

Do not place credentials in localStorage/sessionStorage or route/query state. Inputs clear after result/exit where practical.

## Turnstile, limits and denial behavior

- Server-side Siteverify is mandatory; validate `success`, expected hostname, expected action and error codes. Treat token as short-lived/single-use per provider rules.
- 3 credential tests per 15 minutes per source/provider.
- 10 error diagnoses per 10 minutes per source.
- 100 accepted credential-test attempts per 15 minutes per provider.
- Maximum 4 plan steps/requests; no retries; batch size 1.
- Denial occurs before provider request; use HTTP 429 plus `Retry-After` when limited.
- If hosted budget or control-plane capacity is exhausted, fail closed and show “Hosted testing temporarily unavailable — use the local CLI.”

## Provider lifecycle and kill switch

A provider can be `ACTIVE`, `REVIEW`, `DEPRECATED`, `DISABLED` or `REMOVED`. `DISABLED`/`REMOVED` blocks before secret materialization. Operators can disable a provider or all hosted credential testing during an incident.

## Environment and operations

Development, staging and production must have separate Turnstile keys, Durable Object namespaces, HMAC keys, routes, test canaries and release approvals. API HealthLab-owned secrets belong in protected platform secret bindings or protected/offline release identities. Never commit them. Rotate on suspected compromise and after relevant personnel/access changes.

## Logging, telemetry and error handling

Telemetry and update checks are off by default in CLI. If safe operational metrics are introduced, define an allowlist and data-retention policy first. Never log raw request body, provider response body, authorization headers, credentials, env variable values or raw `Error` object messages that may contain secrets. Unknown failures become sanitized `ENGINE_ERROR` / `UNKNOWN` without leaking raw details.

## Security launch gates

See `security/THREAT_MODEL.md`, `security/INCIDENT_RESPONSE.md`, `docs/TESTING.md`, and the launch acceptance section. Complete STRIDE/abuse-case review, manual review and an independent penetration test where feasible before public hosted credential testing.
