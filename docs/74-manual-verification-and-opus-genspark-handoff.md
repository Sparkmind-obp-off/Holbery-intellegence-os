# 74 — HIO Manual Verification & Opus/Genspark Handoff

**Date:** 2026-10-17  
**Purpose:** One implementation handoff for the HIO coding engine.  
**Repository:** https://github.com/Sparkmind-obp-off/Holbery-intellegence-os  
**Production:** https://holbery-intelligence-os.pages.dev  
**Read with:** docs 66, 67, 71, 72 and 73.

## Decision

Do not spend the next implementation cycle adding more chatbot UI or another generic roadmap. The next milestone is a safe coding engine: repository inspection → bounded edits → sandbox checks → bounded repair → reviewable diff/artifacts.

Coding Agent v1 is proposal-only. Suggested checks are not proof of execution. Keep this distinction visible in UI, API responses, docs and task state.

## Mandatory boundaries

- Work only in Sparkmind-obp-off/Holbery-intellegence-os.
- Do not touch HOLBERY Commerce, Bozqu One System, ORDVELA or any other project.
- Do not create, enable, invoke or rely on GitHub Actions or files under .github/workflows/.
- Do not deploy to production, run production migrations, change Cloudflare configuration, set/rotate secrets or merge PRs without separate explicit authorization.
- Do not execute model-generated code inside the production Worker.
- No paid service, provider upgrade or paid sandbox consumption without explicit approval.
- Do not invent SDK methods, successful test results, usage numbers, cost numbers or deployment status.
- Use a feature branch and reviewable PR. Keep the PR draft until manual verification and review are complete.

## Before editing

1. Fetch latest main and inspect open PRs/branch state, including PR #11 which documents the no-workflows policy. Do not merge it automatically.
2. Record current main SHA, current production deployment commit, and the difference between them. Never infer that main is deployed.
3. Read package.json, wrangler.jsonc, current migrations, src/auth.ts, src/agent-workspace.ts, src/coding-agent.ts, provider modules and existing tests.
4. Run the manual baseline in a local checkout: npm ci, npm run check, npm run security:check, npm run test:founder, npm run test:e2e. Capture real output. If browser tests or local D1 cannot run, mark them BLOCKED with a reason.
5. Verify all migrations, including 0008 and 0009, against fresh local D1 and the current local schema. Production migration status is read-only in this task.
6. Create a file-level plan before coding.

## Implementation order

### Slice 1 — contracts and fake adapter
- Define typed sandbox/repository/model interfaces, state machine and error taxonomy.
- Implement a deterministic fake sandbox for unit tests only.
- Add state-transition, budget, idempotency, path-safety and authorization tests.
- Expose mocked execution as mocked/BLOCKED, never PASS.

### Slice 2 — real provider adapter
- Evaluate current official Daytona API/docs and actual account/credential availability before choosing exact API calls.
- Implement only supported methods; handle create/run/poll/read/cancel/destroy and cleanup.
- If real provider access is absent, stop at fake adapter and report precisely what blocks integration.

### Slice 3 — repository-aware patching
- Pin base commit SHA; discover files automatically within bounded limits; protect ignored/generated/secret files.
- Use patches/diffs, validate normalized paths and prevent symlink/path traversal.
- Keep repository credentials in the HIO control plane and out of sandbox/model context.

### Slice 4 — test/repair controller
- Execute only server-approved commands, never arbitrary commands from the model.
- Run test → collect exit status → pass bounded failure context to repair model → apply patch → rerun.
- Default maximum two repair attempts. Stop on cancellation, timeout, budget exhaustion, policy violation, repeated failure or provider error.
- Persist every transition and actual command result.

### Slice 5 — reviewable delivery
- Return a diff, changed-file manifest, command/test evidence, sanitized logs, artifact metadata and honest usage/cost availability.
- Require owner approval of the exact diff/base SHA before creating a draft PR.
- Never auto-merge or deploy.

## Manual commands (no workflows)

Use the repository scripts that actually exist:
- npm ci
- npm run check (typecheck + lint + format check + unit tests + build)
- npm run security:check
- npm run test:founder
- npm run test:e2e
- npm run db:migrate:local and targeted local D1 migration/route tests, after checking the local D1 setup.

Do not use npm run test:production unless separately authorized because it may contact the live app. Do not run npm run deploy.

## Definition of done

- [ ] Baseline captured
- [ ] State machine and authorization tests pass
- [ ] Path and command restrictions pass adversarial tests
- [ ] Fake adapter tests pass
- [ ] Real sandbox provider access and lifecycle verified, or explicitly BLOCKED
- [ ] Actual test commands and exit codes persisted
- [ ] Repair loop succeeds once and stops safely on repeated failure
- [ ] Cancellation, timeouts, quotas, retries and cleanup tested
- [ ] Artifact access is owner-scoped and sanitized
- [ ] Publish requires explicit approval and stale-base protection
- [ ] Local migrations pass; no production migration performed
- [ ] Manual regression and security checks have actual output
- [ ] No GitHub Actions/workflows created or invoked
- [ ] No production deployment and no unrelated project changed

## Voice / multimodal features

Voice input/output can be a later workspace capability, but it is not a substitute for the coding engine and should not be mixed into this release gate. Before implementation, specify browser permission handling, transcription provider, text-to-speech provider, latency, consent, retention, cost controls, accessibility and fallback-to-text. Do not claim live voice or real-time audio until a provider path is implemented and tested. Prioritize a reliable coding engine first unless a separate product decision changes the scope.
