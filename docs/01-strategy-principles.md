# 01 — Strategy and Operating Principles

## Strategic posture
HIO is the internal intelligence capability of HOLBERY. It is not a separate public brand and should not cause projects to fragment. The same evidence and decision process can inform SYSTEMS, PRODUCTS, VENTURES, and COMMERCE, while each offer is only pursued when evidence supports it.

## Non-negotiable principles
1. **Evidence before exposure.** Research privately before public activation.
2. **Provenance by default.** Every observation should point to a source URL or permitted artifact, timestamps, collection run, and method.
3. **Facts are not interpretations.** Store source content/metadata separately from summaries, labels, inferred pain, and hypotheses.
4. **A signal is not a customer.** A complaint, search trend, click, signup, checkout, payment, and repeat purchase represent different evidence strengths.
5. **Counter-evidence is mandatory.** Search for substitutes, non-buying behavior, workarounds, low frequency, and reasons not to solve the problem.
6. **Independence matters.** Ten reposts of one original complaint are not ten independent demand signals.
7. **Commercial intent beats vanity metrics.** Existing spend, requests for paid solutions, switching behavior, budget, and verified payments generally matter more than likes alone.
8. **Uncertainty stays visible.** Missing data is not a positive score. Model confidence must not masquerade as source reliability.
9. **Humans approve consequential actions.** No autonomous spending, mass outreach, or public launch.
10. **Every test has a stop rule.** Define budget, sample, success threshold, duration, and stop conditions before activation.
11. **Costs are product data.** Record API, actor, model, storage, and operator costs where measurable.
12. **Learn from failure.** Preserve rejected hypotheses and why they were rejected.

## Evidence ladder
- D0 — Hypothesis
- D1 — Observed signal
- D2 — Repeated pattern
- D3 — Commercial signal
- D4 — Market-test behavior
- D5 — Verified transaction
- D6 — Outcome and repeatability

Higher levels do not automatically invalidate lower-level caveats. A single payment proves a transaction occurred, not repeatable product-market fit.

## Operating loop
Discover → Ingest → Normalize → Deduplicate → Preserve → Cluster → Evaluate → Decide → Gate → Test → Measure → Learn.

## Portfolio discipline
HIO may discover many opportunities but must not encourage building them all. Maintain a single ranked backlog, limit active market tests, and require explicit owner approval before promoting an opportunity to a product initiative. Keep product-specific code and delivery in their own repositories after an opportunity passes the gate.


## Canonical productization baseline — 2026-10-12

HIO's intended direction is an AI Business Command Workspace: evidence → opportunity → approved execution → measurable outcomes. This is a target product direction, not proof that every capability is shipped or commercially ready. Keep fixture/demo evidence distinct from live data, and use [the canonical productization and production-parity contract](50-ai-workspace-productization-and-production-parity.md) for current capability labels, security boundaries, release verification, and SaaS launch gates. Current production login remains blocked until the Owner configures distinct `OPERATOR_SECRET` and `SESSION_SECRET` values securely and the deployed authenticated workflow is verified. Benchmark current Genspark AI Workspace and G2 product evidence before turning assumptions into requirements.
