# HIO AI Workspace Productization & Production Parity

**Status:** Canonical product direction; runtime capability must be independently verified.  
**Owner:** HOLBERY  
**App:** https://holbery-intelligence-os.pages.dev  
**Repository:** https://github.com/Sparkmind-obp-off/Holbery-intellegence-os  
**Updated:** 2026-10-12

## Product direction

HIO is being developed as a sellable AI Business Command Workspace: a coherent workspace that helps operators move from market signals to evidence-backed opportunities, approved execution, and measured outcomes. This is a product direction, not a claim that the current release is commercially ready.

Research comparable AI workspace, workflow, and agent products using G2 category/review pages and primary vendor documentation, including ClickUp, Notion, and Salesforce Agentforce. Capture dated source URLs, concrete user pain, positive and negative evidence, pricing when publicly available, limitations, and confidence. Do not copy branding or treat marketing claims as verified outcomes.

## Target workspace

1. Executive Home — priorities, blockers, decisions, costs, verified status, next actions.
2. Demand Intelligence — research questions, sources, bounded collection, evidence, counter-evidence, provenance, dossiers.
3. Opportunities — target user, problem, payer hypothesis, alternatives, differentiation, uncertainty, scoring version, validation plan.
4. Portfolio & Acquisitions — assets, lifecycle, dependencies, due diligence, technical disposition, isolation boundaries.
5. Execution & Workflows — tasks/jobs, dependencies, retries, budgets, receipts, idempotency, approvals, recovery.
6. Integrations & Providers — credential inventory, OAuth scopes, connection health, expiry, cost, quotas, last verification.
7. Monetization — offers, pricing hypotheses, payment readiness, fulfillment, refunds, actual revenue evidence.
8. Outcomes & Learning — usage, experiment results, conversion, retention, costs, failures, decisions.
9. Approvals & Audit — pending approvals, risk, approver, event history, revocation, rollback.
10. Settings & Security — users/roles, workspace boundaries, sessions, retention, export/deletion, environment status.

A navigation item is not proof of a working feature. Label every capability truthfully: Verified, Implemented—not verified, Fixture/demo, Stub, Planned, Blocked, or Unknown.

## Production parity contract

For every user-facing capability, record the frontend route and states, backend route/service, server-side authorization, D1 tables/migrations, provider dependencies, tests, production verification time, deployed commit, limitations, and rollback/disable path.

A feature is production-verified only when its critical path works in the intended environment, authorization is enforced, and persisted effects are inspected. A unit test, mock, fixture, local build, screenshot, HTTP 200, or static page deployment alone is insufficient.

Preserve the current Cloudflare Pages/Workers and D1 architecture unless an evidence-backed decision justifies a change. Keep domain logic separate from presentation, validate input at boundaries, use safe typed errors, version migrations, and enforce object/workspace ownership on the server. Keep fixture records labelled and separate from live demand and revenue metrics. Use idempotency for retryable mutations and audit material state changes.

## OAuth and Owner credential transparency

Maintain a complete Owner-facing inventory without showing secret values. For every provider list its purpose, required credential names, secure configuration location, scopes, environment, readiness, last verified connection, expiry/rotation state, rate/cost limits, and recovery instructions.

Show meaningful states such as Needs setup, Pending authorization, Connected, Permission missing, Expired, Revoked, Error, and Not verified. OAuth consent denial, missing scopes, refresh failures, expiry, revocation, and outages must be logged and surfaced to the Owner. Notify through an actually configured channel; if no external notification channel exists, show a persistent in-app notice and explicitly report external notifications unavailable.

Never expose secret values in chat, browser storage, HTML, API responses, logs, public documentation, screenshots, or Git history. Store them only in the approved secret store. A status must come from an actual check or be clearly labelled as owner-reported.

## Continuous delivery and updates

Use dependency-aware workstreams, not calendar promises or phase names that imply completion. For every meaningful change:
1. Inspect branch, deployed commit, routes, D1/migrations, auth, secret readiness by name/status only, tests, and provider state.
2. Implement a coherent vertical slice in the existing repository.
3. Run typecheck, lint, tests, build, and relevant security/browser checks; fix regressions.
4. Test database setup/upgrades, persistence, authorization, failure handling, and idempotency as applicable.
5. Create reviewable Git changes; never force-push or overwrite unrelated work.
6. Deploy only through the authorized Cloudflare BYOK path when prerequisites pass.
7. Verify deployed commit, login, private-route denial without auth, authenticated workflow, D1 writes, and failure behavior.
8. Record evidence, limitations, and rollback instructions. If blocked, state the exact blocker.

Do not add GitHub Actions, paid services, or duplicate infrastructure by default. Keep the existing deployment and verification workflow unless a concrete need justifies a change.

## Commercial readiness

Do not sell the entire platform until the relevant features are implemented, verified, and supported. Before accepting external SaaS customers, verify tenant isolation, role enforcement, session lifecycle, recovery, privacy/terms, retention, export/deletion, incident response, support ownership, usage metering, abuse controls, cost limits, backup/restore, and monitoring. Before billing, test payment/webhook verification, idempotency, reconciliation, failed payments, refunds, cancellation, and fulfillment.

Validate one narrow target user and repeated/expensive problem. Measure workflow value against a baseline, test costs and support burden, and obtain a paid pilot or real payment before claiming willingness to pay is validated. No forecasts, compliments, clicks, or simulated payments count as revenue. Do not invent pricing before value and willingness-to-pay evidence exists.

## Release blocker and boundaries

The reported current production release is setup-required because OPERATOR_SECRET and SESSION_SECRET are missing. The Owner must configure distinct production secrets through Cloudflare or another authorized secure route; never request values in chat. Then deploy and verify production login and the persisted authenticated workflow. Provider integrations, OAuth, and external notifications remain inactive until individually configured and tested.

This document does not authorize changes to HOLBERY Commerce, Bozq Cukur / Bozq One System, Vestren, Ranel, or other owner-protected projects. HIO may inventory these assets but must not alter their production code, data, secrets, domains, or deployments without separate explicit authorization.

## Definition of done

Report separately what is implemented, tested, committed/pushed, deployed, production-verified, and commercially validated. Completion requires code, tests, persisted behavior, security boundaries, user-facing states, documentation, release evidence, and recovery behavior to agree.


## Product discovery and production-readiness references (2026-10-12)

Use docs/51 for the dated Genspark/G2 benchmark, docs/52 for the Evidence-to-Execution Business OS target architecture, docs/53 for mandatory production and commercial launch gates, and docs/54 for the market validation playbook. These define target direction and acceptance criteria; they do not claim that unimplemented modules are live. Production readiness requires actual authenticated runtime and D1 verification.
