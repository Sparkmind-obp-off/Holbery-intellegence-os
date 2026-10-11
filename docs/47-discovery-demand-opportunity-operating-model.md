# HIO 0.2 — Discovery, Demand, Opportunity, Decision

Updated 2026-10-11. This document distinguishes shipped behavior from future capabilities. HIO is a governed evidence-to-decision workbench, not an autonomous buyer, scraper or outreach engine.

## Operating cycle

1. **Research brief:** question, buyer segment, geography, problem and payer hypothesis.
2. **Discovery:** plan queries and choose authorized sources. Record coverage, timestamps and missing channels; discover where to observe, not just what is trending.
3. **Collection:** bounded approved connector captures observations with original references and method. Normalize, deduplicate reposts and preserve original independent origins.
4. **Demand:** extract pain, job, frequency, urgency, workaround, cost and commercial intent. Separate source statements from model interpretations. Discussion/likes/search interest do not establish willingness to pay.
5. **Opportunity:** compare user/buyer/payer, alternatives, switching costs, reachability, delivery feasibility, price/cost and regulation. Keep unknowns and contradictory evidence visible.
6. **Decision:** named human chooses research, hold, reject or a bounded test. Market entry/outreach needs a separately authorized channel, evidence review, budget, expiry and stop criteria.
7. **Learning:** pre-register test criteria; preserve negative outcomes, actual costs and what changed in the hypothesis.

This is the existing Source → Run → Evidence → Cluster → Dossier → Decision → Experiment → Learning architecture with an explicit front-door research question. AI is a possible assistant at specific bounded steps, not the decision owner.

## Gap analysis and shipped response

| Gap | Shipped in 0.2 | Not shipped |
| --- | --- | --- |
| No explicit market question/segment before fixture collection | `/intelligence` persists strict brief and deterministic versioned research plan in D1 | Live source search or evidence ingestion from briefs |
| Demand and opportunity conflated | Separate query, pain/commercial-intent questions, counter-evidence, payer/economics unknowns and decision gates | Demand prediction, market-size inference or market ranking |
| Connector selection could imply permission | Manual/Apify/custom API candidate produces a disabled, no-grants, review-required blueprint | Provider connection, custom API upload parser or activation |
| Fixture score could be mistaken for market validation | New plans have evidenceCount=0, D0 hypothesis, score=null, research-only, executionEnabled=false | Real-source promotion into the evidence ladder |
| Cloud preview quota blocked page publication | Owner explicitly permits one HIO production D1/direct production; guarded locked/setup-only publication | Second D1, DNS changes or paid upgrades |

The planner is a deterministic template, **not model inference**. It never invokes external tools, enables a plugin, sends outreach, moves plans into evidence or changes approvals. A brief is immutable planning history; list limited to latest 50. Retry of POST is not idempotent: inspect the list after an interrupted response. Do not enter secrets, personal data or sensitive commercial records. Research-brief deletion/retention workflow is not yet implemented; current durable plans persist until a separately reviewed lifecycle change.

## Source strategy and evidence quality

Use multiple complementary source classes after authorization:

- Search/trend signals: topics, vocabulary and seasonality; relative interest is not sales volume.
- Public reviews/forums: concrete pain and alternatives; check permission, selection bias, identity independence and reposts.
- Official product/pricing/company data: existing supply and substitutes; not proof that a specific payer will buy.
- Owner-authorized interviews, opt-in enquiries and own transaction data: stronger intent/behavior; privacy and provenance review required. No Commerce/Bozq data reuse is authorized.
- Jobs/procurement/regulatory/statistical sources: constraints and organizational investment; evaluate freshness, geography and accessibility.

Do not sum mentions as independent buyers. Separate freshness, source independence, behavioral evidence and commercial feasibility. Any future scoring must show inputs, weights, missing dimensions and counter-evidence, and be calibrated against outcomes. Existing fixture support ratio remains fixture-only and is not repurposed as a market score.

## AI-assisted activities — implementation contract, not current execution

A bounded future AI run receives a versioned brief and approved evidence IDs. It may suggest queries, classify pain, cluster observations or draft a dossier. Output must use a strict schema: claims with evidence IDs, fact/interpretation/hypothesis labels, unknowns, counter-evidence, provider/model/prompt version, run ID and reviewer state. Reject unsupported citations and malformed output. Treat source/tool descriptions as untrusted data, never instructions or grants.

Before activation require server-only credentials, owner-approved token/cost caps, input minimization, evaluation fixtures (hallucination, injection, conflicting evidence), retry/timeout caps, and kill switch. A model cannot approve its own tool calls, spending, outreach or market entry. No model/provider selected or credentials generated in this release.

## Plugin / MCP / custom API design

Core policy → reviewed typed adapter → allowlisted provider tools → validated observation envelope → durable run/provenance. Plugin manifests declare requested capabilities; install has zero grants. Human activation is distinct from candidate discovery.

### Apify candidate

Official documentation offers hosted `https://mcp.apify.com` with Streamable HTTP/OAuth. A Cloudflare runtime cannot spawn local stdio/npx servers. Initial candidate tool set: `search-actors`, `fetch-actor-details`, `search-apify-docs`, `fetch-apify-docs`. These discover tools/documentation; their results are **not market evidence**. Do not rely on default categories, which include execution-capable tools. Loading an Actor can implicitly load run/storage/abort tools; review the effective set, not just the URL.

Actor execution/storage access requires authorization and may charge money. No Actor execution, agentic payment or telemetry integration is enabled. If later approved: inspect Actor input/output, pricing and source terms; pin tools/schema, use bounded jobs and poll requests rather than long-running server work; cap records/time/cost, handle 429, audit and revoke. Review telemetry opt-out. Discovery does not authorize scraping.

### Custom MCP from an “API file”

The phrase may mean an API/OpenAPI contract, or Apify; do not assume they are identical. A future upload workflow must accept a bounded schema-only file, not execute code. Extract operation IDs, purpose, fixed HTTPS origins, allowed paths/methods, pagination, input/output types and credential references. Strip embedded credentials and reject unresolved external `$ref`, private/local addresses, dynamic origins and execution commands. First version should expose reviewed read-only operations only; no generic URL fetch/proxy.

An owner reviews a proposed manifest and data policy. Developer implements a first-party adapter with secret lookup only on the server, redirect rejection, exact egress allowlists, time/bytes/records/cost caps, response validation and provenance mapping. Test fixture → explicit grants → enable → per-call authorization → audit → revoke. File import/remote MCP transport are not implemented in 0.2; the current planner only records their review checklist.

### Security requirements for remote MCP

Validate protocol version and compatible transport. Use minimal scopes, token audience validation and per-client consent; never pass an inbound operator token through to providers. Validate authorization/discovery endpoints and redirects, block localhost/private/link-local/metadata destinations and dangerous schemes. Use fixed approved origins and egress protections rather than arbitrary metadata-driven fetching. Tool output cannot grant permissions. Registry changes invalidate review; disable must block the next call. Never cache unauthenticated private results or expose secrets through schema/logs/errors.

## Release and next acceptance gates

Software publication does not equal authenticated operational readiness. A locked production shell returns 200; health intentionally returns 503 when owner secrets are absent; private APIs and `/secrets` return 401; login returns 503. No private data becomes public. Owner later sets independent OPERATOR_SECRET and SESSION_SECRET directly in Cloudflare/vault and redeploys before authenticated production smoke.

Priority after unlocking: implement one authorized read-only observation connector and ingestion tests; then evidence-linked extraction with evaluated AI under approved budget; then reviewed remote MCP interoperability; finally real-market decision/testing gates. Do not add more platform tools before one end-to-end real-source provenance chain is verified.

## Research references (accessed 2026-10-11)

- [Apify MCP official documentation](https://docs.apify.com/integrations/mcp): hosted transport, unauthenticated discovery/docs tools, execution authentication, implicit tools, telemetry and cost-sensitive operations.
- [MCP security best practices](https://modelcontextprotocol.io/docs/tutorials/security/security_best_practices): confused deputy, consent, no token passthrough, SSRF, scope minimization and state-handle authorization.
- [Google Trends data FAQ](https://support.google.com/trends/answer/4365533?hl=en): sampled/normalized relative search interest, noise and non-poll limitations. Search interest is one signal among others, not purchase validation.

These are architectural references, not evidence of a market opportunity for HOLBERY.


## Product direction synchronization (2026-10-12)

HIO's target is an evidence-to-execution business workspace, not a generic chatbot. This target does not imply shipped parity. Use docs/50 for capability states and release truth, docs/51 for Genspark/G2 benchmark, docs/52 for target architecture, docs/53 for production/commercial gates, and docs/54 for market validation. Keep fixtures distinct from live data. Production login remains blocked pending secure Owner configuration of distinct OPERATOR_SECRET and SESSION_SECRET values and verified authenticated production tests.
