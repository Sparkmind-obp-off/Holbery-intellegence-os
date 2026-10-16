# 67 — HIO MVP Implementation Roadmap

**Decision date:** 2026-10-17  
**Scope:** HIO only. Preserve HOLBERY Commerce and Bozq One System untouched.  
**Audit basis:** [66 — Implementation Audit](66-implementation-audit-before-commercial-mvp.md)  
**Product target:** [64 — Public SaaS Product Direction](64-public-saas-product-direction.md)

## Objective

Deliver one secure, measurable, customer-facing journey:

**FIND → review evidence → approve one opportunity → BUILD one useful artifact in Daytona → deliver privately → VALIDATE a real signal → record continue/revise/stop.**

Do not build every advertised feature at once. The release is successful when one real customer test completes safely and its actual provider usage/cost is visible.

## Phase 0 — Establish baseline and safety rails

Deliverables:
- Record current commit, deployed version, D1 migration state, Pages/Worker configuration and secret presence (never secret values).
- Run npm ci, npm run check, npm run security:check, local D1 migration tests, and relevant E2E suites in the checked-out repository.
- Capture sanitized test output and identify failures before modifying code.
- Verify backup/restore path and deployment rollback; do not run production migrations until backup/recovery is proven.
- Make a file-level plan and use a feature branch/PR where available.

**Exit gate:** baseline report exists; existing tests pass or known failures are recorded; production recovery path is documented. No feature work should obscure baseline failures.

## Phase 1 — Customer identity and tenant isolation

Deliverables:
- Define customer, workspace, membership, role, and session model. Keep owner/admin operations separate from customer workspace routes.
- Add additive migrations only; preserve existing founder sessions and records.
- Add customer sign-up/invitation or controlled beta provisioning, sign-in/out, expiry, recovery and session revocation. Avoid public self-registration until abuse/rate limits and recovery are tested.
- Require workspace membership on every customer read/write and every provider job/artifact operation.
- Add explicit authorization helpers and scoped data access; reject client-supplied tenant IDs unless membership is verified.
- Add tests for unauthenticated, wrong-workspace, role-denied, expired-session, revoked-session and cross-tenant object access.
- Keep founder/admin routes behind existing operator controls and distinct from customer routes.

**Exit gate:** cross-tenant tests prove a user cannot read, alter, download or trigger jobs for another workspace; no existing founder access regression.

## Phase 2 — Provider adapters and usage/cost ledger

Deliverables:
- Introduce a narrow provider adapter contract with normalized success/failure, timeout, request ID, usage, estimated/actual cost, provenance, and safe error classes.
- Reuse existing Tavily/Firecrawl/Apify/Groq research code; do not duplicate existing providers.
- Add Apify Actor selection as explicit configuration. Start with one permitted Actor/source that has been tested; do not claim broad social coverage.
- Add optional Jina Reader, OpenRouter, xAI/Grok, Workers AI, Resend, Sentry and R2 adapters only when their feature is active and account terms/credentials have been verified. Keep secrets server-side.
- Add per-workspace/day/job caps, concurrency limits, timeout, cancellation, idempotency, cost reservations/receipts, and safe quota-exhaustion behavior.
- Build a provider capability/status register from configuration and tests, not from a UI checkbox or saved key.
- Keep the default model/provider configurable. Do not require Groq and xAI both for the MVP.

**Exit gate:** each enabled provider passes a minimal sanitized capability test; provider failures cannot bypass quotas; all external calls create usage receipts; keys never appear in logs or responses.

## Phase 3 — Customer FIND and opportunity decision

Deliverables:
- Create a customer-facing demand brief form: niche/segment, geography, problem/question, payer hypothesis, constraints.
- Run one bounded source acquisition and Tavily web context step; preserve URLs, timestamps, collection time, source identity, duplicate handling, and counter-evidence.
- Generate an evidence-linked opportunity brief with knowns, unknowns, limitations, competing alternatives and a validation recommendation.
- Store all records under a workspace; distinguish evidence from AI interpretation.
- Add approve/reject/revise/later decision with rationale and audit event. Approval means permission to prepare a bounded build, not permission to publish or spend without limits.

**Exit gate:** one customer can run FIND, inspect original sources, make a recorded decision, and see an honest result when no evidence is found or a provider fails.

## Phase 4 — BUILD in Daytona and private artifact delivery

Deliverables:
- Implement Daytona adapter using official API/docs and confirmed account configuration.
- Start from a server-owned, versioned build template; accept only validated input and a narrow build manifest. Do not give sandbox broad production secrets.
- Execute in isolated sandbox with maximum duration/resources, network egress policy, cancellation, status polling, cleanup, and per-workspace cost cap.
- Select the smallest useful output: workbook, template, report, calculator, dashboard, or web demo. A website is not mandatory.
- Run artifact-specific tests; produce a manifest with file type, checksum, test status, limitations, build version and usage guide.
- Store private outputs in R2 when needed; verify membership before every download and enforce retention/deletion.
- Never publish a generated site or send outreach automatically. Require explicit approval for consequential external actions.

**Exit gate:** one approved opportunity produces one tested artifact; another workspace cannot access it; sandbox terminates and cleanup is verified; cost/usage is recorded.

## Phase 5 — VALIDATE and outcome tracking

Deliverables:
- Link the artifact to a falsifiable hypothesis, named target segment, validation channel, success threshold, stop threshold, budget and expiry.
- Capture feedback, test usage, qualified interest, signup, pre-order or payment only where lawful and actually observed.
- Distinguish stated interest from usage and actual payment. No invented metrics or synthetic data presented as customer results.
- Record evidence, limitations, actual cost, learning, and continue/revise/stop decision.
- Provide an exportable validation summary.

**Exit gate:** a real test result can be recorded and traced back to its hypothesis, artifact and evidence. If no real customer has tested it yet, status remains not validated.

## Phase 6 — Operational readiness and controlled beta

Deliverables:
- Configure Resend only for enabled transactional email; verify sender domain, SPF/DKIM/DMARC, bounce/suppression and abuse controls.
- Configure Sentry with PII/secrets scrubbing, safe sampling, access controls and retention.
- Configure R2 private access, lifecycle/retention, size limits and recovery.
- Publish privacy notice, terms, support/contact route, source and AI limitations, retention/deletion/export path, beta terms, and truthful feature availability.
- Run security, accessibility, mobile, E2E, rate-limit, provider timeout/quota, restore, rollback, and cross-tenant tests.
- Conduct a costed end-to-end test and define free beta quota/stop conditions.

**Exit gate:** signed acceptance checklist, backup/restore proof, no critical/high unresolved access-control issue, documented costs, and operator incident/recovery procedure.

## Phase 7 — Commercial payment (after beta evidence)

Deliverables:
- Confirm Duitku merchant production configuration, supported transaction model, fees, callback signatures, idempotency, reconciliation, refunds and webhook retries.
- Add billing only after pricing/entitlements and usage measurement are coherent.
- Test successful, failed, duplicate, pending, expired, refunded and mismatched payment callbacks.
- Make billing status authoritative server-side; do not trust frontend claims of payment.

**Exit gate:** real test transaction and reconciliation evidence, or keep billing disabled and continue controlled free beta.

## MVP acceptance checklist

- [ ] Existing founder workspace and historical records remain intact.
- [ ] Customer identity, sessions, recovery and workspace membership are tested.
- [ ] Cross-tenant read/write/download/job attempts are denied.
- [ ] One permitted source + Tavily produce traceable evidence.
- [ ] User approval precedes build execution.
- [ ] Daytona build is isolated, bounded, cancellable and cleaned up.
- [ ] Artifact delivery is private and workspace-authorized.
- [ ] Validation hypothesis, success/stop criteria and real outcome are persisted.
- [ ] Provider usage and cost are recorded per job/workspace.
- [ ] Provider secrets and customer data are redacted from logs.
- [ ] Backup/restore, rollback and incident steps are verified.
- [ ] Paid billing remains off until its own acceptance gate passes.

## Recommended implementation order

1. Baseline tests + backup/rollback verification.
2. Customer identity and tenant isolation.
3. Usage ledger and provider adapter contract.
4. Customer FIND/decision.
5. Daytona BUILD + private artifact.
6. VALIDATE outcomes.
7. Privacy/ops/beta acceptance.
8. Payment/billing only if beta evidence warrants it.

Do not parallelize all phases in a single large code change. Implement, test, review and checkpoint each phase. Stop if a change threatens existing production data or requires an unverified destructive migration.
