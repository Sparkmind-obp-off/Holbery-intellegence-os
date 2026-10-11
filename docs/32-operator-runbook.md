# Operator Runbook

## Before a collection run
Confirm source approval and review date; permitted purpose/fields; budget, record/page cap, timeout and retention; connector health and secret configuration; no active incident/kill switch; operator and run intent.

## During a run
Monitor run ID/state, received/accepted/rejected records, duplicates, rate limits, errors, latency and cost. High volume is not a quality signal. Pause/cancel if cost exceeds bounds, policy becomes uncertain, sensitive data appears unexpectedly or provider errors become unstable.

## After a run
Verify terminal state and persisted counts; inspect partial failures; check duplicates and timestamps; review provenance; compare usage/cost; sample source fidelity; document incidents. Do not promote clusters before evidence and counter-evidence review.

## Incident playbooks
- Rate limit: respect Retry-After, reduce concurrency and preserve checkpoints.
- Provider outage: record affected scope; missing results do not prove absence of demand.
- Unexpected sensitive data: stop/quarantine, restrict access and review deletion obligations.
- Credential exposure: revoke/rotate, inspect access logs, remediate repository history and record incident.
- Bad model output: preserve source records, invalidate derived result, record versions, add sanitized evaluation fixture.
- False opportunity: trace evidence, find duplicates/staleness/promotional manipulation, version the correction.

## Stop conditions
Unclear permission; budget cap reached; secret exposure; unexpected personal data; unverifiable source; action exceeds authorization.

## Reporting format
Run ID, source, scope, timestamps, status, counts, duplicates, evidence coverage, errors, cost, limitations and next action. Say “not measured” when no reliable measurement exists.

## Product direction synchronization (2026-10-12)

HIO's target is an evidence-to-execution business workspace, not a generic chatbot. This target does not imply shipped parity. Use docs/50 for capability states and release truth, docs/51 for Genspark/G2 benchmark, docs/52 for target architecture, docs/53 for production/commercial gates, and docs/54 for market validation. Keep fixtures distinct from live data. Production login remains blocked pending secure Owner configuration of distinct OPERATOR_SECRET and SESSION_SECRET values and verified authenticated production tests.
