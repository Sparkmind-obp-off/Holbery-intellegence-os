# HOLBERY Intelligence OS — ONE-SHOT BUILD, PUSH & CLOUDFLARE BYOK DEPLOY MASTER PROMPT

**Repository:** https://github.com/Sparkmind-obp-off/Holbery-intellegence-os  
**Goal:** In one coordinated agent session, audit, implement, test, commit, push to GitHub, deploy through the authorized Cloudflare BYOK workflow, and verify the actual result.

## MISSION

You are the principal engineer, product engineer, QA/security reviewer, release manager, and deployment operator for HOLBERY Intelligence OS (HIO). Do not merely write another plan. Inspect the actual repository, implement a coherent usable full-stack application, run tests, fix failures, commit and push changes, deploy via the existing Cloudflare BYOK configuration, and verify the real deployed result.

“One-shot” means one substantial coordinated execution session. It never means skipping tests or inventing success. Complete all safe work in the session; if external credentials/authorization are missing, continue all independent tasks and report the precise blocker.

## 1. Source of truth and boundaries

- Repository: `Sparkmind-obp-off/Holbery-intellegence-os`; inspect the current branch and established workflow before editing.
- Read README and relevant docs, including architecture, database, integrations, security, testing, deployment, plugin/MCP, and Manual specifications. Reconcile documentation with actual code.
- Preserve useful implementation; do not replace the project with a template without evidence.
- Keep this project separate from the HOLBERY parent-brand repository and Bozq One System. Never move or expose Bozq data.
- Keep current repository visibility unchanged. Never commit tokens, keys, cookies, passwords, private data, or credential-bearing URLs.
- Prefer existing/free-tier infrastructure. Do not incur paid usage without authorization.
- Inspect existing CI/deployment config first; do not introduce GitHub Actions or other CI where prohibited by project instructions.
- Never claim code, tests, push, deployment, or live validation succeeded without verifying it.

## 2. Mandatory audit-first action

Inspect source tree, package manifests, lockfiles, framework/runtime, routes, tests, migrations, database bindings, Cloudflare configuration, deployment scripts, secrets configuration, and current branch/remote state. Run supported baseline tests/build/lint/type checks without revealing secrets. Create/update `docs/implementation-status-and-audit.md` with verified findings, exact commands/results, gaps, decisions, risks, and blockers. Then proceed straight into implementation unless a real external blocker prevents safe progress. Do not stop after producing an audit report.

## 3. Build a coherent full-stack product

Prioritize a real end-to-end vertical slice, not disconnected mock screens. Target workflow:

`Source Registry → Collection Run → Normalize → Deduplicate → Evidence Store → Cluster → Opportunity Dossier → Human Decision → Experiment → Outcome/Learning`

Implement, adapting to the actual stack:
1. Responsive application shell, navigation, typed contracts, validation, consistent errors and loading/empty/success/failure states.
2. Database persistence and migrations, using existing appropriate bindings where present. Include timestamps, indexes as needed, idempotency, retention and rollback guidance.
3. Source/connector registry, bounded collection runs, fixture connector, status/errors and safe retries.
4. Evidence provenance: source/provider/reference where permitted, capture timestamp, collection method, quality metadata, deduplication, evidence list/detail and audit events.
5. Clusters and opportunity dossiers with supporting and counter-evidence, uncertainty, hypotheses, explainable scoring and reviewer notes.
6. Decision ledger and experiment records with owner, rationale, review date, budget/limits, success/stop criteria, approvals, outcomes and costs.
7. A dedicated in-app Manual/Help page (prefer `/manual` if compatible): workflows, glossary, plugin/integration setup, permissions, troubleshooting, privacy/safety, version, known limitations and review date. Describe only behavior that actually ships.
8. Plugin foundation: validated manifest, registry, declared capabilities/permissions, fixture plugin, bounded execution, audit, disable/revoke kill switch. Installation never automatically grants permissions.
9. MCP foundation: a reviewed MCP client adapter with tool allowlists, authorization, output validation and audit if safely supportable. A custom MCP server is optional unless needed for the coherent MVP; expose only approved capabilities with authentication, authorization, limits and audit.
10. Operator settings, safe operational logs, source status and clear errors.

Prefer one working fixture-driven end-to-end flow over shallow or fake implementations of every feature. Clearly label unavailable/planned functionality. Separate observed facts, model interpretations and unverified hypotheses.

## 4. Technology policy

Audit first and follow the existing stack. If genuinely unimplemented, choose the simplest maintainable Cloudflare-compatible stack and record an ADR. Prefer strict types, server-side authorization, schema validation, migrations, reproducible builds, pinned dependencies, platform secret storage and minimal dependencies. Do not add a vector DB, queue, paid SaaS, telemetry, billing, or new framework without a demonstrated requirement. Treat external source content, model output and MCP results as untrusted input.

## 5. Safety and approval gates

- Use official APIs or appropriately licensed providers only; obey provider terms, scopes, rate limits and retention.
- No unauthorized scraping, session circumvention, private-group access bypass, spam, unsolicited mass outreach, fabricated evidence, autonomous spending or autonomous public launch.
- Never print secret values or store credentials in browser bundles. Check presence without displaying values.
- Consequential actions—spending, public exposure, outreach, destructive migrations/deletions, new permissions—require explicit authorization.
- Never blindly delete/migrate production data or overwrite production resources.
- Do not persist private chain-of-thought. Store concise rationale, model/version metadata and evidence references as appropriate.

## 6. Test, fix, repeat

Run the checks supported by the actual stack: dependency/lockfile consistency; format/lint/type checks; production build; unit/integration tests; migration/rollback checks; API validation/authorization; fixture end-to-end flow; duplicate/retry/failure/rate-limit/permission-denied/disabled-plugin cases; prompt-injection tests for implemented AI/MCP paths; secret/diff inspection; responsive/accessibility smoke checks. Fix regressions and rerun relevant checks. Do not call skipped tests passed; state exact reasons and release impact.

## 7. REQUIRED: commit and push to GitHub

GitHub push is mandatory:
- Commit code, tests, migrations and matching docs in coherent milestones.
- Push tested changes to the canonical repository using existing authenticated Git/GitHub tooling.
- Verify remote branch and commit SHA.
- Fetch/reconcile if remote advanced; never force-push over unrelated work.
- Never commit secrets.
- Report repo URL, branch, commit SHA and push verification.
- If auth/permissions/tooling block push, preserve changes safely and mark **PUSH NOT COMPLETED** with exact blocker; never claim success.

## 8. REQUIRED: Cloudflare BYOK deployment

Cloudflare BYOK deployment is mandatory:
- Inspect the existing authorized Cloudflare BYOK account/project, deploy scripts, bindings, domains, database/storage resources and available deployment tools. Do not invent a project, URL, secret or binding.
- Build/test first; use preview/staging before production when available.
- Verify required config without revealing secret values.
- Run only safe, reversible migrations. Obtain approval for destructive/irreversible production changes.
- Use the actual authenticated Cloudflare BYOK workflow. A GitHub push is not proof of deployment unless the existing configuration confirms automatic deployment.
- After deployment, verify actual URL/ID, health/main route and a critical workflow; record timestamp and evidence where available.
- Diagnose and safely retry deployment failures.
- If missing BYOK authorization, credentials, bindings, or deploy-tool capability blocks deployment, finish all independent code/test/push work, prepare precise next steps, and mark **BLOCKED — NOT DEPLOYED**. Do not claim a build equals deployment.
- Do not make destructive DNS, domain, access-policy or production-resource changes without explicit approval.

## 9. One-shot execution sequence

In the same session wherever tools/time permit:
A. Audit repo, deployment and baseline.  
B. Make evidence-based architecture decisions and record material ADRs.  
C. Implement application shell and the end-to-end evidence workflow, including Manual.  
D. Add safely testable plugin/MCP foundation.  
E. Run checks, fix failures, repeat.  
F. Review security, secrets, migrations and diffs.  
G. Commit/push and verify remote commit.  
H. Deploy through Cloudflare BYOK and verify.  
I. Update status docs and Manual to match actual shipped behavior; commit/push final updates and verify final remote state.  
J. Return final report.

Do not pause for routine decisions or ask the owner to do work the available tools can safely do. If a session limit interrupts execution, leave exact status, commits, test results and next action for resumability.

## 10. Mandatory final report

Report:
1. Outcome and features that actually work.
2. Main files/features changed.
3. Exact tests/build commands and pass/fail/skipped status.
4. GitHub URL, branch, commit SHA and push verification.
5. Cloudflare BYOK project/environment, deployment URL/ID and smoke-test evidence—or **BLOCKED — NOT DEPLOYED** with exact blocker.
6. Database/migration status and rollback.
7. Security review and remaining risks.
8. Distinct status for implemented, tested, pushed, deployed and operationally validated.
9. Only concrete owner actions that truly require their authorization.
10. Single highest-value next step.

## Definition of success

A coherent, tested HIO application is committed and pushed to the intended GitHub repository and deployed/verified through the authorized Cloudflare BYOK workflow. If access/credentials are unavailable, complete all independent work and report the hard blocker truthfully. **Start now: audit, build, test, fix, commit, push, deploy through Cloudflare BYOK, verify, and report. Do not return only a plan.**
