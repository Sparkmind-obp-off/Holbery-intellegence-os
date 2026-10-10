# 12 — Operations, Reliability, and Cost Controls

## Run lifecycle
Each collection or analysis run has a unique ID, initiating actor, start/end timestamps, status, source/inputs, checkpoint, counters, cost estimate, errors, and output references.

## Status vocabulary
- QUEUED
- RUNNING
- SUCCEEDED
- PARTIAL
- FAILED
- CANCELLED
- DISABLED (for source/connector status)

Never label a run successful when critical stages failed. Partial runs must show which records were skipped or failed.

## Budgets and limits
Configure per-source and global limits for:
- Requests per run and per day.
- Maximum records and payload size.
- Model input/output tokens or equivalent provider cost.
- Actor/API spend.
- Runtime/retries and total job duration.
- Storage and retention.
- Maximum active experiments and test spend.

If cost cannot be measured exactly, record the estimate method and uncertainty. Default to a dry-run or small bounded run for new connectors.

## Reliability
- Idempotency keys and unique constraints for repeated records.
- Bounded retries with exponential backoff and jitter where supported.
- Checkpoint after safe units of work.
- Respect provider rate limits and retry-after responses.
- Dead-letter or review queue for repeated failures.
- Connector-level health and kill switch.
- Alert on repeated errors, unexpected volume, cost spikes, or policy failures.

## Observability
Track:
- Run duration, items fetched/accepted/rejected/deduplicated.
- Source freshness and coverage.
- API/model cost per accepted evidence item and per dossier.
- Classification review/rejection rate.
- Cluster merge/split corrections.
- Time from first signal to decision.
- Experiment funnel, paid conversion, delivery outcomes, and refunds.

## Operational cadence
- Review source access/terms and costs on a defined schedule.
- Review failed runs and source freshness.
- Review evidence quality and cluster drift.
- Reconcile transaction events against payment records where applicable.
- Audit active experiments and stop rules.
- Retire unused sources and delete expired data.

## Kill switches
Provide global pause, source-specific disable, model-provider disable, experiment pause, and spending limit enforcement. Fail closed when authorization or access policy is uncertain.
