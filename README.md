# API HealthLab

> **Intent-Aware, Evidence-Driven API Credential & Integration Diagnostics**  
> *Test what your API keys can actually do — safely, deterministically, with zero credential retention.*

[![Tests](https://img.shields.io/badge/tests-96%20passed-10b981.svg)](#test-suite)
[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Bundler-Vite%205-purple.svg)](https://vitejs.dev/)
[![Architect](https://img.shields.io/badge/Developer-Parth%20Ahuja-8b5cf6.svg)](#credits--attribution)

---

## 1. Product Thesis

Most API credential issues are discovered too late — during production deploys, obscure runtime outages, or silent downstream pipeline failures. Typical key validators only check whether a string matches a regex pattern.

**API HealthLab** answers the decisive question:
> **"Can this credential safely perform this specific intended API action right now?"**

The user selects a provider, an intent, and an execution mode. API HealthLab runs an intent-aware policy check, executes a bounded probe via a strict network boundary, and returns a normalized forensic diagnosis grounded in allowlisted evidence — without persisting secrets to any database.

---

## 2. Key Features

### 🧪 Interactive Diagnostic Studio
- **Dual Execution Modes**:
  - **Direct Local CLI (Air-Gapped)**: Outbound HTTPS traffic routes directly from the user's terminal to the provider API. Zero transit through third-party servers.
  - **Live Cloud Worker**: Ephemeral in-memory execution via a Cloudflare Edge Worker with zero intentional disk storage.
- **Intent-Aware Probing**: Supports `LIST_MODELS`, `IDENTITY`, `CHAT_MINIMAL`, `EMBED_MINIMAL`, and `RESOURCE_READ`.
- **Deterministic 128-State Policy Matrix**: Total default-deny policy engine evaluating `Risk` × `Side-Effect` × `Cost` × `Mode` before any network request is allowed.
- **4 Canonical Diagnostic Verdicts**:
  1. `VERIFIED HEALTHY`: HTTP 200, verified permissions, latency metrics, and shell `.env` export snippets.
  2. `DIAGNOSTIC FAILED`: Upstream error codes (`INVALID_API_KEY`, `INSUFFICIENT_QUOTA`) with actionable dashboard remediation links.
  3. `POLICY BLOCKED`: Fails closed when attempting write actions, billable probes without explicit acknowledgment, or high-risk operations.
  4. `INCONCLUSIVE`: Upstream timeout (6000ms boundary) or DNS unreachable, offering status page guidance.

### 🔬 Error Classification & Forensic Lab
- **Structured Error Parsing**: Normalizes messy JSON bodies, stack traces, and HTTP responses into structured diagnostic codes.
- **Zero-Secret Leakage Redaction**: All raw keys matching registered credentials or common authorization formats are masked in real time (`sk-ant-***`).
- **AI Remediation Protocol Generator**: Generates actionable, step-by-step diagnostic fixes and configuration commands.

### 📚 Provider Capability & Intent Catalog
- **23 Integrated Providers**: 7 Core MVP providers (OpenAI, Google Gemini, Anthropic, Mistral, Groq, OpenRouter, GitHub) and 16 Beta probers.
- **Interactive Specification Drawer**: Inspect endpoints, HTTP methods, headers, payload limits, and explicit **Semantic Boundaries** (*what the test proves vs what it does NOT prove*).

### 🛡️ Zero-Retention Trust Architecture
- **No Database Persistence in MVP (ADR-012)**: Credentials are never written to any persistent SQL/NoSQL database, object storage, cookies, or browser `localStorage`.
- **ControlledFetch Network Sandbox**: Strict HTTPS-only protocol enforcement, exact provider hostname allowlist, manual redirect halting (prevents SSRF), and strict payload size limits (32 KiB request, 128 KiB response).

---

## 3. Architecture & Repository Structure

The project is structured as a high-performance **pnpm monorepo**:

```text
api-healthlab/
├── apps/
│   ├── web/                 # Presentation Client (React 18 + Vite + TypeScript)
│   ├── worker/              # Edge Boundary (Cloudflare Worker API + NDJSON Streaming)
│   └── cli/                 # Local-First Execution Tool (@api-healthlab/cli)
├── packages/
│   ├── core/                # Domain semantics, policy engine, ControlledFetch, redaction
│   ├── provider-kit/        # Manifest schema, validation, and probe executor
│   ├── providers/           # Reviewed provider manifests and code adapters
│   ├── catalog/             # Manifest-derived capability discovery metadata
│   └── transport/           # Shared NDJSON and streaming contracts
├── docs/                    # Architectural Decision Records (ADRs) and design specs
├── tests/                   # 96 comprehensive unit, contract, integration, and security tests
├── vercel.json              # Zero-config Vercel deployment specification
└── package.json             # Workspace root configuration
```

---

## 4. Deployment Guide

### Deploying the Web Application to Vercel (via GitHub)

API HealthLab includes a pre-configured [`vercel.json`](vercel.json) at the root, making deployment seamless:

1. **Push to GitHub**:
   Ensure your changes are committed and pushed to your GitHub repository:
   ```bash
   git add .
   git commit -m "feat: complete API HealthLab production release"
   git push origin main
   ```

2. **Import into Vercel**:
   - Go to [vercel.com](https://vercel.com/) and click **"Add New..."** &rarr; **"Project"**.
   - Select your GitHub repository (`API_HealthLab` or similar).

3. **Build & Output Settings**:
   Vercel automatically detects [`vercel.json`](vercel.json). The build settings are:
   - **Framework Preset**: `Vite`
   - **Build Command**: `pnpm --filter @api-healthlab/web build`
   - **Output Directory**: `apps/web/dist`
   - **Install Command**: `pnpm install`

4. **Environment Variables**:
   In the Vercel Project Settings &rarr; **Environment Variables**, add:
   | Variable | Value | Description |
   | :--- | :--- | :--- |
   | `VITE_GROQ_API_KEY` | `gsk_...` | API key for the AI error remediation engine. |
   | `PUBLIC_WEB_ORIGIN` | `https://your-domain.vercel.app` | Production domain for CORS resolution. |

5. **Deploy**:
   Click **Deploy**. Your application will build in ~2.5 seconds and go live globally.

---

### Cloud Storage & Database Architecture (Note on Neon Postgres)

In accordance with our strict **Zero-Retention Trust Architecture (ADR-012)**:
- The **Core MVP deliberately contains NO customer database or credential storage**.
- Diagnostic probes are processed in transient volatile memory and immediately discarded.
- No secrets are stored on disk, eliminating the possibility of data breach exfiltration.

> **Future Multi-Tenant Expansion**: If future enterprise roadmap milestones require saved test suites, team RBAC, or organization webhook monitors, **Neon Serverless Postgres** (`@neondatabase/serverless`) is the recommended database layer. The architecture is designed to integrate Neon via drizzle/prisma schema ports in `packages/core`.

---

## 5. Local Development Quickstart

### Prerequisites
- **Node.js**: `>= 20.0.0`
- **pnpm**: `>= 9.0.0` (Recommended: `12.11.2`)

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Run Local Web Application
```bash
# Starts Vite dev server at http://localhost:5173
pnpm --filter @api-healthlab/web dev
```

### 3. Run Local CLI
The CLI runs air-gapped on your local workstation without any hosted servers:
```bash
# List supported providers
pnpm --filter @api-healthlab/cli start providers

# Safely scan an environment file for missing or invalid keys
pnpm --filter @api-healthlab/cli start scan --file .env.example

# Diagnose a raw error string with automatic secret redaction
pnpm --filter @api-healthlab/cli start diagnose --error "Error 401: Invalid API key Bearer sk-ant-secret123"

# Generate code snippets for integration
pnpm --filter @api-healthlab/cli start snippet --provider openai --intent LIST_MODELS
```

### 4. Run Test Suite
Execute all 96 unit, security, and contract tests:
```bash
pnpm test
```

### 5. Typecheck & Build Monorepo
```bash
pnpm typecheck
pnpm build
```

---

## 6. Security & Defense Hardening

API HealthLab is hardened against common web application vulnerabilities:

- **SSRF Defense**: `ControlledFetch` validates host allowlists, rejects IP literals (IPv4/IPv6 private ranges like `127.0.0.1`, `169.254.169.254`, `10.x`), denies non-443 ports, and stops automatic redirect following (`redirect: 'manual'`).
- **CRLF & Header Injection**: Custom headers are validated against `/^[a-zA-Z0-9_-]+$/` with length bounds, stripping hop-by-hop headers.
- **Denial of Service Limits**: Strict 32 KiB request limit, 128 KiB response limit, and 6000ms execution timeouts.
- **Redaction**: All secret tokens registered in `RedactionContext` are masked before DOM rendering or exception re-throwing.
- **Defensive Headers**: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, and `Cache-Control: no-store`.

---

## 7. Credits & Attribution

- **Lead Developer & Software Architect**: **Parth Ahuja**
- **Brand & Identity**: Midnight Signal Lab (Key & Flask Concept)
- **License**: [MIT License](LICENSE) &copy; 2026 Parth Ahuja. All rights reserved.
