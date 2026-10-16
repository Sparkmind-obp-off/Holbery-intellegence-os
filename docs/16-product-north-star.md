# Product North Star & Success Metrics

**Status:** Proposed product contract, not a claim of implementation.

## Product thesis
HOLBERY Intelligence OS turns permitted digital signals into traceable, decision-ready opportunity dossiers. It helps an operator decide what problem to solve, for whom, with what offer, and what evidence would justify the next investment. It is a decision-quality system, not a volume-of-data system.

## North Star
**Verified Opportunity Decisions (VOD):** opportunity dossiers that pass the evidence gate, include counter-evidence and an explicit decision, and later produce a measurable, attributable learning outcome. A defensible decision not to pursue can count when its evidence and rationale are complete.

## Supporting metrics
- Evidence coverage: claims linked to source records and timestamps.
- Provenance completeness: evidence with source, method, observed-at time, identifier/URL and permitted-use classification.
- Independent corroboration: genuinely independent source families; copied/syndicated posts do not count separately.
- Commercial-intent rate: clusters containing purchase, budget, switching, workaround or vendor-seeking signals.
- Decision latency: time from first admissible evidence to approved decision.
- Experiment learning rate: approved tests producing an interpretable predeclared result.
- False-positive rate: promoted opportunities later rejected due to duplicates, stale evidence, misinterpretation or low commercial relevance.
- Cost per decision-ready dossier: attributable collection, storage, model and operator cost per dossier passing the gate.
- Reliability: successful collection runs divided by eligible runs, by connector and time window.
- Safety: unauthorized actions, policy violations, secret incidents and unapproved spend; target zero.

## Guardrails
Do not optimize for raw posts, tokens, model calls, dashboard visits or AI-generated idea counts without measuring usefulness. Keep confidence, evidence coverage, commercial intent, readiness and risk separate.

## Stage goals
- **Internal alpha:** one reproducible vertical slice; traceable claims; working stop control; visible costs.
- **Internal beta:** repeatable runs, deduplication, review queues, versioned clustering/scoring and decision history.
- **Product validation:** a real external user completes a workflow and receives measurable value; willingness to pay is tested separately.
- **Commercial product:** tenant isolation, onboarding, export/deletion, billing, support, legal review and operating economics are ready.

Every metric needs a definition, source, owner, measurement window and known failure modes.

## Product direction synchronization (2026-10-12)

HIO's target is an evidence-to-execution business workspace, not a generic chatbot. This target does not imply shipped parity. Use docs/50 for capability states and release truth, docs/51 for the Genspark/G2 benchmark, docs/52 for target architecture, docs/53 for production/commercial gates, and docs/54 for market validation. Keep fixtures distinct from live data. Production login remains blocked pending secure Owner configuration of distinct OPERATOR_SECRET and SESSION_SECRET values and verified authenticated production tests.

## Commercial SaaS direction update — 2026-10-16

North-star update (2026-10-16): help customers find evidence-backed demand, build the smallest useful artifact, validate real-world interest, and prepare validated products to launch. HIO is intended to be a commercial customer-facing SaaS; current live scope remains defined by readiness evidence. See [docs/64-public-saas-product-direction.md](64-public-saas-product-direction.md).
