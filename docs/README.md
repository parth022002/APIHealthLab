# Documentation maintenance

`PROJECT.md` is the project-level source of truth. This directory contains domain-specific authoritative detail. If a feature changes requirements, flow, architecture, storage, integration, security, design, testing or milestones, update the relevant document in the same change. Accepted architectural decisions belong in `DECISIONS.md`. After Phase 0, repository Zod schemas become canonical for runtime contracts and documentation must be updated from them.

For all visual work, consult `DESIGN_SYSTEM.md` first and use `WEBSITE_DESIGN_RESEARCH.md` for the observations/rationale behind the chosen direction. The research is not a mandate to clone any reference site.

For visual/animation work, `DESIGN_SYSTEM.md` defines tokens and UI components, `WEBSITE_DESIGN_RESEARCH.md` explains the reference-site synthesis, and `MOTION_AND_INTERACTION.md` is the implementation-ready contract for motion concepts, reduced motion, event-driven diagnostics and performance/accessibility gates. The visual mockup in `../design-preview/` is exploratory only.
