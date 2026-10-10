# 14 — Decision Log

This log records current design decisions. Amendments should include date, rationale, evidence, and impact.

## D-001 — Separate repository
**Status:** Accepted  
**Decision:** HOLBERY Intelligence OS lives in `Sparkmind-obp-off/Holbery-intellegence-os`, separate from the parent-brand repository and product repositories.  
**Rationale:** Clear ownership and lifecycle for internal intelligence infrastructure.

## D-002 — Internal-first
**Status:** Accepted  
**Decision:** Keep research, evidence, ranking, and approval workflows private by default. Activate external channels only for approved bounded experiments.  
**Rationale:** Avoid premature exposure and scattered initiatives.

## D-003 — Evidence ladder
**Status:** Accepted  
**Decision:** Use D0–D6 to distinguish hypothesis through repeatable outcomes.  
**Rationale:** Prevent observed interest from being presented as paid demand.

## D-004 — Human approval gates
**Status:** Accepted  
**Decision:** Require owner approval for spending, public actions, source-policy uncertainty, and offer launch.  
**Rationale:** Preserve control over consequential actions.

## D-005 — Modular monolith
**Status:** Provisional default  
**Decision:** Start with one repository and modular boundaries.  
**Rationale:** Lower cost and complexity until a measured reason to split appears.

## D-006 — Existing infrastructure first
**Status:** Provisional default  
**Decision:** Audit and reuse suitable HOLBERY/Cloudflare conventions, while preserving appropriate data boundaries.  
**Rationale:** Avoid replatforming and accidental cross-project coupling.

## D-007 — Source policy
**Status:** Accepted  
**Decision:** Official APIs and authorized methods first; no access circumvention, private-group scraping, or mass unsolicited outreach.  
**Rationale:** Reliability, privacy, compliance, and long-term access.

## D-008 — Scoring is advisory
**Status:** Accepted  
**Decision:** Show score, confidence, coverage, and risk separately; no score automatically launches a product.  
**Rationale:** Prevent false precision.

## D-009 — No implementation claim from documentation
**Status:** Accepted  
**Decision:** Mark the project as design-only until code, tests, and deployment are actually verified.  
**Rationale:** Maintain trustworthy status reporting.

## Open decisions
- Which two or three initial source types have accessible, permitted, cost-effective access?
- Which existing Cloudflare/database resources are appropriate for this repo?
- Which authentication method and operator roles are already available?
- What data retention periods apply to each source/provider?
- Which evaluation dataset and quality thresholds should be used for extraction/clustering?
- Which experiment/commerce events can be reused without duplicating payment truth?
