# 65 — Final External Provider Register for HIO MVP

**Decision date:** 2026-10-17  
**Scope:** HOLBERY Intelligence OS (HIO) only. Do not modify HOLBERY Commerce or Bozq One System.  
**Authority:** Product direction: [64](64-public-saas-product-direction.md). Architecture: [63](63-final-stack-find-build-validation.md). Verified release readiness: [62](62-founder-first-release-readiness.md).

## Executive decision

**The selected provider categories are sufficient for a first controlled HIO MVP. Do not acquire another external provider just to make the stack look complete.** The next priority is implementation, safe configuration, and end-to-end verification of one customer journey—not adding more vendors.

The owner reports having approved/saved credentials for several optional providers. That is an owner-reported setup state only; it is not independent proof that a key is present in the correct environment, valid, properly scoped, billable, or successfully used by HIO. Never copy secrets into this document, source control, chat, browser code, prompts, or logs.

## Canonical provider register

| Capability | Final provider / default | MVP role | Cost / access posture | Status and rule |
|---|---|---|---|---|
| App hosting and API | Cloudflare Pages + Workers | Public UI, API, server-side orchestration and provider adapters | Workers Free currently lists 100,000 requests/day and 10 ms CPU per invocation. D1/Workers limits can stop requests when exceeded. | Existing HIO foundation. Verify actual runtime and plan limits; do not promise unlimited use. |
| Structured persistence | Existing HIO D1, database hio-production, binding DB | Workspace-scoped metadata, evidence references, decisions, experiments, usage ledger and job state | D1 Free currently lists 5 million rows read/day, 100,000 rows written/day, and 5 GB total storage. | Reuse existing D1 and migrations. No parallel database by default. |
| Artifact object storage | Cloudflare R2 | Private XLSX/PDF/ZIP outputs and build artifacts when needed | Free allowance is useful for early volume, but storage/operation quotas and lifecycle costs must be monitored. | Approved target. Implement private buckets, authorization, short-lived downloads where appropriate, size limits and retention. |
| Primary FIND acquisition | Apify | Supported public/authorized community and social sources via selected Actors | Free tier currently provides $5 monthly platform/Actor usage; Actor pricing varies and compute is charged. | Required primary acquisition lane. Test each Actor separately; no assumptions about platform-wide access. Apply hard per-run and per-tenant budgets. |
| Public web discovery | Tavily | Search public web sources and enrich evidence | Free tier has a monthly credit allowance; exact quota and current account balance must be checked in Tavily. | Standard FIND complement. Preserve source URL/date and evidence provenance; limit calls and retries. |
| Page content extraction fallback | Jina Reader | Extract readable content from an already-discovered public URL when appropriate | Basic unauthenticated Reader usage is available, but rate limits apply. Jina's pricing page labels its “Toy Experiment” token tier as non-commercial. | Optional fallback only. Do not use the non-commercial token tier for customer SaaS workloads. Confirm a commercial-permitted path before use. Reader is not a scraper-bypass tool and must respect site access restrictions. |
| Model routing / optional fallback | OpenRouter | Access alternate models for selected non-critical tasks and development experiments | Free model tier currently lists 25+ models but caps free-model use at 50 requests/day; free tier lacks budgets/spend controls and contractual SLA. | Optional, not the production reliability foundation. Add HIO-side limits and redaction. |
| Model API | Existing reported Groq support; Grok Console / xAI API optional | Bounded analysis/coding; targeted X/web search only when justified | xAI API is usage-billed; current model pricing is token-based and search tools incur separate invocation costs. Do not assume a free API allowance. | Keep Groq and Grok/xAI distinct. xAI remains optional until credential, budget, API behavior, and use-case tests pass. Do not require xAI for every workflow. |
| Isolated BUILD execution | Daytona | Execute generated code, install dependencies, run tests, package prototypes in isolated sandboxes | Pricing page currently advertises $200 free compute; startup credits are eligibility-dependent. Usage is metered; credits are not a permanent free tier. | Required standard build lane. Set max duration, resources, network policy, cancellation, cleanup, per-tenant budget and isolation before customer execution. |
| Transactional email | Resend | Verification, recovery, job-completion and essential notifications | Free tier currently lists 3,000 emails/month, with a 100/day cap. | Approved target. Configure and verify sending domain (SPF/DKIM/DMARC), bounce/error handling, suppression and abuse controls before customer-facing use. |
| Error monitoring | Sentry | Application error/latency diagnostics and release health | Free/developer allowance is quota-limited; confirm current event, retention and privacy settings in the account. | Approved target. Scrub secrets and sensitive content; never capture API keys, auth tokens, private source contents, or sandbox environment values. |
| Payments | Existing Duitku plan, when billing is ready | Customer payment only if the chosen merchant/product flow supports it | Merchant activation, production credentials, payment method, fees, callbacks and refund/reconciliation behavior must be confirmed directly. | Not a blocker for a closed/free MVP test. Required before accepting real paid orders; do not claim Duitku is active without an end-to-end production test. |
| Optional inference | Cloudflare Workers AI | Suitable lightweight classification/extraction/summarization where quality and cost tests pass | Quota/model availability depend on account and current product terms. | Optional. Keep behind the same provider abstraction; do not assume all models or workloads are free. |

## Architecture decision: keep the stack small

### Required for the first end-to-end MVP slice
1. Cloudflare Workers + Pages + existing D1.
2. One verified Apify Actor/source that HIO is permitted to access.
3. Tavily for public-web context/evidence.
4. One configured model provider for a bounded analysis step. Reuse the existing verified provider if it passes; do not require both Groq and xAI.
5. Daytona for one isolated build that creates one useful artifact.
6. A persisted validation experiment and outcome in HIO.

### Approved but optional / add when the feature needs it
- R2: when file artifacts need durable private storage.
- Resend: before email verification/recovery/notifications are enabled.
- Sentry: before a broader beta; configure data scrubbing first.
- Jina Reader: extraction fallback only, and only under commercial-permitted terms.
- OpenRouter: development/fallback adapter, not a promise of always-free inference.
- Grok Console / xAI API: targeted capability when it outperforms the current provider enough to justify cost.
- Workers AI: task-specific inference alternative.
- Duitku: only for the paid transaction milestone.

Do not add a separate vector database, workflow platform, analytics vendor, second web-search vendor, or second sandbox vendor for the first slice. Start with D1 metadata and provenance references, deterministic deduplication, a bounded workflow, and Daytona. Add a vector store or durable workflow engine only after measured workload or reliability requirements demonstrate the need.

## Free-tier and commercial-use guardrails

- Free-tier quotas are development/early-beta budgets, not unlimited production capacity or uptime guarantees.
- A provider may allow basic/personal experimentation but restrict a particular API, model, data use, or tier for commercial use. Jina's current pricing page explicitly labels its Toy Experiment token tier “Non-commercial use only”; do not use that tier for customer-facing workflows.
- OpenRouter free models have strict daily limits and no spend controls. Enforce limits in HIO regardless of provider.
- xAI tool calls can add charges beyond model token usage. Use an explicit feature flag and per-job budget.
- Apify Actor pricing and source coverage differ. Cap Actor runtime, results, retries, concurrency, and per-workspace spend.
- Daytona credits run out; sandbox resources must be metered and stopped.
- Cloudflare Free limits can cause service errors after quota exhaustion. Instrument usage and degrade gracefully.
- Store provider credentials only as server-side secrets in the correct environment. Separate development, preview, and production credentials where supported. Never put secrets in GitHub, client-side code, build artifacts, or logs.
- Maintain provider-neutral interfaces and normalized usage records: provider, model/Actor, operation, workspace, request/job ID, estimated/actual units and cost when available, status, timestamp, retry count, and source provenance.
- Avoid forwarding private customer content to optional providers by default. Minimize and redact payloads; disclose processors and retention in privacy terms before commercial launch.

## Non-provider requirements still required before calling HIO a commercial SaaS

The external provider list is sufficient for an MVP; these application and operational gates remain essential:

1. Customer identity, secure sessions, tenant isolation, roles, and account recovery. Existing founder/owner authentication must not be assumed to be a finished customer multi-tenant identity system.
2. Per-tenant usage ledger, quotas, rate limits, provider budget caps, idempotency, cancellation and safe retries.
3. Secure Daytona execution with resource limits, restricted network egress, artifact scanning/packaging, and cleanup.
4. Data lifecycle: privacy notice, source attribution, retention/deletion/export, private artifact authorization, and backup/restore evidence.
5. Monitoring and incident handling, with sensitive data scrubbed from telemetry.
6. Clear beta terms, support/contact path, accurate feature/usage disclosures, and a plan for provider quota exhaustion.
7. If taking payment: verified merchant/payment configuration, callback signature validation, idempotency, reconciliation, refund handling, and a tested successful/failed payment flow.
8. End-to-end acceptance evidence for FIND → human-approved BUILD → artifact delivery → VALIDATE outcome, including actual cost for the complete workflow.

## Verification checklist

Record one state per provider: NOT_CONFIGURED, OWNER_REPORTED_READY, CONFIGURED_UNVERIFIED, CONNECTED_TEST_PASS, CONNECTED_TEST_FAIL, or DISABLED.

- [ ] Confirm a key exists as a secret in the intended environment without printing or retrieving its value.
- [ ] Confirm provider account/project, key scope, rate limit and commercial terms.
- [ ] Run a minimal non-sensitive capability test.
- [ ] Record status code, latency, usage/cost, request ID, and sanitized outcome.
- [ ] Test invalid key, timeout, rate limit, provider failure, cancellation, and retry behavior.
- [ ] Verify per-tenant limits and that secrets/data do not cross tenant boundaries.
- [ ] Verify monitoring redaction and deletion/retention behavior.
- [ ] Complete one real end-to-end MVP workflow and record actual cost.

Owner-reported credential approval/saving is not enough to mark a provider CONNECTED_TEST_PASS. Do not put credential values or fragments in this register.

## Official references checked for this decision

- Cloudflare Workers limits: https://developers.cloudflare.com/workers/platform/limits/
- Cloudflare D1 pricing: https://developers.cloudflare.com/d1/platform/pricing/
- Cloudflare R2 pricing: https://developers.cloudflare.com/r2/pricing/
- Apify pricing: https://apify.com/pricing
- Tavily docs: https://docs.tavily.com/
- Jina Reader and rates/terms: https://jina.ai/reader/
- OpenRouter pricing and limits: https://openrouter.ai/pricing
- xAI model pricing: https://docs.x.ai/developers/models
- xAI tool pricing: https://docs.x.ai/developers/pricing
- Daytona pricing: https://www.daytona.io/pricing
- Resend pricing: https://resend.com/pricing
- Sentry pricing: https://sentry.io/pricing/

## Final decision

**No additional external provider is required to begin the first HIO MVP slice.** Proceed with the chosen stack, verify every connection, and build/test the end-to-end workflow. Keep public paid launch blocked until customer identity/tenant isolation, usage and cost controls, privacy/security, recovery, support, and payment acceptance (if enabled) are proven by tests. This register is a design and verification standard, not evidence that credentials have been connected or that the software has been commercially launched.
