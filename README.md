# HOLBERY Intelligence OS

**Version:** 0.1.0 — implemented, fixture-only internal MVP.
**Repository:** https://github.com/Sparkmind-obp-off/Holbery-intellegence-os
**Release status:** local runtime/browser verified; Cloudflare BYOK **BLOCKED — NOT DEPLOYED**. No approved HIO cloud project/database/production secrets were identified. Existing repository visibility remains PUBLIC; application records require operator authentication.

> **Doctrine: evidence before exposure.** Code completion and synthetic fixtures are not business validation.

## What actually works

A persisted vertical slice: `Source registry → bounded fixture collection → normalize → deduplicate → evidence/provenance → fixed cluster → opportunity dossier → human decision → approved zero-cost fixture experiment → outcome/learning`.

- Responsive self-hosted operator UI, loading/empty/error/success states, request IDs and `/manual`.
- Hono API, strict TypeScript/Zod input validation, D1 migrations and transactional writes.
- Source enable/disable, explicit permission basis and 30-day fixture retention.
- Four-record connector with three unique synthetic observations and one repost; failure/rate-limit fixtures; identical-key retry replay and conflicting-payload rejection.
- Evidence hashes, timestamps, provider/method, quality, linked duplicate provenance and expiry filtering.
- Supporting/counter-evidence dossier, visible unknowns and deterministic explainable **fixture score**, not a commercial opportunity ranking.
- Append-only human decisions with rationale, reviewer notes, named operator, review date and evidence snapshot.
- Latest unexpired fixture approval required for experiment; criteria/stop rules, zero IDR budget, immutable outcome and learning. Nothing launches, spends or sends messages.
- Exact reviewed built-in manifests, install disabled with no grants, explicit grants, disable/revoke, audit and bounded outputs.
- Read-only local MCP-style JSON-RPC fixture adapter: allowlisted `evidence.list`, authentication, permission checks, validation and audit. **Not a remote MCP client/server interoperability implementation.**
- Fail-closed operator authentication, signed/revocable expiring sessions, SameSite/HttpOnly cookies, CSRF origin/header checks, rate limits, CSP and safe audit metadata.

## Local quick start

Requires Linux/macOS, Node >=22.16, npm, PM2 for sandbox preview. Windows Cloudflare native build compatibility is not claimed.

```sh
npm ci --ignore-scripts
node scripts/init-local.mjs
npm run db:migrate:local
npm run check
pm2 start ecosystem.config.cjs
curl http://localhost:3000/api/health
```

The generator writes random **local-only** secrets to ignored `.dev.vars` with mode 0600, never prints values. Configure a credential known to your operator in that local file or your own development secret store; never commit/share it. `OPERATOR_SECRET` and `SESSION_SECRET` must each be >=32 characters. `OPERATOR_NAME` names the internal operator. No browser localStorage secrets.

Sign in, install `hio.fixture`, explicitly approve `fixture.read`, enable the fixture source, collect, inspect dossier, record a decision, define a fixture experiment, and record outcome. Install `hio.mcp-fixture` and grant `evidence.read` separately to test the local tool. The end-to-end harness disables both plugins/source when finished.

## Routes and contracts

UI: `/`, `/sources`, `/runs`, `/evidence?q=...`, `/clusters`, `/opportunities`, `/decisions`, `/experiments`, `/plugins`, `/settings`, `/manual`.

- Public readiness: `GET /api/health` (200 only when DB migrations and authentication config are ready).
- Sessions: `POST /api/session` with `{secret}`, `DELETE /api/session`. Mutations require matching `Origin`, `X-HIO-Request: operator`, and a signed session except login.
- Private `/api/v1`: `me`, `summary`, `sources` (GET/PATCH `:id`), `plugins` (GET/POST/PATCH `:id`), `runs` (GET/POST), `evidence` (GET; `q`, `offset`, page size 25; GET `:id`), `clusters` (GET), `opportunities` (GET; GET `:id`), `decisions` (GET/POST), `experiments` (GET/POST; POST `:id/outcome`), `mcp/call` (POST), `audit` (GET latest 50), `settings` (GET; POST `settings/purge-expired`). History lists are bounded to latest 50; overview counts use server aggregates.
- Detailed strict schemas and enums: `src/contracts.ts`. Errors: `{error:{code,message,requestId}}`. Source/tool content is untrusted data, not authorization.

## Data and rollback

D1 is the only durable application store. `0001_core.sql` creates sources, plugins/grants, runs, evidence, provenance, clusters/memberships, opportunities, decisions, experiments, audit and rate counters. `0002_sessions.sql` adds revocable hashed sessions. No other project's database is accessed.

Local binding uses all-zero ID and `hio-local`; this is not a production resource. Evidence content expires after 30 days, is excluded from reads and can be minimized by an operator purge. ID/hash/provenance and governance records remain; full real-provider deletion policy is NOT implemented. Decision/outcome records are immutable. Expired sessions are removed on subsequent login.

Tests exercise transactions, concurrent idempotency and an actual SQLite snapshot restore with evidence/provenance. Wrangler local migrations applied successfully and repeat application reports no migrations. Production migrations/backup/RPO/RTO have not been validated. Roll back application to a schema-compatible deployment and retain additive schema; forward-fix rather than dropping populated production tables. Use D1 backup/Time Travel only after target ownership and restore procedure are approved.

## Tests

```sh
npm run check               # typecheck, lint, formatting, 29 tests, production build
npm audit                   # 0 vulnerabilities at release review
npm run security:check      # configured-secret and recognized-token heuristic scan
npx playwright install --with-deps chromium
npm run test:e2e            # localhost ONLY; requires running Wrangler + .dev.vars
```

E2E exercises actual local Wrangler/D1 and Chromium UI workflow, 11 routes with axe WCAG smoke, mobile viewport/keyboard, logout and disabled-plugin/tool cases. Screenshots are ignored test artifacts, not proof of cloud deployment. Full manual accessibility certification, remote MCP/AI/provider tests, production migrations and production smoke are not claimed. See [verified audit](docs/implementation-status-and-audit.md) for commands, failures/fixes and release evidence.

## Deployment — BYOK gated

Cloudflare token/account inspection succeeded, but there is no existing HIO Pages project, dedicated D1 binding, production operator identity or deployment configuration. Parent HOLBERY/Bozq resources are intentionally untouched. No CI, DNS/custom domain, resource creation, paid integrations, or remote migration was introduced.

Owner must authorize dedicated HIO Pages/D1 resources (isolated preview and production), additive remote migrations and private credentials. Then record actual project/account/D1 IDs in the config and project metadata; set secrets through Cloudflare platform storage, not code. Keep preview DB isolated. `npm run deploy` fails closed on local-only config. The guarded script requires approved existing resources, platform-secret names, clean git tree, reviewed remote schema and explicit release flags. It never creates resources or applies remote migrations. Deploy preview first, verify health/auth/workflow, then separately approve main production and verify actual URL/ID. A GitHub push is not a deploy.

**Production URL/ID:** none. Temporary sandbox preview: https://3000-i4iy2xulzlnyzo6tm3kbl-2e1b9533.sandbox.novita.ai (login-gated, ephemeral; not Cloudflare production).

## Limitations and highest-value next step

No real source collection, AI analysis/embeddings, automatic retries/jobs, remote MCP transport, third-party plugin execution, marketplace, multi-user SSO/RBAC, export, real-world experiment activation, outreach, payments, or commercial validation. One internal workspace/operator only. Shared login quota can be exhausted by an attacker; add edge abuse controls and team identity before wider use. Manifest execution budgets describe the bounded built-in fixture; no arbitrary runtime sandbox or remote timeout guarantee exists.

**Next:** authorize isolated private HIO preview provisioning and secret management; deploy and validate this tested slice there before implementing a real, terms-reviewed connector.

## Architecture and specifications

All 45 original documents remain preserved. Their roadmap proposals are not claims of shipped capabilities. Material implementation decision: [ADR 0001](docs/adr-0001-fixture-first-edge-monolith.md). Release evidence: [implementation audit](docs/implementation-status-and-audit.md).

Start with [charter](docs/00-project-charter.md), [principles](docs/01-strategy-principles.md), [architecture](docs/02-system-architecture.md), [evidence model](docs/04-evidence-model.md), [data model](docs/05-logical-data-model.md), [source governance](docs/06-source-governance.md), [scoring](docs/07-opportunity-scoring.md), [market-test gate](docs/08-market-test-gate.md), [technology decisions](docs/10-technology-decisions.md), [security](docs/11-security-privacy.md), and [testing acceptance](docs/13-testing-acceptance.md).

Product/full-stack details: [North Star](docs/16-product-north-star.md), [scope](docs/17-product-scope-and-personas.md), [UX](docs/18-ux-information-architecture.md), [frontend](docs/19-frontend-architecture.md), [API](docs/20-backend-api-architecture.md), [lifecycle](docs/21-database-and-data-lifecycle.md), [connectors](docs/22-integrations-and-connector-contract.md), [prompt security](docs/23-ai-evaluation-and-prompt-security.md), [privacy](docs/24-privacy-and-compliance-matrix.md), [design](docs/25-design-system-and-content-language.md), [learning](docs/27-experiment-and-learning-architecture.md), [release gates](docs/28-environments-deployment-and-release.md), [requirements](docs/30-product-requirements-and-acceptance.md), [runbook](docs/32-operator-runbook.md), and [readiness](docs/33-product-readiness-checklist.md).

Plugin/MCP: [platform](docs/34-plugin-platform-architecture.md), [manifest](docs/35-plugin-manifest-and-capability-contract.md), [MCP architecture](docs/36-mcp-integration-architecture.md), [SDK](docs/37-plugin-sdk-and-developer-experience.md), [trust lifecycle](docs/38-plugin-security-lifecycle.md), [roadmap](docs/39-plugin-roadmap-and-reference-architecture.md). Delivery: [implementation plan](docs/40-end-to-end-implementation-plan.md), [Manual specification](docs/41-in-app-manual-and-help-center.md), [master prompt](docs/42-holbery-intelligence-os-master-system-prompt.md), [phase gates](docs/43-one-shot-execution-plan-and-phase-gates.md), [delivery contract](docs/44-one-shot-delivery-contract.md). Other original operations/strategy/decision-log documents remain in `docs/`.

## Boundaries

This project is separate from the HOLBERY parent-brand repository and Bozq One System. No Bozq data moved or exposed. No unauthorized scraping, private-group/session circumvention, spam, unsolicited outreach, fabricated real evidence, autonomous spending or public product launch. The owner retains final authority for consequential actions.
