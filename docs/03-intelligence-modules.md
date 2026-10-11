# 03 — Intelligence Modules

Each module is a capability boundary, not a requirement for a separate service.

## Implementation clarification — 0.2, 2026-10-11

See [Discovery–Demand–Opportunity operating model](47-discovery-demand-opportunity-operating-model.md) for the researched, staged implementation. `/intelligence` now persists brief/query/unknowns/counter-evidence/decision-gate plans. These are deterministic D0 hypotheses, not live collection, AI inference or market ranking. The fixture pipeline remains synthetic. All capability bullets below describe target responsibilities, not a claim that those modules are fully operational.

## A. Discovery Intelligence
**Question:** Where should we look next, and what sources are worth the cost?
- Source discovery and registry maintenance.
- Query/topic planning.
- Source coverage and freshness.
- Source quality and access constraints.
- Research-gap detection.
- Output: source recommendations and collection plans.

## B. Demand Intelligence
**Question:** What recurring problems, jobs, friction, and unmet needs are people expressing?
- Problem statement extraction.
- Pain, urgency, frequency, workaround, and affected role classification.
- Language and locale normalization.
- Duplicate/repost detection.
- Segment and context identification.
- Output: evidence-linked demand clusters, not unsupported market-size claims.

## C. Opportunity Intelligence
**Question:** Which problems are commercially promising and feasible for HOLBERY?
- Buyer, user, payer, and decision-maker hypotheses.
- Existing alternatives and substitutes.
- Current spending and switching behavior.
- Reachability and channel constraints.
- Delivery feasibility, cost, margin, defensibility, and fit with HOLBERY.
- Output: ranked opportunity dossiers with uncertainty and counter-evidence.

## D. Evidence & Validation
**Question:** What do we actually know?
- Evidence ladder and provenance.
- Independent-source analysis.
- Claim-to-source links.
- Conflicting evidence and confidence.
- Validation requirements and readiness gate.
- Output: auditable dossier and explicit unknowns.

## E. Offer Intelligence
**Question:** What smallest paid offer could solve the problem?
- Outcome and scope definition.
- Buyer and payer.
- Offer format: kit, software/system, venture, or commerce.
- Pricing hypotheses and alternative offers.
- Delivery and support obligations.
- Unit-economics model.
- Output: testable offer hypothesis; not an automatically approved product.

## F. Distribution Intelligence
**Question:** Where can we ethically reach the relevant audience?
- Channel fit, rules, audience presence, and cost.
- Search demand and content intent.
- Community contribution guidelines.
- Owned landing pages, opt-in capture, partner/referral paths.
- Output: approved channel plan with policy notes. Does not mass-post or send unsolicited messages.

## G. Learning Intelligence
**Question:** What did the test change in our beliefs?
- Experiment results against pre-registered thresholds.
- Funnel, payment, refund, delivery, retention, and cost analysis.
- Score calibration and historical comparisons.
- Preserve null/negative results.
- Output: continue, iterate, pivot, or stop recommendation.

## H. Governance, Cost & Audit
Cross-cutting capabilities:
- Permission and source-policy checks.
- Human approvals and decision log.
- Spend/token/API quotas.
- Retention and deletion.
- Change history and incident traceability.

## Common output contract
Every module output should contain:
- Entity/record ID and schema version.
- Input evidence IDs.
- Generated output and its classification (fact, extraction, inference, hypothesis, recommendation).
- Confidence/limitations where meaningful.
- Model/provider/version and run ID where applicable.
- Created timestamp and review state.
- Recommended next action, if any.


## Canonical productization baseline — 2026-10-12

HIO's intended direction is an AI Business Command Workspace: evidence → opportunity → approved execution → measurable outcomes. This is a target product direction, not proof that every capability is shipped or commercially ready. Keep fixture/demo evidence distinct from live data, and use [the canonical productization and production-parity contract](50-ai-workspace-productization-and-production-parity.md) for current capability labels, security boundaries, release verification, and SaaS launch gates. Current production login remains blocked until the Owner configures distinct `OPERATOR_SECRET` and `SESSION_SECRET` values securely and the deployed authenticated workflow is verified. Benchmark current Genspark AI Workspace and G2 product evidence before turning assumptions into requirements.
