# Product Requirements & Acceptance Criteria

## Functional requirements
- FR-01: each source has owner, permission basis, allowed fields, review date, retention and enable/disable state.
- FR-02: each run records scope, policy version, timestamps, state, limits, counts, errors and cost where available.
- FR-03: each evidence item links to source record, run, timestamps and transformation history.
- FR-04: replay does not inflate counts or independent-source coverage.
- FR-05: operator can accept, reject, correct or flag evidence/clusters.
- FR-06: score factors, weights, missing data, counter-evidence and version are inspectable.
- FR-07: decisions record actor, timestamp, rationale, evidence snapshot and revisit conditions.
- FR-08: experiments require approval, limits, thresholds and attribution.
- FR-09: source/model calls have per-run and period caps.
- FR-10: authorized export/deletion follows policy.
- FR-11: partial failures are explicit; retries are bounded and idempotent.
- FR-12: authorization is server-side; secrets never reach client bundles/logs.
- FR-13: material AI claims link to evidence or are labeled hypotheses.
- FR-14: configured, tested, deployed, production-verified and outcome-verified are separate statuses.

## Non-functional requirements
Reliability without silent data loss; least privilege; minimum necessary data; modular typed contracts; structured observability; cost visibility; accessible primary flows; provider adapters where practical. Set numeric SLOs only after workload measurement.

## Critical acceptance scenarios
1. Replay creates no duplicate evidence count.
2. Rate limit creates a recoverable/partial state, not false success.
3. Policy block prevents collection and is audited.
4. Embedded prompt injection cannot authorize tools or change budgets.
5. Score can be reconstructed from factor values and version.
6. Reviewer can inspect evidence and record a decision.
7. Failed jobs do not erase persisted records.
8. Disabled connector cannot be restarted by model output.
9. External experiment requires approval and spend limits.
10. Workspace isolation is proven before multi-user launch.
11. Secrets and sensitive content do not appear in logs/client bundles.
12. Retention/deletion jobs report scope and outcome.

A feature is complete only with implementation, automated tests, documented limitations, security/privacy review, operational visibility and rollback behavior. Local tests do not prove production operation or business value.

## Product direction synchronization (2026-10-12)

HIO's target is an evidence-to-execution business workspace, not a generic chatbot. This target does not imply shipped parity. Use docs/50 for capability states and release truth, docs/51 for Genspark/G2 benchmark, docs/52 for target architecture, docs/53 for production/commercial gates, and docs/54 for market validation. Keep fixtures distinct from live data. Production login remains blocked pending secure Owner configuration of distinct OPERATOR_SECRET and SESSION_SECRET values and verified authenticated production tests.

## Commercial SaaS direction update — 2026-10-16

Product target update (2026-10-16): the intended public SaaS journey is FIND → BUILD → VALIDATE → LAUNCH. Requirements must distinguish target design from implemented features and include tenant isolation, provider/Daytona budgets, artifact tests, validation outcome persistence, privacy/retention, and commercial launch gates. See [docs/64-public-saas-product-direction.md](64-public-saas-product-direction.md).
