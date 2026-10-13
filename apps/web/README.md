# Web app placeholder

Planned stack: React + Vite + TypeScript. This remains a thin presentation layer. It consumes `/api/providers`, `/api/providers/:id`, `/api/diagnose` and `/api/test`; it never calls external provider endpoints directly. Do not persist credentials to browser storage. Implement the components/flows in `docs/DESIGN_SYSTEM.md` and `docs/USER_FLOWS.md` only after the shared core and hosted contract are stable.

Visual implementation must follow `../../docs/DESIGN_SYSTEM.md` and `../../docs/MOTION_AND_INTERACTION.md`. CSS/SVG-first Signal Core and Proof Path are the intended brand motion concepts. The `../../design-preview/motion-direction.html` file is an exploratory concept only; do not treat its simulated sample sequence as production diagnostic behavior. Real in-app progress must be mapped to validated NDJSON events and reduced-motion behavior must be covered by tests.
