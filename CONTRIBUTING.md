# Contributing to API HealthLab

## Before opening a change

1. Read `PROJECT.md` and `AGENTS.md`.
2. Identify the FR/NFR and acceptance checks the change addresses.
3. Read the relevant architecture/security/database/provider/design docs.
4. Keep the frozen MVP scope; scope expansion requires an accepted ADR.
5. Add offline tests/fixtures and keep all secrets synthetic.
6. Update the relevant docs in the same change.

## Security-sensitive changes

Any provider adapter, manifest, policy, ControlledFetch, redaction, admission, authentication or transport change must include negative tests. No provider code may call `fetch` outside ControlledFetch. Do not put credentials in issues, commits, logs, fixtures, snapshots or snippets. Report suspected vulnerabilities privately through the disclosure contact once configured; do not open a public issue containing secrets.

## Local setup

This repository is a pre-development scaffold. During Phase 0, pin Node.js and pnpm versions, install dependencies, commit the lockfile, and add scripts before treating format/lint/typecheck/test/build as executable gates. Do not interpret the placeholder package manifests as completed applications.

## Pull request checklist

- [ ] Requirements and docs updated
- [ ] ADR added/updated if a decision changes
- [ ] Unit/fixture/security tests included
- [ ] No real secrets or user/provider payloads added
- [ ] Tests actually run and results reported
- [ ] Known limitations and follow-up documented
