# HIO Research Source Register & Decision Log

**Research snapshot:** 2026-10-12  
**Purpose:** Make product strategy traceable; separate source claims from HIO conclusions.

## 1. Source register

| Source | Type | What it supports | Limitations |
|---|---|---|---|
| Strategyzer — Business Model Canvas: https://www.strategyzer.com/library/the-business-model-canvas | Primary framework source | Describe customers, value proposition, channels, relationships, resources, activities, partners, revenue and costs together | A canvas structures assumptions; it does not validate them |
| Strategyzer — What is a business model?: https://www.strategyzer.com/library/what-is-a-business-model | Primary framework source | Business model as a simplified representation of how an organization creates and captures money/value | Conceptual framework, not proof of HIO demand |
| Strategyzer — Value Proposition Canvas: https://www.strategyzer.com/library/the-value-proposition-canvas | Primary framework source | Jobs, pains, gains; match offer to a specific customer segment and test fit | Must be paired with customer evidence |
| Y Combinator — The Real Product Market Fit: https://www.ycombinator.com/blog/the-real-product-market-fit/ | Startup practitioner guidance (2016) | Build for a real painful problem; early product can be imperfect; observe customer behavior | Advice, not a universal numeric PMF threshold |
| Y Combinator — Essential Startup Advice: https://www.ycombinator.com/blog/ycs-essential-startup-advice/ | Startup practitioner guidance | Build, talk to users, iterate; avoid scaling before product and economics work | Advice; segment and context matter |
| Stripe — Essential SaaS Metrics: https://stripe.com/resources/more/essential-saas-metrics | Commercial/financial guidance; updated 2026-04-13 | CAC, retention, churn, MRR/ARR, gross margin, LTV and related measures | Vendor content; formulas and benchmarks require context |
| Stripe — CAC in SaaS: https://stripe.com/resources/more/cac-in-saas | Commercial/financial guidance | CAC, payback, LTV/CAC and acquisition efficiency | Benchmarks are directional, not guarantees |
| Genspark AI Workspace 6.0: https://www.genspark.ai/blog/genspark-ai-workspace-6 | Vendor primary source; published 2026-07-20 | Market direction around persistent memory, intelligence, suites/tools and human-agent collaboration | Vendor marketing; claims not independently verified by this source |
| G2 AI Agents for Business Operations: https://www.g2.com/categories/ai-agents-for-business-operations | Review/category discovery source | Competitor discovery and customer-review research set | Category inclusion/reviews may be biased; not a market-size census |
| NIST SP 800-218 SSDF: https://csrc.nist.gov/pubs/sp/800/218/final | Government security framework | Secure development practices and release-risk discipline | Framework; implementation and risk assessment still required |
| NIST SSDF project: https://csrc.nist.gov/projects/ssdf | Government framework overview | Four practice groups: prepare organization, protect software, produce secure software, respond to vulnerabilities | Does not certify HIO |
| Cloudflare Pages bindings/secrets: https://developers.cloudflare.com/pages/functions/bindings/ | Official platform documentation | Runtime bindings and encrypted secret configuration behavior | Documentation is not evidence that HIO secrets are configured |
| Cloudflare D1 migrations: https://developers.cloudflare.com/d1/reference/migrations/ | Official platform documentation; updated 2026-06-08 | Versioned migration practices and applying/listing migrations | Does not prove current production DB state |

## 2. Research synthesis

### Market direction
AI workspaces increasingly combine persistent context, reasoning, tools and collaboration. Genspark's own 6.0 framing describes SecondBrain, Super Agent, Suites and GenTeam. Treat this as a market-positioning signal, not proof of superiority or an implementation requirement.

### Strategic implication for HIO
Do not win on generic chat, the number of agents, or claims of autonomous work. Test differentiation around traceable evidence, approval-aware execution, portfolio-level lineage, explicit cost control and measured outcomes.

### Business model implication
Use the Business Model Canvas and Value Proposition Canvas as hypothesis maps, then test through direct user behavior. Revenue is not validated by a pricing page. Unit economics cannot be declared healthy without measured cost-to-serve, retention and acquisition cost.

### Production implication
Security, identity, data integrity, provider permissions, operations and commercial trust are part of the product, not launch-week polish. NIST SSDF and Cloudflare documentation provide reference practices, but each relevant control must be tested in HIO's actual release.

## 3. Decisions recorded

1. **Positioning:** Evidence-to-Execution Business OS / AI Business Command Workspace. Status: strategic hypothesis.
2. **First customer segment:** not yet proven; compare a small number of narrow segments before selecting one.
3. **Business model:** paid bounded pilot first, then subscription/usage only after workflow and economics evidence. Status: recommended experiment, not final commitment.
4. **Portfolio boundary:** HIO orchestrates approved assets; it does not gain blanket access to other ventures.
5. **ORDVELA:** absorb for portfolio governance; keep technically isolated pending due diligence.
6. **Production status:** prior evidence indicated a deployed Pages app but missing production auth secrets and unverified authenticated workflow. Recheck live state before claiming readiness.
7. **Release standard:** all production and commercial claims require dated, release-specific evidence.
8. **Research integrity:** vendor marketing and AI-generated output are not independent proof; preserve counter-evidence and uncertainty.

## 4. Open questions to resolve with evidence

- Which customer segment has the highest urgency and a reachable buyer?
- What single workflow produces value repeatedly with current low-cost infrastructure?
- Which external data sources can be accessed legitimately, reliably and within budget?
- Which actions are read-only, draft-only, reversible, spend-incurring or irreversible?
- What are actual cost per completed workflow, support minutes per customer and conversion/retention?
- Which security, privacy, payment and contractual obligations apply to the chosen market?
- What must remain manual until reliability and permissions are proven?

## 5. Research refresh rules

Refresh this register when:
- a competitor changes positioning/pricing or ships a materially relevant feature;
- a source is inaccessible or its content changes;
- customer evidence contradicts the product thesis;
- an integration, data source or regulatory assumption changes;
- the release moves from internal alpha to pilot or commercial availability.

Every update should state date, author, change, source and impact on the decision. Do not silently rewrite old assumptions as if they were always facts.
