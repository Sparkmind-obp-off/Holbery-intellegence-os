# 71 — AI Agent Workspace Implementation Blueprint

**Date:** 2026-10-17  
**Status:** Phase 0 audit complete; implementation baseline still required  
**Scope:** HIO only. Do not modify HOLBERY Commerce, Bozq One System, ORDVELA production, or other projects without explicit authorization.  
**Canonical target:** HOLBERY Intelligence OS (HIO)  
**Repository:** https://github.com/Sparkmind-obp-off/Holbery-intellegence-os  
**Production app:** https://holbery-intelligence-os.pages.dev  
**Dedicated D1:** hio-production (DB binding)

## 1. Product objective

Build a cloud-hosted, modular AI Agent Workspace with a familiar conversational assistant experience and bounded agents that can research, plan, build artifacts, validate outcomes, and prepare launch assets. The product should feel like a focused AI workspace rather than a clone of Grok's proprietary interface or a promise of guaranteed autonomous income.

Core loop: **ASK → PLAN → RESEARCH → REVIEW → BUILD → VALIDATE → LEARN**

AI-generated analysis is not market evidence. A build is not a validated product. A prepared offer is not a sale. Record actual usage, costs, customer feedback and payments separately.

## 2. Audit findings (read-only)

### HIO — canonical implementation base

- Repository docs 62–70 establish HIO as the canonical customer-facing FIND → BUILD → VALIDATE → LAUNCH workspace.
- package.json identifies TypeScript, Hono, Zod, Vite, Wrangler, Vitest and Playwright; Node >=22.16 is specified.
- wrangler.jsonc targets Pages output dist and the existing D1 database hio-production, binding DB. Preview has no D1 binding.
- The canonical readiness board reports a working founder/operator interface, existing session controls, research routes and real provider-backed research tests. It explicitly does not claim public multi-tenant SaaS, Daytona build execution, or commercial readiness.
- The source audit and roadmap require baseline checks before feature work and explicitly prohibit unsafe production changes.

### ORDVELA — reference only in this task

ORDVELA has an accepted architecture for assistant workspace, provider gateway and bounded agent runtime, with workspace authorization and approval gates. It remains a separate production application. This blueprint does not change ORDVELA or merge its code; reuse can be proposed only after a separate compatibility review and explicit authorization.

### Live Cloudflare inventory (read-only)

- Pages project holbery-intelligence-os exists, with holbery-intelligence-os.pages.dev and hio.holbery.biz.id.
- Production Pages configuration binds DB to D1 ID ce92c645-7ce2-4edf-8ffa-ce0d16115bbe.
- The matching D1 resource reports name hio-production and 22 tables.
- Latest deployment metadata reports deployment 08658a27-bb25-48d0-b915-33ea766e0c2d, associated with commit 59d4fa93b41366c290782e503c77dd952624ac0a.
- Provider secret values were not retrieved. Cloudflare metadata is not proof that provider credentials work.
- A fresh authenticated research run, full repository test suite and recovery drill were not run during this blueprint pass.

## 3. Architecture

### Client — Cloudflare Pages

A responsive workspace with these areas:
1. **Chat** — conversations, history, model/provider indicator, streaming or incremental response when supported.
2. **Agents** — objective, plan, step states, approval requests, run logs, cancellation and result summary.
3. **Research** — demand briefs, evidence URLs, timestamps, provenance, counter-evidence and opportunity decisions.
4. **Build** — approved build brief, artifact type, status, tests, manifest and private download.
5. **Validate** — hypothesis, target segment, success/stop thresholds, observed signal and decision.
6. **Workspace settings** — members, provider availability, usage limits, privacy/export/delete controls when implemented.

The UI must not imply a feature is live when its adapter is absent or only mocked.

### Control plane — Cloudflare Pages Functions / Workers

Use the existing HIO Hono route conventions and server-side environment bindings. Keep modules behind explicit interfaces:
- identity: authentication identity extraction; distinct from existing founder/operator auth.
- tenant: workspace membership and role authorization on every request and background job.
- conversation: message persistence, pagination and retention.
- model-provider: provider-neutral request/response contract, timeout, safe errors and usage receipts.
- orchestrator: bounded task state machine; never arbitrary shell execution.
- tool-registry: typed allowlisted tools, schemas, permissions and side-effect classification.
- approval: preview, approve/reject, expiry and one-time execution grant; approval itself does not execute a tool.
- research: reuse the existing tested HIO provider pipeline rather than duplicating it.
- build: adapter contract for Daytona; disabled until account access, sandbox policy and costs are verified.
- artifact: private R2 storage when configured; authorize every read/download.
- usage-ledger: per-workspace request/run budgets, concurrency, timeout, cancellation and cost receipts.
- audit: actor, workspace, action, decision, outcome and correlation ID; never log secrets or full sensitive prompts by default.

### Persistence — existing D1 first

Reuse HIO D1 and add only additive migrations after schema review. Likely logical entities (final names must be reconciled against existing tables before implementation):
- workspaces, memberships, roles
- conversations, messages
- agent_runs, agent_steps, tool_invocations
- approval_requests, approval_events
- provider_usage, budget_reservations
- artifact_manifests, validation_experiments, validation_results
- audit_events

All tenant-owned records need an explicit workspace relationship and server-verified membership. Never trust a client-supplied workspace ID on its own. Do not store provider API keys in D1.

### Model/provider gateway

Start with one real, configured model provider to keep cost and failure modes small. Reuse an existing HIO provider where suitable; otherwise add a narrow adapter only after inspecting provider code and secrets configuration. Grok-like behavior does not require a mandatory xAI dependency. xAI/Grok Console is optional and requires a valid API key, API access, quota and a live smoke test. Workers AI may be evaluated for tasks that fit its models and limits.

A missing real key must return a clear unavailable/configuration state; it must never silently pretend that a demo response is real inference.

### Agent execution contract

1. Accept an objective and validate length, scope and allowed tool set.
2. Generate a bounded plan with a maximum step count and deadline.
3. Classify each step as read-only, reversible write, or consequential external action.
4. Run safe read-only steps only within configured policy and budgets.
5. For writes or consequential actions, create a preview and wait for explicit approval.
6. Execute an approved step once, with idempotency and a bounded timeout.
7. Persist the actual result, provider usage, duration and sanitized errors.
8. Allow cancellation and terminate the run; never leave an unbounded loop.
9. Mark the task complete only from observed results, not model assertions.

No autonomous purchases, billing, publication, posting, DM/outreach, paid Apify runs or production deployments by default.

## 4. Rp0-first operating mode

- Reuse existing Cloudflare Pages and D1; do not create a second database or duplicate product.
- Use existing provider integrations and quotas before adding new services.
- Keep optional connectors disabled unless verified and budgeted.
- Treat all free-tier limits as changeable; measure usage rather than promising unlimited operation.
- Require an explicit hard budget (default zero for unapproved billable actions), per-run caps and cancellation.
- Daytona is the intended standard build sandbox in the canonical stack, but build execution remains disabled until access and cost are verified. Do not replace isolation with arbitrary code execution inside the production Worker.
- No paid subscription, paid API call, or paid service activation without owner approval.

## 5. Phased implementation and acceptance gates

### Phase 0 — Baseline and recovery (current)
- Record current HEAD, branch, package lock, Node version, working tree and all test outputs.
- Run npm ci, npm run check, npm run security:check, npm run test:founder, npm run test:e2e, and local D1 migration tests where supported.
- Inspect all auth, tenant, research, provider, UI and migration code before edits.
- Verify backup/restore and rollback paths without mutating production.
- **Gate:** baseline report with known failures and safe recovery plan.

### Phase 1 — Customer identity and tenant isolation
- Evaluate Clerk integration using distinct public CLERK_PUBLISHABLE_KEY and server-only CLERK_SECRET_KEY; webhook secret only if a signed webhook is implemented.
- Keep founder/operator authentication separate.
- Add customer/workspace membership checks and negative cross-tenant tests.
- Use mock identities in automated tests; never put credential values in chat, Git, D1, prompts or logs.
- **Gate:** unauthorized, wrong-workspace, expired/revoked-session and role-denied tests pass. No production auth cutover in this phase.

### Phase 2 — Chat vertical slice
- Add a simple chat screen and authenticated conversation/message API.
- Connect one real provider adapter, persist history, bound context/output and timeout.
- Add provider status, usage receipts, request limits and safe error UI.
- **Gate:** real provider response and history persistence verified; secrets absent from browser bundles and logs.

### Phase 3 — Read-only tools and agent runs
- Add typed tools for authorized HIO research/opportunity reads.
- Persist plan, steps, status, approval requests and sanitized outputs.
- Add cancellation, max steps, timeouts, idempotency and tool allowlist.
- **Gate:** prompt-injection tests prove source content is treated as data; no tool executes before authorization.

### Phase 4 — FIND → BUILD
- Reuse HIO research pipeline for sourced evidence and opportunity review.
- Add Daytona adapter only after account/credential/terms/cost verification.
- Generate one small artifact from a reviewed brief, run artifact-specific tests, create manifest and private delivery.
- **Gate:** one approved build is bounded, tested, attributable to a workspace, privately delivered and costed.

### Phase 5 — VALIDATE and monetization
- Persist falsifiable hypothesis, target customer, success/stop thresholds and actual outcomes.
- Prepare product listing, demo and delivery instructions; require approval for publication.
- Track actual payment separately from interest, clicks, downloads and AI-generated estimates.
- **Gate:** a real validation signal is recorded. Billing remains off until payment callbacks, reconciliation, refunds, entitlements and support pass acceptance.

### Phase 6 — Controlled beta and release
- Complete privacy/terms, retention/export/delete, support, backup/restore, rate-limit and incident checks.
- Test at least two distinct workspaces and cross-tenant isolation.
- Deploy preview first; production release requires explicit release approval and verified rollback.
- **Gate:** end-to-end acceptance evidence and cost-to-serve measurement.

## 6. Test matrix

- Unit: provider normalization, schema validation, state transitions, budget reservation, idempotency and safe error mapping.
- Authorization: no session, invalid session, wrong workspace, role denied, expired/revoked session, cross-tenant artifact and job access.
- Agent safety: prompt injection in source content, unknown tool, malformed tool args, excessive steps, timeout, cancellation, duplicate approval and duplicate execution.
- Provider: missing key, invalid key, rate limit, timeout, upstream 5xx and quota exhaustion; never fake successful inference.
- Persistence: conversation history, run state, audit receipts, migration forward compatibility and private artifact ownership.
- UI/E2E: loading, empty, failure, retry, cancellation, mobile layout, accessibility and no secret/provider-key leakage.
- Release: preview deployment, health checks, private-route denial, rollback and recovery proof.

## 7. Current blockers and owner-only actions

1. **Clerk configuration/connectivity:** credentials are reported as available in earlier project context, but this audit did not validate a successful Clerk handshake or the correct environment bindings. Configure only via the approved secret manager and test with fake keys locally.
2. **Provider selection/credential status:** existing provider names are visible in project metadata; no fresh end-to-end inference was performed in this pass. xAI/Grok API is optional, not a blocker if an existing approved provider works.
3. **Daytona:** account access, API credential, workspace policy and actual cost/quota are not verified. Build adapter must stay disabled until checked.
4. **Recovery and release approval:** production rollback metadata exists, but this pass did not execute a restore drill or authorize production code/schema changes.
5. **Commercial activation:** no verified customer payment or income is established. Payment integration stays off until separately tested.

Do not ask the owner to paste secrets into chat. Ask only for a decision or access that cannot be safely resolved through the connected tools.

## 8. Audit trail for this blueprint

- Source inspected: HIO docs 62–70, package.json, wrangler.jsonc, ORDVELA unified-platform architecture doc.
- Cloudflare read-only inventory inspected: HIO Pages project, latest deployment metadata, and dedicated D1 identity/table count.
- No production resource was mutated.
- No application code, database migration, secret, or production deployment was changed in this blueprint pass.
- Test commands were not executed because this session has GitHub/Cloudflare API access but no verified local checkout/Node execution environment. Treat this as a documented audit and phased implementation plan, not a passing test report.
## 9. Implementation update (2026-10-17)

An initial authenticated AI chat vertical slice has now been added on the feature branch:
- `src/agent-workspace.ts`: standalone AI Workspace UI and authenticated chat/history APIs.
- `migrations/0005_agent_workspace.sql`: additive conversation/message tables and indexes.
- `src/index.ts`: registers chat API routes and owner-session-protected `/agent` page.
- `src/view.ts`: adds an AI Workspace entry point in the HIO navigation.
- Chat reuses the existing configured Groq model constant and `GROQ_API_KEY` server binding; provider keys are never sent to the browser.
- Chat history is stored in HIO D1 and scoped to the existing owner/operator identity. This is a single-owner beta, not yet public multi-tenant SaaS.
- Requests have a 25-second timeout, 1,200-token output cap, 40 successful assistant answers per UTC day, existing API mutation rate limiting, and explicit no-fake-response errors when the provider is missing or unavailable.
- The UI uses `textContent` for model output to avoid rendering model output as HTML.

**Verification caveat:** the source changes are committed to the feature branch, but this API-only session did not execute Node/Vitest/TypeScript/Playwright or apply the migration to a local D1. Do not mark the feature production-ready until `npm ci`, `npm run check`, `npm run security:check`, `npm run test:founder`, `npm run test:e2e`, and a local D1 migration test pass. The migration has not been applied to production, and no production deployment was triggered intentionally.

**Next implementation slice:** add automated route tests (provider missing, auth required, conversation ownership, daily cap, upstream timeout/429), then run the full baseline in a verified checkout. After that, add task planning/tool approvals to the chat UI; do not imply agent tools are already executing.