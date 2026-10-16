# 64 — HIO Public SaaS Product Direction: FIND → BUILD → VALIDATE → LAUNCH

**Decision date:** 2026-10-16  
**Decision status:** Product direction accepted; commercial launch and feature availability remain gated by evidence.  
**Canonical product:** HOLBERY Intelligence OS (HIO)  
**Canonical product model:** multi-customer SaaS workspace, not founder-only/internal-only software.  
**Stack authority:** `docs/63-final-stack-find-build-validation.md`  
**Readiness authority:** `docs/62-founder-first-release-readiness.md`

## 1. Product decision

HIO is to be developed and commercialized as a public-facing AI Business Workspace that helps a customer discover a real problem, preserve evidence, build the smallest useful solution, validate demand, and prepare a promising solution for launch.

The customer-facing promise is:

> Find real customer problems, turn the strongest opportunity into a usable product prototype, and validate the idea before investing in a full business.

HIO is not marketed as a fully autonomous business that guarantees revenue, universal social-media access, or automatic product-market fit. Claims must match live, tested capabilities.

## 2. Core user journey

1. **FIND — Demand discovery**
   - Customer defines a niche, audience, geography, and problem area.
   - HIO searches accessible community/social sources and public web sources using enabled connectors.
   - Results retain source URLs, timestamps where available, provenance, access status, deduplication, and counter-evidence.
   - Customer reviews evidence and creates an opportunity brief.

2. **DECIDE — Opportunity review**
   - HIO summarizes affected customer, pain, current workaround, potential payer, alternatives, uncertainties, confidence, and estimated validation cost.
   - AI scores are decision support only, not proof of demand or financial outcomes.
   - Customer selects one opportunity before spending on a build.

3. **BUILD — Product generation**
   - Daytona is the standard isolated environment for AI-assisted code generation, execution, and testing.
   - HIO chooses the smallest artifact that can test the problem: spreadsheet/workbook, template, document, calculator, dashboard, web demo, or prototype system.
   - A coding model is a provider-selectable dependency. Grok access means **Grok Console / xAI API**, not a dependency described as “Grok AI”. Workers AI or another approved provider may be selected when appropriate.
   - Builds are resource-limited, logged without secrets, tested, packaged, and attributable to a workspace.

4. **VALIDATE — Market test**
   - Each build is linked to a falsifiable hypothesis, target segment, and pre-defined success/stop thresholds.
   - Capture feedback, usage, signups, qualified interest, pre-orders, or paid-pilot signals where legally and operationally appropriate.
   - Distinguish stated interest from actual behavior and payment.
   - Record continue, revise, or stop with evidence and limitations.

5. **LAUNCH — Prepare delivery**
   - When validation justifies it, help package the artifact, write usage documentation, prepare a product page/demo, and plan support/fulfilment.
   - Publication, external messaging, billing, purchases, and other consequential actions require explicit customer authorization and appropriate controls.
   - A launch-preparation artifact does not mean HIO has automatically published or sold the product.

## 3. Canonical stack

See document 63 for the full technical contract. Summary:

- **FIND required primary:** Apify Actors/API for supported and authorized source acquisition.
- **FIND standard complement:** Tavily for public-web search and evidence enrichment.
- **FIND optional:** Grok Console / xAI API, including targeted X Search where suitable; not a universal connector for all networks.
- **Optional inference:** Cloudflare Workers AI where task quality, model limits, and cost fit.
- **BUILD required standard environment:** Daytona for isolated build/test execution.
- **Delivery/control plane:** Cloudflare Workers + Pages; existing D1 for structured state; R2 for generated artifacts when useful.
- **VALIDATE:** hypothesis, target customer, measurable signal, thresholds, results, and recorded decision.

Each connector is enabled only after access, terms, pricing, coverage, quota, credentials, and production behavior have been checked. A stack listed here is a design choice, not proof that the integration is live.

## 4. Public versus private surfaces

### Public, unauthenticated
- Product overview, clear use cases, capabilities and limitations.
- Sample reports/demo data explicitly labelled as examples.
- Pricing hypothesis or published plan details only after costs and entitlement rules are decided.
- Sign-up/sign-in entry points, terms, privacy notice, support/contact and service status where implemented.
- No customer evidence, workspace names, private records, generated artifacts, provider keys, owner diagnostics, or operational secrets.

### Authenticated customer workspace
- Customer's own briefs, evidence, opportunities, builds, artifacts, validation experiments, usage, and plan entitlements.
- Strict tenant/workspace isolation enforced server-side on every read/write and background job.
- Explicit consent and approval for connector use, build execution, external publication, or billable actions.
- Export and deletion/retention controls must be defined before onboarding real customer data.

### Owner/admin operations
- Separate owner/admin authorization, not merely hidden navigation.
- Provider secrets, tenant support tools, quota/billing controls, release controls, audit and incident actions.
- Never expose admin APIs, diagnostics, other customers' records, or secret metadata beyond least privilege to ordinary users.
- Support access to customer data must be scoped, justified, auditable, and limited.

## 5. Commercial model

Commercialization is the target; prices and packaging remain hypotheses until tested with customers and unit economics.

Potential packaging dimensions:
- Free/trial: limited discovery runs, small evidence allowance, one or few builds, watermarked/sample outputs where useful.
- Starter: individual creators/sellers, constrained monthly research and artifact quota.
- Pro: higher quotas, more projects/builds, richer export and validation tracking.
- Team: shared workspaces, role-based access, shared projects, admin controls and usage visibility.

Do not publish fixed prices until real provider and Daytona costs are measured. Quotas must prevent a customer from creating unbounded scraping, model, sandbox, storage, or publication spend. Pricing should be tied to measured cost-to-serve and willingness-to-pay interviews/paid tests, not copied from competitors. BYOK may be offered later but is not required for MVP and does not eliminate Daytona or platform costs.

## 6. MVP boundary

The first commercial pilot should complete one end-to-end journey with a small number of invited external customers:
- One supported, authorized FIND source plus Tavily web enrichment.
- One evidence-backed opportunity brief.
- Owner/customer approval before build.
- One Daytona-generated, tested artifact chosen for the problem.
- A controlled demo or downloadable package.
- A validation experiment and persisted result.
- Basic account/workspace separation, usage budget, audit, support and privacy disclosures.

Do not claim broad social coverage, autonomous agents, universal spreadsheet/web generation, billing readiness, multi-tenant security, or public self-service signup until each has been implemented and verified.

## 7. Commercial launch gates

A public marketing page can be prepared before full product availability, but customer data processing, paid plans, and self-service onboarding must not be opened until the relevant gates pass:

1. Authentication and tenant isolation tested across two or more separate workspaces.
2. Provider and Daytona credentials stored server-side; no secrets in prompts, logs, browser, repo or generated output.
3. Usage accounting, per-tenant caps, cost ceilings, timeouts, cancellation and abuse controls work.
4. Data source permissions, retention, privacy disclosures, terms, and deletion/export expectations are documented.
5. Build isolation, artifact scanning, output tests, sandbox cleanup and incident handling are verified.
6. Billing, plan entitlements, failed-payment behavior, refunds/support and accounting are implemented before taking recurring payments.
7. Restore/backup and rollback have evidence; no unsupported claim of recovery readiness.
8. End-to-end acceptance passes with recorded evidence.
9. At least one real customer problem has credible validation; paid demand is recorded separately from survey interest.
10. Marketing claims reflect verified capability and limitations.

## 8. Metrics

Track funnel and economics by workspace:
- FIND: source coverage, successful collection rate, cost per usable unique evidence item, deduplication rate, source freshness.
- DECIDE: evidence completeness, time to opportunity decision, counter-evidence reviewed.
- BUILD: build success rate, time to first artifact, tests passed, cost per build, failure/retry rate.
- VALIDATE: experiment completion, qualified feedback, activation/usage, signup/pre-order/paid-pilot conversion.
- LAUNCH: artifact downloads, publish-ready completion, customer retention, paid conversion, support burden.
- Business: gross margin per plan, provider/Daytona cost per active workspace, churn, refunds, and incidents.

## 9. Governance

Use the evidence-to-execution loop with human review. Treat fetched content as untrusted input. Do not generate claims or fabricated testimonials. Do not scrape private communities without authorization, evade access controls, spam users, auto-DM, or publish/post without approval. Keep third-party terms and data-source limitations visible.

## 10. Decision log

- HIO transitions from founder-first internal workspace toward a customer-facing commercial SaaS product.
- FIND → BUILD → VALIDATE → LAUNCH is the canonical customer journey.
- Apify is the required primary acquisition layer; Tavily is the standard web complement.
- Daytona is the required standard build/test environment.
- xAI integration is called Grok Console / xAI API.
- Cloudflare remains the control-plane, persistence, and publication layer.
- Existing readiness record remains authoritative for what is actually implemented and verified.
- No production deployment, billing enablement, public self-service launch, or claim of commercial readiness is implied by this strategy decision.
