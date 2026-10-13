# Incident Response Runbook

**Status:** operational draft. Replace placeholder roles/contacts before public launch. Do not store secrets or private contact details in this tracked file.

## Incident categories

- Suspected user credential exposure
- API HealthLab-owned secret compromise (Turnstile, rate-limit HMAC, release identity)
- Provider abuse signal / liveness-oracle use
- ControlledFetch or manifest policy bypass
- Unsafe diagnostic output / redaction failure
- Dependency or release supply-chain compromise
- Provider drift, terms change or upstream outage that makes a probe unsafe

## Immediate containment

1. **Stop the affected path:** use provider lifecycle kill switch (`DISABLED`) or disable hosted credential testing if broad scope is unclear. Disabled/removed adapters must be blocked before secret materialization.
2. **Protect users:** keep public errors generic and never publish raw request details. Do not log credentials or raw provider payloads while investigating.
3. **Rotate API HealthLab-owned secrets** through platform bindings/protected identities if compromise is suspected. Rotate per environment, not by copying a production secret into staging.
4. **Limit abuse:** lower provider admission budgets or disable the affected provider. Hosted degrade message: “Hosted testing temporarily unavailable — use the local CLI.”
5. **Preserve safe evidence:** deployment/version IDs, UTC times, reason codes, aggregate counters and sanitized traces only. Do not export raw requests.
6. **Assess affected data:** confirm from architecture whether credentials were transient or whether a retention/logging defect occurred. Be factual and do not claim “no exposure” without evidence.
7. **Restore only after review:** patch, add regression tests, review manifest/policy, deploy through protected release process and verify canaries.
8. **Post-incident:** document timeline, root cause, customer/user impact, decisions and mitigations; update threat model, tests and ADR if architecture changed.

## Required operational readiness before launch

- Named incident lead and backup
- Access to provider/hosted kill switch
- Secret rotation procedure for each environment
- Alert path for redaction failure, abnormal 429 volume and provider budget spikes
- Rollback procedure and a known-good build
- Public security/contact process (without secrets in tickets)
- Post-incident review template and regression policy
