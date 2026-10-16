# 08 — Market-Test Readiness Gate

Passing this gate means a bounded experiment may be approved. It does **not** mean demand or product-market fit has been proven.

## Required dossier
- [ ] Clear problem statement and target segment.
- [ ] At least three attributable evidence records where feasible, across at least two independent source types; explain exceptions.
- [ ] Independence/repost check completed.
- [ ] Commercial-intent evidence or an explicit plan to test the missing commercial assumption.
- [ ] Counter-evidence and alternative explanations documented.
- [ ] Buyer, user, payer, and decision-maker hypotheses.
- [ ] Existing alternatives and current workaround documented.
- [ ] One small offer with a concrete outcome, price hypothesis, scope, and delivery plan.
- [ ] Unit economics estimate: revenue, variable cost, payment fees, support, refunds, acquisition cost assumptions.
- [ ] Channel plan with policy/permission review.
- [ ] Privacy, legal, claims, and fulfillment readiness reviewed.
- [ ] Event tracking and attribution defined.
- [ ] Budget cap, duration, sample target, success thresholds, and stop rules set.
- [ ] Owner approval recorded.

## Test design
A test should isolate one or two critical assumptions. Avoid building a full product when a lawful, honest offer page, waitlist, concierge prototype, or narrow paid pilot can answer the question.

## Example metrics
- Qualified impressions and visits.
- Qualified conversion rate.
- Opt-in / demo request / checkout initiation.
- Paid conversion and payment reconciliation.
- Refund/cancellation rate.
- Delivery completion and customer-reported outcome.
- Gross margin and contribution after acquisition/support costs.
- Repeat usage or repeat purchase where appropriate.

Metrics must have precise definitions and denominators. A large number of unqualified views is not a substitute for buyer evidence.

## Stop conditions
Stop or pause when:
- Budget/time cap is reached.
- Source/channel access or policy status changes.
- Unexpected privacy or security risk appears.
- Delivery cannot meet the stated promise.
- Thresholds show the hypothesis is not supported.
- Tracking is broken enough that results cannot be interpreted.

## Decision after experiment
Record actuals, deviations, costs, sample limitations, failed assumptions, and decision: continue, iterate, pivot, or stop. Never rewrite success thresholds after seeing results without marking the experiment as changed.


## Canonical productization baseline — 2026-10-12

HIO's intended direction is an AI Business Command Workspace: evidence → opportunity → approved execution → measurable outcomes. This is a target product direction, not proof that every capability is shipped or commercially ready. Keep fixture/demo evidence distinct from live data, and use [the canonical productization and production-parity contract](50-ai-workspace-productization-and-production-parity.md) for current capability labels, security boundaries, release verification, and SaaS launch gates. Current production login remains blocked until the Owner configures distinct `OPERATOR_SECRET` and `SESSION_SECRET` values securely and the deployed authenticated workflow is verified. Benchmark current Genspark AI Workspace and G2 product evidence before turning assumptions into requirements.

## Commercial SaaS direction update — 2026-10-16

Commercial direction update (2026-10-16): validation is a core customer-facing product stage, not only an internal gate. Every opportunity must connect to a hypothesis, target customer, pre-set success/stop thresholds, actual signal, and continue/revise/stop decision. Canonical flow: [docs/64-public-saas-product-direction.md](64-public-saas-product-direction.md).

## Commercial SaaS direction update — 2026-10-16

Commercial direction update (2026-10-16): validation is a core customer-facing product stage, not only an internal gate. Every opportunity must connect to a hypothesis, target customer, pre-set success/stop thresholds, actual signal, and continue/revise/stop decision. Canonical flow: [docs/64-public-saas-product-direction.md](64-public-saas-product-direction.md).
