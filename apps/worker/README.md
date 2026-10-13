# Worker placeholder

Planned stack: Cloudflare Workers with TypeScript. Owns HTTP preflight, Origin/CORS/security headers, Turnstile Siteverify orchestration, Durable Object admission, invocation of shared core, and NDJSON transport. It must not bypass core policy or log raw request/provider content.
