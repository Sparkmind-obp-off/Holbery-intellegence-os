# Frontend Architecture

## Role
The frontend is a private operator workbench. It must expose evidence quality, uncertainty, source health and decision accountability. It is not the source of truth for business rules.

## Recommended baseline
TypeScript and React with Vite are the provisional default for a lightweight operator SPA, subject to I0 audit. Select an accessible component foundation after checking maintenance and license. Use schema-validated API types, browser-level tests, and a chart library only when real data needs visualization. Do not introduce a framework before auditing existing code.

## Feature boundaries
- app shell and navigation
- overview and review queue
- sources and connector health
- collection runs and logs
- evidence search, provenance and review
- clusters and merge/split review
- opportunities, scoring and dossier
- experiments and outcomes
- decision ledger
- settings, exports and retention
- shared API client, error handling, forms and accessible primitives

## State ownership
Server-owned: evidence, sources, runs, scores, decisions, experiments and audit events. Local state: filters, selected tabs and temporary form inputs. URL state: safe, shareable internal filters and dossier IDs. Never store secrets or authoritative permissions in browser storage. The frontend must not maintain a competing authoritative score or workflow state.

## API and failure behavior
Represent loading, empty, stale, partial, forbidden, rate-limited and failed states. Mutations show server-confirmed outcomes. Do not silently retry external side effects. Use request/run IDs for support.

## Performance and quality
Paginate evidence; search large datasets server-side; do not download entire corpora to the browser. Run typecheck, lint, component tests, accessibility checks and browser tests for source → run → evidence → dossier → decision. Use synthetic or sanitized fixtures.

## Definition of done
The UI reflects backend truth, preserves traceability, supports keyboard navigation and has explicit behavior for expected failure states.

## Product direction synchronization (2026-10-12)

HIO's target is an evidence-to-execution business workspace, not a generic chatbot. This target does not imply shipped parity. Use docs/50 for capability states and release truth, docs/51 for Genspark/G2 benchmark, docs/52 for target architecture, docs/53 for production/commercial gates, and docs/54 for market validation. Keep fixtures distinct from live data. Production login remains blocked pending secure Owner configuration of distinct OPERATOR_SECRET and SESSION_SECRET values and verified authenticated production tests.
