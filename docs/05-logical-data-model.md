# 05 — Logical Data Model

This is a logical contract, not a production migration. Names and fields may be refined after auditing the actual runtime and database.

## Core entities
### source_registry
- id, name, source_type, base_url, access_method, terms_url
- allowed_use, access_status, rate_limit_policy, retention_policy
- enabled, owner, last_reviewed_at, review_due_at

### collection_runs
- id, source_id, trigger_type, started_at, finished_at, status
- cursor_before, cursor_after, attempted_count, accepted_count
- duplicate_count, rejected_count, error_count, estimated_cost, error_summary

### source_records
- id, source_id, external_id, canonical_url, published_at, observed_at
- content_hash, normalized_text_ref, metadata_json, language
- duplicate_of, collection_run_id, retention_state

### evidence_items
- id, source_record_id, claim_type, excerpt_or_summary
- observed_fact_json, inference_json, quality_dimensions_json
- evidence_level, reviewer_status, created_at, schema_version

### problem_clusters
- id, title, problem_statement, segment_hypothesis, language
- evidence_count, independent_source_count, first_seen_at, last_seen_at
- status, merge_parent_id, created_at, updated_at

### cluster_memberships
- cluster_id, evidence_id, relationship_type, relevance_score, reviewed_at

### alternatives
- id, cluster_id, name, type, pricing_evidence, source_evidence_ids
- strengths, weaknesses, observed_gaps, last_checked_at

### opportunities
- id, cluster_id, buyer_hypothesis, user_hypothesis, payer_hypothesis
- score_version, score_json, confidence, coverage, counter_evidence_json
- status, owner_decision, decision_reason, next_review_at

### offers
- id, opportunity_id, name, target_outcome, scope, price_hypothesis
- delivery_model, delivery_cost_estimate, gross_margin_estimate
- legal_review_status, fulfillment_plan, status

### experiments
- id, opportunity_id, offer_id, hypothesis, channel, audience_definition
- start_at, end_at, budget_limit, sample_target
- success_thresholds_json, stop_rules_json, approval_status, status

### experiment_events
- id, experiment_id, event_type, occurred_at, anonymous_subject_key
- attribution_data_json, value_amount, currency, source, dedupe_key

### decisions
- id, entity_type, entity_id, decision, rationale
- evidence_snapshot_json, approver, approved_at, review_due_at

### audit_events
- id, actor_type, actor_id, action, entity_type, entity_id
- occurred_at, request_id, outcome, metadata_redacted_json

## Relationships
- One source has many collection runs and source records.
- A source record may yield multiple evidence items.
- Evidence items may belong to multiple clusters, with an explicit relationship.
- An opportunity links to one primary problem cluster but can reference related clusters.
- Offers and experiments reference an opportunity.
- Decisions and audit events preserve the history of consequential changes.

## Data rules
- Use stable internal IDs and unique constraints for provider/source external IDs where available.
- Hash normalized content for duplicate detection, but preserve original source identity and do not delete independent provenance.
- Keep money as integer minor units plus ISO currency code.
- Use UTC timestamps internally and retain source timezone when relevant.
- Use JSON fields for evolving extraction details, but keep key filters and joins in typed columns.
- Never store secrets in these tables.
- Add indexes only for demonstrated query patterns.
- Define deletion propagation and retention rules before storing full content.

## Initial implementation constraint
Reuse the repository's existing database and migration conventions after an audit. Do not blindly create these tables if equivalent tables already exist.
