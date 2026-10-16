# HIO Value Model, Pricing & Investment Gates

**Status:** Commercial hypotheses; not a validated price list  
**Date:** 2026-10-12

## 1. Product thesis

HIO should not compete as another generic chat interface or a list of AI tools. Its proposed differentiation is **evidence-backed business decisions connected to controlled execution and measured outcomes**. A workspace should make it easier for a small operator or portfolio owner to answer: what should I do next, why, what will it cost, what needs my approval, and did it work?

The defensible product is the connected workflow and its audit trail—not a claim that AI can run a business autonomously.

## 2. Candidate customer and first wedge

**Primary hypothesis:** solo founders and small digital-business operators who manage several ideas, tools, vendors and product experiments but lack a disciplined system for turning research into validated decisions.

This is a hypothesis, not proven demand. A wide “all businesses” audience would make validation and onboarding difficult. Initial discovery should compare at least two segments:
- solo founders / micro-SaaS builders with several product bets;
- small online sellers or service operators who repeatedly research customer problems and create offers.

Choose one initial segment only after interviews, observed workflows, and a paid pilot indicate a clear, frequent and costly problem. Do not build separate vertical features before the winning workflow is known.

## 3. Value proposition (testable)

For a small business operator who loses time and money switching between research, notes, spreadsheets and disconnected automation, HIO aims to provide one traceable path from market signal to approved experiment and outcome—reducing decision latency and untracked work while making costs and risks visible.

Test these claims separately:
- **Time value:** time to turn a question into a defensible decision.
- **Decision quality:** share of recommendations supported by traceable evidence and counter-evidence.
- **Execution reliability:** completion rate, retries, duplicate prevention and failure recovery.
- **Financial value:** cost per validated learning, experiment or completed workflow.
- **Trust value:** owner can see permissions, approvals, data provenance and execution receipts.

Do not advertise numerical savings until measured against a documented baseline.

## 4. Business model options to test

| Model | What is sold | Strength | Risk / proof required |
|---|---|---|---|
| Subscription SaaS | Workspace and included usage | Predictable recurring revenue | Retention, support load, cost-to-serve |
| Tiered subscription + usage | Base plan plus metered research/execution | Aligns variable provider costs | Transparent meters, spend limits, billing disputes |
| Paid pilot / setup | Defined workflow setup and validation | Useful before full self-serve SaaS | May become labor-heavy services |
| Productized research | Evidence dossier and decision report | Can validate willingness to pay early | Must disclose methodology and freshness |
| Hybrid | Subscription plus optional setup | Can bridge early customer learning | Scope creep and unclear product boundaries |

**Recommended test sequence:** start with a tightly scoped paid pilot or concierge-assisted workflow, then introduce a subscription only when repeated usage and a common product workflow are evidenced. This is a validation strategy, not a commitment to one final model.

## 5. Price-setting method

Do not pick a price because competitors have one or because a feature list looks large. Test willingness to pay against the value of a defined outcome.

For each candidate plan, record:
- target buyer and use case;
- outcome promised and excluded outcomes;
- monthly included runs/credits and what counts as a run;
- variable cost per run (model, collection provider, storage, notifications);
- support/onboarding time;
- payment fees, refunds, taxes and currency assumptions;
- gross margin at low, expected and high usage;
- abuse limits and overage behavior;
- evidence supporting the price (interview, proposal, checkout attempt, paid conversion, renewal).

Use a cost floor and a value ceiling. Set initial limits from measured provider costs; never promise “unlimited AI” while underlying costs are variable.

## 6. Unit economics and metrics

Track cohort and segment data, not only aggregate totals:
- **Activation:** new workspaces completing one valuable end-to-end workflow.
- **Time-to-value:** time from signup to first accepted outcome.
- **Paid conversion:** paid customers / qualified trials or pilots.
- **Retention:** customer and workspace retention by cohort.
- **Churn:** customer loss and recurring revenue loss.
- **ARPA:** recurring revenue per account.
- **COGS:** inference, external API/collection, infrastructure directly attributable to service, payment fees and delivery support where applicable.
- **Gross margin:** (revenue − COGS) / revenue.
- **CAC:** fully loaded sales and marketing cost / new paying customers.
- **CAC payback:** time required for gross profit from a customer to recover CAC.
- **LTV:** use observed cohort retention and gross profit where possible; label early estimates as provisional.
- **Reliability:** success rate, provider error rate, p95 latency, retry/duplicate rate, incident count.
- **Trust:** approval bypasses, unauthorized attempts, data deletion completion, unresolved security issues.

Use common SaaS ratios as diagnostic reference points, not universal laws. Early samples are small and estimates unstable; do not present LTV/CAC as meaningful before enough retention history exists.

## 7. Investment gates

### Gate A — Problem evidence
Pass only if the target segment repeatedly describes the problem without being led, can show current workarounds, and can explain its cost or consequence.

### Gate B — Value evidence
Pass only if users complete the workflow and can identify a useful result. AI-generated output alone is not value evidence.

### Gate C — Payment evidence
Pass only with real paid pilot/subscription transactions or a clearly documented high-commitment procurement signal. Compliments, survey intent, waitlist signups and free usage do not equal payment proof.

### Gate D — Repeatability
Pass only if at least multiple independent customers can onboard, reach value and complete the same core workflow without founder-only intervention dominating delivery.

### Gate E — Economics
Pass only when variable cost, support effort, refunds and acquisition effort are measured and the offer has a plausible path to positive contribution margin.

### Gate F — Scale
Pass only after security, reliability, support, retention and repeatable acquisition are demonstrated. Do not scale spend before the core product is retained and economically viable.

## 8. Value scorecard

Score each dimension from 0 to 5 with evidence links and reviewer:
- severity/frequency of problem;
- clarity of target buyer and budget owner;
- current workaround cost;
- differentiation on an outcome customers care about;
- willingness-to-pay evidence;
- repeat usage / retention evidence;
- delivery feasibility;
- gross-margin plausibility;
- security and regulatory risk;
- distribution feasibility.

A high weighted score must not override a hard failure in safety, permissions, payment integrity or production security. Store scorecard version and weights. Until real customer evidence exists, label the result **hypothesis / not commercially validated**.

## References

- Strategyzer Business Model Canvas: https://www.strategyzer.com/library/the-business-model-canvas
- Strategyzer Value Proposition Canvas: https://www.strategyzer.com/library/the-value-proposition-canvas
- Y Combinator, The Real Product Market Fit: https://www.ycombinator.com/blog/the-real-product-market-fit/
- Stripe, Essential SaaS Metrics (updated 2026-04-13): https://stripe.com/resources/more/essential-saas-metrics
- Stripe, CAC in SaaS: https://stripe.com/resources/more/cac-in-saas


## Product direction update — 2026-10-16

HIO is targeting a commercial SaaS product with the journey FIND → BUILD → VALIDATE → LAUNCH. Plan names and prices remain hypotheses, not published commitments. Before charging, measure actual Apify/Tavily/xAI/Workers AI and Daytona costs, implement per-workspace entitlements and usage metering, define caps/overages/refunds/support, and test willingness to pay. BYOK can be considered later; it does not eliminate sandbox, storage, or platform costs. Do not treat deployment as proof of commercial readiness. Canonical commercial model: [docs/64-public-saas-product-direction.md](64-public-saas-product-direction.md).
