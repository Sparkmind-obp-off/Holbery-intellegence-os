# 43 — One-Shot Execution Plan and Phase Gates

**Goal:** Minimize handoffs while retaining safe checkpoints. “One-shot” means one substantial agent run per work package, not pretending a complex product can be finished without testing or external access.

## Delivery model

Use five major execution passes. The agent should complete every safe task in the current pass, run checks, and report blockers only when external authorization or a destructive decision is required.

| Pass | Scope | Required output |
|---|---|---|
| 1 — Audit + foundation | Repository audit, baseline checks, architecture reconciliation, application shell, navigation, typed contracts, error/loading/empty states | Verified audit/status report, reproducible build, usable application shell |
| 2 — Data + evidence | Database/migrations, fixture connector, bounded collection, normalization, deduplication, evidence provenance, audit trail | Working end-to-end fixture evidence flow |
| 3 — Intelligence + decisions | Clustering, dossier, explainable scoring, counter-evidence, decision ledger, experiment tracking and human gates | Operator can move from evidence to reviewed decision |
| 4 — Manual + extensibility | In-app Manual, plugin manifest/registry, fixture plugin, permission review, disable/revoke, MCP client contract and tests | Documented usable app with safe extension foundation |
| 5 — Hardening + release | Test fixes, security and failure-mode checks, runbook, backup/rollback review, preview/staging deployment, real connector only if authorized | Release candidate and truthful readiness report |

## What can be combined

- Audit and app foundation can be one run, provided the audit happens first.
- Database, fixture connector, evidence UI, and audit trail should be built as one vertical slice.
- Clustering, dossier, scoring, and decisions should share the same evidence model.
- Manual content should be written alongside actual workflows and then verified against the UI.
- Plugin contracts, fixture plugin, and permission tests belong together.
- Security/release checks run after each pass and again at the end.

## What must not be shortcut

- Repository/environment audit.
- Tests and correction of regressions.
- Permission review before connecting external services.
- Human approval for production changes, spending, public exposure, or destructive migrations.
- Honest separation between implemented, tested, deployed, and validated.
- Real-provider integration when credentials, API scopes, terms, or access have not been supplied.

## Time estimate policy

Do not promise a fixed completion date before the audit. Estimate after Pass 1 based on actual codebase, deployment access, missing credentials, and test infrastructure. The goal is fewer interaction rounds, not removing necessary engineering verification.

## End-of-pass checkpoint

At the end of each pass, the agent must:
1. Run all relevant checks.
2. Fix issues introduced by the pass.
3. Update status and decision docs.
4. Commit coherent changes.
5. State exactly what is complete and what is blocked.
6. Continue into the next pass in the same session if tools/context/time permit and no approval is required.

## Final MVP acceptance

- A new operator can open the app and navigate its primary areas.
- Fixture source can run within declared bounds.
- Evidence is persisted with provenance and deduplication.
- An opportunity dossier displays supporting and counter-evidence and explains uncertainty.
- Human-reviewed decision and experiment records can be created.
- Audit trail records sensitive lifecycle actions.
- Manual page is accessible and describes real behavior.
- Plugin manifest and permissions are validated; disabling the fixture plugin prevents further execution.
- Automated checks pass or every unavailable check has a specific documented reason.
- Deployment/readiness claims match verified evidence.


> **Superseding delivery rule (2026-10-12):** Treat the passes below as work organization only, not phase-completion claims. Use dependency-aware continuous workstreams and verified acceptance evidence. The canonical product direction, OAuth/Owner visibility requirements, production parity, commercial readiness, and scope boundaries are defined in [the productization contract](50-ai-workspace-productization-and-production-parity.md).


## Product direction synchronization (2026-10-12)

HIO's target is an evidence-to-execution business workspace, not a generic chatbot. This target does not imply shipped parity. Use docs/50 for capability states and release truth, docs/51 for Genspark/G2 benchmark, docs/52 for target architecture, docs/53 for production/commercial gates, and docs/54 for market validation. Keep fixtures distinct from live data. Production login remains blocked pending secure Owner configuration of distinct OPERATOR_SECRET and SESSION_SECRET values and verified authenticated production tests.
