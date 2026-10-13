# Motion & Interaction Blueprint — API HealthLab

**Status:** Accepted design direction; implementation is still pre-development.  
**Owner:** Product/design owner  
**Reviewed:** 2026-10-13  
**Related:** [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md), [`WEBSITE_DESIGN_RESEARCH.md`](WEBSITE_DESIGN_RESEARCH.md), [`USER_FLOWS.md`](USER_FLOWS.md), [`PROJECT.md`](../PROJECT.md)  
**Exploratory prototype:** [`../design-preview/motion-direction.html`](../design-preview/motion-direction.html)

## 1. Creative direction: motion with meaning

The site should have distinctive, high-quality animation—not a collection of unrelated effects. Use a recognizable **Signal Core** visual: a laboratory flask/key symbol at the center, connected nodes around it, and a signal trail that moves through the diagnostic stages. The metaphor links the existing brand mark to the product's real job: test a credential against a specific intent, observe evidence and explain a result.

The intended contrast is:

- **Marketing surface:** atmospheric, expressive, memorable; the Signal Core can glow and move gently.
- **Interactive product preview:** clear, explorable, and explicitly labelled as a sample.
- **Diagnostic application:** crisp and quiet; animation communicates state transitions and real events, never decorates every panel.

The prototype is a visual concept only. Its sample run is simulated, makes no API call and must never be presented as a real credential test. The product implementation must consume real contracts/events when it becomes functional.

## 2. Signature elements

### 2.1 Signal Core hero

A luminous flask/key mark is framed by three thin orbital paths. Three connected nodes represent **Provider**, **Intent**, and **Evidence**. A cyan/violet signal travels along one route, with restrained glints rather than a full-screen particle storm.

**Idle:** slow drift (small translation only), a low-intensity halo and sparse floating points.  
**Pointer hover/focus:** one nearby node brightens and its label becomes more prominent; no essential content is hover-only.  
**Click/tap node:** show a short, accessible explanation of the corresponding concept; a second tap closes it.  
**Demo running:** the signal path advances one stage at a time only when the demo sequence advances.  
**Demo completed:** freeze the path and reveal an evidence/result card. Never loop a completed result as though it were current live data.

### 2.2 Proof Path interactive walkthrough

A horizontal path on wide screens and a vertical stepper on mobile:

1. **Intent selected**
2. **Policy checked**
3. **Bounded probe**
4. **Evidence classified**
5. **Next action explained**

The marketing version is a sample walkthrough. It must be labelled “Sample walkthrough — no provider request is sent.” A visitor starts it deliberately by activating a button; do not auto-run a fake request on page load. A `prefers-reduced-motion` visitor sees the stages change immediately or with a simple non-moving focus change.

In the real diagnostic application, this component must instead map validated `step_started`, `step_completed` and `final` events into UI state. It must not synthesize completion, infer a successful test from elapsed time, or fill unknown stages with fake progress.

### 2.3 Evidence reveal

A result preview reveals each sanitized evidence item with a short opacity/vertical entrance and a left-to-right accent trace. It may draw attention to **source**, **observed value**, **strength**, and **meaning** in that order. The evidence content itself comes from an explicit static demo fixture in marketing, or the real allowlisted `Evidence` contract inside the product.

Do not animate evidence-strength bars as percentages. `HIGH/MEDIUM/LOW` are categories, not numerical probabilities.

### 2.4 Provider constellation

Use a restrained row/grid of seven supported provider cards, not a rotating wheel of logos. Hover/focus can draw a brief connector to the supported intent tags and reveal execution notes. The displayed intent list and lifecycle status must derive from the validated provider catalog/manifests. Do not mark every provider or every intent as supported by default.

### 2.5 Small but polished feedback

- CTA hover: translate Y by at most 1–2 px and adjust border/glow; no magnetic cursor behavior.
- Selectable intent/card: visible border and background change; small 1–2 px transform is optional.
- Diagnostic step: current-step ring/pulse only while the real event is active; stop when completed/aborted.
- Copy snippet: icon/label changes to “Copied” for a brief bounded interval, with an accessible live announcement; copying never includes a credential.
- Validation failure: focus moves to the relevant error; a brief border change is okay, but no shaking field.
- Result state: status icon draws/fades once after the final event; status text appears at the same time and is not color-only.

## 3. Landing page choreography

| Section | Signature motion | Trigger | Boundaries |
|---|---|---|---|
| Navigation | underline/foreground transition | hover, focus, active route | 120–180 ms; no animated full-width sweep |
| Hero text | small opacity + 8–12 px rise | once on initial render | do not delay headline/CTA; skip or simplify under reduced motion |
| Signal Core | orbit paths and sparse glints | idle, only when visible | one active scene; low-cost SVG/CSS default; static asset fallback |
| Proof Path | path trace and stage highlight | explicit “Play sample walkthrough” activation | sample label stays visible throughout; no network request |
| Workflow sections | staggered opacity + 8–12 px rise | first viewport entry | animate once, no forced scroll, no layout reflow |
| Provider cards | border/color/connector response | hover or keyboard focus | no endless card float; preserve the grid layout |
| Evidence preview | row-by-row reveal | real events in app; explicit replay in sample | do not invent test status or live metrics |
| Footer/links | subtle color transition | hover/focus | must retain visible focus and touch targets |

Do not require a person to wait for an entrance animation, watch an intro, scroll in a specific direction, or move the pointer to access content.

## 4. Motion tokens

Use these initial tokens in one place; adjust only from user testing or measured performance/accessibility feedback.

| Token | Default | Typical use |
|---|---:|---|
| `motion.fast` | 120 ms | Icon/color feedback, CTA hover |
| `motion.standard` | 180 ms | Selection, tabs, focusable panel state |
| `motion.menu` | 200 ms | Popover/menu open and close |
| `motion.reveal` | 320 ms | Small content reveal or result introduction |
| `motion.illustration` | 450 ms | Single explanatory path transition only |
| `motion.ambient` | 18–30 s | Decorative orbit; disabled for reduced motion/offscreen where feasible |
| `motion.distance.small` | 2 px | Focus/hover lift |
| `motion.distance.reveal` | 8–12 px | One-time reveal |

Preferred easing: `cubic-bezier(0.2, 0.7, 0.2, 1)` for entrances and `ease-out` for quick response. Animate `transform` and `opacity` first. Avoid animating layout dimensions, expensive blur/filter properties, large shadows every frame or scroll-bound calculations that execute continuously.

## 5. Implementation strategy

### P0 — CSS/SVG-first

- Use CSS transitions/keyframes and inline SVG for the Signal Core, path traces, connector lines and status symbols.
- Use `IntersectionObserver` for one-time in-view reveals, with a no-JavaScript/static-content baseline.
- Keep the prototype self-contained and dependency-free. Do not add a large animation or 3D runtime before Phase 0 sets the toolchain and a measured need is demonstrated.
- Keep animation state in presentational UI only. No credential, derived secret, raw response body or untrusted provider text may be passed into a motion scene, DOM attribute, telemetry event or replay system.
- Real diagnostic timeline animation must use the actual NDJSON event stream. It may show indeterminate waiting only while a request is genuinely pending; it cannot claim provider work has completed.

### P1 — optional depth after baseline

A Spline/WebGL/3D scene or a React motion library may be evaluated only after a working baseline exists. It requires an accepted ADR covering bundle impact, loading behavior, dependency maintenance, static fallback, keyboard/touch alternative, `prefers-reduced-motion`, mobile performance and security/privacy. The core UI must remain usable if the scene fails to load or the browser lacks WebGL.

Do not select a library only because it can produce an effect. Start with CSS/SVG and add a dependency when it materially improves a required interaction.

## 6. Accessibility rules

- Respect `prefers-reduced-motion: reduce`. Remove orbital loops, particle movement, parallax, large transforms and staggered reveals; show the final static visual and state.
- Reduced motion must not remove information, functionality, outcome distinctions or control feedback.
- Do not rely on hover. Every interaction must work through keyboard and touch with visible focus, a reachable close/exit action, and semantic labels.
- Do not flash, strobe, rapidly pulse or repeatedly animate large screen areas. Avoid motion that could distract from errors or security disclosures.
- Do not animate the entire page background behind long copy, forms, secrets or evidence tables.
- Keep static headline, navigation, primary CTA and product purpose available before optional media/animation loads.
- Provide meaningful status announcements without repeatedly reading every decorative state change to a screen reader.

## 7. Performance guardrails

These are project targets to verify in implementation, not results already measured:

- No mandatory WebGL or video for first paint or for the diagnostic workflow.
- Signal Core default is CSS/SVG; defer optional 3D until after the first meaningful content.
- Aim for the first-party animation layer to add no more than 60 KiB gzipped to the initial landing-page JavaScript beyond the application baseline. Record the real bundle delta before accepting a heavier library.
- Keep no more than one continuous decorative animation group active in the hero; pause or simplify when the hero is offscreen, the page is hidden, or reduced motion is requested.
- Prevent layout shift: reserve the scene's aspect ratio and do not insert content above existing controls during animation.
- Test mobile viewport, low-power mode where available, keyboard-only usage, no-WebGL, JS-disabled/static rendering, and reduced-motion.

## 8. Design acceptance checklist

- [ ] The landing page includes a distinct Signal Core visual tied to key/credential + provider network + evidence.
- [ ] The page has an explicit, playable Proof Path walkthrough and clearly states that the marketing sample makes no provider request.
- [ ] The visual hierarchy and primary CTA work before optional animation loads.
- [ ] The real diagnostic UI is calm and uses real run events only.
- [ ] No fake percentage, fabricated timing, simulated “live” provider status or unsupported success claim appears.
- [ ] A user can navigate the experience with keyboard and touch; hover reveals are not the only way to access content.
- [ ] Reduced-motion removes ambient/reveal movement without losing information.
- [ ] No secret or raw provider data can enter animation props/state, attributes, analytics, replay or screenshots.
- [ ] The mobile version switches the constellation/path to a readable static or vertical layout.
- [ ] The optional scene has a static fallback and is not in the critical rendering path.
- [ ] Bundle delta and rendered performance are recorded when the implementation is built.
- [ ] Color, focus and reduced-motion behavior pass the design-system accessibility gates.

## 9. Definition of done

Motion is ready when the marketing prototype can be browsed without watching it, the sample walkthrough is clearly identified as illustrative, the actual diagnostic experience only animates actual events, reduced-motion and keyboard/touch paths pass, and the bundle/performance review has been recorded. A beautiful animation is not accepted if it delays the tool, hides information, weakens security disclosure or implies results that the diagnostic engine did not produce.
