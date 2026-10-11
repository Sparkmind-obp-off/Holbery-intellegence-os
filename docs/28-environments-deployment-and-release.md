# Environments, Deployment & Release Gates

## Environments
- Local: fixtures and tests, no production credentials by default.
- Preview: isolated review deployment with synthetic/sanitized data and test-only integrations.
- Production: approved live resources, platform-managed secrets, strict quotas and audit.
- Research collection: controlled execution with source permissions and hard limits; deploying the UI does not enable collection automatically.

Do not assume these environments exist. Audit current code and resources before modifying them.

## Cloudflare-first preference
Cloudflare is the provisional direction because it fits HOLBERY's ecosystem. Confirm exact Pages/Workers/D1/R2/Queues configuration against existing code, current limits and workload needs. Do not create a second database or move production data without an approved migration plan.

## Release sequence
Audit repo/dependencies/workflows/resources; record gaps; add tests and security checks; create isolated preview; run synthetic end-to-end tests; review source policy, secrets, spend and rollback; get explicit approval before production deploy or live collection; verify production behavior safely; record commit, deployment ID, checks, limitations and rollback instructions.

## Deployment truth labels
Configured; built; tested (name environment/suite); deployed; production verified; live source verified; payment verified. These statuses are not interchangeable.

## Rollback and control
Keep independent kill switches for connectors, scheduled jobs, experiments and external actions. Document release rollback and migrations that cannot be safely reversed.

## Change control
Production changes record reason, owner, commit, tests, expected impact, migration, rollback and approval. Agents may prepare changes but must not silently spend money, activate collection, publish externally or alter live data.

## Acceptance
A release is reproducible from its commit and environment configuration; critical checks are recorded; preview secrets are isolated; rollback has been rehearsed.

## Product direction synchronization (2026-10-12)

HIO's target is an evidence-to-execution business workspace, not a generic chatbot. This target does not imply shipped parity. Use docs/50 for capability states and release truth, docs/51 for Genspark/G2 benchmark, docs/52 for target architecture, docs/53 for production/commercial gates, and docs/54 for market validation. Keep fixtures distinct from live data. Production login remains blocked pending secure Owner configuration of distinct OPERATOR_SECRET and SESSION_SECRET values and verified authenticated production tests.
