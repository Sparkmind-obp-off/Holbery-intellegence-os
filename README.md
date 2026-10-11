# HOLBERY Intelligence OS

**Version 0.2.0 — Discovery → Demand → Opportunity → Decision.** Internal fixture workflow plus persisted research planning; not live market validation or autonomous AI.

**Canonical repository:** https://github.com/Sparkmind-obp-off/Holbery-intellegence-os

**Release status (2026-10-11): SOFTWARE PAGE DEPLOYED + CLOUD SMOKE VERIFIED, SETUP-REQUIRED/LOCKED.** Live: https://holbery-intelligence-os.pages.dev. Actual production deployment `4cd77f6d-dba2-48e0-bdf0-14e1e2b36ee8`, deployed code commit `b4b3d5cb5b8a9945486a5d8fc752679e656db04a`, deploy succeeded 07:13:48 UTC; Cloudflare metadata reverified 07:15:12 UTC. Production credentials remain absent, so authenticated operation is **not verified/available**. Root/assets 200, DB connected, private APIs and `/secrets` 401, health/login intentional 503. Browser desktop/mobile and locked-page axe smoke passed.

> Evidence before exposure. A plan, fixture score, AI suggestion or page deployment is not proof of demand.

## Working product

- `/intelligence`: persist market question, segment/geography, problem and payer hypothesis; generate a deterministic versioned plan with Discovery queries, Demand questions/counter-evidence, Opportunity unknowns and Decision gates. Candidate manual/Apify/custom API blueprints are disabled, no grants, review-required. No model/tool calls. Plans remain D0 hypotheses, evidenceCount 0, score null, research-only, execution disabled and budget 0.
- Source → bounded fixture collection → normalize/deduplicate → evidence/provenance → fixed cluster → dossier → human decision → zero-cost fixture experiment → immutable outcome/learning.
- Four synthetic input records, three unique observations and one repost; failure/rate-limit modes, idempotency replay/conflict, atomic source/plugin admission and kill switches.
- Supporting/counter-evidence, commercial unknowns and deterministic **fixture-only** support ratio; not market ranking or revenue prediction.
- Strict TypeScript/Zod/Hono, D1 transactional writes, migrations and audit. Responsive self-hosted JS/CSS UI, loading/error/empty states and `/manual`.
- Exact built-in plugins install disabled/no grants; separate explicit grants/revocation. Local read-only MCP-style JSON-RPC `evidence.list` with schema, limits and audit. **No remote MCP interoperability or arbitrary plugin code.**
- Fail-closed signed/revocable HttpOnly/SameSite owner session, origin/header CSRF checks, body/rate limits, CSP and safe errors.
- Owner-only `/secrets`: allowlisted runtime readiness, other environments unknown, non-secret copy/recovery instructions and persistent owner-reported rotation metadata. No secret value/fragment/hash reveal, Cloudflare write token, or secret storage in browser.

[Portfolio consolidation & acquisition operating model](docs/49-portfolio-consolidation-and-acquisition-operating-model.md) · [ORDVELA internal acquisition decision](docs/portfolio/acquisitions/ordvela-internal-acquisition-2026-10-11.md) · [HIO Master Command Center — ORDVELA Capability Integration Plan](docs/architecture/hio-master-command-center-ordvela-integration-plan.md) · [Researched operating model and gap analysis](docs/47-discovery-demand-opportunity-operating-model.md) · [Audit/release evidence](docs/implementation-status-and-audit.md) · [Resource inventory](docs/cloudflare-resource-inventory.json).

## Resources and URLs

| Resource | Dedicated target | State |
| --- | --- | --- |
| Account | `a167a50f1272635d3c1145aab3cd8f98` | BYOK verified |
| Pages | `holbery-intelligence-os`, ID `764e8875-45c9-4621-92c9-af9fd98496e2` | Production page deployed, locked |
| Production DB | `hio-production`, ID `ce92c645-7ce2-4edf-8ffa-ce0d16115bbe`, binding `DB` | Dedicated HIO D1 only |
| Preview | No DB | Optional; never falls back to production |
| Local DB | `hio-local`, all-zero ID | Isolated local simulation |

Verified live software page: https://holbery-intelligence-os.pages.dev. Immutable deployment URL: https://4cd77f6d.holbery-intelligence-os.pages.dev. This is actual Cloudflare publication, not the sandbox or just a reserved address. D1 metadata contains no exact “AYO production” match, so no unverified database was substituted. No Commerce/Bozq data/resource was changed, no second DB, paid upgrade, DNS/custom-domain or Access-policy change.

## User guide

After secure owner setup and redeploy: login → Intelligence Desk → create a specific brief → inspect saved queries, counter-evidence, commercial unknowns and review gates. Do not enter credentials or personal/sensitive records. Connector selection is planning, not activation. Inspect the list before retrying an interrupted POST; brief creation is not idempotent.

For synthetic workflow: install hio.fixture → explicitly grant fixture.read/enable → enable fixture source → run → inspect evidence/provenance and dossier → record human rationale/review date → approve fixture Rp0 → experiment → outcome. hio.mcp-fixture/evidence.read is approved separately. E2E ends with source/plugins disabled. No real market-entry or outreach permission is granted by fixture approval.

## Owner setup — autonomous production release

**Current required workflow:** use [Master Prompt 48 — Autonomous Secrets & Production Release](docs/48-autonomous-production-secrets-and-release-master-prompt.md). The authorized coding agent must generate independent `OPERATOR_SECRET` and `SESSION_SECRET` values, configure them as encrypted Production Secrets through the existing Cloudflare BYOK connection, redeploy, validate the authenticated workflow, and return both actual values to the owner in the final private response. Do not make the owner type secrets into the dashboard or terminal when the agent already has the necessary access.

The raw values must not enter this public repo, client code, APIs, application logs or build artifacts. Since Cloudflare does not allow secret readback after saving, the agent must retain the values it generated and return those same values at handoff; do not claim access to an old value.

Resource management page, for reference only:
https://dash.cloudflare.com/a167a50f1272635d3c1145aab3cd8f98/pages/view/holbery-intelligence-os/settings

[Operational details and recovery notes](docs/cloudflare-provisioning-and-secrets-owner.md).

## Local development

Node >=22.16, Linux sandbox/CI. No Windows Cloudflare build guarantee.

```sh
npm ci --ignore-scripts
node scripts/init-local.mjs
npm run db:migrate:local
npm run check
pm2 start ecosystem.config.cjs
curl http://localhost:3000/api/health
npm run test:e2e
```

Root config is cloud-only. Local launcher starts actual local cwd and explicitly overrides D1 UUID/environment so nested Pages config rediscovery cannot choose a different simulation. Ignored local-only `.dev.vars` files are 0600 and never production sources. Build before starting; clean port 3000 on restart. E2E deliberately hardcodes localhost to avoid production mutations.

## Functional entry URIs

UI: `/`, `/intelligence`, `/sources`, `/runs`, `/evidence?q=...`, `/clusters`, `/opportunities`, `/decisions`, `/experiments`, `/plugins`, `/settings`, `/secrets`, `/manual`.

- Public GET `/api/health`: reports database/authentication, releaseState and false liveCollection/aiInference; 200 only if schema/auth configured, otherwise intentional 503.
- POST `/api/session` `{secret}`; authenticated DELETE `/api/session`. Mutations require matching Origin and `X-HIO-Request: operator`.
- Private `/api/v1/intelligence`: GET latest 50 brief summaries, POST strict `{question,segment,geography,problem,payerHypothesis,connector}` with connector manual/apify/custom-api; GET `/:id` immutable saved plan.
- Other private `/api/v1` endpoints: me, summary, sources (GET/PATCH :id), plugins (GET/POST/PATCH :id), runs (GET/POST), evidence (GET q/offset, 25/page; GET :id), clusters, opportunities (GET/:id), decisions (GET/POST), experiments (GET/POST; POST :id/outcome), mcp/call (POST), audit (GET latest 50), settings (GET; POST settings/purge-expired), secrets (GET, no query probing), secrets/rotation (POST allowlisted name/environment/past date metadata).
- Contracts in src/contracts.ts, src/intelligence.ts and src/secrets.ts. Errors `{error:{code,message,requestId}}`; no raw platform errors.

## Data and lifecycle

D1 only: sources, plugins/grants, runs, evidence/hash, provenance, clusters/memberships, opportunities, decisions/snapshots, experiments/outcomes, audit, quotas, hashed sessions, rotation metadata and research_briefs. No application runtime filesystem/in-memory persistence.

Migrations 0001–0004 applied and verified remotely; repeated invocation reported no migrations to apply. 0004 adds only research_briefs and its index, no destructive SQL or production data seed. Application/test migrations are ordered; Wrangler history makes repeat application safe. Actual remote migration evidence is recorded in the audit. Remote integrity_check is unsupported by observed D1 interface and not claimed; local SQLite integrity/backup restore tests pass. Production recovery/RPO/RTO remains unverified.

Fixture payload expires after 30 days, is hidden from reads and can be explicitly minimized; IDs/hash/provenance/governance remain. Research briefs persist; deletion/retention UI not implemented, so no sensitive data. Decisions/outcomes append-only. Retain additive schema during rollback, prefer forward-fix; no destructive restore/drop without explicit approval and verified recovery.

## Tests and release controls

```sh
npm run check          # strict types, lint, formatting, 41 tests, build
npm audit             # 0 reported vulnerabilities at review
npm run security:check
npm run test:e2e       # actual local Wrangler/D1 + Chromium
```

Local E2E covers fixture workflow, persisted Intelligence Desk creation/detail/reload/escaped hostile text, Secrets Owner metadata/copy/reload/redaction, 13-route axe WCAG smoke, mobile/keyboard/logout and kill switches. Heuristic credential scanner also checks supplied builds/PM2 logs; not a complete security certification.

Guarded `npm run deploy` verifies exact HIO account/project/D1 identity, main branch, remote migration approval, platform secret metadata, clean git tree and checks. It never provisions/migrates automatically. Normal releases require secrets. **Only explicit `HIO_ALLOW_LOCKED_DEPLOY=yes` for approved main production allows missing secrets**, without changing fail-closed auth. Preview still needs its own DB/secrets and cannot share production.

Approved direct-release command (after remote schema verification and clean committed code):

```sh
HIO_RELEASE_APPROVED=yes HIO_PRODUCTION_APPROVED=yes HIO_TARGET_BRANCH=main \
HIO_REMOTE_MIGRATIONS_VERIFIED=yes HIO_ALLOW_LOCKED_DEPLOY=yes npm run deploy
```

Locked publication: root/assets 200; health 503 with database true/authentication false; private APIs and `/secrets` 401; login 503. Authenticated production workflow is not claimed until owner securely sets secrets, redeploys and actual login/workflow/logout tests pass.

## Remaining work and recommended order

1. Owner secret setup/redeploy and authenticated cloud smoke.
2. One authorized read-only connector with real provenance/dedupe/retention tests; candidate tools are not evidence.
3. Evaluated evidence-linked AI extraction with owner-approved provider/budget; no unsupported claims or tool grants.
4. Reviewed remote MCP transport/OAuth and custom API contract importer, exact egress/schema/tool allowlists.
5. Real-market test/market-entry gates, team identity/RBAC and production backup/restore.

No real connectors, model inference, semantic clustering, custom MCP interoperability, automatic jobs, outreach, autonomous spending, payments or commercial validation currently ship.

## Preserved specifications and references

The original spec corpus remains available. Only module/MCP documents 03/36 gained explicit current-implementation clarifications; their target design content remains intact. [ADR 0001](docs/adr-0001-fixture-first-edge-monolith.md) preserves fixture-first decisions; later owner permission supersedes mandatory-preview release gating.

Start: [charter](docs/00-project-charter.md), [principles](docs/01-strategy-principles.md), [architecture](docs/02-system-architecture.md), [modules](docs/03-intelligence-modules.md), [evidence](docs/04-evidence-model.md), [source governance](docs/06-source-governance.md), [scoring](docs/07-opportunity-scoring.md), [market gate](docs/08-market-test-gate.md), [security](docs/11-security-privacy.md), [testing](docs/13-testing-acceptance.md).

Product: [scope](docs/17-product-scope-and-personas.md), [UX](docs/18-ux-information-architecture.md), [API](docs/20-backend-api-architecture.md), [lifecycle](docs/21-database-and-data-lifecycle.md), [connectors](docs/22-integrations-and-connector-contract.md), [AI/security](docs/23-ai-evaluation-and-prompt-security.md), [privacy](docs/24-privacy-and-compliance-matrix.md), [learning](docs/27-experiment-and-learning-architecture.md), [release](docs/28-environments-deployment-and-release.md), [runbook](docs/32-operator-runbook.md), [readiness](docs/33-product-readiness-checklist.md).

Plugins: [platform](docs/34-plugin-platform-architecture.md), [manifest](docs/35-plugin-manifest-and-capability-contract.md), [MCP](docs/36-mcp-integration-architecture.md), [SDK](docs/37-plugin-sdk-and-developer-experience.md), [trust](docs/38-plugin-security-lifecycle.md), [roadmap](docs/39-plugin-roadmap-and-reference-architecture.md). Delivery: [plan](docs/40-end-to-end-implementation-plan.md), [Manual](docs/41-in-app-manual-and-help-center.md), [master prompt](docs/42-holbery-intelligence-os-master-system-prompt.md), [phase gates](docs/43-one-shot-execution-plan-and-phase-gates.md), [contract](docs/44-one-shot-delivery-contract.md), [legacy owner prompt](docs/46-cloudflare-pages-d1-secrets-owner-access-master-prompt.md), [current autonomous secrets + deploy prompt](docs/48-autonomous-production-secrets-and-release-master-prompt.md), [0.2 operating model](docs/47-discovery-demand-opportunity-operating-model.md). Other original specifications remain in docs/.

## Boundaries

No Commerce/Bozq data/resource reuse, unauthorized scraping, private-session circumvention, spam, autonomous spending, public product launch, DNS/domain/Access changes or paid SaaS/upgrade. Software-page publication is owner-requested infrastructure availability, not a commercial launch. Human owner retains consequential authority.


## Productization direction (2026-10-12)

HIO is being productized as a sellable AI Business Command Workspace. This is a target direction, not a claim that all workspace modules or integrations are live. The current production login remains blocked until the Owner configures OPERATOR_SECRET and SESSION_SECRET securely and login is verified. See [the canonical productization and production parity contract](docs/50-ai-workspace-productization-and-production-parity.md).


## Product discovery and production-readiness references (2026-10-12)

Use docs/51 for the dated Genspark/G2 benchmark, docs/52 for the Evidence-to-Execution Business OS target architecture, docs/53 for mandatory production and commercial launch gates, and docs/54 for the market validation playbook. These define target direction and acceptance criteria; they do not claim that unimplemented modules are live. Production readiness requires actual authenticated runtime and D1 verification.
