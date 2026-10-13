# Test suite structure

```text
tests/
├── unit/            # schemas, policy matrix, classifier, aggregation, redaction
├── contract/        # provider manifest/adapter network safety
├── integration/     # runner, Durable Object counters, idempotency, streams
├── e2e/             # Playwright flows and accessibility
├── security/        # malicious manifests, secret leaks, SSRF/redirect/parser cases
└── fixtures/        # synthetic provider responses, never real secrets
```

Start offline and deterministic. Add live-provider smoke tests only under a protected workflow with dedicated scoped credentials; never require live credentials in normal CI.
