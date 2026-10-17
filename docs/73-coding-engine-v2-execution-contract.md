# 73 — HIO Coding Engine v2: Execution Contract

**Date:** 2026-10-17  
**Status:** Implementation specification; not evidence of working sandbox execution  
**Scope:** HOLBERY Intelligence OS only  
**Policy:** No GitHub Actions, no workflow automation, no production deployment or migration without separate authorization.

## 1. Goal and non-goals

Upgrade the bounded coding proposal flow into a reviewable coding engine that can inspect a repository, plan a bounded change, edit files in an isolated environment, run approved checks, repair failures within a strict budget, and return a verifiable patch and test report.

The production Cloudflare Worker remains the control plane. It must never run arbitrary shell commands or model-generated code. Code execution belongs in an isolated, disposable sandbox. No auto-merge, auto-deploy, credential exposure, unrestricted network access, or edits to other projects are authorized.

## 2. Current baseline

Coding Agent v1 currently:
- accepts an objective and 1–3 explicit target paths;
- reads selected files from public repository main with a per-file size cap;
- requests structured file-replacement proposals from the existing Groq integration;
- persists tasks using migration 0009;
- may prepare a draft PR after separate authenticated approval when a narrowly scoped GitHub token is configured.

It does **not** discover files automatically, execute a sandbox, run checks, repair failures, or prove that proposed checks passed. A proposal is not a completed build.

## 3. Required architecture

### Control plane (HIO Worker / Hono)
- Authenticate the operator and enforce task authorization on every endpoint.
- Validate requests and apply per-task, daily, concurrency, runtime, model-call and cost budgets.
- Persist a task before dispatch.
- Call a provider-neutral sandbox adapter.
- Persist state transitions and sanitized events.
- Expose status, cancellation, diff, test report and artifact metadata.
- Require explicit approval before publishing a branch or draft PR.

### Sandbox adapter
Define a narrow typed interface independent of the provider:
- create a disposable workspace from an explicitly identified repository/ref;
- inspect workspace status;
- write or apply a patch;
- run one approved command with a timeout;
- read bounded stdout/stderr and exit code;
- produce a diff and bounded artifact manifest;
- cancel a command/task;
- destroy the workspace and confirm cleanup.

These are interface requirements, **not assumed existing Daytona SDK method names**. Inspect current official provider documentation and installed SDK/API before implementing a real adapter. If credentials or compatible account access are unavailable, implement a fake adapter for deterministic unit tests and report real execution as BLOCKED, not PASS.

### Repository adapter
- Pin every task to an immutable base commit SHA; record repository and ref.
- Start with the HIO repository only; do not accept arbitrary owner/repository URLs from the client.
- Read using least privilege. Never send GitHub credentials to the model.
- Discover files automatically within bounded size/count; honor ignore rules for dependencies, generated files, secrets and large/binary files.
- Apply edits as a patch/diff where possible; do not silently overwrite unrelated concurrent changes.
- Reject absolute paths, traversal, symlink escapes, binary files and files outside task scope.
- Preserve a manifest of changed paths and base hashes.

### Model adapter
- Reuse existing provider conventions and server-side Groq configuration; do not invent provider capabilities.
- Separate planning, editing, failure analysis and repair prompts.
- Treat repository contents, issue text, terminal output and test fixtures as untrusted data, not instructions that override system policy.
- Request structured plans and patches, validate output, and keep tool permissions outside model control.
- Record provider/model identifiers, usage when available, elapsed time and safe error codes. Never fabricate usage/cost data.

## 4. Task state machine

Required bounded flow:

queued → planning → preparing → editing → testing → (repairing → testing)* → review_ready

Terminal states: completed, failed, cancelled, blocked.

Rules:
- Validate every transition server-side and record an append-only event.
- Persist state before and after external side effects so interrupted tasks can be reconciled.
- Make dispatch, cancellation, cleanup and publish operations idempotent.
- Default to at most two repair attempts, configurable only within server policy.
- A repair may not expand the objective, scope, command allowlist, network policy or budget.
- Record each actual command, environment, base/patch identity, exit status and duration.
- Stop on timeout, cancellation, budget exhaustion, policy violation, repeated identical failure or sandbox health failure.
- Do not label a task completed when execution is mocked, tests were skipped, or results cannot be retrieved.

## 5. Command and network policy

Use an explicit server-side command allowlist per task type. Candidate HIO checks from the existing package scripts include npm run check, npm run security:check, npm run test:founder, npm run test:e2e and local D1 migration/route tests. Inspect the current scripts before permitting them. A command is not permitted merely because the model requests it.

- Never run deployment commands, production migrations, secret changes, destructive Git commands or commands that access host credentials.
- Default to no secrets in the sandbox.
- Deny unrestricted outbound network access by default. Permit only documented package/repository endpoints required for setup, or use a reviewed dependency cache.
- Enforce CPU/memory/disk/time limits where supported. If a provider cannot enforce a limit, document the gap and do not claim the control is active.
- Bound output and redact credentials before persistence/display.
- Do not mount Cloudflare production credentials, GitHub write tokens, user home directories or other project workspaces into the sandbox.
- Provider adapter failures must fail closed; never fall back to executing code in the Worker.

## 6. Security and authorization gates

- Every route verifies actor and task ownership.
- Create/execute/cancel/publish endpoints reject malformed IDs and unexpected fields.
- Apply rate, daily task, concurrency, wall-clock, model-call, repair-attempt and cost limits.
- Enforce policy in the server-side dispatcher, not only in UI controls.
- Validate path normalization before writing and after resolving paths inside the sandbox.
- Prevent prompt injection from granting tools or revealing secrets.
- Use existing HIO auth conventions and applicable CSRF/origin protections.
- Store sanitized logs and necessary metadata, not secrets or unnecessary source snapshots.
- Define retention and cleanup for source copies, logs, artifacts and orphaned sandboxes.
- Keep GitHub write credentials out of the sandbox and model context. Publishing is a separate control-plane operation after explicit approval.

## 7. Persistence contract

Inspect current migration history and local D1 configuration before adding schema. Use additive migrations only; do not apply production schema during implementation.

Persist at minimum:
- task/owner/repository IDs, immutable base SHA, objective and allowed scope;
- state, attempt counters, timestamps and cancellation request;
- sandbox provider/workspace ID and cleanup status (never secret values);
- plan and patch/diff metadata;
- command, environment, exit code, bounded output, duration and test classification;
- provider usage/cost only when returned by a reliable source;
- artifact manifest/checksums, expiry and access policy;
- sanitized event history and failure category.

Use indexed columns for state and searchable metadata; bounded JSON may hold structured reports. Consider indexes for owner/state/updated time and idempotency keys. Reconcile abandoned tasks and orphan sandboxes.

## 8. Artifact and review contract

A review-ready result includes:
1. task summary and exact base commit;
2. changed file list and unified diff;
3. path validation and file hashes;
4. each command actually executed, exit code, duration and PASS/FAIL/SKIPPED/BLOCKED;
5. repair attempts and final failure explanation;
6. sandbox/provider status, including whether mocked;
7. sanitized logs and artifact manifest/checksums;
8. usage/cost marked known or unavailable;
9. limitations and a human review checklist.

Artifacts must be owner-scoped, size-limited, content-type checked and time-limited where supported. Do not return public artifact URLs by default.

Publishing is separate: the owner approves the exact diff and base SHA; HIO creates a branch and draft PR only. No merge, production migration or deployment occurs automatically.

## 9. Manual verification matrix — no workflows

Run only in a checked-out development environment or explicitly approved isolated sandbox. Preserve actual output and environment details.

| Area | Required checks | Pass evidence |
|---|---|---|
| Baseline | npm ci, npm run check, npm run security:check | Actual output and exit codes |
| DB | Fresh local D1 migrations and upgrade from representative prior schema | Schema diff and successful local test |
| Auth | Unauthenticated, wrong owner, malformed ID, rate limit | Correct 401/403/400/429; no leakage |
| Path safety | Traversal, absolute path, symlink escape, secret/config, binary and oversized files | Rejected before write |
| Sandbox | Create, allowed command, timeout, cancel, destroy, outage | Actual lifecycle and cleanup evidence |
| Command policy | Unknown/deploy/destructive command, denied network | Blocked server-side |
| State machine | Duplicate dispatch, retry, concurrent cancel, interrupted worker | No duplicate side effect; recoverable state |
| Repair loop | Fix succeeds; repeated failure; attempt limit; scope expansion request | Bounded attempts and correct terminal state |
| Evidence | Failed/skipped test, mocked provider, missing usage data | No false PASS/completed label |
| Artifacts | Cross-owner access, oversized output, expired artifact | Denied or safely cleaned |
| Publish | No approval, stale base SHA, GitHub outage, duplicate submission | No unapproved PR; idempotent/reconciled |
| Regression | Founder E2E, existing agent/research tests, accessibility | Actual results compared to baseline |

## 10. Acceptance gates

**Gate A — Baseline:** current state and existing failures recorded before coding.

**Gate B — Safe local engine:** fake sandbox tests pass; no production or unrelated-project changes.

**Gate C — Real sandbox:** provider access is verified, lifecycle and command execution succeed, resource/network controls are evidenced. If not, gate remains BLOCKED.

**Gate D — Repair loop:** a deliberately failing local test is repaired within the configured limit, then rerun; an unfixable failure stops safely.

**Gate E — Review delivery:** patch, test evidence, manifest and logs are owner-scoped; publish requires explicit approval.

**Gate F — Release:** manual regression suite, migration review, security review, recovery/rollback plan and explicit production authorization.

Do not mark a gate complete based on code existence, documentation, mocks, a green UI badge or a model assertion alone.

## 11. Required implementation report

Report exact branch/commit and changed files; implemented versus mocked versus blocked; actual manual commands and exit codes; test/migration/security findings; provider capabilities tested without revealing credentials; known risks and next gate; and confirmation that no workflows, production deployment, production migration or unrelated project was touched.
