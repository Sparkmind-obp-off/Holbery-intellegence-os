# Full-Stack Delivery Roadmap

This extends I0–I8 with explicit frontend, backend, data, integration and product-readiness outputs. Evidence comes before broad features.

## I0 — Repository and environment audit
Inventory files, stack, routes, schema, workflows, deployment resources, environment variable names only, tests, security and cost gaps. Record verified facts and unknowns without printing secrets. **Exit:** as-is architecture and no-regression plan.

## I1 — Domain contracts and source registry
Backend/data: typed domain contracts, source registry, policy versions and run-state machine. Frontend: source list and detail with policy state. Tests: schema, authorization, migration and state transitions.

## I2 — Evidence ingestion
Persist run records, normalized source records, evidence provenance, stable IDs, fingerprints and audit events. UI: run timeline, evidence table and provenance. **Exit:** fixtures flow reproducibly and duplicate replay is idempotent.

## I3 — One approved connector
Select one source based on permission, signal quality, cost, reliability and complexity. Add manifest, bounded collection, fixture tests, rate-limit handling, kill switch and usage accounting. If no suitable source is approved, use fixtures and record the blocker honestly.

## I4 — Clustering and review
Duplicate-aware grouping, versioned clusters, source diversity, counter-evidence and reviewer correction. **Exit:** labeled evaluation shows useful grouping and duplicates are not counted as independent corroboration.

## I5 — Scoring and dossier
Versioned transparent factors; separate coverage, confidence, readiness and risk; preserve dossier snapshots. **Exit:** reviewer can reproduce ranking and identify missing evidence.

## I6 — Decision ledger and governance
Append-only decisions, approvals, audit, budget caps and source kill switch. **Exit:** no external side effect without authorization.

## I7 — Bounded experiment tracking
Experiment state machine, event ingestion, attribution and results. **Exit:** thresholds are predeclared and lead/payment states are truthful.

## I8 — Internal learning loop
Compare hypotheses with outcomes, analyze false positives, improve source choice and scoring, version evaluation fixtures. **Exit:** repeated use creates measurable decision value.

## I9 — Productization readiness
Assess target user, repeatable workflow, data rights, cost per useful dossier, onboarding, security, isolation, export/deletion, support, pricing evidence and paid pilots. Produce a go/no-go decision; it does not authorize launch.

## First vertical slice
Approved source → collection run → normalized record → evidence item → reviewed cluster → opportunity dossier → human decision. Do not build broad dashboards, many connectors, autonomous agents or subscription billing before this slice is dependable.