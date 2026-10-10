# 09 — Implementation Roadmap

Roadmap stages are gates, not promises of calendar completion. Each phase requires acceptance evidence before moving forward.

## I0 — Repository and environment audit
- Inspect repo contents, default branch, package manager, runtime, deployment, CI, secrets configuration (names only), existing database schema, auth, event tracking, and tests.
- Check relevant HOLBERY infrastructure for reuse opportunities without coupling unrelated repos.
- Identify what is real, what is placeholder, and what is not configured.
**Exit:** written audit, no secrets exposed, no duplicate infrastructure proposed without reason.

## I1 — Contracts and source registry
- Add typed domain contracts and schema versioning.
- Implement source registry and source policy review states.
- Add cost/rate-limit and source disable controls.
**Exit:** registry CRUD and validation tests pass.

## I2 — Evidence foundation
- Create/reuse database migrations.
- Implement collection-run ledger, normalized source records, provenance, hashes, duplicate links, and retention metadata.
**Exit:** repeat ingestion is idempotent; reviewer can trace evidence to source and run.

## I3 — First authorized connectors
- Select two or three source types only after access/terms audit.
- Implement bounded queries, quotas, checkpointing, retry, cancellation, and error states.
**Exit:** fixture tests plus a limited authorized live run with costs and provenance recorded.

## I4 — Classification and clustering
- Extract problem statements, segment/context, workarounds, urgency/frequency, commercial-intent clues, alternatives, and counter-evidence.
- Keep AI outputs separate from raw evidence.
**Exit:** human-reviewed sample set and evaluation notes; merge/split clusters auditable.

## I5 — Opportunity scoring and decision ledger
- Implement versioned scoring, coverage, uncertainty, counter-evidence, review states, and human decisions.
**Exit:** same inputs produce reproducible score output for a fixed scoring version.

## I6 — Private operator surface
- Evidence explorer, source health/costs, clusters, opportunity dossier, approvals, audit trail.
**Exit:** owner can complete the research-to-decision loop without direct database edits.

## I7 — Bounded experiment integration
- Create experiment records, channel/approval gate, event schema, and metrics.
- Integrate with existing HOLBERY commerce/checkout only after auditing contracts; do not duplicate payments.
**Exit:** test can be launched, measured, paused, and closed with traceable results.

## I8 — Learning and calibration
- Compare predicted opportunity assessments with actual outcomes.
- Track paid conversion, delivery outcomes, repeatability, refunds, and cost.
**Exit:** post-test report and a documented decision.

## Initial vertical slice
One approved source → collection run → normalized record → evidence item → reviewed cluster → opportunity dossier → human decision. Build this before broadening source coverage.

## Explicitly deferred
- Autonomous agents that publish or spend.
- All-platform crawling.
- Multi-database/microservice architecture.
- Public multi-tenant SaaS.
- Complex real-time streaming unless measured need exists.
