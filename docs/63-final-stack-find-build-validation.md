# 63 — Final Stack Decision: FIND → BUILD → VALIDATE

**Decision date:** 2026-10-16  
**Status:** Accepted architecture / implementation target. This document does not claim every provider is connected or production-tested.  
**Scope:** HOLBERY Intelligence OS (HIO) only. Do not modify HOLBERY Commerce or Bozq One System.

## Executive decision

HIO follows one loop: **FIND demand → preserve evidence → select a problem → BUILD the smallest useful product → VALIDATE with real users → record the outcome.**

The stack stays intentionally small. Apify is the required primary acquisition layer. Daytona is the required standard build environment. Tavily complements social/community acquisition with public web research. **Grok Console means the xAI developer console and API access—not “Grok AI” as a product/UI dependency.**

## Layer 1 — FIND

### Required primary stack

1. **Apify — primary social/community data acquisition**
   - Use suitable Actors and APIs for accessible public or otherwise authorized data from supported sources, potentially Reddit, Facebook Groups/pages, Threads, X, and other relevant communities.
   - Test each Actor/source separately: access, coverage, freshness, login requirements, platform terms, limits, and pricing vary.
   - Do not assume every group, private post, comment, or platform can be accessed. Never bypass access controls or private-group restrictions.
   - Preserve source URL, platform, publication/collection timestamps when available, source/Actor identity, and collection status.

2. **Tavily — standard web discovery and evidence enrichment**
   - Search public pages, forums, competitor pages, product alternatives, and supporting/counter-evidence.
   - Use extraction/crawl where appropriate and supported. Tavily complements Apify; it is not a universal private-community scraper.

### Optional, purpose-specific providers

3. **Grok Console (xAI API) — optional X search and model provider**
   - “Grok Console” means the developer console/API access used to configure and manage xAI API credentials.
   - Use xAI API search tools, including X Search when suitable, for targeted X conversations or web search; use its models for analysis/coding only when capability and cost justify it.
   - Do not label this dependency “Grok AI”; the intended integration is Grok Console / xAI API.
   - It is not a universal connector for Facebook, Reddit, Threads, or all communities.

4. **Cloudflare Workers AI — optional cost-aware inference**
   - Evaluate for suitable classification, structured extraction, summarization, and lightweight transformations.
   - Provider/model choice remains configurable; Workers AI is not mandatory if another approved model fits better.

### FIND processing contract

Normalize source records, deduplicate by canonical URL/content fingerprint where appropriate, retain provenance, and separate source facts from model interpretation. Each opportunity brief should contain:
- Problem and affected user/customer segment.
- Original source URLs and dates, with representative evidence.
- Recurrence signals and sampling limitations.
- Existing alternatives and competitor/workaround notes.
- Payer hypothesis, urgency, willingness-to-pay evidence or explicit unknowns.
- Counter-evidence, confidence, data gaps, estimated collection cost, and recommended next validation step.

A model-generated score is a prioritization aid, not proof of market size, demand, revenue, or product-market fit. A repost must not be counted as independent demand evidence.

## Layer 2 — BUILD

### Required standard build environment

1. **Daytona — standard code-generation and execution sandbox**
   - Daytona is the required default environment for AI-generated code, project files, dependency installation, commands, tests, and prototype execution.
   - A coding model/agent writes and revises code; Daytona provides the isolated environment in which it runs. Daytona alone is not the model and does not independently decide what to build.
   - Enforce per-build isolation, execution/resource limits, allowed network access, dependency checks, secret-safe logs, and a kill/cancel path.
   - Keep customer secrets and production credentials out of generated source, prompts, artifacts, and sandbox logs.

2. **Coding model — provider selectable**
   - **Grok Console / xAI API** is one option for planning, code generation, debugging, or review.
   - Cloudflare Workers AI or another explicitly configured provider can be selected when quality, capability, cost, and limits fit.
   - Do not hard-wire every workflow to one model. The intended xAI integration is Grok Console / xAI API, not “Grok AI.”

3. **Output-specific generators — choose the smallest useful artifact**
   - Spreadsheet/workbook: Python with openpyxl and/or pandas, executed and tested in Daytona; output XLSX/CSV plus a usage guide and test data.
   - Web demo/system: a suitable web framework, built and run in Daytona; test before publication.
   - Reports/documents: an appropriate document generator.
   - Dashboard/calculator: a small web application only when it tests the problem better than a spreadsheet or document.
   - Package generated files, test results, limitations, and usage instructions as applicable.

Daytona is mandatory as the standard build lane, but **a website is not mandatory as the product output**. Output must fit the validated problem. Do not build complex SaaS when a spreadsheet or focused demo can test value.

## HIO control plane and delivery

Cloudflare is HIO’s default control-plane/publication stack, not a replacement for Daytona.

- **Cloudflare Workers:** authenticated APIs, provider adapters, job coordination, validation workflow, access controls, quotas, and server-side secrets.
- **Cloudflare Pages:** HIO UI and suitable web demos.
- **Cloudflare D1:** workspace-scoped briefs, evidence references/metadata, opportunity decisions, build status, validation experiments, and outcomes. Reuse the existing HIO D1 schema; add migrations only when needed. Do not create a parallel database by default.
- **Cloudflare R2:** generated files and larger artifacts such as XLSX, PDF, ZIP, and demo assets when object storage is appropriate.
- **Cloudflare Workers AI:** optional inference as described above.

### Operator credentials versus BYOK

**MVP default:** operator-managed provider accounts/keys, stored only as server-side secrets, with explicit provider budgets and usage records. Never expose keys to browsers, repositories, prompts, artifacts, or logs.

**Later SaaS option:** offer BYOK per workspace after tenant isolation, secret lifecycle, usage visibility, consent, and support are ready. BYOK does not make third-party API usage free. Daytona usage must also be bounded and attributed to a workspace.

## VALIDATE — required completion stage

A generated artifact is not a validated business. Each selected opportunity needs:
- A named hypothesis and target customer.
- A demo or artifact that can be inspected or tried.
- A specific feedback, usage, signup, pre-order, or paid-pilot signal.
- Success and stop thresholds selected before the experiment.
- Actual results, context, limitations, and a recorded decision: continue, revise, or stop.

No automated posting, outreach, purchases, billing, or other consequential external action without an explicit policy and appropriate human approval.

## End-to-end reference flow

1. Owner creates a demand brief in HIO.
2. HIO invokes approved Apify source(s) and Tavily under bounded budgets; optional Grok Console / xAI API search is used only when selected.
3. HIO stores provenance and normalized evidence, deduplicates records, distinguishes facts from AI interpretations, and prepares an opportunity brief.
4. Owner reviews evidence and approves one problem to prototype.
5. A coding model generates the plan and files; Daytona executes the build and tests in an isolated sandbox.
6. HIO packages the appropriate output (spreadsheet, document, or web demo); Pages/Workers and D1/R2 are used when required.
7. Owner approves a validation experiment. Results are recorded in HIO and inform the next decision.

## Rollout order and release gates

1. **Inventory first:** inspect existing HIO source adapters, research routes, quotas, secrets, D1 tables, tests, and any existing Daytona setup. Reuse what exists.
2. **One FIND slice:** start with one authorized, accessible, economically viable source. Verify provenance, deduplication, limits, cancellation, and safe errors.
3. **One BUILD slice:** pass an approved opportunity brief to Daytona and generate one small artifact; verify isolation, packaging, tests, and cleanup.
4. **One VALIDATE slice:** share a controlled demo, capture feedback/signals, and persist the outcome.
5. Add sources, providers, durable orchestration, BYOK, and commercial plans only after the first end-to-end slice passes.

Before activating or expanding provider integrations, verify credentials are valid and properly scoped; rotate them if exposure is suspected. Confirm budgets, workspace authorization, audit, retries/idempotency, cancellation, retention, backup/recovery, and rollback. A provider named in this design is not proof of a live integration.

## Official references

- Apify: https://docs.apify.com/api/v2
- Tavily: https://docs.tavily.com/
- xAI API / developer console: https://docs.x.ai/
- Daytona: https://docs.daytona.io/
- Cloudflare Workers: https://developers.cloudflare.com/workers/
- Cloudflare Pages: https://developers.cloudflare.com/pages/
- D1: https://developers.cloudflare.com/d1/
- R2: https://developers.cloudflare.com/r2/
- Workers AI: https://developers.cloudflare.com/workers-ai/

## Decision summary

| Layer | Final default | Role |
|---|---|---|
| FIND — primary | **Apify** | Social/community data acquisition via supported Actors/APIs |
| FIND — web complement | **Tavily** | Public web search and evidence enrichment |
| FIND — optional | **Grok Console / xAI API** | Targeted X/web search and model API when justified |
| FIND/BUILD — optional | **Cloudflare Workers AI** | Suitable inference tasks |
| BUILD — required | **Daytona** | Isolated code execution, testing, and prototype generation |
| Control plane | **Cloudflare Workers + Pages** | APIs, HIO UI, and suitable demo publication |
| Persistence | **Existing D1 + optional R2** | Structured state and generated artifacts |
| Final gate | **Validation experiment** | Evidence of usefulness and buyer intent before expansion |

This is the canonical stack decision for HIO. It defines the intended architecture; implementation status must be reported separately from target design.


## Final external-provider register (2026-10-17)

The canonical provider register is [docs/65-final-external-provider-register.md](65-final-external-provider-register.md). The selected providers are sufficient to begin one controlled end-to-end MVP slice; do not acquire more providers before implementation/testing demonstrates a gap.

Important free-tier/commercial-use guardrails:
- Jina Reader is an optional extraction fallback. Its current pricing page labels the Toy Experiment token tier non-commercial; do not use that tier for customer SaaS traffic.
- OpenRouter free models have strict request limits and no free-tier spend controls; it is optional, not a production SLA.
- xAI/Grok Console API is usage-billed, including possible separate search-tool invocation costs; do not assume it is free.
- Daytona's advertised free compute is a finite credit, not permanent free execution.
- Resend, Sentry, and R2 are optional/feature-triggered additions; configure and verify them before enabling their customer-facing function.

The owner reports that relevant credentials have been approved/saved, but this does not establish that they are present in the right environment or connected/tested. Track provider status using the states and checklist in doc 65. Do not publish credential values or fragments.

**Stack sufficiency decision:** no further external provider is required to start the first MVP slice. Commercial launch remains blocked by implementation and acceptance gates, especially customer identity and tenant isolation, per-tenant usage/cost controls, safe Daytona execution, privacy/data lifecycle, recovery, support, and payment verification if charging customers.
