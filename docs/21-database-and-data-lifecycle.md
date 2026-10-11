# Database & Data Lifecycle

## Principles
The database is the durable record of observations, inferences, decisions and outcomes. Keep raw source records, normalized records, evidence claims, model outputs, operator decisions and measured outcomes distinct.

Use existing infrastructure only after I0 verifies ownership, schema, environment, backups, migrations and production impact. Avoid competing databases or dual writes without a documented reason.

## Logical entities
Workspaces, users, roles and memberships; source registry and policy versions; collection runs and run events; source records and versions; fingerprints; evidence items and reviews; problem clusters and memberships; opportunities and dossier snapshots; score runs and factor results; decisions and evidence links; experiments and events; integration metadata; usage ledger; audit events; retention jobs. Do not create every entity in the first migration.

## Key data rules
- Stable IDs; URLs are not primary keys.
- Store source identifier/URL, source family, collection method, observed-at time, source-published time where available, content hash, policy classification and run ID.
- Preserve evidence-to-record and claim-to-evidence links.
- Version clusters, scoring rules, prompts for material analysis and dossier snapshots.
- Preserve original source content only when necessary and permitted; define deletion behavior before storing sensitive data.
- Store timestamps in UTC while retaining original timezone where useful.
- Use append-only audit records for consequential actions.

## Lifecycle
Collect permitted fields → normalize and deduplicate → classify use/sensitivity → retain minimum necessary data → apply source-specific retention/deletion → propagate restrictions to derived indexes and exports → retain only lawful and necessary audit metadata.

## Migrations and recovery
Every migration is versioned, reviewed and tested with a rollback or forward-fix plan. Back up before destructive changes. Production migrations need explicit approval. Define backup frequency, RPO/RTO and ownership after the actual provider is confirmed; a backup is not verified until a restore test succeeds.

## Multi-tenancy readiness
Model workspace ownership early, but defer external multi-tenancy until validation. Before external users, test cross-workspace isolation, scoped queries, export separation and tenant-specific retention.

## Acceptance
Prove provenance survives normalization, duplicate ingestion is safe, migrations are repeatable, deletion jobs report outcomes and records cannot cross workspace boundaries.

## Product direction synchronization (2026-10-12)

HIO's target is an evidence-to-execution business workspace, not a generic chatbot. This target does not imply shipped parity. Use docs/50 for capability states and release truth, docs/51 for Genspark/G2 benchmark, docs/52 for target architecture, docs/53 for production/commercial gates, and docs/54 for market validation. Keep fixtures distinct from live data. Production login remains blocked pending secure Owner configuration of distinct OPERATOR_SECRET and SESSION_SECRET values and verified authenticated production tests.
