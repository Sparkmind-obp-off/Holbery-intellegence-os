# HOLBERY Public Market Engine — FIND / BUILD / SELL

**Decision status:** Product direction proposed for implementation review  
**Brand:** HOLBERY only  
**Product descriptor:** HOLBERY Market Discovery (working descriptor, not a new brand)  
**Reference concept:** Adopt ORDVELA's demand-discovery and evidence-to-opportunity workflow  
**Implementation status:** This document defines the product direction; it does not claim that public registration, multi-user tenancy, billing, publishing, or every social-network connector is already shipped.

## 1. Executive decision

HOLBERY should evolve from a founder-first private workspace into a **public-first market discovery product**. The founder is the owner/operator of the product, not the only intended user.

Adopt ORDVELA's useful workflow and code patterns under HOLBERY. Do not launch or market ORDVELA as a separate brand. During the transition, keep the ORDVELA repository, runtime, credentials, and data isolated until capability mapping, security review, and migration gates are complete. Reuse behavior through reviewed adapters or a deliberate migration—not an unreviewed repository/database merge.

The product promise:

> Find real problems in real markets, turn the strongest evidence into product opportunities, and help people validate and sell a solution.

The primary product flow is three stages:

1. **FIND** — discover real public market signals and evidence.
2. **BUILD** — turn evidence into a defensible opportunity and a testable product/offer.
3. **SELL** — prepare and validate an offer, distribute it through approved channels, and measure actual outcomes.

These are three workspaces in one HOLBERY product, not three separate products or brands.

## 2. Public-first means two distinct surfaces

### Public website — no account required to understand the product

The public front door should explain the outcome, show a safe interactive example, disclose what sources are actually supported, and let a visitor start a discovery. It should not expose private user research, provider credentials, raw diagnostics, or other workspaces.

Recommended landing-page hierarchy:

- Headline: **Temukan masalah nyata. Bangun solusi yang dibutuhkan. Uji apakah orang mau membeli.**
- Short explanation of FIND → BUILD → SELL.
- A small sample discovery with visible original source links, dates, and clear labels saying whether data is live or illustrative.
- Source coverage and limitations: supported, requires user authorization, unavailable, or planned.
- Primary action: **Mulai discovery**.
- Secondary action: **Lihat contoh hasil**.
- Plain-language privacy and data-use explanation.

The demo must be visibly labelled. Never present fixtures or a curated example as a live search result.

### Signed-in workspace — users own their work

Visitors may inspect a limited demo without signing in. Creating, saving, rerunning, exporting, or connecting private work requires an account and a workspace.

Recommended first public identity flow:
- Email one-time code or magic link; avoid requiring users to invent and remember another password.
- Verify email before creating a durable account.
- Separate user identity from workspace membership and role.
- Support owner, member, and read-only roles from the beginning, even if the first release only exposes owner-created workspaces.
- Account recovery and session revocation must be self-service and safe.
- Keep the founder/operator's platform administration separate from ordinary customer accounts.
- Do not use one shared operator password as the public sign-in mechanism.

Email delivery provider, anti-abuse controls, rate limits, session storage, and domain configuration must be selected and tested before public registration is enabled. Do not collect email addresses until the registration flow is operational and its privacy notice is ready.

## 3. The three-stage product

### Stage 1 — FIND

**User question:** “What are people struggling with, asking for, or trying to solve?”

Core flow:
1. Choose a market, audience, geography, language, and problem theme.
2. Choose approved sources or accept a clearly explained source plan.
3. Search or collect a bounded set of observations.
4. Review the original post/page/snippet, source, URL, timestamp, and retrieval date.
5. Group related observations without collapsing independent sources into one.
6. Extract problem, affected person, urgency, frequency, workaround, alternatives, and possible buying intent.
7. Show supporting evidence, counter-evidence, missing coverage, and next research questions.

The interface should be simple: one research question, optional audience/location, source selection, then **Temukan bukti**. Advanced filters can live behind an expandable control.

Each result must show:
- Original source link and platform.
- Source publication time where provided, and collection time separately.
- Exact excerpt or faithful extract, not an invented paraphrase presented as a quote.
- Evidence label: direct observation, source-authored claim, AI interpretation, or hypothesis.
- Independent-source/repost handling.
- Why the result may matter, plus confidence limitations.

**Current HIO capability to preserve:** the repository describes live web research through Tavily, Firecrawl, and Apify, with Groq-assisted analysis, bounded provider calls, daily caps, provenance, counter-evidence, and guarded conclusions. This is a foundation for FIND, not proof that every social platform is connected.

**ORDVELA capabilities to evaluate for adoption:** existing Meta/Threads/Facebook/Instagram adapters, Apify actor workflows, provider registry and quotas, evidence deduplication, and demand-to-opportunity logic. Their code, current deployment, access rights, provider permissions, live credentials, source terms, and production state must be verified before calling them active in HOLBERY.

Source states must be explicit:
- Live and verified
- Connected but not currently verified
- Requires user authorization
- Discovered candidate, not enabled
- Unavailable or blocked
- Planned, not implemented

Never imply that a platform's public posts can all be collected. Use official APIs, approved access, licensed search/index providers, or specifically reviewed public-source adapters. Respect platform terms, privacy, rate limits, and deletion/retention obligations. No login-wall bypass, private-group scraping, unauthorized collection, or mass-contact automation.

### Stage 2 — BUILD

**User question:** “Which problem is worth solving, and what is the smallest product I can test?”

Turn a selected evidence cluster into an opportunity card with:
- Target user, buyer, and payer hypothesis.
- Problem, urgency, frequency, current workaround, and alternatives.
- Evidence strength, independent sources, recency, counter-evidence, and gaps.
- Competitors/substitutes and what would make the proposed solution distinct.
- Proposed solution type: digital product, template, service, workflow, software, or physical product.
- Price hypothesis, delivery effort, estimated costs, and unknowns.
- One recommended low-cost validation experiment with success and stop criteria.

Use explicit states: **Hypothesis → Evidence gathered → Ready to test → Tested → Validated / Rework / Rejected**.

Do not collapse these states into a single AI score. If a score is later introduced, show the factors, missing evidence, counter-evidence, and calibration status. Social mentions, likes, search interest, or AI confidence are not equivalent to willingness to pay.

Build outputs should initially be practical and lightweight:
- Product/offer brief
- Buyer/problem statement
- Minimum viable deliverable outline
- Landing-page or listing copy draft
- Experiment plan and result template
- Evidence-linked decision record

The user approves material decisions. AI may prepare a draft; it must not silently launch a product, spend money, contact people, or publish externally.

### Stage 3 — SELL

**User question:** “How do I test the offer, get it in front of the right people, and know whether it worked?”

Start with assisted selling, not an unbounded autonomous sales agent:
- Draft an offer, price hypothesis, listing, landing page, FAQ, and ethical promotion assets.
- Let the user choose and approve a distribution channel.
- Record channel, date, offer version, audience, costs, clicks/enquiries where available, sales, refunds, delivery effort, and objections.
- Separate draft, approved, published, and measured states.
- Support manual links/exports before direct integrations are available.
- Add marketplace, storefront, payment, and analytics integrations only after the connector and account permissions are verified.

A product is not “validated” because a page was generated or published. Use observed behavior such as qualified enquiries, preorders, paid pilots, completed purchases, repeat use, refunds, and fulfilment economics. Keep absent metrics marked unknown.

Publishing, paid campaigns, sending messages, purchases, and other external side effects require a clear preview and explicit user approval. No spam, fabricated testimonials, fake scarcity, or unauthorized bulk messaging.

## 4. Navigation and screen design

Keep the public navigation small:

- **Discover** — start a search and browse evidence.
- **Opportunities** — review and compare evidence-backed problems.
- **Build** — shape a solution and plan a validation experiment.
- **Sell** — prepare offers and review channel/outcome performance.
- **Workspace settings** — account, members, data sources, privacy, exports.

The marketing website and signed-in product share the HOLBERY identity but are different routes and states. Owner maintenance is a separate, restricted destination and must not appear as ordinary customer navigation.

### First screen after sign-in

Show:
- A prominent discovery input.
- Recent research and saved opportunities.
- Three compact stages with clear progress.
- One helpful next action.
- A transparent usage/limit indicator when relevant.

Avoid:
- Raw provider names, internal IDs, database details, logs, API terminology, secrets, and engineering status in customer-facing screens.
- A wall of charts before the user has data.
- Fake metrics, simulated market trends, or empty “AI score” badges.
- A generic chatbot as the only entry point.

Use Bahasa Indonesia by default, with a future-ready path to English. Keep wording plain, calm, premium, responsive, and accessible. The UI must show real source links and explain limitations in the language of the user's decision.

## 5. Product architecture and responsibility boundaries

Keep the existing Cloudflare-based foundation unless measured requirements justify a change. Separate these responsibilities logically, even if they initially run in one application:

1. **Presentation** — public landing page, account flow, FIND/BUILD/SELL workspaces.
2. **Intelligence** — query planning, evidence classification, deduplication, clustering, opportunity analysis, and uncertainty.
3. **Execution** — connector calls, bounded jobs, retries, approval checks, quotas, rate limits, and kill switches.
4. **Data** — users, workspaces, memberships, research briefs, source receipts, evidence, opportunities, experiments, offers, outcomes, and audit trail.
5. **Identity and policy** — verified accounts, workspace isolation, role-based authorization, sessions, user consent, and provider grants.
6. **Maintenance** — diagnostics, provider configuration, deployment/recovery, and secrets; restricted to authorized operators.

Use provider adapters and a canonical observation envelope so that a source can be replaced without rewriting the entire product. Each observation should preserve source/provider, original URL or stable identifier, source time, retrieval time, excerpt/payload reference, workspace, run receipt, licence/permission state, and deduplication lineage. Keep large/raw payload retention minimal and policy-aware.

### Multi-user isolation is a launch gate

The current HIO is an authenticated owner workspace, not yet a proven multi-tenant public SaaS. Before public customer data is accepted:
- Add explicit user and workspace identity and enforce workspace scoping on every read/write.
- Test cross-workspace IDOR and unauthorised object access.
- Ensure caches, exports, background jobs, provider receipts, and logs cannot leak data between workspaces.
- Set per-user/workspace quotas and abuse protection.
- Add account deletion/export and documented retention behavior.
- Add privacy-safe audit events and incident/revocation controls.
- Do not expose the owner's maintenance or secrets screens to customers.

Do not turn off existing authentication to make the product “public.” Public-first means the website and signup are open to visitors; private workspace data remains authenticated and authorized.

## 6. Source and provider strategy

Use a source registry with capability, access mode, evidence type, freshness, cost, terms review, and last verification.

Initial order:
1. Preserve and verify HIO's existing live web-search/research path.
2. Audit ORDVELA's existing adapters and adopt only the capabilities that pass current tests, source-policy review, and live verification.
3. Prioritize one or two source classes that produce useful, traceable results over claiming “all social media.”
4. Add connectors incrementally, each with fixed allowed operations, least-privilege credentials, request/record/time/cost caps, safe error mapping, receipts, and a kill switch.
5. Keep all new provider integrations disabled until access, terms, pricing, quota, and output mapping are reviewed.

A successful HTTP response is not sufficient proof of useful evidence. Acceptance requires valid original references, correct timestamps where available, no fabricated excerpts, deduplication, failure handling, and a source-quality review.

## 7. Monetization model — hypothesis, not launch claim

Do not lock pricing before usage and cost are measured. Begin with a transparent free trial/limited discovery experience, then test paid tiers only after public account isolation, quotas, provider costs, and retention are reliable.

Potential packaging, subject to validation:
- **Free:** sample demo and a small number of bounded discoveries.
- **Solo:** higher discovery allowance, saved opportunities, and exports.
- **Team:** shared workspaces, members, and collaborative review.
- **Advanced:** additional approved source capacity and workflow integrations only where provider cost and permissions support it.

No price, usage allowance, or paid feature should be published until the cost per completed discovery, model/provider spend, abuse exposure, and support burden are measured. Paid distribution/payment integration is a later gate, not a prerequisite for designing the product.

## 8. Phased implementation plan

### Phase 0 — Product and capability truth
- Reconcile HIO main, current production deployment, and the prior HIO UX PRs before changing code.
- Inventory ORDVELA repository capabilities and current deployment without changing its production resources.
- Mark every capability as verified live, implemented but unverified, fixture/mock, planned, or blocked.
- Identify any existing public custom domain and verify its current routing before changing DNS or domain bindings.
- Produce a screen map and source capability matrix.

### Phase 1 — Public product shell
- Create a public landing page and honest sample discovery.
- Separate public marketing routes from authenticated workspaces.
- Establish the HOLBERY design system and FIND/BUILD/SELL navigation.
- Preserve existing private founder access and maintenance boundary.
- No public signup until identity and workspace isolation are ready.

### Phase 2 — Public accounts and workspace safety
- Implement verified-email sign-in, account recovery, workspace membership, roles, and session revocation.
- Implement per-workspace data scoping and tests across all private routes and background operations.
- Add quotas, abuse controls, data export/deletion, and retention policy.
- Perform security tests before onboarding external users.

### Phase 3 — FIND public beta
- Ship a bounded, real-source discovery workflow with traceable evidence and visible limitations.
- Add source status and per-run receipts.
- Add user feedback for relevance, duplicate, stale, or low-quality evidence.
- Keep source connections opt-in and safe by default.

### Phase 4 — BUILD workflow
- Create evidence-linked opportunity briefs and product/offer drafts.
- Add reversible experiments, explicit success/stop criteria, and immutable outcomes.
- Evaluate quality against real, reviewed evidence.

### Phase 5 — SELL workflow
- Add offer/listing assets and user-approved distribution.
- Record actual outcomes and costs.
- Integrate payment/marketplace/analytics systems only after verified permissions and a scoped connector plan.

### Phase 6 — Pricing and scale
- Measure provider cost, value per discovery, retention, repeat usage, and paid intent.
- Introduce validated tiers and commercial terms.
- Scale sources and automation only when evidence, permissions, security, and unit economics justify it.

## 9. Acceptance gates

The public product is not launch-ready until all applicable gates pass:

- Anonymous visitor can understand HOLBERY and view a clearly labelled example.
- Signup and recovery work without a shared operator password.
- User A cannot read, modify, export, or infer User B's private data.
- Every displayed market observation links to a traceable source or is labelled as a hypothesis.
- Live data, fixture data, AI interpretation, and unknowns are visibly distinct.
- Provider cost/limits and source permissions are enforced server-side.
- External actions require explicit approval and have an audit receipt.
- A discovery can be repeated safely without duplicate records or uncontrolled spend.
- Account deletion/export and data-retention behavior are documented and tested.
- Public UI contains no internal secrets, raw diagnostics, or private operator controls.
- Release notes state exactly what is live and what is not.

## 10. Brand and migration policy

- **HOLBERY** is the only outward-facing brand in this direction.
- “HOLBERY Market Discovery” is a descriptive product label, not a new standalone brand.
- “ORDVELA” remains an internal repository/asset codename during migration only; do not create new standalone marketing pages or domains for it.
- Do not delete the ORDVELA repository, domain, data, or deployment as part of this product decision.
- Do not copy credentials, private data, or production records between projects.
- Do not change HOLBERY Commerce or Bozqu Cukur / Bozq One System; those remain protected, separate projects.
- Any production resource, domain, identity, database, or secret migration requires a separate reviewed plan, backup/rollback, tests, and explicit authorization.

## 11. Decision summary

**Product direction:** HOLBERY public-first market discovery and opportunity-to-revenue workspace.

**Core workflow:** FIND → BUILD → SELL.

**Reuse:** HIO's verified real-source research, evidence provenance, approvals, and safe provider execution; ORDVELA's reviewed demand discovery, provider registry, and opportunity workflows where verified.

**Do not claim:** all social platforms connected, every result live, public SaaS readiness, product-market fit, validated demand, or revenue without the corresponding evidence.

**Next engineering action:** complete Phase 0's read-only capability/resource reconciliation, then implement the smallest safe Phase 1 slice without disrupting the working research engine or protected projects.
