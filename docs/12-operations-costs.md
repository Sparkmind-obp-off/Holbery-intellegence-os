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


## Canonical productization baseline — 2026-10-12

HIO's intended direction is an AI Business Command Workspace: evidence → opportunity → approved execution → measurable outcomes. This is a target product direction, not proof that every capability is shipped or commercially ready. Keep fixture/demo evidence distinct from live data, and use [the canonical productization and production-parity contract](50-ai-workspace-productization-and-production-parity.md) for current capability labels, security boundaries, release verification, and SaaS launch gates. Current production login remains blocked until the Owner configures distinct `OPERATOR_SECRET` and `SESSION_SECRET` values securely and the deployed authenticated workflow is verified. Benchmark current Genspark AI Workspace and G2 product evidence before turning assumptions into requirements.

## Commercial SaaS direction update — 2026-10-16

Commercial operating update (2026-10-16): Apify, Tavily, xAI/Grok Console, Workers AI, Daytona, Workers, D1 and R2 usage must be measured and capped per workspace. Do not set public pricing until actual cost-to-serve and willingness to pay are tested. BYOK is optional later and does not eliminate platform/sandbox costs. See [docs/64-public-saas-product-direction.md](64-public-saas-product-direction.md).

## Commercial SaaS direction update — 2026-10-16

Commercial operating update (2026-10-16): Apify, Tavily, xAI/Grok Console, Workers AI, Daytona, Workers, D1 and R2 usage must be measured and capped per workspace. Do not set public pricing until actual cost-to-serve and willingness to pay are tested. BYOK is optional later and does not eliminate platform/sandbox costs. See [docs/64-public-saas-product-direction.md](64-public-saas-product-direction.md).
