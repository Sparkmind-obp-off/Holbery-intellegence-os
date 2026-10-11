# 40 — End-to-End Implementation Plan

**Status:** Proposed execution baseline; implementation has not started until the repository audit is completed.
**Purpose:** Turn the existing architecture into a staged, testable application without building disconnected features.

## Delivery rule

Build one working vertical slice at a time. Every phase must have a visible result, automated checks, a documented rollback path, and explicit acceptance criteria. Do not interpret a passing test suite as proof of real-world demand.

## Phase 0 — Audit and decisions

- Inspect repository tree, current branches, package/tooling, CI, deployment configuration, database bindings, secrets handling, and existing tests.
- Verify the intended Cloudflare account/project and environment without printing credentials.
- Identify implemented code versus documentation-only claims.
- Record findings in an implementation status report and decision log.
- Do not replace existing infrastructure until its purpose and dependencies are understood.

**Exit gate:** verified inventory, risk list, baseline tests, and an approved minimum vertical slice.

## Phase 1 — Application foundation

- Establish the application shell, navigation, authentication boundary, environment configuration, error handling, logging, and accessible responsive layout.
- Define typed domain contracts and API error conventions.
- Add CI checks, formatting/linting, unit tests, and deployment preview workflow.
- Keep secrets in platform secret storage; never in source, browser bundles, logs, or docs.

**Exit gate:** reproducible build and deployment preview; navigation and error states work; secrets scan and baseline tests pass.

## Phase 2 — Operator workspace and Manual page

- Build a usable dashboard shell with explicit empty, loading, success, and failure states.
- Add a dedicated **Manual / Help** page in the application navigation.
- Manual content is versioned in the repository and explains workflows, permissions, source limitations, and troubleshooting.
- Add contextual help links from complex screens; do not force users to search the manual for basic actions.
- Separate the in-app operator manual from developer/architecture documentation.

**Exit gate:** an operator can navigate the app and follow a tested walkthrough without developer assistance.

## Phase 3 — Persistence and governance

- Implement database schema/migrations only after the audit confirms the appropriate database and deployment constraints.
- Establish users/roles, workspace settings, source registry, collection runs, normalized observations, evidence provenance, audit events, and retention/deletion rules.
- Add idempotency, pagination, validation, timestamps, and migration/rollback procedures.
- Seed only synthetic fixtures; never disguise fixture data as live evidence.

**Exit gate:** migrations and rollback tested; access controls and audit events verified; no duplicate records on retry.

## Phase 4 — Evidence vertical slice

Implement the smallest end-to-end flow:

1. Register a disabled fixture connector.
2. Validate its manifest and declared capabilities.
3. Run fixture collection with bounded limits.
4. Normalize and deduplicate observations.
5. Preserve source, timestamp, method, and provenance.
6. Show the evidence in the operator workspace.
7. Review, approve/reject, and audit the decision.
8. Disable the connector and verify that further runs are blocked.

**Exit gate:** complete automated tests for the entire flow, including failure, retry, duplicate, permission denial, and disable/kill-switch scenarios.

## Phase 5 — First permitted live connector

- Select one source only after checking API availability, terms, scopes, data rights, rate limits, and operational cost.
- Prefer official APIs or appropriately licensed providers.
- Show connection status, granted scopes, collection limits, last run, failures, and revoke/disconnect controls.
- Treat source content as untrusted data; it must not be able to issue system instructions or authorize actions.
- Do not use private-session access, login circumvention, or unauthorized scraping.

**Exit gate:** documented permission basis, successful bounded test, provenance retained, rate limits enforced, and disconnect/revoke verified. If access is unavailable, keep the fixture connector and document the blocker.

## Phase 6 — Intelligence workflow

- Build clustering, evidence quality, counter-evidence, opportunity dossiers, explainable scoring, and human review.
- Distinguish observed evidence from AI interpretation and unverified hypotheses.
- Track model/prompt version, run metadata, evaluation results, and cost.
- Require evidence links for material claims; allow the operator to mark a claim unsupported.

**Exit gate:** evaluation set passes defined thresholds; unsupported claims are visible; scores are explainable and never auto-authorize spending or public launch.

## Phase 7 — Decision and experiment tracking

- Add a decision ledger with owner, rationale, alternatives, confidence, expiry/review date, and status.
- Add experiment records, hypotheses, success/failure thresholds, budgets, owner, stop conditions, and outcome evidence.
- Require explicit human approval for consequential actions, public launch, spending, or outreach.
- Record verified outcomes, including negative results and actual costs.

**Exit gate:** an experiment cannot launch without required approvals and limits; results can be tied back to the originating evidence and decision.

## Phase 8 — Plugin and MCP platform

- Start with a registry and validated manifests; installation never grants permissions automatically.
- Support first-party and private plugins before any public marketplace.
- Add a reviewed MCP client adapter with tool allowlists and per-tool authorization.
- Add a custom MCP server only for explicitly selected, safe capabilities that should be exposed to external agents.
- Use bounded execution, timeouts, output validation, audit logs, secret references, and kill switches.
- Never equate MCP compatibility with trust.

**Exit gate:** fixture plugin and one reviewed integration pass contract/security tests; unauthorized capabilities are denied; revocation stops execution.

## Phase 9 — Hardening and operational readiness

- Verify backups/restore, retention/deletion, observability, incident response, rate limits, cost budgets, dependency/supply-chain checks, accessibility, and mobile/responsive UX.
- Run security review and failure-mode tests.
- Test staging-to-production promotion and rollback.
- Update the runbook and in-app Manual to match actual shipped behavior.

**Exit gate:** release checklist signed off; rollback tested; known limitations and operational owner documented.

## Phase 10 — Internal pilot and product decision

- Use the system internally against a defined question and time window.
- Measure source coverage, useful evidence yield, review time, cost per useful insight, decision speed, and outcomes.
- Review false positives, missing evidence, connector failures, and operator burden.
- Decide whether to improve internally, keep it private, or prepare a separately scoped commercial product.

**Exit gate:** decision based on observed internal usage and evidence, not feature count alone.

## Required status labels

Every module must be marked one of: **Planned**, **In progress**, **Implemented**, **Tested**, **Deployed to staging**, **Deployed to production**, or **Validated in operation**. These labels are not interchangeable.

## Definition of done for each phase

- Code and documentation are consistent.
- Automated tests and relevant manual checks pass.
- Permissions, privacy, and failure cases are covered.
- Observability and recovery are documented.
- Deployment state is explicitly recorded.
- No unsupported claim of live data, production operation, or market validation.


## Product direction synchronization (2026-10-12)

HIO's target is an evidence-to-execution business workspace, not a generic chatbot. This target does not imply shipped parity. Use docs/50 for capability states and release truth, docs/51 for Genspark/G2 benchmark, docs/52 for target architecture, docs/53 for production/commercial gates, and docs/54 for market validation. Keep fixtures distinct from live data. Production login remains blocked pending secure Owner configuration of distinct OPERATOR_SECRET and SESSION_SECRET values and verified authenticated production tests.
