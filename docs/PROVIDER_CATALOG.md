# Provider Catalog and Adapter Requirements

The validated manifests are the single source of provider capability truth. This page records the intended frozen catalog; live support is proven by adapter fixtures and code, not by this table alone.

| Provider ID | Auth | Hosted posture | P0 intent candidates in v2.4 |
|---|---|---|---|
| `openai` | `API_KEY` | Hosted + local, subject to R1/cost policy | `LIST_MODELS`, `CHAT_MINIMAL`, `EMBED_MINIMAL` |
| `gemini` | `API_KEY` | Hosted + local, subject to R1/cost policy | `LIST_MODELS`, `CHAT_MINIMAL`, `EMBED_MINIMAL` |
| `anthropic` | `API_KEY` | Hosted + local, subject to R1/cost policy | `LIST_MODELS`, `CHAT_MINIMAL` |
| `mistral` | `API_KEY` | Hosted + local, subject to R1/cost policy | `LIST_MODELS`, `CHAT_MINIMAL`, `EMBED_MINIMAL` |
| `groq` | `BEARER_TOKEN` | Hosted + local, subject to R1/cost policy | `LIST_MODELS`, `CHAT_MINIMAL` |
| `openrouter` | `API_KEY` | Hosted + local, subject to R1/cost policy | `LIST_MODELS`, `CHAT_MINIMAL` |
| `github` | `BEARER_TOKEN` | Local-first; hosted enablement reviewed explicitly | `IDENTITY`, `RESOURCE_READ` |

## Requirements for each provider addition/change

- Official documentation and terms reviewed; `docsUrl`, `termsUrl` and `verifiedOn` recorded.
- Exact host, endpoint/method, authentication header, body and extraction caps reviewed.
- Every intent has explicit risk/cost/side-effect/request-safety/data-sensitivity metadata.
- Provider code/structured semantics outrank generic HTTP fallback; conflicts handled deterministically.
- Fixtures cover success, invalid credential, permission/scope, billing/quota, rate limit, absent model/resource, endpoint issue, timeout, redirect, 5xx, malformed JSON and HTML/WAF where applicable.
- Contract tests assert no direct fetch, no retry, correct header/URL and parser bounds.
- Kill-switch test proves `DISABLED`/`REMOVED` returns `SKIPPED(PROVIDER_DISABLED)` before secret materialization and emits no network request.
- Capability matrix is generated during CI/release from validated manifests.

## Manifest v1 rules

- JSON/config only; no executable code, arbitrary regex, custom hosted manifest or arbitrary host.
- Supported methods: GET and POST.
- Header allowlist is global. Hosted credentials only go in declared auth header slots.
- Maximum inheritance depth 3; cycles rejected; deterministic merge; inheritance can never widen host/auth/method/risk/cost/side-effect policy.
- `LIST_MODELS`: capped array-pluck (max 256 entries, extracted strings max 512 chars) and optional `arrayContains(target.model)` assertion.
- `CHAT_MINIMAL` / `EMBED_MINIMAL`: provider-reviewed fixed JSON body, safe serializer, no arbitrary user text interpolation, output cap 4096 bytes; declared cost class reflects potential charge/quota.
- Retryable metadata is explanatory only; engine performs zero automatic retries.
- HTML/WAF classification to `ORIGIN_RESTRICTED` is allowed only where provider-specific evidence supports it; otherwise `UNKNOWN`.
