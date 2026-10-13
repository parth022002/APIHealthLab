# Database and Persistence Design

## MVP persistence decision

There is **no application/customer relational database**, no user table, no credential vault and no persisted diagnostic-history table. Provider definitions/capabilities live in reviewed source-controlled manifests. Credentials, `TestRun`, `StepResult`, `Evidence`, target context and derived secrets are request-local only.

The sole planned persistent store in hosted MVP is SQLite-backed Cloudflare Durable Objects for bounded abuse/admission/idempotency state.

## Logical entities

| Entity | Storage | Relationship / contract | Persistence rule |
|---|---|---|---|
| Provider | Source-controlled manifest/catalog | One provider has products/capabilities and declared intents | Reviewed source only; stable provider ID |
| Product / capability | Manifest-derived catalog | Provider/product to supported IntentSpec | Generated, not hand-maintained |
| IntentSpec | Zod schema/source code | Validates goal and request-time parameter schema | Canonical schema once Phase 0 lands |
| CredentialInput / AuthCredential | Request-local memory | Typed auth method and secret material | Never persist, index or fingerprint raw value |
| TargetContext | Request-local memory | Non-secret model/project/resource context | Validate before secret materialization |
| TestRun / StepResult / Evidence | Request-local result lifecycle | One run has 0–4 step results and allowlisted evidence | Not durable in MVP |
| Source admission window | Durable Object SQLite | HMAC-pseudonymous source bucket within provider-scoped object | Expiring counter only |
| Provider admission window | Durable Object SQLite | Accepted attempts within a provider-scoped 15-minute window | Expiring counter only |
| Diagnosis admission window | Durable Object SQLite | Separate per-source diagnosis rate limit | Must not use/exhaust credential-test quota |
| Idempotency state | Durable Object SQLite | Short-lived key/request fingerprint and bounded sanitized result | TTL max 120 seconds; never raw request/secret/body |

## Physical schema proposal

The Durable Object identity is provider-scoped, so provider ID need not be repeated in each provider-window row. Use parameterized SQL and atomic transactions for counter updates.

```sql
CREATE TABLE IF NOT EXISTS source_window (
  bucket_hash TEXT PRIMARY KEY,
  window_start_ms INTEGER NOT NULL,
  request_count INTEGER NOT NULL CHECK (request_count >= 0),
  expires_at_ms INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_source_window_expiry
  ON source_window (expires_at_ms);

CREATE TABLE IF NOT EXISTS provider_window (
  window_start_ms INTEGER PRIMARY KEY,
  accepted_count INTEGER NOT NULL CHECK (accepted_count >= 0),
  expires_at_ms INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_provider_window_expiry
  ON provider_window (expires_at_ms);

CREATE TABLE IF NOT EXISTS diagnosis_window (
  bucket_hash TEXT PRIMARY KEY,
  window_start_ms INTEGER NOT NULL,
  request_count INTEGER NOT NULL CHECK (request_count >= 0),
  expires_at_ms INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_diagnosis_window_expiry
  ON diagnosis_window (expires_at_ms);

CREATE TABLE IF NOT EXISTS idempotency_state (
  key_hash TEXT PRIMARY KEY,
  request_fingerprint TEXT NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('ADMITTED','COMPLETED','REJECTED')),
  sanitized_result_json TEXT,
  expires_at_ms INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_idempotency_expiry
  ON idempotency_state (expires_at_ms);
```

`diagnosis_window` is the explicit physical representation of the v2.4 requirement that error-diagnosis admission be independent from credential-test limits. Keep it isolated from provider test counters.

## Keys, hashing and constraints

- `bucket_hash`: keyed HMAC of a normalized source identifier, using a distinct API HealthLab-owned secret per environment. Never store raw IP addresses.
- `key_hash`: keyed hash of the Idempotency-Key in an appropriately scoped namespace; raw key should not be persisted.
- `request_fingerprint`: keyed hash of a canonical, secret-excluded request descriptor. It must not be built from raw request JSON or credential values.
- Counter updates and admission decisions must be atomic; concurrent requests must not exceed the configured limits.
- Non-negative `CHECK` constraints and enum-value constraints are required.
- Expiry indexes support bounded cleanup; delete expired rows opportunistically during counter operations and optionally with a periodic cleanup path.
- A cached sanitized result may be retained for at most 120 seconds and max 64 KiB solely to suppress accidental duplicate execution/replay. It must exclude raw URLs, headers, bodies, credentials and secret intermediate values.
- Provider counter window size: 15 minutes. Source/provider test limit: 3. Provider-wide budget: 100 accepted attempts per 15 minutes/provider. Diagnosis limit: 10 per 10 minutes per source.

## What must never be stored

Raw or derived credentials; bearer tokens; API keys; raw IPs; raw provider request/response bodies; authorization headers; secret intermediate values; full error payloads; user accounts or run history (not in MVP). Never add logging or analytics tables that bypass these rules.

## Future persistence gate

User accounts, saved workspaces, team access, scheduled monitoring or diagnostic history need a separate accepted ADR covering business purpose, classification, encryption, retention/deletion, tenant isolation, access logs, backup/restore, incident response and breach impact. Do not introduce a database just to keep a diagnostic history that can remain ephemeral.
