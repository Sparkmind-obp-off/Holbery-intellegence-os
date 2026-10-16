# HIO Market Research & Validation Standard

**Status:** Required operating standard for opportunity claims  
**Date:** 2026-10-12

## 1. Purpose

Prevent HIO from turning weak signals, synthetic fixtures, AI-generated summaries or vendor marketing into false market confidence. Research is useful only when it helps a named decision and preserves how evidence was obtained.

## 2. Evidence classes

Assign every item one class:
- **E0 — Synthetic/test fixture:** useful for testing software only; zero market proof.
- **E1 — Public signal:** accessible public page, post, review, pricing page or public dataset with source and date.
- **E2 — Repeated pattern:** similar problem observed independently across sources; deduplication and selection bias documented.
- **E3 — Direct problem evidence:** interview, observed workflow, support log or customer artifact with consent and context.
- **E4 — Behavioral commitment:** user spends time, shares data, runs a pilot, changes workflow or signs a concrete commitment.
- **E5 — Payment evidence:** actual paid transaction, deposit, procurement approval or renewal, verified without exposing payment secrets.
- **E6 — Retention/outcome evidence:** repeated use, renewal, measurable customer outcome and delivery cost.

Do not convert E0 to E1. Do not call E1/E2 “validated demand.” Evidence level is not a score of truth: a payment can still be an outlier, and public complaints may be unrepresentative.

## 3. Required evidence record

Each record should include:
- evidence ID, source ID, URL or permitted connector reference;
- observed/captured date and source date (if available);
- source type, access method, permission/legal basis and terms constraints;
- raw excerpt or minimum necessary evidence, with privacy review;
- author/actor and capture run;
- normalized problem statement, segment and context;
- duplicates/reposts and canonical source;
- positive evidence, counter-evidence and competing explanations;
- classification (fact, quote, vendor claim, inference, estimate, unknown);
- confidence rationale, limitations and next test;
- retention/deletion date and reviewer.

Do not store private-group or personal data through unauthorized scraping, bypass login/access controls, evade rate limits, or imply access to a platform/community that has not been authorized. Prefer official APIs, user-authorized connectors, public sources and manual research where appropriate.

## 4. Research protocol

1. Write the decision question before collecting data.
2. Define one target segment and geography; do not mix buyers with different needs.
3. State the problem and payer hypotheses separately.
4. List what evidence would support, weaken or falsify each hypothesis.
5. Search a diverse source set; record failed/inaccessible sources rather than inventing data.
6. Deduplicate reposts, syndicated content and multiple complaints from the same author.
7. Separate frequency of mentions from severity, willingness to pay and reachable market.
8. Interview users about recent behavior and workarounds; avoid leading questions and hypothetical “would you buy?” as the only test.
9. Run the smallest safe test with predefined success and stop criteria.
10. Capture outcomes, including negative results, and update the decision log.

## 5. Opportunity scoring rubric

Use a versioned scorecard. Suggested dimensions:
- pain severity and recurrence;
- identifiable user and buyer;
- evidence independence and freshness;
- workaround and measurable cost;
- willingness-to-pay evidence;
- competitive alternatives and differentiation;
- reachable distribution channel;
- delivery feasibility and integration access;
- contribution margin potential;
- legal, privacy, safety and platform-policy risk.

Each score must cite supporting evidence and counter-evidence. Mark missing data as **unknown**, not zero or an optimistic estimate. Scores prioritize research; they do not automatically approve execution or investment.

## 6. Experiment card (required)

- Hypothesis and affected segment.
- Baseline / current workaround.
- Intervention and scope.
- Owner and deadline.
- Budget cap and provider cap.
- Consent, data scope and deletion plan.
- Success threshold and failure threshold.
- Stop conditions (security incident, cost cap, policy issue, negative user impact).
- Required human approvals.
- Outcome measurement and evidence destination.
- Decision rule: continue, revise, stop or archive.

## 7. Vendor and competitor research

For each competitor, capture official feature/price pages, date accessed, target customer, workflow, claimed benefits, independent user feedback, integrations, limits, privacy/security posture where public, and unresolved questions. Vendor materials establish what the vendor claims, not proof that customers achieve the outcome. Review sites provide discovery signals, not a representative census.

Benchmark HIO against categories rather than copying product names: AI workspaces, workflow automation, business intelligence, market research, agent orchestration and vertical SaaS. The question is not “how many features do they have?” but “what repeated user outcome is better, cheaper, safer or more verifiable?”

## 8. Exit criteria for a validated opportunity

An opportunity can be marked **validation-ready** only when:
- one buyer/segment is explicit;
- the problem is supported by traceable evidence;
- meaningful counter-evidence has been reviewed;
- a value proposition and alternative are described;
- the experiment has measurable pass/fail criteria;
- delivery and data permissions are feasible;
- cost and risk are bounded;
- the decision owner approves the test.

It can be marked **commercially validated** only after real-world behavior and payment/delivery evidence support that label. No AI-generated score can set this state by itself.

## References

- Strategyzer, Value Proposition Canvas: https://www.strategyzer.com/library/the-value-proposition-canvas
- Y Combinator, Essential Startup Advice: https://www.ycombinator.com/blog/ycs-essential-startup-advice/
- G2 AI Agents for Business Operations: https://www.g2.com/categories/ai-agents-for-business-operations
- Genspark AI Workspace 6.0 (vendor claims, accessed 2026-10-12): https://www.genspark.ai/blog/genspark-ai-workspace-6

## Commercial SaaS direction update — 2026-10-16

Commercial product update (2026-10-16): all demand evidence and validation results should be attributable to a customer workspace and a specific opportunity/experiment. Distinguish public-source evidence, AI inference, stated interest, actual use, and payment. Keep data provenance and sampling limitations visible. Canonical flow: [docs/64-public-saas-product-direction.md](64-public-saas-product-direction.md).
