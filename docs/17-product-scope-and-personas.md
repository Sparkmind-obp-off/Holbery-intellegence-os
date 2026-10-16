# Product Scope, Users & Jobs to Be Done

## Primary user now
**Internal opportunity operator:** a HOLBERY operator exploring business problems and deciding which product, system, kit or venture merits investment.

## Potential future users
Founder/operator; product strategist; research analyst; small product team; and possibly a venture studio. These are hypotheses, not validated target segments.

## Jobs to be done
- Find repeated, recent problems without counting copied posts as independent evidence.
- Compare opportunities with reasons, uncertainties and evidence that could reverse the ranking.
- Prepare a bounded test with payer, offer, channel, budget cap, success threshold and stop rule.
- Revisit past decisions with a preserved evidence snapshot and visible changes.
- Stop a disallowed or unavailable source cleanly without corrupting prior records.

## In scope
Approved digital discovery, evidence capture, deduplication, clustering, opportunity dossiers, transparent scoring, human decisions, bounded experiments, learning history, cost governance and source governance.

## Out of scope initially
Autonomous public posting, mass outreach, buying traffic, broad unbounded crawling, private-community scraping, access-control circumvention, a generic social-listening dashboard, and claims that online discussion alone proves willingness to pay.

## Productization hypothesis
If multiple independent operators repeatedly need the same evidence-to-decision workflow, a reusable product may emerge. Keep data export and workspace ownership in mind, but defer expensive multi-tenancy until validation.

## Questions to validate
Which decisions are slow or guesswork-driven? What does the dossier enable? Which sources are essential? What makes a user trust or reject a finding? Is value frequent enough for recurring payment? Can the user legally act on the insight? Answer with observed usage and outcomes, not assumptions.

## Product direction synchronization (2026-10-12)

HIO's target is an evidence-to-execution business workspace, not a generic chatbot. This target does not imply shipped parity. Use docs/50 for capability states and release truth, docs/51 for the Genspark/G2 benchmark, docs/52 for target architecture, docs/53 for production/commercial gates, and docs/54 for market validation. Keep fixtures distinct from live data. Production login remains blocked pending secure Owner configuration of distinct OPERATOR_SECRET and SESSION_SECRET values and verified authenticated production tests.

## Commercial SaaS direction update — 2026-10-16

Scope update (2026-10-16): include external customers/creators/sellers/operators as target users, with workspace-level data ownership. The product journey is FIND → BUILD → VALIDATE → LAUNCH. Do not imply self-service signup, paid plans, all connectors, or full agent execution exist until verified. See [docs/64-public-saas-product-direction.md](64-public-saas-product-direction.md).
