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


## Existing PR #10 compatibility decision — important

PR #10 (`feat(agent): add coding PR validation loop`) must **not** be merged or used as-is under the no-GitHub-Actions policy. Its current validation endpoint reads GitHub Actions check runs, and its branch changes the existing Actions workflow. This is a policy conflict even if its earlier CI run was green.

Port only the useful product behavior into a manual runner / sandbox evidence system:
- validation status must come from commands actually executed in an isolated development sandbox, not from GitHub Actions;
- store the command, pinned base SHA, final patch hash, environment/provider, start/end times, exit code, bounded sanitized output, and result classification;
- expose an owner-scoped validation report from HIO;
- repair only from bounded real failure output and the approved diff, with a fixed attempt budget;
- keep PR creation as a separate explicit approval step.

Do not invoke GitHub Actions APIs, poll workflow/check runs, add workflow files, or use a CI result as the acceptance mechanism. A GitHub draft PR may be the delivery destination, but validation is owned by the HIO manual/sandbox runner.

## End-to-end workspace acceptance flow

The finished workspace should feel like one continuous task, not a collection of disconnected screens:

1. **Understand:** accept the user's goal and clarify only if a required input is genuinely missing.
2. **Plan:** persist an ordered, typed plan with tool name, risk, required permission and expected output.
3. **Find:** execute only explicitly enabled research tools; preserve source URLs, timestamps, provider and retrieval status.
4. **Build:** create an isolated workspace pinned to a base commit; inspect files; propose and apply bounded patches; never run arbitrary model output in the Worker.
5. **Validate:** run the server-approved command set in the sandbox, save actual exit codes, repair within budget and rerun.
6. **Deliver:** package diff, test report, logs and artifacts; request explicit approval only when a consequential side effect is about to occur (such as publishing a draft PR).
7. **Learn:** persist outcomes and failures as task events so a reopened task can resume or explain exactly why it stopped.

For each step, the UI must display one honest state: queued, running, awaiting approval, passed, failed, blocked, cancelled or review-ready. Never use “done” for a plan-only step or a mocked execution.
