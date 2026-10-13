# Reviewed code adapters

Only use for provider workflows that cannot be safely expressed by manifest v1. Keep plans bounded (≤4 steps/requests), use explicit DAG dependencies, keep secret intermediates ephemeral and register them for redaction immediately. Code adapters cannot call `fetch` directly.
