# 10 — Technology Decisions (Provisional)

These are initial defaults. The repository audit may revise them when existing working infrastructure or constraints justify a better choice.

## Decision 1: Modular monolith
**Choice:** one application/repository with clear modules and adapter interfaces.  
**Reason:** lower operational cost, easier auditability, faster vertical slice. Split services only when a measured scaling, isolation, or team boundary requires it.

## Decision 2: Reuse HOLBERY's existing Cloudflare-first posture
**Choice:** prefer current Cloudflare Workers/Pages and existing conventions if the audit confirms they are suitable.  
**Reason:** the user already operates Cloudflare infrastructure. Do not create a new platform stack simply for novelty.

## Decision 3: One primary relational database
**Choice:** reuse the existing database only after confirming ownership, environment, schema, backup, access, and separation requirements. If this repository needs its own data boundary, use a dedicated database appropriate to the runtime.  
**Reason:** prevent accidental cross-project data coupling and operational sprawl. Do not add Neon or another database without a concrete reason.

## Decision 4: Background work
**Choice:** start with scheduled Workers and bounded jobs; introduce Queues for retryable/asynchronous work if supported and useful. Use Durable Objects only for justified coordination/state needs.

## Decision 5: Object storage
**Choice:** optional R2 for artifacts only when necessary and permitted. Keep small metadata in the relational store. Avoid storing full copies of source content when a URL, hash, and short excerpt suffice.

## Decision 6: Model providers
**Choice:** provider-agnostic interface. Route tasks by cost and quality; cache deterministic/repeatable work where safe; keep prompts and schema versions. Model output is untrusted until validated and, for consequential claims, reviewed.

## Decision 7: Source connectors
**Choice:** official APIs first, approved/licensed providers and Apify actors as optional adapters where their terms and source permissions allow the intended use. No assumption that a platform API or free tier exists.

## Decision 8: CI and deployment
**Choice:** GitHub source of truth, automated lint/type/test/build checks, environment separation, secret storage outside git, deployment verification, and rollback procedure.

## Revisit triggers
Reconsider a choice only when there is evidence: quota pressure, cost, reliability, security, operational burden, query latency, team needs, or a provider policy change. Document the trigger and migration plan.


## Canonical productization baseline — 2026-10-12

HIO's intended direction is an AI Business Command Workspace: evidence → opportunity → approved execution → measurable outcomes. This is a target product direction, not proof that every capability is shipped or commercially ready. Keep fixture/demo evidence distinct from live data, and use [the canonical productization and production-parity contract](50-ai-workspace-productization-and-production-parity.md) for current capability labels, security boundaries, release verification, and SaaS launch gates. Current production login remains blocked until the Owner configures distinct `OPERATOR_SECRET` and `SESSION_SECRET` values securely and the deployed authenticated workflow is verified. Benchmark current Genspark AI Workspace and G2 product evidence before turning assumptions into requirements.
