# CI/CD requirements before workflow creation

Create workflows during Phase 0/1 only after the package manager and lockfile are pinned. Required gates: format, lint, typecheck, unit tests (including all 128 policy combinations), provider contract tests, redaction/security suite and build. Pin third-party actions by full commit SHA. Use least-privilege workflow permissions, protected release environments and trusted publishing/provenance. Fork/untrusted PRs must never receive production provider credentials.
