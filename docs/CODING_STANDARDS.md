# Coding Standards and Repository Conventions

## Repository layout

```text
api-healthlab/
├── PROJECT.md                 # product-level source of truth
├── README.md
├── AGENTS.md
├── apps/
│   ├── web/src/               # React/Vite, presentation and NDJSON client
│   ├── worker/src/            # Cloudflare HTTP boundary and platform ports
│   └── cli/src/               # Commander CLI and local file/secret input
├── packages/
│   ├── core/src/              # schemas, domain, policy, intents, planner, runner,
│   │                          # diagnostics, evidence, redaction, controlled network ports
│   ├── provider-kit/src/      # manifest validation and adapter contract
│   ├── providers/manifests/   # reviewed provider manifests
│   ├── providers/code/        # reviewed complex adapters only
│   ├── catalog/src/           # generated manifest-derived catalog
│   └── transport/src/         # shared event contracts if useful
├── tests/                     # unit, integration, security, contract and e2e
├── fixtures/providers/        # synthetic, secret-free provider response fixtures
├── public/brand/              # static, non-secret logo assets
├── docs/                      # product and engineering documentation
├── security/                  # threat model, incident response and disclosure
├── reference/                 # reference blueprint, source assets
└── .github/workflows/         # CI/release workflows after implementation
```

Keep the monorepo small; do not split services into separate deployables without an ADR.

## Naming

| Kind | Convention | Examples |
|---|---|---|
| Files/directories | kebab-case | `controlled-fetch.ts`, `provider-manifest/` |
| React components | PascalCase | `CredentialField.tsx`, `DiagnosticTimeline.tsx` |
| Classes/types/interfaces | PascalCase | `IntentSpec`, `RunResult`, `SecretValue` |
| Functions/variables | camelCase | `resolveProbePlan`, `billableAcknowledged` |
| Constants | UPPER_SNAKE_CASE for immutable policy constants | `MAX_PROVIDER_RESPONSE_BYTES` |
| Provider IDs | lowercase stable slug | `openai`, `gemini`, `github` |
| Intent/status/reason codes | stable uppercase underscore | `CHAT_MINIMAL`, `INVALID_CREDENTIAL` |
| Zod schema | `...Schema` suffix | `credentialInputSchema` |
| Tests | same base name + `.test.ts` or `.spec.ts` | `policy-matrix.test.ts` |
| ADRs | numbered, immutable ID | `ADR-025` |

## TypeScript and schema policy

- `strict: true`; `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitReturns` and `noFallthroughCasesInSwitch` should remain enabled unless a reviewed ADR explains an exception.
- Parsed JSON, HTTP payloads, CLI args, manifest data and environment strings are `unknown` until validated.
- Zod schemas in the repository are runtime-canonical. Infer TypeScript types from them instead of duplicating shape definitions.
- Use `safeParse` at HTTP, CLI, manifest, extraction and configuration boundaries.
- Security-sensitive functions have explicit return types. Use exhaustive discriminated-union switches and `assertNever` guards.
- Do not model secret safety as a compile-time branded string alone; use a runtime wrapper and controlled `reveal()` boundary.
- Do not store or display arbitrary provider errors. Map to stable `DiagnosticStatus` and `reasonCode` with safe metadata.

## Domain and provider code

- Core runner owns deadlines, cancellation, policy, retries (zero by default), aggregation and result normalization.
- Provider adapter declares/resolves request and semantic interpretation; it does not execute raw network IO.
- Manifest v1 is single-step and declarative. It cannot execute code, arbitrary regex, arbitrary host or unsafe headers. Inheritance max depth 3, cycles rejected, security restrictions non-widening.
- Every resolved URL/header set is revalidated immediately before fetch.
- Structured provider codes outrank generic HTTP fallback; equally authoritative conflicting rules resolve to `INCONCLUSIVE`.
- Model/catalog capabilities are generated from manifests at build/release; fail generation when manifests conflict or required verification metadata is absent.

## React and UI components

Build reusable accessible components with one responsibility:

- `ProviderSelector` and `IntentSelector`
- `TargetContextForm`
- `ExecutionPolicySummary` and `ConsentControls`
- `CredentialField`
- `DiagnosticTimeline` and `EvidenceList`
- `RemediationPanel` and `SnippetPanel`

Inputs must have visible labels, keyboard support, visible focus and appropriate validation/error associations. No secret persistence; submit only after explicit action. Presentation components must not encode provider-specific API truth.

## Dependency boundaries

- Core has no React, Worker APIs, Commander or provider SDK dependency.
- Only ControlledFetch does actual provider network calls.
- Provider adapters cannot adjust global redirects, headers, retries, DNS, sockets or proxy behavior.
- No dependencies added solely for out-of-scope future features.
- Lockfile is committed and managed by the selected package manager; no mixed-lockfile policy.

## File and secret handling

- No shell expansion or command execution while parsing `.env`.
- Max `.env` file size 256 KiB, regular files only by default, no symlink following by default, UTF-8/LF/CRLF support, binary-like content rejected.
- Duplicate assignments warn without showing values. Don't trust `gitignore` check as a security boundary; report clearly if `.env` isn't ignored.
- `.env.example` contains placeholders only; actual provider keys belong in local shell/secret manager.
- Generated snippets use environment placeholders. Snapshot fixtures must not contain live secrets.

## Quality gates

Formatting, lint, typecheck, tests and build are required CI gates. Tests include policy matrix, schemas, provider fixtures, classifier precedence/ties, aggregation, redaction, snippets, rate-window math and adapter security contract tests. CI actions must be full-SHA pinned, permissions least-privileged, release environments protected, and no production secret exposed to a fork/untrusted PR.
