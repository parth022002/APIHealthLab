# Design System — API HealthLab

**Status:** Provisional accepted direction: **Midnight Signal Lab**  
**Reviewed:** 2026-10-13  
**Research:** [`WEBSITE_DESIGN_RESEARCH.md`](WEBSITE_DESIGN_RESEARCH.md)  
**Brand asset:** `public/brand/api-healthlab-mark.png`

## 1. Design thesis

Use a **cinematic shell and surgical product UI**. The text-free brand mark can be luminous and expressive; the diagnostic product must remain calm, precise and evidence-led. The UI should feel like a premium developer instrument, not a noisy sci-fi dashboard.

The interface has to express three product ideas: API connectivity, credential/key diagnostics and laboratory-style experimentation. The visual system supports—not replaces—the core promise: *Can this credential safely perform this intended API action?*

The page structure and reference-site observations are documented in [`WEBSITE_DESIGN_RESEARCH.md`](WEBSITE_DESIGN_RESEARCH.md). The signature animation language, state choreography, implementation tiers and performance budget are specified in [`MOTION_AND_INTERACTION.md`](MOTION_AND_INTERACTION.md). This file is the implementation token/component contract.

## 2. Color tokens

### Neutral surfaces and typography

| Token | Hex | Use |
|---|---|---|
| `color.canvas` | `#090A12` | Main application and marketing canvas |
| `color.surface` | `#10131F` | Base panels, forms, navigation and cards |
| `color.surfaceRaised` | `#171B2A` | Raised cards, menus and focused surfaces |
| `color.surfaceActive` | `#20263A` | Active/hovered row or control surface |
| `color.border` | `#2A3044` | Panel boundaries, dividers and input outlines |
| `color.text` | `#F5F7FB` | Primary text |
| `color.textMuted` | `#A3AABD` | Secondary text and descriptions |
| `color.textSubtle` | `#778198` | Nonessential metadata only; contrast must be measured in context |

### Brand and semantic accents

| Token | Hex | Use |
|---|---|---|
| `color.primary` | `#A99BFF` | Primary CTA fill and focused/selected controls; use dark label text |
| `color.primaryStrong` | `#9B8CFF` | Links, outlined actions and brand accent on dark surfaces |
| `color.signal` | `#4DE1D2` | Active connectivity, running path and technical visualizations; not a success state substitute |
| `color.blue` | `#73ABFF` | Informational links/visualizations where appropriate |
| `color.magenta` | `#D889F7` | Decorative brand/marketing art only |
| `color.success` | `#37C996` | `HEALTHY` outcome; pair with icon and label |
| `color.warning` | `#F6BE63` | Possible charges, caution and required user attention |
| `color.danger` | `#F16E83` | Denial, failure and invalid input; pair with icon and label |
| `color.info` | `#73ABFF` | Informational status |

Do not use every logo color across every surface. Keep most pixels neutral. Violet is the primary brand/action color, teal/cyan is a technical signal, amber is for cost/caution, and green/red remain semantic result colors. Magenta and gold are reserved for brand artwork or one marketing illustration, not common app chrome.

Filled primary controls should use dark text such as `#111122` on `#A99BFF`. Do not assume white text has sufficient contrast on a light accent. Check actual rendered combinations against WCAG 2.2 AA before launch. Never use color alone to communicate state.

## 3. Typography

- UI/body: **Inter** or **Manrope** variable sans; choose one during implementation and verify real browser rendering. Include a native system fallback.
- Technical strings: **JetBrains Mono** or the system monospace stack for model IDs, environment variable names, reason codes, code snippets and selected evidence values.
- Large marketing headline: expressive, compact tracking and high contrast, but copy must remain readable and specific.
- Form labels, errors and result text must never be reduced or stylized for branding.
- Avoid using all-caps for prose. Uppercase is reserved for normalized intent, status and reason identifiers.

## 4. Spacing, layout and shape

- 4 px spacing base with an 8 px rhythm: `4, 8, 12, 16, 24, 32, 40, 48, 64` px.
- Keep body copy in a readable max-width; hero compositions can be wide.
- Input/control radius: 8–10 px. Panel/card radius: 12–16 px. Pills are for concise statuses or small metadata only.
- Prefer restrained border/surface separation over heavy shadows on every card.
- Mobile must not create horizontal overflow in code, evidence or timeline components.
- Use a compact navigation for the diagnostic experience; the account-free MVP does not need a persistent workspace-style sidebar.

## 5. Page-level composition

### Landing page

Recommended flow: compact navigation → specific headline and CTA → clearly marked example diagnostic preview → four-step workflow → manifest-derived provider coverage → common failure examples → local-vs-hosted trust explanation → CLI example → “what this proves / does not prove” → footer.

Suggested working headline: **“Know what your API key can actually do.”** This is marketing copy, not a claim of universal provider coverage. Keep `Start a diagnostic` as the main CTA and `Use the CLI` as the secondary path.

A brand animation is optional. The headline, purpose, main CTA and navigation must remain useful before any animated/3D asset loads. Synthetic previews must be labeled as examples and must not imply live telemetry.

### Diagnostic flow

Use the canonical sequence: intent → provider → target → execution/risk/cost disclosure → authorization/billable acknowledgement → credential → bounded test → evidence/result. Credential input appears only after context and policy are clear.

### Result hierarchy

1. Overall outcome (`HEALTHY`, `FAILED`, `INCONCLUSIVE`, `SKIPPED`).
2. Provider + intent + target + execution mode.
3. Primary diagnostic status and a plain-English reason.
4. Allowlisted evidence with provenance and evidence strength.
5. Specific remediation or safe reproduction snippet.
6. “What this proves / does not prove.”

Provider health is separate from credential/intent outcome. The result UI must reflect real `RunResult` and NDJSON events, never invented progress.

## 6. Interaction and motion

The signature concepts are **Signal Core** (flask/key + connected provider/intent/evidence nodes) and **Proof Path** (intent → policy → bounded probe → evidence → next action). See [`MOTION_AND_INTERACTION.md`](MOTION_AND_INTERACTION.md) for the full choreography and acceptance gates.

- CSS/SVG is the P0 default; do not add 3D/WebGL or a motion library before a working baseline and a documented performance need.
- Standard transitions are 120–180 ms; menus/popovers are 160–220 ms; one explanatory illustration transition may reach 300–500 ms.
- Prefer opacity, color and small transforms; avoid expensive continuous blur, layout animation and forced scroll choreography.
- Respect `prefers-reduced-motion`, keyboard use and touch. Provide static/non-WebGL fallbacks.
- The real diagnostic timeline must be driven by actual NDJSON events. Marketing examples must say they are simulated and must not make provider calls.
- No sound, cursor hijacking, scroll-jacking, non-dismissible intro, fake progress or animation that hides security/consent information.

## 7. Component contract

| Component | Responsibility |
|---|---|
| `SiteNavigation` | Compact and accessible; a restrained active state and one primary CTA. |
| `SignalCore` | Signature CSS/SVG flask/key and network illustration; keyboard/touch-accessible explanatory nodes; static fallback. |
| `ProofPath` | Five-stage explanation; simulated only in marketing, event-driven in the real app. |
| `HeroDiagnosticPreview` | Illustrative preview, no credential field; static/low-motion fallback; mark synthetic data. |
| `ProviderCard` | Provider, supported intents and lifecycle/execution notes from the catalog. |
| `IntentOption` | Purpose, required target context and relevant risk/cost metadata. |
| `ExecutionPolicySummary` | Display risk, side effect, cost and mode as separate dimensions. |
| `ConsentControls` | Separate `authorized` and `billableAcknowledged` controls where required. |
| `CredentialField` | Masked, no local/session storage, explicit submit, safe clear/reset. |
| `DiagnosticTimeline` | Ordered, sanitized `step_started` and `step_completed` events. |
| `OutcomeHeader` | Outcome and primary reason first; never status color alone. |
| `EvidenceRow` | Label, allowlisted observed value, provenance and evidence strength. |
| `RemediationPanel` | Practical next steps keyed by stable `actionId`. |
| `SnippetPanel` | Deterministic snippet from resolved request, environment placeholder only. |
| `TrustModeComparison` | Accurate local-vs-hosted credential exposure disclosure. |

## 8. Accessibility, security and performance

- Target WCAG 2.2 AA for the core journey.
- Test color contrast on actual components, visible focus, keyboard interaction, screen-reader naming, validation semantics and focus management after errors.
- Respect reduced-motion settings, with no information available only through motion or hover.
- Never place secrets in DOM attributes, URLs, local/session storage, analytics, replay, error trackers or animated state.
- Keep the core page visible before optional artwork loads; provide static and reduced-motion alternatives.
- Avoid heavy 3D/video dependencies unless the value is demonstrated and target-device performance is tested.

## 9. Design change protocol

Before adding a new color, typeface, animation library, full-screen 3D scene or alternate theme, update `docs/WEBSITE_DESIGN_RESEARCH.md` or this file and include: user benefit, loading/performance impact, reduced-motion fallback, accessibility/contrast checks and a screenshot or render review. Do not copy a reference site pixel-for-pixel.
