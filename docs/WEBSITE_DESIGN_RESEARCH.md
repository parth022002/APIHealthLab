# Website Design Research — API HealthLab

**Status:** Recommended design direction for the first implementation  
**Reviewed:** 2026-10-13  
**Applies to:** Marketing landing page, diagnostic flow, result screens, responsive layout and motion system  
**Source of truth:** This research informs `docs/DESIGN_SYSTEM.md`; the design system is the token/component contract for implementation.

## 1. Executive recommendation

Adopt **Midnight Signal Lab**: a distinctive, premium developer-tool identity with a cinematic first impression and a calm, evidence-led product UI.

The design should communicate four things in this order:

1. **Clarity:** what the product tests and what the result means.
2. **Control:** the user chooses the provider, intended action, target and execution mode before entering a credential.
3. **Evidence:** results show observable facts, diagnostic classification and a concrete next step.
4. **Technical craft:** a recognizable flask/key/network brand mark, purposeful motion and subtle luminous detail make the experience memorable.

The visual inspiration is intentionally blended, not copied: Linear's restraint for app screens; Heron's issue-focused product storytelling; Cerebrium's performance proof; Trionn and Casa di Solare's editorial typography; Spline, Luma and Active Theory's selective depth/motion; Epiminds' understandable flow diagrams; Notion's approachable product explanation; and Porsche's disciplined product presentation and comparison/configuration patterns.

**Core rule:** use a cinematic shell and surgical product UI. Let the brand artwork be colorful; keep forms, credential entry, evidence and errors legible, restrained and predictable.

## 2. Reference review method and limitations

The provided websites were reviewed on 2026-10-13 using their public pages and indexed page content. This was not a full screenshot-by-screenshot, device-lab, analytics or source-code audit. Some references expose content dynamically or were not retrievable through the text review environment. The notes below distinguish what was observable from what remains unverified. Before reproducing any specific animation, check the live site manually and test the API HealthLab implementation on real target browsers/devices.

## 3. Reference-by-reference analysis

### 3.1 Heron AI — https://heronaiapp.com/

**Observed:** an interactive architectural-model hero invites people to click/drag to reveal violations, then connects repetitive-work pain points to its in-tool agent, chat widget and dashboard. The narrative moves through problem → observe/advice/action → use cases. Product images contain concrete issues and proposed corrections rather than generic abstract AI imagery. The site describes edits as requiring user approval. (Public page content: [Heron AI](https://heronaiapp.com/))

**Borrow:** an interactive, bounded “diagnostic reveal” in the hero; show a safe example key/test request moving through checks and revealing evidence. Tell the product story with real-looking result UI and specific failure examples.

**Do not copy:** the architecture/floor-plan metaphor or any claim that API HealthLab autonomously changes external systems. The product's role is to test, classify and explain—not mutate a customer's provider setup.

### 3.2 Cerebrium — https://cerebrium.ai/

**Observed:** a concise infrastructure positioning statement, prominent action choices, and performance-oriented proof (cold starts, autoscaling, observability and comparative timing visuals). The available page content emphasizes scaling and low-latency behavior. ([Cerebrium](https://cerebrium.ai/))

**Borrow:** turn abstract reliability into evidence. Use compact proof panels for “request sent”, “HTTP response received”, “provider error parsed”, “intent assertion passed/failed”, and show latency only when measured. Give the main CTA a clear visual priority.

**Do not copy:** performance numbers or comparative benchmark claims. API HealthLab must use only its own measured data and provider-specific test results.

### 3.3 SharpLink — https://www.sharplink.com/

**Observed:** institutional/financial positioning, an investor dashboard, explicit headline claims, company-news hierarchy and metrics such as total holdings and staking rewards. The browser-readable copy is minimal and parts of the page require JavaScript. ([SharpLink](https://www.sharplink.com/))

**Borrow:** high-trust data presentation: labels close to values, clear units, strong hierarchy and a distinction between headline status and underlying metrics. Use this for diagnostic summary and evidence—not for decorative market imagery.

**Do not copy:** finance/crypto styling or financial claims unrelated to the product.

### 3.4 TRIONN — https://trionn.com/

**Observed:** a studio-led brand story with oversized/editorial typography, spaced lettering, intentional negative space, a clear “about” statement, selected proof points, awards and a structured story around strategy/design/technology. Its stated positioning emphasizes clarity and long-term craft. ([TRIONN](https://trionn.com/))

**Borrow:** confident headline typography, short explanatory blocks, story rhythm and a disciplined balance between visuals and whitespace. Use one expressive hero, then transition into concrete product UI and proof.

**Do not copy:** agency-style self-promotion or animated text that makes the product's purpose harder to understand.

### 3.5 Dragonfly 2 / Studio Freight — https://dragonfly2.studiofreight.dev/

**Review status:** the URL did not return inspectable page content in the research environment. I cannot reliably attribute specific visual or interaction patterns to it from this review.

**Recommendation:** retain it as a human-review reference. Before implementation, open it directly and record the exact interaction you like (e.g., transition, scrolling, object movement or typography) rather than asking an AI agent to imitate the whole page blindly.

### 3.6 Casa di Solare — https://casadisolare.com/

**Observed:** a typography-focused, editorial experience for a variable display typeface. It exposes type weights/styles, an interactive type tester with size/weight/intensity controls, and a hover-revealed illustration. The copy is arranged as a deliberate visual narrative. ([Casa di Solare](https://casadisolare.com/))

**Borrow:** a distinctive display typeface used sparingly; a small interactive “test this” area where user input immediately changes a bounded preview; and occasional hover reveals that reward exploration.

**Do not copy:** over-stylized typography for body copy, documentation or evidence values. Credential forms and code must remain highly legible.

### 3.7 ZRK Technology — https://www.zrk.technology/

**Review status:** the page was not retrievable in the text review environment. Specific design claims could not be verified.

**Recommendation:** keep it on the inspiration list but don't use it as the basis for a coded design decision until it can be inspected directly. If a specific feature is important, capture a screenshot and describe the behavior in the design issue.

### 3.8 1367 Studio — https://www.1367studio.com/

**Observed:** the site's public page was available primarily in French and the accessible material identifies the studio with digital-product design/development. A recent public article describes content modeling as a foundation, with AI used for repetitive work and people retaining review/approval. ([1367 Studio](https://www.1367studio.com/), [studio note on content structure and AI](https://www.1367studio.com/blog/1367-studio-sanity-agency-partner))

**Borrow:** model the content and component system first; keep the component vocabulary coherent; automate repetitive tasks but keep consequential product behavior explicit and reviewable.

**Do not copy:** assumptions about the site's full visual language that were not available from the text review.

### 3.9 Zera Software Studio — https://zerasoftwarestudio.com/

**Observed:** the public site organizes the offer around marketing, creative and digital work, uses large/spaced typography, portfolio sections and a clear stepwise approach. A separate studio/client-portal example shows connected project, document, activity, review and approval patterns. ([Zera Studio](https://zerasoftwarestudio.com/), [client workspace example](https://zerasoftwarestudio.com/crm))

**Borrow:** explain the product workflow in an ordered set of steps; use concrete interface previews; keep review actions adjacent to the evidence or object being reviewed.

**Do not copy:** lead-generation forms, sales funnels or client/account workspace features into the MVP without a product requirement. API HealthLab has no end-user account system in its frozen scope.

### 3.10 Active Theory — https://activetheory.net/

**Observed with limitation:** the main page could not be fully read by the text environment, but the public XR experiments page describes WebGL/WebXR, real-time lighting, glow/bloom, particles and zero-gravity physics experiments. ([Active Theory XR experiments](https://xr.activetheory.net/))

**Borrow:** an atmospheric, abstract visual moment—glowing network nodes, a key-shaped object or a controlled orbit—in the brand/marketing area only. Motion may explain relationships rather than exist purely as decoration.

**Do not copy:** full-screen immersive effects into the diagnostic workflow, scroll-locking, mandatory high-end GPU rendering or motion that delays access to the form.

### 3.11 Samsy tutorial — https://samsy.ninja/tutorial

**Review status:** the URL did not return inspectable page content in the research environment; I could not verify the tutorial's current design or exact teaching methods.

**Recommendation:** if the intention is to reference a specific shader, animation or creative-coding technique, identify that technique separately. Do not treat the whole site as a design-system source without a manual review.

### 3.12 Spline — https://spline.design/

**Observed:** Spline positions itself around real-time 2D/3D creation, interactive states and events, timeline animation, physics/particles, layered materials, and live data/API variables. It also supports embedding interactive scenes in web experiences. ([Spline](https://spline.design/), [Spline 3D page](https://spline.design/3d-design))

**Borrow:** one signature, interactive 3D brand element with a clear metaphor; give an object intentional states such as idle, hover, selected and diagnostic progress. Data-driven animation may respond to actual, sanitized UI state.

**Do not copy:** 3D as the only way to understand the product. It must be decorative/illustrative, not a required interaction or source of diagnostic truth.

### 3.13 Linear — https://linear.app/

**Observed:** a dark-first product surface with a strong hierarchy around real product UI and workflows, compact high-information components, and a focus on reducing noise. Linear's own design-refresh note says secondary navigation should recede so the user's primary task stays in focus. ([Linear](https://linear.app/), [Linear on its design refresh](https://linear.app/now/behind-the-latest-design-refresh))

**Borrow:** this is the principal reference for the diagnostic application: dark neutral surfaces, restrained borders, consistent spacing, quiet navigation, readable data density and purposeful selected/focus states. Prioritize the next action and the evidence over decorative chrome.

**Do not copy:** Linear's exact visual identity, iconography, product metaphors or proprietary design details. Use the principle of restraint, not a pixel-level imitation.

### 3.14 Notion — https://www.notion.com/

**Observed:** a direct, approachable value proposition (“teams and agents think together”), a simple primary/secondary call to action, strong product/workspace imagery, and well-separated discovery, learning, developer, pricing and sign-in pathways. ([Notion](https://www.notion.com/))

**Borrow:** plain-English language, approachable onboarding, strong information architecture and a product preview that answers “what will I do here?” before a wall of feature claims.

**Do not copy:** Notion's workspace metaphor or add team workspaces/accounts to the MVP.

### 3.15 Luma Labs — https://lumalabs.ai/

**Observed with limitation:** the root URL was not inspectable in the text environment, but the public Dream Machine page uses highly visual image/video storytelling with a short promise, examples and a prominent try-now path. ([Luma Dream Machine](https://lumalabs.ai/dream-machine?noredirect=true), [current Dream Machine app](https://dream-machine.lumalabs.ai/))

**Borrow:** a concise emotional headline and a carefully art-directed hero visual; an example can communicate possibility faster than a long feature list.

**Do not copy:** autoplay-heavy video or large assets that hurt first load, obscure text, or make a developer tool feel like an entertainment app. Provide a still/fallback and honor reduced-motion settings.

### 3.16 Epiminds — https://epiminds.com/

**Observed:** the product explains a network of specialized AI agents with a shared orchestrator and a clear Analyze → Execute → Delegate progression. Example prompts demonstrate how the system operates in familiar language. ([Epiminds](https://www.epiminds.com/))

**Borrow:** show API HealthLab's real pipeline visually: Choose intent → Check policy → Execute bounded probe → Classify evidence → Suggest next action. Use a concrete sample run or command to make the flow understandable.

**Do not copy:** autonomous-agent claims. API HealthLab is deterministic/rule-based for diagnosis in the MVP and should not market itself as an AI agent.

### 3.17 21 Hours on the Moon — https://www.21hrs.space/

**Review status:** public search exposed the title “21 Hours on the Moon,” but the page itself returned too little text for a reliable analysis of its layout, color or interactions. ([21 Hours on the Moon](https://www.21hrs.space/))

**Recommendation:** leave it as an unverified visual reference; capture screenshots or describe the exact effect wanted before implementing it.

### 3.18 Porsche India — https://www.porsche.com/middle-east/_india_/

**Observed:** the public page uses large image-led model storytelling and a model catalogue. Related India configurator pages allow users to choose a model, see attributes, open a configuration, compare models and inspect technical specifications. ([Porsche India page](https://www.porsche.com/middle-east/_india_/), [Porsche model selector](https://models.porsche.com/en-IN/model-start), [Porsche model overview](https://www.porsche.com/middle-east/_india_/models/))

**Borrow:** art direction, consistent image framing, one dominant subject per section, and progressive exploration: glance at summary → inspect details → compare/ configure. Translate that into provider cards and intent-specific details rather than car-like imagery.

**Do not copy:** luxury-commerce visuals or full-screen imagery into functional diagnostic screens. Speed and information clarity outrank cinematic scale in the tool.

## 4. Design principles selected for API HealthLab

### Principle A — Premium first impression, quiet working area

The landing page may use the logo's luminous flask/key/network language, but the actual test journey should use neutral surfaces and sparse accents. The user should feel that the tool is precise, not noisy.

### Principle B — Demonstrate the product, not abstract “AI”

The first visual after the headline should resemble the real diagnostic result: provider, intent, request state, status, evidence, duration when measured, and remediation. Never fabricate live telemetry or present placeholder numbers as real product performance.

### Principle C — Show the flow before asking for a secret

Keep to the canonical sequence: intent → provider → target → execution/risk/cost disclosure → authorization/charge acknowledgement → credential entry → bounded test → evidence/result. Credential input comes late and is never placed inside an animated hero.

### Principle D — Use motion to reveal cause and effect

Potentially useful moments: hover/selection feedback, a small network line tracing through diagnostic stages, an event timeline revealing real streamed steps, and a safe demonstration state. Avoid long preload sequences, forced scroll animation, fake progress and motion that hides failures.

### Principle E — Treat evidence as the trust asset

Show the normalized overall status separately from provider health. Keep evidence provenance, strength, a short observed value and a clear explanation. Label “what this proves” and “what it does not prove.” Provide a next action or safe reproduction snippet.

### Principle F — Make the design system coherent before building pages

Define tokens, type hierarchy, spacing, radius, interaction states, semantic status roles and breakpoints once. Components and provider labels derive from the product contracts/manifests rather than being manually duplicated.

## 5. Recommended color direction: Midnight Signal Lab

This is a refinement of the existing dark violet baseline, adding a cleaner teal/cyan signal to echo connectivity and reserving warm amber for cost/attention. It is **not** an instruction to use all logo colors on all controls.

| Token | Value | Intended use |
|---|---|---|
| `color.canvas` | `#090A12` | Main app and marketing canvas |
| `color.surface` | `#10131F` | Form panels, navigation and cards |
| `color.surfaceRaised` | `#171B2A` | Selected/elevated panels and menus |
| `color.surfaceActive` | `#20263A` | Hover/pressed or active item surface |
| `color.border` | `#2A3044` | Dividers, outlines and panel boundaries |
| `color.text` | `#F5F7FB` | Primary text |
| `color.textMuted` | `#A3AABD` | Secondary text and descriptions |
| `color.textSubtle` | `#778198` | Nonessential metadata only; recheck contrast by context |
| `color.primary` | `#A99BFF` | Primary CTA and focus/selection, with dark text on filled controls |
| `color.primaryStrong` | `#9B8CFF` | Links and outlined/line accent on dark surfaces |
| `color.signal` | `#4DE1D2` | Connection lines, active diagnostic step, network/technical accents |
| `color.blue` | `#73ABFF` | Links or informational visualization where consistent |
| `color.magenta` | `#D889F7` | Decorative marketing/brand artwork only |
| `color.success` | `#37C996` | `HEALTHY` status; always pair with label/icon |
| `color.warning` | `#F6BE63` | Possible charge, caution or user action required |
| `color.danger` | `#F16E83` | Denial/failure/invalid input; always pair with label/icon |
| `color.info` | `#73ABFF` | Neutral informational status |

For text on primary controls, use a dark label such as `#111122`; do not assume white text is sufficiently contrasting on a light violet accent. Validate final browser-rendered components against WCAG 2.2 AA. Decorative gradients belong on the mark, landing-page hero or one selected highlight only—not behind long body text, credential forms or evidence tables.

### Color balance

- 80–90% neutral dark surfaces and readable text.
- Violet is the recognizable brand/action accent.
- Teal/cyan is a technical signal, not a substitute for success green.
- Amber is reserved for cost/attention/consent.
- Red/coral and green are reserved for semantic outcomes.
- Magenta/gold can appear in the logo/marketing artwork but should not spread through app chrome.

## 6. Typography, spacing and shape

- Use a high-legibility variable sans such as **Inter** or **Manrope** for UI and headings; the final choice can be set during UI implementation after a live render check. Use a system fallback.
- Use **JetBrains Mono** or a system monospace for IDs, model names, environment variables, reason codes, code snippets and evidence values. Never force long prose into monospace.
- Headlines: strong size and controlled negative tracking on the landing page; never shrink form labels or result text for style.
- Use the existing 4px spacing basis with the 8px rhythm: 4, 8, 12, 16, 24, 32, 40, 48, 64.
- Inputs and controls: 8–10px radius. App panels: 12–16px radius. Pills only for concise statuses or small metadata.
- Borders and surface contrast should create hierarchy; avoid heavy box shadows on every card.

## 7. Recommended page structure

### Marketing landing page

1. **Navigation:** compact mark, Product, Providers, How it works, Security, Docs/GitHub; one primary “Start a diagnostic” CTA.
2. **Hero:** headline “Know what your API key can actually do.” Brief description that API HealthLab tests a selected action against a supported provider. Primary CTA “Start a diagnostic”; secondary “Use the CLI.” Show a subtle interactive/animated brand metaphor or static fallback.
3. **Product preview:** a genuine mock based on the canonical result contract—not false live data—with status, event timeline, evidence and a suggested next step.
4. **How it works:** Select intent → run a bounded probe → inspect evidence → fix the problem.
5. **Provider coverage:** seven MVP providers with capabilities derived from manifests; distinguish supported intents, local-first behavior and lifecycle state.
6. **Common failures:** credential rejected, insufficient scope, billing/quota, model unavailable, rate limit and endpoint mismatch; keep diagnosis language honest.
7. **Trust/execution modes:** explain local CLI vs hosted mode and the hosted credential disclosure. Do not say “we never see your secret.”
8. **CLI example:** short copy/paste command with environment-variable placeholder, not a real credential.
9. **“Proves / doesn’t prove” section:** communicate diagnostic boundaries.
10. **Footer:** documentation, source repository, security/disclosure, terms/privacy when finalized.

### Diagnostic application

Use a focused full-width content area; a compact step indicator can orient the user, but avoid a complex SaaS side navigation because the MVP has no accounts or persistent workspace.

**Step 1 — Intent and provider:** select the action, provider and non-secret target fields. Hide unsupported combinations rather than implying support.

**Step 2 — Policy and credential:** show execution mode, credential risk, side effect and cost separately. Separate authorization from billable acknowledgement. Reveal the masked credential field only after preflight/policy context is clear.

**Step 3 — Running:** show actual `step_started` and `step_completed` events as they arrive. If the browser is waiting, use honest waiting indicators; do not fabricate percentages.

**Step 4 — Result:** show overall outcome first; provider health separately; then primary status, evidence, remediation and safe reproduction. Keep raw provider bodies and secrets out of view.

### Results information hierarchy

1. Overall outcome: Healthy / Failed / Inconclusive / Skipped.
2. What was tested: provider + intent + target and execution mode.
3. Why: primary status and concise explanation.
4. Evidence: allowlisted value, source/provenance and evidence strength.
5. Next action: remediation, retry guidance only where justified, or safe snippet.
6. Limits: “what this proves / does not prove.”

## 8. Motion and interaction specification

This high-level research recommendation is made implementation-ready in [`MOTION_AND_INTERACTION.md`](MOTION_AND_INTERACTION.md), which defines the Signal Core, Proof Path, triggers, state mapping, performance targets and acceptance checklist. The visual concept preview is [`../design-preview/motion-direction.html`](../design-preview/motion-direction.html).

- Standard state transitions: 120–180ms; popovers/menus: 160–220ms; larger illustrative transitions: 300–500ms only where valuable.
- Prefer opacity, color and small transforms. Avoid animating layout or large blurred surfaces on every scroll frame.
- Respect `prefers-reduced-motion`; provide a static hero asset and disable orbit/particle movement in reduced-motion mode.
- Lazy-load any optional 3D/WebGL scene after primary content. Provide a no-WebGL fallback and never block the diagnostic form on it.
- Keep animation optional on low-powered devices and under a documented performance budget; test keyboard navigation independently from pointer/hover interactions.
- Use motion to reveal sequence/cause and effect; never use animation to imply that a real test has completed before the engine returns a result.
- No audio, cursor hijacking, scroll-jacking, non-dismissible intro or forced wait screen.

## 9. Component direction

| Component | Design requirements |
|---|---|
| `SiteNavigation` | Compact, keyboard accessible, low contrast until active; sticky only if useful. |
| `HeroDiagnosticPreview` | Lightweight and illustrative; no credential field; static fallback; preview clearly marked as example. |
| `ProviderCard` | Provider mark/name, supported intents, lifecycle/execution hint; content from catalog. |
| `IntentOption` | Explicit purpose, required target fields and risk/cost metadata. |
| `ExecutionPolicySummary` | Distinct risk, side effect, cost and mode fields; no single vague “safe” badge. |
| `ConsentControls` | Separate `authorized` and `billableAcknowledged` where required. |
| `CredentialField` | Masked, no browser persistence, explicit submit, safe clear/reset. |
| `DiagnosticTimeline` | Ordered real stream events with readable timestamps/state labels. |
| `OutcomeHeader` | Outcome and primary reason first; status text/icon in addition to color. |
| `EvidenceRow` | Label, observed value, provenance and strength; never raw bodies or secrets. |
| `RemediationPanel` | Clear next steps and stable action identifiers; avoids vague AI copy. |
| `SnippetPanel` | Language tabs; generated from resolved request; env placeholder only; copy affordance. |
| `TrustModeComparison` | Accurately compares local and hosted credential exposure. |

## 10. Performance, accessibility and security guardrails

- Landing page's headline, core message, navigation and CTA must work before the optional hero interaction loads.
- Avoid dependence on autoplay video, external shader packages or a third-party scene to render the site correctly.
- Keep the app usable at mobile widths, with touch-size targets and no horizontal overflow in code/evidence blocks.
- Target WCAG 2.2 AA; test foreground/background contrast, focus, keyboard operation, screen-reader labels, error focus and reduced-motion mode.
- Do not place secrets in DOM attributes, URLs, local/session storage, analytics, screen recordings or animation state.
- Use synthetic/sample result data only in marketing examples and label it as such. Real product result UI must derive from validated `RunResult` contracts.

## 11. Design acceptance checklist

- [ ] The home hero identifies the product purpose within one viewport.
- [ ] The brand feels recognizably API HealthLab without copying a reference site's logo/layout.
- [ ] Dark theme tokens are centralized; no random one-off colors are used.
- [ ] Color roles remain semantic; teal is not overloaded as “success.”
- [ ] Product preview says “example” when it is static/synthetic.
- [ ] Credential entry happens after provider, intent, target and policy context.
- [ ] Diagnostic events and outcome states reflect actual engine events.
- [ ] Reduced-motion/static fallback works without losing core information.
- [ ] Core workflow is usable with keyboard and screen reader.
- [ ] All text and control colors have measured WCAG 2.2 AA contrast.
- [ ] Mobile and reduced-performance devices remain usable without 3D/WebGL.
- [ ] No reference website is copied pixel-for-pixel; references inform principles only.

## 12. Go-forward decision

Use **Midnight Signal Lab** as the provisional accepted design direction. The refined motion language is **Signal Core + Proof Path**: a restrained animated flask/key/network mark for brand recognition and a separate, understandable staged walkthrough of the diagnostic process. Follow `MOTION_AND_INTERACTION.md` for implementation and acceptance rules. The baseline dark palette remains; violet is the primary brand/action accent, cyan/teal marks active connectivity, and semantic success/warning/error colors remain separate. The marketing page may use a cinematic, lightweight visual moment. The diagnostic workflow prioritizes clarity, bounded actions and visible evidence over immersion.

If a developer wants to add a full 3D/WebGL hero, new motion library or alternative theme, they must demonstrate a static fallback, reduced-motion behavior and performance result before the addition is accepted.
