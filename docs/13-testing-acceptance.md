# 13 — Testing and Acceptance Criteria

## Test layers
1. Unit tests: normalization, hashing, deduplication, scoring, policy decisions, schema validation.
2. Contract tests: connector output shape, pagination/checkpoints, provider errors, cost estimation.
3. Integration tests: database transactions, job lifecycle, auth, audit events.
4. Security tests: authorization, secret redaction, prompt injection, input limits, SSRF protection where URLs are fetched.
5. End-to-end tests: source registry → evidence → cluster → dossier → decision.
6. Evaluation tests: reviewed sample set for extraction and cluster quality.
7. Experiment tests: attribution, dedupe, payment reconciliation, refunds, stop conditions.

## Required scenarios
- Re-ingesting the same record does not create an unbounded duplicate.
- Similar records remain independently attributable.
- Missing timestamps or fields are handled explicitly.
- Provider timeout/rate limit produces bounded retry and visible status.
- Disabled source cannot start a new collection.
- Malicious source text cannot change system policy or trigger tools.
- Model output failing schema validation is rejected or queued for review.
- Score changes are tied to a version and display coverage.
- Owner decision creates an audit event.
- Gate cannot be passed with missing mandatory approvals.
- Budget cap pauses the relevant job or experiment.
- Payment events are idempotent and reconciled before being marked verified.
- Retention/deletion operations follow documented rules.
- Logs do not expose credentials or unnecessary personal data.

## Acceptance for first vertical slice
- One approved source connector can execute a bounded run.
- At least one source record and evidence item are stored with provenance.
- Repeat run demonstrates idempotency.
- A reviewer can inspect source, extraction, uncertainty, and counter-evidence.
- One cluster and opportunity dossier can be produced and reviewed.
- Decision is persisted with rationale and actor.
- Tests, build, and deployment checks are reported honestly.

## Reporting discipline
Always distinguish:
- Documents written.
- Code implemented.
- Tests executed and results.
- Deployment completed and verified.
- Live source access verified.
- Real customer/payment outcomes observed.

Never claim a test, integration, deployment, or transaction without corresponding evidence.


## Product direction synchronization (2026-10-12)

HIO's target is an evidence-to-execution business workspace, not a generic chatbot. This target does not imply shipped parity. Use docs/50 for capability states and release truth, docs/51 for the Genspark/G2 benchmark, docs/52 for target architecture, docs/53 for production/commercial gates, and docs/54 for market validation. Keep fixtures distinct from live data. Production login remains blocked pending secure Owner configuration of distinct OPERATOR_SECRET and SESSION_SECRET values and verified authenticated production tests.

## Commercial SaaS direction update — 2026-10-16

Commercial acceptance update (2026-10-16): tests must include tenant-to-tenant access denial, per-workspace quotas, connector failures/rate limits, Daytona sandbox isolation and cleanup, artifact validation, cancellation, secret-leak scanning, and one end-to-end FIND → BUILD → VALIDATE journey. Passing unit tests alone is not commercial launch approval. See [docs/59-production-and-commercial-acceptance-matrix.md](59-production-and-commercial-acceptance-matrix.md).
