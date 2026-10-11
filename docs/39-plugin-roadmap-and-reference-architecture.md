# Plugin Platform Roadmap & Reference Architecture

## Guiding decision
Build a stable plugin contract and controlled adapter boundary before building a general-purpose code marketplace. The goal is to make integrations replaceable and custom MCP support possible without making the core fragile.

## Phase P0 — Audit and boundaries
Inspect the actual repository, deployment, stack, existing connectors and database. Record constraints and select one runtime model. No production secrets are printed or copied. Exit: current-state map and approved implementation plan.

## Phase P1 — Canonical contracts
Define manifest schema, capability names, source-record contract, error taxonomy, plugin lifecycle and permission model. Add fixture tests. Exit: example connector passes validation without external credentials.

## Phase P2 — Built-in adapter registry
Register built-in connectors, validate configuration, show enabled/disabled state, expose health and log bounded runs. Exit: disabling a plugin stops new executions reliably.

## Phase P3 — First real source plugin
Choose one source based on legal access, signal quality, price, reliability and implementation complexity. Implement bounded collection, provenance, rate limits, cost reporting and kill switch. Instagram is a candidate, not a guaranteed API capability; use only supported/authorized access.

## Phase P4 — Custom plugin SDK
Create scaffolding, local fixture runner, contract test suite and package/version format. First support declarative or trusted adapters rather than arbitrary code uploads.

## Phase P5 — MCP client adapter
Register reviewed MCP servers; enumerate tools; allowlist read-only tools; validate inputs/outputs; apply timeouts, quotas and audit. Add side-effect tools only after separate approval design.

## Phase P6 — Isolated runtime
Only if a real use case requires third-party executable plugins, add sandboxing, egress controls, package signing/provenance, resource quotas and stronger supply-chain checks.

## Phase P7 — Private distribution
Support export/import of signed or digest-pinned plugin packages within trusted workspaces. Include version compatibility and rollback.

## Phase P8 — External product readiness
Evaluate tenant isolation, plugin publisher trust, user consent, billing/usage limits, abuse reports, privacy and support. A public marketplace is a separate product and security project.

## Architecture invariants
- Core owns permissions, evidence persistence, audit, budgets and approvals.
- Plugins are replaceable and never become the source of truth for decisions.
- Every output carries plugin version and provenance.
- Installation does not equal authorization.
- Source-policy and cost controls apply equally to first-party and third-party integrations.
- A failed connector does not erase past records or imply absence of demand.
- Public repository content contains no credentials, sessions, customer data or production dumps.

## First vertical slice
Manifest → register disabled → validate configuration → fixture test → bounded run → normalized record → evidence persistence → audit event → operator review → disable and confirm no further runs.

## Decision gate
Do not implement arbitrary plugin execution or a marketplace until the basic connector contract and one real, permitted integration demonstrate value.

## Product direction synchronization (2026-10-12)

HIO's target is an evidence-to-execution business workspace, not a generic chatbot. This target does not imply shipped parity. Use docs/50 for capability states and release truth, docs/51 for Genspark/G2 benchmark, docs/52 for target architecture, docs/53 for production/commercial gates, and docs/54 for market validation. Keep fixtures distinct from live data. Production login remains blocked pending secure Owner configuration of distinct OPERATOR_SECRET and SESSION_SECRET values and verified authenticated production tests.
