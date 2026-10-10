# Architecture Decision Records

Use this template for decisions affecting architecture, data, provider choice, security, cost, workflow or product direction.

## ADR-XXXX: Short title
- Status: proposed / accepted / superseded / rejected
- Date:
- Decision owner:
- Related phase or issue:

### Context
What problem or constraint requires a decision? Include verified state and unknowns.

### Decision
State the choice precisely. Mark assumptions and provisional decisions.

### Alternatives
List credible alternatives and why they were not selected.

### Consequences
Document benefits, trade-offs, migration cost, lock-in, security/privacy impact and operating cost.

### Evidence and confidence
Link tests, measurements, provider limits and supporting documentation. Separate facts from estimates.

### Revisit triggers
Name the metric, event, constraint or date that should reopen the decision.

## Guardrails
Internal-first; modular monolith until evidence justifies splitting; official/approved sources first; preserve provenance; human approval for consequential actions and spend; audit existing infrastructure before adding more; public repo contains no secrets or private data; user retains final approval for material production, commercial, legal and financial decisions.

A technical preference is not a verified implementation. Record target architecture separately from current state.