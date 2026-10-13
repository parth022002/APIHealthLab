# Threat Model and Abuse Cases

**Status:** baseline threat inventory; must be expanded into a reviewed STRIDE/abuse-case exercise before public hosted credential testing.

## Assets

- User-supplied provider credentials and derived tokens/signatures
- Exact provider host/auth policy and manifest integrity
- Diagnostic evidence/results and provider metadata
- Hosted admission counters, idempotency state and API HealthLab-owned secrets
- Release signing/provenance identity and CI environment

## Trust boundaries

1. Browser ↔ Worker public HTTP boundary
2. Worker ↔ Turnstile / Durable Object control plane
3. Shared core ↔ provider adapter/manifest
4. ControlledFetch ↔ external provider API
5. CLI ↔ local filesystem/environment/terminal
6. Contributor/CI ↔ protected release environment

## Key threat cases

| Threat | Impact | Main controls | Test evidence required |
|---|---|---|---|
| Credential exfiltration through logs/errors | Account compromise | Runtime redaction; allowlisted evidence; safe errors; no raw bodies | Exact/derived secret canary tests through each output channel |
| Provider liveness oracle / mass key checking | Abuse/reputation damage | One key/run; no batch; Turnstile; source/provider + provider budget; risk limits | Concurrent limit and batch-rejection tests |
| SSRF or redirect credential leakage | Internal access/secret disclosure | Exact host; HTTPS; manual redirects; no arbitrary URL; auth only in header | URL/header/redirect negative fixtures |
| Malicious manifest / inheritance widening | Credential exfiltration or unexpected call | Bundled trusted manifests; strict schema; non-widening inheritance; final request revalidation | Manifest fuzzing and inheritance property tests |
| Unbounded response/parser resource use | DoS/memory exhaustion | Streaming decoded-byte caps; header/string/array/nesting limits; timeout | Compressed-body and parser-bomb fixtures |
| Abuse-counter race | Bypass hosted limits | Atomic Durable Object transactions; provider-level budget | Concurrency test on boundary windows |
| Idempotency replay or collision | Duplicate calls or result confusion | Scoped key hashes, request fingerprint, 120-second TTL, bounded sanitized result | Duplicate/conflicting request tests |
| Supply-chain compromise | Malicious published release | Pinned action SHAs, least privilege, protected env, OIDC/provenance/SBOM | Release rehearsal/audit |
| Provider outage misclassified as invalid key | User takes wrong corrective action | Independent ProviderHealthSignal; structured evidence priority | Incident and transient fixture tests |
| Local `.env` parser executes shell expression | Local code execution | Parse-only bounded parser; no expansion/exec; no symlink by default | Malicious syntax/symlink/binary tests |

## Required follow-up

- Complete STRIDE and abuse-case review with owner/date before hosted launch.
- Record residual risk and launch decision in `PROJECT.md`/ADR.
- Verify current Cloudflare platform limits and provider policies at release time; v2.4's infrastructure values are a checked baseline, not permanent guarantees.
- Conduct a manual security review and independent penetration test where feasible before a general-public hosted launch.
