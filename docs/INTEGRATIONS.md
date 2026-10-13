# Integration Inventory

## Integration rule

Every outbound integration must have an explicit purpose, data contract, owner, environment, allowed data classification, secret owner, timeout/retry behavior, failure path, rate limit, licensing/terms review, retention rule and tests. Add it only with a documented ADR. Provider SDKs are excluded from the execution path because they may hide retries or bypass controlled networking.

## MVP integrations

| Integration | Purpose | Data exchanged | Security / scope |
|---|---|---|---|
| OpenAI | Provider under test | User-selected bounded request; auth header; structured evidence | Exact host; fixed minimal safe templates for billable intent; explicit cost class |
| Google Gemini | Provider under test | Same pattern through reviewed Gemini manifest | Exact host/auth placement validated; no unsupported auth shortcuts |
| Anthropic | Provider under test | Same pattern through reviewed manifest | Exact host/auth placement validated |
| Mistral | Provider under test | Same pattern through reviewed manifest | Exact host/auth placement validated |
| Groq | Provider under test | Same pattern through reviewed manifest | Exact host/auth placement validated |
| OpenRouter | Provider under test | Same pattern through reviewed manifest | Exact host/auth placement validated |
| GitHub | Identity/resource read where supported | Bearer token to selected documented read-only intent | Local-first; hosted enablement requires explicit security review/policy |
| Cloudflare Workers | Hosted request boundary, streaming and routes | Validated request and sanitized result | Separate environments, security headers, same-origin checks, `no-store` |
| Cloudflare Turnstile | Hosted abuse prevention | Short-lived challenge token and Siteverify response | Server-side validation of success, expected hostname and action; secret only in protected Worker binding |
| SQLite-backed Durable Objects | Rate admission, provider budget, short-lived idempotency | HMAC source bucket/counters/short-lived hashes/sanitized bounded result | No raw IP, credentials or raw provider bodies |
| GitHub Actions / npm release | Test/build/release provenance | Source, fixture data, artifacts and provenance | Pin actions to full SHAs, least privilege, protected environments and OIDC trusted publishing |

### AI models: important distinction

There is no third-party LLM used to diagnose pasted errors in MVP. Model APIs are external **providers under test** only. `CHAT_MINIMAL` and `EMBED_MINIMAL` are bounded probes with reviewed templates, declared cost and tiny output caps. Do not insert arbitrary user-provided prompt text into these requests in MVP.

### Email

No outbound email provider, email sign-in, verification, password-reset or email alert feature in MVP. Do not add Resend/SendGrid/Postmark or similar placeholders. If email becomes a validated need, create an ADR for purpose, consent, personal-data retention, abuse controls, delivery failures and secret management.

### File and object storage

No hosted upload, object-storage bucket, persisted attachment or user document storage in MVP. CLI may read a bounded local `.env` or error file; those bytes remain local unless user explicitly sends them elsewhere. Do not add R2/S3/Blob/Cloudinary merely to create a future-looking abstraction.

## Provider API rules

- Exact provider hosts from reviewed manifests; hosted arbitrary/custom endpoints are prohibited.
- HTTPS only; no IP literals, userinfo, non-default ports or URL fragments.
- GET/POST only for manifest v1; redirect mode `manual`; redirected request is blocked unless a future reviewed policy validates the destination before another request.
- Hosted credential must enter only declared authentication-header slots, never query parameters, URL path or body.
- Header allowlist is global; reject Host, Content-Length, Cookie, Connection, Transfer-Encoding, Proxy-Authorization, Forwarded, `X-Forwarded-*`, Upgrade and other hop-by-hop/proxy headers.
- No provider SDK, hidden retry, custom proxy, raw TCP socket or user-defined DNS.
- Provider response is bounded while streaming and parsed only after decoded-byte limits are enforced.

## Public provider status/model intelligence (P1)

If implemented later, public status/model metadata is kept separate from credential/intent classification, carries source URL and verification time, and may be cached with an explicit policy. Never cache a credential-bearing endpoint or response.
