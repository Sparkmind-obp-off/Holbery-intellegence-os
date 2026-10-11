# Backend & API Architecture

## Responsibilities
The backend is the policy and orchestration boundary. It owns authentication, authorization, input validation, source permissions, run lifecycle, evidence provenance, deduplication, score versions, decisions, cost caps and audit events.

## Shape
Begin as a modular monolith with explicit domain modules. Do not split into microservices until scale, team boundaries or reliability evidence justify the operating cost. Modules: identity/access; source registry; collection orchestration; evidence ingestion; normalization/deduplication; clustering; opportunity scoring; dossier builder; decision ledger; experiment management; cost governance; audit/observability.

## API conventions
Use a versioned API contract, JSON schema validation, stable error codes, pagination cursors, request IDs and UTC timestamps in ISO 8601. Preserve original source timestamp/timezone when available.

Illustrative resources: sources; collection runs; run status; evidence search/detail/review; clusters and reviewed merge/split; opportunities and dossier; decisions; experiments and experiment events; sanitized health checks. These are proposals, not implemented endpoints.

## Long-running jobs
Collection and enrichment run as jobs, not long HTTP requests. Persist transitions such as queued → running → succeeded/partial/failed/cancelled. Cancellation prevents future work and retries where possible. Never report completion until terminal state is durable.

## Idempotency and consistency
Use idempotency keys for retryable create/run actions; stable source IDs and normalized fingerprints; bounded exponential backoff; provider Retry-After; safe cursor checkpoints after persistence; transactional state updates where possible. External collection is at-least-once, so ingestion must be idempotent.

## Errors
Distinguish invalid input, unauthorized, forbidden, not found, conflict, provider rate limit/unavailable, quota exhausted, policy blocked, partial result and internal failure. Never expose secrets in errors.

## Security
Authorize every object server-side. Treat source text as untrusted data. Model output cannot grant permission, raise budgets or authorize external actions.

## Acceptance
Contract tests cover authorization, validation, pagination, idempotency, state transitions, provider failures, cost caps and audit creation.

## Product direction synchronization (2026-10-12)

HIO's target is an evidence-to-execution business workspace, not a generic chatbot. This target does not imply shipped parity. Use docs/50 for capability states and release truth, docs/51 for Genspark/G2 benchmark, docs/52 for target architecture, docs/53 for production/commercial gates, and docs/54 for market validation. Keep fixtures distinct from live data. Production login remains blocked pending secure Owner configuration of distinct OPERATOR_SECRET and SESSION_SECRET values and verified authenticated production tests.
