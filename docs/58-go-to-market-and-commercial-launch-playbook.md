# HIO Go-to-Market & Commercial Launch Playbook

**Status:** Proposed validation playbook; no claim of current commercial readiness  
**Date:** 2026-10-12

## 1. Positioning

**Category:** Evidence-to-Execution Business OS.  
**Short description:** A workspace that helps small business operators turn research into evidence-backed decisions, safely execute approved workflows, and measure outcomes.  
**Core promise to test:** less disconnected research and untracked execution; more traceable decisions, bounded costs and measurable learning.

Avoid claims such as “fully autonomous business,” “guaranteed revenue,” “all integrations supported,” “production-ready,” or “Genspark parity” unless each is substantiated by a current release and evidence.

## 2. Beachhead and customer selection

Choose a beachhead using five tests:
1. the problem happens frequently;
2. the buyer is identifiable and can pay;
3. existing workaround is visible and costly;
4. the first workflow can be delivered safely with current infrastructure;
5. reachable channels exist without relying on spam or unauthorized platform access.

Start with one workflow, not the entire “AI business center.” Candidates for discovery—not commitments—include:
- source-backed market research → opportunity dossier → owner decision;
- approved workflow execution → cost and outcome ledger;
- portfolio asset health → release/integration readiness report.

Select one only after direct discovery and a paid or high-commitment pilot signal.

## 3. Offer ladder to test

- **Research preview:** read-only, limited sample; clearly labels data freshness, sources and missing integrations.
- **Paid pilot:** one segment, one workflow, a fixed time window, explicit output, capped usage, human review and success criteria.
- **Starter subscription:** one workspace, core evidence and decision workflow, low included usage.
- **Growth subscription:** additional workspaces/seats and more workflow capacity after support and cost are measured.
- **Usage add-on:** transparent charge for variable provider/model/collection costs, with hard spend caps.
- **Assisted setup:** optional and separately priced; scope and delivery hours explicit.

Names and prices remain open hypotheses. Avoid inventing tiers until cost-to-serve, willingness to pay, support burden and retention are known.

## 4. Pilot contract / scope checklist

Every pilot needs:
- named customer, user, buyer and owner;
- problem statement and current workaround;
- workflow and excluded use cases;
- data sources and permissions;
- baseline, target result, measurement method and reporting date;
- fixed duration, usage quota, budget cap and stop conditions;
- customer responsibilities and support hours;
- security/privacy summary and data retention/deletion policy;
- payment, refund/cancellation and acceptance terms;
- success, failure and continuation decision;
- permission for any testimonial or case study (separate opt-in).

Never use customer data for model training or public case studies unless contract and applicable consent permit it.

## 5. Acquisition and conversion

Use low-cost, evidence-driven channels first:
- public educational research artifacts with transparent methods;
- product-led sample workflow or interactive demo using synthetic data clearly labeled;
- relevant communities only where promotion is allowed;
- partner referrals and customer referrals;
- direct conversations with a small number of qualified target users where appropriate.

Do not spam groups, scrape private communities without authorization, fabricate testimonials, inflate metrics, or imply partnerships. Measure source-to-qualified conversation, qualified conversation-to-pilot, pilot-to-paid, and paid retention.

## 6. Funnel definitions

- **Visitor:** a unique eligible visit, with privacy-respecting analytics.
- **Qualified lead:** matches the selected segment and describes the target problem.
- **Discovery completed:** a structured interview/observed workflow is documented with consent.
- **Pilot accepted:** scope, price, owner and success criteria agreed.
- **Paid customer:** payment has been confirmed by the payment provider and reconciled.
- **Activated:** completed the defined core workflow and received its intended output.
- **Retained:** repeats the core workflow in a later period or renews.
- **Advocate:** voluntarily provides a reference or referral.

Do not count a page view as demand, a checkout click as revenue, an AI-generated report as a customer outcome, or a test payment as production revenue.

## 7. Pricing and commercial controls

Price only after identifying buyer value and cost. Include inference/provider usage, collection API cost, storage, bandwidth, payment fees, refunds, support, and manual fulfillment. Publish included usage, overage rules, limits, cancellation, refund terms and data handling. Set tenant/workspace quotas and owner-level spend caps. Deny over-budget execution by default.

Payment lifecycle must be modeled as pending → verified success / verified failure / expired / refunded / disputed. Trust provider-signed webhooks, verify signatures, make webhook processing idempotent, reconcile periodically, and never unlock paid features based solely on a browser redirect.

## 8. Launch phases

**Phase 0 — Internal alpha:** synthetic/test data; owner-only; no external execution; security and data contracts.  
**Phase 1 — Design partners:** read-only or human-approved workflow; written scope; manual support; capped cost.  
**Phase 2 — Paid pilot:** real payment, customer onboarding, incident/support process, measurable acceptance.  
**Phase 3 — Limited self-serve:** documented onboarding, plan/usage enforcement, deletion/export, support path, status/incident communications.  
**Phase 4 — Scale:** only after retention, unit economics, reliability, security and repeatable acquisition have evidence.

Each phase has a go/no-go decision. A launch date does not waive a failed gate.

## 9. Sales-ready evidence pack

Before public sale, prepare:
- precise product description and supported/unsupported feature list;
- live demo with representative workflow and disclosed limitations;
- current status page or incident communication route;
- pricing, usage, cancellation/refund and terms/privacy documents;
- security and data-processing summary appropriate to target buyers;
- onboarding and support guide;
- export/delete instructions;
- benchmark/methodology notes for any research claims;
- release/version and change log;
- at least one completed customer workflow with permission to share results, or clearly state that customer proof is not yet available.

## 10. Go/no-go checklist

No-go if login/auth is not verified, tenant boundaries are untested, a payment can be spoofed, provider permissions are unclear, cost caps can be bypassed, critical security issues remain, data cannot be deleted as promised, or support/incident ownership is undefined.

## References

- Y Combinator, Essential Startup Advice: https://www.ycombinator.com/blog/ycs-essential-startup-advice/
- Stripe, Essential SaaS Metrics: https://stripe.com/resources/more/essential-saas-metrics
- Cloudflare Pages bindings and encrypted secrets: https://developers.cloudflare.com/pages/functions/bindings/


## Canonical positioning update — 2026-10-16

Position HIO as a customer-facing AI Business Workspace that helps users **find evidence-backed demand, build the smallest useful product, validate it, and prepare to launch**. Do not market it as guaranteed revenue, universal social access, or a fully autonomous agent. Use a limited invited-customer pilot before opening public self-service. Public marketing pages may describe the product direction, but any statement about live capabilities must match the readiness board. Canonical product scope: [docs/64-public-saas-product-direction.md](64-public-saas-product-direction.md); current readiness: [docs/62-founder-first-release-readiness.md](62-founder-first-release-readiness.md).
