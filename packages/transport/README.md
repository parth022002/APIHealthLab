# Transport contracts placeholder

Use only if separating shared NDJSON event schemas/serializers improves dependency boundaries. Define monotonic `seq`, `step_started`, `step_completed` and terminal `final`; every serialized field must be safe and versioned. Keep transport contracts separate from Worker-specific stream mechanics.
