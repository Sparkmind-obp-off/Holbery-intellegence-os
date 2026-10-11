# HOLBERY Portfolio Consolidation & Acquisition Operating Model

**Status:** Proposed operating policy for internal portfolio consolidation  
**Owner:** HOLBERY  
**Canonical operating system:** HOLBERY Intelligence OS (HIO)  
**Purpose:** Reduce brand sprawl, prioritize monetization, and prevent new products from being launched without evidence.

## Executive decision

HOLBERY is the single parent identity. HIO is the internal portfolio intelligence and decision system used to evaluate, consolidate, operate, and monetize portfolio assets.

For this policy, **“acquisition” means internal portfolio absorption/consolidation by default**: bringing an existing project, product, asset, audience, workflow, or validated offer under HOLBERY's portfolio governance. It does **not** imply buying an unrelated company, transferring legal ownership, merging repositories, copying production data, or changing project infrastructure unless a separate approval and due-diligence process explicitly authorizes that action.

The objective is not to create another brand. The objective is to reduce the number of brands and turn the strongest existing assets into a small, coherent set of monetizable offers.

## 1. Brand and portfolio architecture

- **HOLBERY** — the only parent brand and umbrella identity.
- **HOLBERY Intelligence OS (HIO)** — the internal intelligence, portfolio registry, validation, prioritization, and decision layer. HIO is not automatically a customer-facing brand or marketplace.
- **Portfolio assets** — existing products, systems, prototypes, content, domains, code, research, customer evidence, and distribution assets. Keep each asset's original technical location until a migration is explicitly approved.
- **Commercial offers** — only evidence-backed offers that pass validation and can be presented under HOLBERY by default. Use a sub-product name only when it materially improves customer understanding or conversion; do not create a new standalone brand merely to package an idea.
- **Retired / archived assets** — preserve useful IP and learning in the registry; stop spending attention on assets that fail validation.

No new standalone brand should be created without a documented reason, evidence, and owner approval.

## 2. What “acquire into HOLBERY” means operationally

For each existing portfolio asset, HIO should create a registry record and decide one of four outcomes:

1. **Absorb** — incorporate the asset into the HOLBERY portfolio and operate it under the parent brand.
2. **Integrate** — retain the asset's independent technical runtime temporarily, while HIO tracks its status, evidence, risks, and monetization plan.
3. **Harvest** — extract reusable IP, customer insight, code patterns, content, or distribution assets; then archive the original project when safe and authorized.
4. **Hold / reject** — do not invest further until demand, ownership, cost, security, or feasibility questions are resolved.

Do not equate a registry entry with a technical migration or legal acquisition.

## 3. Candidate intake and due diligence

HIO should maintain a single portfolio register with at least these fields:

- Asset name and current project/repository
- Current brand and proposed HOLBERY presentation
- Asset type: product, SaaS, digital product, internal tool, content, domain, integration, or research
- Owner and proof of ownership/control
- Current operational state and latest verified commit/deployment
- Customer/problem segment and payer hypothesis
- Evidence URLs, dates, source types, and counter-evidence
- Product maturity: idea, prototype, tested, paid pilot, revenue-generating, or archived
- Estimated time-to-first-revenue and required work
- Monetization route and proposed price hypothesis
- Dependencies, secrets, API providers, recurring costs, and licensing obligations
- Security/privacy risks and data migration requirements
- Brand overlap and opportunity to reuse existing HOLBERY components
- Decision, rationale, owner, review date, and next measurable gate

Never claim customer demand, revenue, traction, provider connectivity, or production readiness based only on a plan, synthetic fixture, mockup, or local test.

## 4. Acquisition score: prioritize near-term monetization

Score each candidate from 0–5 against the following dimensions. Scores must be supported by evidence and may be marked **unknown** rather than guessed.

| Dimension | Weight | What counts as evidence |
|---|---:|---|
| Proven pain and payer intent | 25% | Repeated public problem reports, explicit willingness to pay, interviews, or paid tests |
| Time to first ethical sale | 20% | A deliverable that can be sold and fulfilled soon without major platform work |
| Existing asset leverage | 15% | Reusable code, template, data model, content, domain, or working workflow |
| Differentiation / defensibility | 15% | A specific workflow advantage, proprietary know-how, validated niche, or measurable result |
| Distribution access | 10% | Existing qualified audience, permitted channel, partner, or discoverable purchase intent |
| Low operating cost | 10% | Free-tier-compatible delivery and limited support burden |
| Brand coherence | 5% | Clear fit under HOLBERY without needing another standalone identity |

A weighted score is a triage aid, not proof of viability. Evidence quality and uncertainty must be shown separately. An asset with high uncertainty must not outrank an asset with verified payer intent simply because the model produces an optimistic score.

### Decision gates

- **Gate 0 — Ownership and safety:** rights, access, privacy, licensing, and dependencies are understood.
- **Gate 1 — Problem evidence:** real sources support a specific problem and target buyer.
- **Gate 2 — Offer test:** one concrete offer and price hypothesis are tested with a permitted channel.
- **Gate 3 — Payment or strong commitment:** paid pilot, preorder, deposit, or another meaningful commitment is observed where appropriate.
- **Gate 4 — Repeatability:** fulfillment, unit economics, support, and acquisition route are workable.
- **Gate 5 — Consolidate/scale:** only now invest in deeper automation, brand expansion, or platform integrations.

Do not build a large SaaS platform to avoid validating a smaller offer. Monetization experiments should be as small and reversible as possible.

## 5. Fast monetization policy

Prioritize the shortest path from an existing asset to a credible paid outcome:

1. Identify the strongest existing problem/offer pair.
2. Reuse current assets before creating anything new.
3. Define one buyer, one pain, one deliverable, one price hypothesis, and one permitted distribution route.
4. Test with low cost and explicit success/failure criteria.
5. Record actual responses, purchases, refunds, fulfillment time, and objections.
6. Stop, revise, or scale based on evidence.
7. Only productize repeatable manual work when it reduces cost or improves outcomes.

Do not use spam, unsolicited mass messaging, fake testimonials, fabricated scarcity, unlicensed data, or unapproved paid APIs/actors to accelerate monetization.

## 6. Brand simplification rules

- Parent brand defaults to HOLBERY.
- HIO is the internal control and intelligence system.
- Prefer product descriptors over new brands (for example, “HOLBERY — [specific offer]”).
- Keep a separate name only if there is evidence that it serves a distinct buyer, channel, product promise, or legal requirement.
- Record existing brand names as aliases or legacy assets where useful; do not automatically delete domains, repositories, or customer-facing pages.
- Do not register additional domains or purchase brand assets without separate approval.
- Keep internal tools private unless a deliberate customer-facing product decision is approved.

## 7. Technical and data boundaries

The HIO portfolio register is the initial source of truth for decisions, not a mandate to merge every codebase into one application.

- Do not copy production data, secrets, customer records, or credentials between projects.
- Do not move or rotate secrets as part of portfolio registration.
- Do not merge repositories, databases, authentication systems, or deployment resources without a separate migration plan, tested rollback, and explicit approval.
- Keep project-specific production resources isolated until migration is necessary and approved.
- Verify actual repo, branch, commit, deployment, database, and integrations before recording a status.
- Preserve existing working systems while portfolio decisions are being evaluated.
- Use adapters and documented interfaces before considering a monolithic rewrite.

### Explicit protected-resource rule

This portfolio policy does not, by itself, authorize changes to HOLBERY Commerce, Bozq Cukur / Bozq One System, Vestren, ORDVELA, or any other project's production resources. They may be inventoried as candidates where authorized, but code/data/resource migration requires a scoped implementation decision and its own safeguards. Bozq remains private and separate.

## 8. HIO workflow to implement

HIO should eventually support this workflow:

1. **Portfolio Inbox:** register an existing asset with source links and owner.
2. **Due Diligence:** gather ownership, technical, cost, licensing, security, and market evidence.
3. **Evidence Ledger:** separate observed facts, hypotheses, model interpretations, and unknowns.
4. **Portfolio Assessment:** show weighted criteria, evidence quality, confidence, and counter-evidence.
5. **Decision Record:** absorb, integrate, harvest, hold, or reject, with rationale and review date.
6. **Offer Lab:** define target buyer, painful job, deliverable, price hypothesis, and test.
7. **Validation Tracker:** record actual buyer signals, commitments, fulfillment, and outcomes.
8. **Monetization Board:** prioritize by evidence-backed time-to-revenue, not vanity metrics.
9. **Asset Lifecycle:** consolidate, maintain, archive, or retire with reversible steps.
10. **Audit Trail:** record who made each decision, which evidence was used, and what changed.

Until real connectors and AI inference are implemented and verified, HIO must label any generated plans as hypotheses and must not pretend to have live market evidence.

## 9. Immediate execution order

1. Establish the portfolio registry and this policy in HIO documentation.
2. Inventory existing assets using repository and deployment metadata where access is authorized.
3. Mark each asset's status as verified, owner-reported, stale, or unknown.
4. Identify duplicate brands, overlapping offers, duplicated capabilities, and recurring costs.
5. Select no more than one or two near-term monetization candidates for validation at a time.
6. Write a concise offer and validation plan for the top candidate.
7. Run the smallest credible test and record the result.
8. Only after evidence, decide whether to absorb, integrate, harvest, hold, or retire the asset.
9. Do not claim the portfolio has been technically acquired until required migrations and verification are complete.

## 10. Required portfolio review output

Each review should provide:

- Portfolio inventory with repository/project references
- Brand consolidation recommendation
- Evidence and counter-evidence for each priority candidate
- Known unknowns and confidence
- Estimated effort and cost bands, with assumptions stated
- Time-to-first-revenue hypothesis
- Recommended single next experiment
- Explicit stop conditions
- Decision and owner approval record
- Technical migration requirements, if any

## Final operating principle

**One parent brand. One internal intelligence and decision system. A small number of evidence-backed offers. No new brands by default.**

Use HIO to reduce complexity and find the shortest honest route to revenue—not to accumulate projects, dashboards, or unvalidated product ideas.


## Product direction synchronization (2026-10-12)

HIO's target is an evidence-to-execution business workspace, not a generic chatbot. This target does not imply shipped parity. Use docs/50 for capability states and release truth, docs/51 for Genspark/G2 benchmark, docs/52 for target architecture, docs/53 for production/commercial gates, and docs/54 for market validation. Keep fixtures distinct from live data. Production login remains blocked pending secure Owner configuration of distinct OPERATOR_SECRET and SESSION_SECRET values and verified authenticated production tests.
