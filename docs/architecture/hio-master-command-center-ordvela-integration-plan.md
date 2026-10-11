# HIO Master Command Center — ORDVELA Capability Integration Plan

**Decision ID:** HIO-ARCH-2026-10-11-COMMAND-CENTER  
**Status:** ACCEPTED DIRECTION; IMPLEMENTATION NOT YET VERIFIED  
**Owner:** HOLBERY  
**Canonical portfolio command center:** HOLBERY Intelligence OS (HIO)  
**Reference implementation:** ORDVELA repository, retained in place during integration

## 1. Decision

HOLBERY Intelligence OS will evolve from a portfolio intelligence/decision layer into HOLBERY's master command center. It should reach functional parity with the useful command-center capabilities already implemented in ORDVELA, then add portfolio-wide governance and monetization control.

This is a product/architecture decision, not a claim that HIO already has these capabilities. The current HIO README describes an internal fixture workflow and persisted research planning; its live page is reported as setup-required/locked because production credentials are absent. Implementation and production readiness must be established by tests and deployment evidence.

ORDVELA is the first internally absorbed portfolio asset. Its existing repository remains the reference source for proven or implemented workflows while capabilities are evaluated. Do not fork or copy the whole codebase blindly.

## 2. Target operating model

HOLBERY is the parent identity. HIO is the control plane. Existing projects remain isolated runtimes until an explicit, tested migration is approved.

### Command-center domains

1. **Executive Home:** portfolio health, blockers, next decisions, cash/operating-cost signals, recent outcomes, and pending approvals.
2. **Demand Intelligence:** source registry, bounded collection jobs, normalized observations, deduplication, provenance, supporting/counter-evidence, and research dossiers.
3. **Opportunities:** segment/problem/payer hypotheses, evidence quality, uncertainty, differentiation, cost, and prioritization. Never present fixture scores as market truth.
4. **Portfolio & Acquisition:** asset registry, internal acquisition records, due diligence, ownership, dependencies, technical disposition, and lifecycle decisions.
5. **Execution & Workflows:** approved tasks, job state, retries, receipts, budgets, quotas, kill switches, and idempotency. No autonomous external action without a defined permission and approval.
6. **Integrations & Providers:** provider catalog, connection/readiness state, least-privilege grants, quotas, terms review, secret references, and health checks. Never expose secret values to the UI or logs.
7. **Monetization:** offer hypotheses, pricing tests, validation pipeline, payment readiness, fulfillment status, refunds, and actual revenue evidence.
8. **Outcomes & Learning:** immutable experiment outcomes, cost, conversion, failures, lessons, and follow-up decisions.
9. **Approvals & Audit:** human approvals, revocation, audit trail, change history, and safe recovery.
10. **Settings & Security:** role boundaries, session/CSRF controls, environment readiness, backup/restore and incident procedures.

## 3. How ORDVELA fits

- Bring ORDVELA into the HIO portfolio registry as the first internal acquisition.
- Reuse its demand-to-revenue workflows, provider operating-layer concepts, command-center documentation, approval controls, quotas, and audit patterns only after verifying each implementation and its tests.
- Treat ORDVELA documentation as a design/reference input, not proof that every described feature is live.
- Keep ORDVELA production code, database, credentials, and deployment in place during assessment.
- Prefer narrow capability integration and stable interfaces over an immediate repository merge.
- Do not modify ORDVELA production as part of this HIO planning decision.

## 4. Implementation sequence

### Phase A — Inventory and parity map
Read-only audit HIO and ORDVELA repositories. Map each target domain to current code, API routes, database tables/migrations, UI, tests, production evidence, security controls, and gaps. Label every claim as verified, owner-reported, planned, or unknown.

### Phase B — HIO foundation
Make HIO's own portfolio register, approvals, audit trail, role model, health/status reporting, and integration registry reliable. Preserve fail-closed behavior and environment boundaries.

### Phase C — Demand and opportunity parity
Integrate only the demand-to-evidence-to-opportunity capabilities that pass tests. Preserve provenance, counter-evidence, deduplication, budget limits, and explicit uncertainty. No fabricated live data or unsupported rankings.

### Phase D — Execution and provider operations
Add bounded, auditable jobs and provider connections behind allowlists, least-privilege grants, hard quotas, approval gates, safe logs, and kill switches. Default all newly introduced providers and external actions to disabled.

### Phase E — Monetization and outcomes
Track a small number of evidence-backed offers, real validation commitments, payment readiness, delivery, refunds, costs, and actual outcomes. Do not treat page views, synthetic records, or internal tests as revenue evidence.

### Phase F — Migration decision
Only after parity, security, backup/rollback, data-ownership, and acceptance gates pass, propose whether any ORDVELA capability should be migrated, shared via API, or left as an independent runtime. Require a separate explicit production change approval.

## 5. Non-negotiable boundaries

- No secret values, token fragments, or private customer data in docs, frontend bundles, logs, or HIO registry records.
- Credentials suspected exposed must be rotated and revocation verified; only safe metadata may be recorded.
- No production database migrations, secret writes, DNS changes, domain purchases, destructive changes, or cross-project data copying under this plan.
- Do not touch HOLBERY Commerce or Bozq Cukur / Bozq One System. Vestren, Ranel, and other project runtimes remain outside scope unless separately authorized.
- HIO must distinguish working features from fixtures, stubs, planned items, and unknown production state.
- Human owner approval is required for material external actions, spend, migration, and destructive changes.

## 6. Acceptance criteria for command-center readiness

- One authenticated overview shows portfolio assets, evidence-backed priorities, blockers, approvals, costs, and outcome status.
- Every opportunity traces back to sourced evidence or is clearly marked as a hypothesis.
- Every job/provider action has an owner, scope, budget/quota, status, receipt, and audit trail.
- Secrets remain server-side and are never returned by readiness or diagnostics endpoints.
- Permission checks, tenant/data isolation where applicable, CSRF/origin controls, rate limits, idempotency, kill switches, and safe error handling are tested.
- Critical workflows have automated tests and production smoke evidence; deployment alone is not acceptance.
- Monetization reporting uses actual payments/fulfillment/refunds where available and labels missing data as unknown.
- A rollback plan and explicit approval exist before any production migration.

## 7. Immediate next action

Start Phase A only: produce a read-only HIO-versus-ORDVELA capability and resource inventory, citing exact files, routes, migrations, tests, and deployment evidence. Use that map to select the smallest high-value implementation slice. Do not begin a broad rewrite or production migration before the gap map is reviewed.


## Product direction synchronization (2026-10-12)

HIO's target is an evidence-to-execution business workspace. This does not authorize changing protected projects or claiming runtime parity without evidence. Use docs/50 for the canonical product/release contract, docs/51 for Genspark/G2 research, docs/52 for target architecture, docs/53 for production/commercial gates, and docs/54 for validation. Keep Owner secrets private; report readiness by name/status only. The current login blocker remains until distinct production secrets are configured and authenticated runtime behavior is verified.
