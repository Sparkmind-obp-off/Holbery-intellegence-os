# HOLBERY Intelligence OS

**Product direction (2026-10-16): Public-facing commercial SaaS — FIND → BUILD → VALIDATE → LAUNCH.** HOLBERY Intelligence OS helps customers discover evidence-backed problems, build a suitable prototype (spreadsheet, document, web demo, or system), and validate demand. This is the target commercial product direction; actual feature availability and launch readiness remain governed by the canonical readiness board.

> **Canonical product direction:** [docs/64-public-saas-product-direction.md](docs/64-public-saas-product-direction.md). **Canonical stack:** [docs/63-final-stack-find-build-validation.md](docs/63-final-stack-find-build-validation.md). **Canonical readiness board:** [docs/62-founder-first-release-readiness.md](docs/62-founder-first-release-readiness.md). The product direction is commercial; the readiness board distinguishes implemented/verified capabilities from planned ones. Older release sections below are historical evidence.

**Current implementation status (2026-10-16):** v0.4.0 verification is recorded in doc 62. Existing live research code has reported Tavily / Firecrawl / Apify + Groq provider support with keys in Cloudflare secrets. This is distinct from the newly selected optional **Grok Console / xAI API** integration; do not treat the latter as implemented until independently connected and tested. The commercial product direction and canonical stack are documented in docs 64 and 63; doc 62 remains authoritative for deployment/readiness state.

## Founder areas (default UI)

| Area | Path | What it does |
| --- | --- | --- |
| Beranda | `/` | Findings, items waiting for approval, blockers, recommended next step, live progress board |
| Intelijen Pasar | `/intelijen` | Run approved live research (one search + one AI analysis), numbered sourced evidence, labelled AI interpretation, guarded recommendation, decision; sample-data practice area |
| Peluang | `/peluang` | Who/workaround/payer/uncertainty; recommendation; Setujui / Tolak / Ubah dulu / Putuskan nanti; decision history |
| Produk & Eksperimen | `/produk` | Single-use approved Rp0 experiment, success/stop criteria, immutable result + learning |
| Insight & Publikasi | `/publikasi` | Honest placeholder; nothing is generated or published yet |
| Pengaturan | `/pengaturan` | Access status, sign-in & recovery, sources, privacy; hidden link to maintenance |

Owner-only technical diagnostics: `/pemeliharaan/*` (not in navigation). Founder data: `/api/founder/*` (plain-language response objects; private). Data storage: Cloudflare D1 (`hio-production`), unchanged schema (migrations 0001–0004).

---

**Canonical repository:** https://github.com/Sparkmind-obp-off/Holbery-intellegence-os

**Release status (2026-10-11 20:46 UTC / 2026-10-12 03:46 WIB): PRODUCTION DEPLOYED; AUTHENTICATED SYNTHETIC WORKFLOW VERIFIED.** Live: https://holbery-intelligence-os.pages.dev. Deployment `d8bb62d8-5253-4d2a-9b38-8285f8efbabe`, runtime commit `32efd13f7816b08ccfb9602da79f832b7e9a57fd`, platform created_at `2026-10-11T20:44:02.736281Z`, latest deploy stage success. Both Production secrets are encrypted `secret_text`. Root/assets/health 200; anonymous private APIs and `/secrets` 401. Real valid/invalid login, Secrets Owner redaction, synthetic brief persistence in exact D1, browser reload, logout and revoked-session denial PASS. Full technical-readiness acceptance remains open: human credential receipt, cloud recovery drill and plan-specific Time Travel retention are not verified. Not a commercial-readiness claim.

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
| Pages | `holbery-intelligence-os`, ID `764e8875-45c9-4621-92c9-af9fd98496e2` | Production deployed, authenticated smoke verified |
| Production DB | `hio-production`, ID `ce92c645-7ce2-4edf-8ffa-ce0d16115bbe`, binding `DB` | Dedicated HIO D1 only |
| Preview | No DB | Optional; never falls back to production |
| Local DB | `hio-local`, all-zero ID | Isolated local simulation |

Verified live software page: https://holbery-intelligence-os.pages.dev. Immutable deployment URL: https://d8bb62d8.holbery-intelligence-os.pages.dev. This is actual Cloudflare publication, not the sandbox or just a reserved address. D1 metadata contains no exact “AYO production” match, so no unverified database was substituted. No Commerce/Bozq data/resource was changed, no second DB, paid upgrade, DNS/custom-domain or Access-policy change.

## User guide

Retrieve the generated credential through the restricted Owner AI Drive handoff, keep it in a password manager, and confirm receipt without sharing its value. Then login → Intelligence Desk → create a specific brief → inspect saved queries, counter-evidence, commercial unknowns and review gates. Do not enter credentials or personal/sensitive records. Connector selection is planning, not activation. Inspect the list before retrying an interrupted POST; brief creation is not idempotent.

For synthetic workflow: install hio.fixture → explicitly grant fixture.read/enable → enable fixture source → run → inspect evidence/provenance and dossier → record human rationale/review date → approve fixture Rp0 → experiment → outcome. hio.mcp-fixture/evidence.read is approved separately. E2E ends with source/plugins disabled. No real market-entry or outreach permission is granted by fixture approval.

## Owner setup — secure production release

**Current required workflow:** the Owner's autonomous secrets/recovery/release instruction authorizes the agent to generate independent cryptographic secrets and configure Production through official Cloudflare tooling. Earlier instructions requesting raw secret delivery in chat are superseded. Never return raw credentials in ordinary chat, repository files, UI/API responses, logs or build artifacts.

`OPERATOR_SECRET` (32–256 characters, owner login) and `SESSION_SECRET` (at least 32 characters, session signing) must be encrypted `secret_text` bindings on the exact HIO Production project. Agent-generated values are retained in ignored temporary storage with directory mode 0700/file mode 0600 until owner receipt is confirmed. The authorized private handoff uses a dedicated restricted Owner AI Drive archive: verify file and inherited ACLs, no public/person grants, and authenticated round-trip bytes before calling access verified. This is an authenticated private file-sharing channel, not a password vault; human receipt is a separate acknowledgement. Never publish temporary signed download URLs. Existing Cloudflare secret values cannot be read back through HIO.

**Current audit — 2026-10-11 20:46 UTC:** agent-led secret writes and guarded production deployments completed. Final real production smoke PASS, including exact D1 synthetic brief `9a44d855-5e9c-41c6-a318-92cf89753119`. Bounded explicit deployment tail observed 29 real smoke invocations and found neither generated secret nor deployment token; raw traces were never persisted. Source/build/PM2 scans also PASS (heuristic scope only). Early production browser runs failed; a delayed-bootstrap race was independently reproduced, fixed by disabling login until startup session lookup settles, and covered by a delayed-response local regression. Later final cloud browser/reload and revocation checks PASS; not every initial timeout is attributed to the race. Backup is a one-time Owner-restricted export, not an automated schedule. Cloud restore and production RPO/RTO remain NOT TESTED. Account subscription metadata returned 403, so plan-specific Time Travel retention is Not inspectable. Owner credential access and authenticated download are verified; human acknowledgement remains pending. No provider integration, OAuth or external notification delivery was activated.

**Historical autonomous pre-release audit — 2026-10-11 20:33 UTC:** exact account/Pages/D1 identity reverified; both new independent 64-character Production bindings verified as `secret_text`. Owner-only credential archive upload and authenticated download match passed; human receipt pending. Official HIO D1 export (14,596 bytes) saved to restricted Owner storage and round-trip verified. Isolated local SQLite restore passed (17 tables, integrity/foreign-key checks); cloud D1 restore and production RPO/RTO are NOT TESTED. Time Travel bookmark available; plan-specific retention not yet attested. Clean install reports zero vulnerabilities; strict checks, 41 tests, build and full local Chromium E2E passed after installing missing browser dependencies. Deployment and authenticated cloud smoke are still pending at this commit. No provider credentials were used; no other project's resources were changed.

**Historical readiness audit — 2026-10-11 14:12 UTC:** BYOK authentication verified; production secret metadata lists neither required secret. Both are **Missing**, so authenticated release remains **Blocked**. Live `/` returns 200, `/api/health` returns 503 with database ready/authentication false, and `/api/v1/summary` and `/secrets` return 401. Four migrations are recorded in remote D1; read-only verification wrote no rows. Strict types, lint, formatting, 41 unit tests, build and heuristic credential scan passed. No new deployment, production mutation, provider request or notification delivery was performed in this audit. Provider credentials exposed in chat must be revoked/rotated and will not be used. Real connectors, OAuth and external notifications remain unimplemented/unverified; notifications are **NOT CONFIGURED**.

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
HIO_PRODUCTION_SMOKE_APPROVED=yes npm run test:production # authorized synthetic HIO-only cloud test
```

Local E2E covers fixture workflow, persisted Intelligence Desk creation/detail/reload/escaped hostile text, Secrets Owner metadata/copy/reload/redaction, 13-route axe WCAG smoke, mobile/keyboard/logout and kill switches. Heuristic credential scanner also checks supplied builds/PM2 logs; not a complete security certification.

Guarded `npm run deploy` verifies exact HIO account/project/D1 identity, main branch, remote migration approval, platform secret metadata, clean git tree and checks. It never provisions/migrates automatically. Normal releases require secrets. **Only explicit `HIO_ALLOW_LOCKED_DEPLOY=yes` for approved main production allows missing secrets**, without changing fail-closed auth. Preview still needs its own DB/secrets and cannot share production.

Approved direct-release command (after remote schema verification and clean committed code):

```sh
env -u HIO_ALLOW_LOCKED_DEPLOY HIO_RELEASE_APPROVED=yes HIO_PRODUCTION_APPROVED=yes \
HIO_TARGET_BRANCH=main HIO_REMOTE_MIGRATIONS_VERIFIED=yes npm run deploy
```

Historical locked publication returned health/login 503. The current normal release passes authenticated production smoke and health 200; anonymous private access still returns 401. Do not use the locked-deploy fallback for intended operational releases.

## Remaining work and recommended order

1. Confirm Owner receipt via private handoff; investigate cloud-only isolated recovery and retention metadata access without touching production or unrelated resources.
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


## Business lineage, value model and commercial gates (2026-10-12)

The expanded decision framework is documented in:
- [55 — Business lineage & portfolio governance](docs/55-business-lineage-and-portfolio-governance.md): source-to-outcome lineage, portfolio lifecycle and isolation.
- [56 — Value model, pricing & investment gates](docs/56-value-model-pricing-and-investment-gates.md): value hypotheses, business models, unit economics and investment criteria.
- [57 — Market research & validation standard](docs/57-market-research-and-validation-standard.md): evidence classes, source provenance, experiments and validation thresholds.
- [58 — Go-to-market & commercial launch playbook](docs/58-go-to-market-and-commercial-launch-playbook.md): customer wedge, paid pilot, funnel, pricing controls and launch phases.
- [59 — Production & commercial acceptance matrix](docs/59-production-and-commercial-acceptance-matrix.md): release gates and evidence required to pass them.
- [60 — Risk, privacy, security & AI governance](docs/60-risk-privacy-security-and-ai-governance.md): threat model, approval levels, secret lifecycle and incident handling.
- [61 — Research source register & decision log](docs/61-research-source-register-and-decision-log.md): source register, synthesized findings, decisions and open questions.

These documents define a target operating standard, not proof that all runtime controls are implemented. HIO remains non-commercial until production authentication, security, data integrity, support, payment (if enabled), and real-customer value gates have been evidenced. All customer, price, product-market-fit and ROI claims remain hypotheses until validated.

## Final FIND / BUILD / VALIDATE stack (2026-10-16)

Canonical stack decision: [docs/63-final-stack-find-build-validation.md](docs/63-final-stack-find-build-validation.md).

- **FIND:** Apify is the required primary social/community acquisition layer; Tavily is the standard public-web research complement.
- **Optional providers:** Grok Console / xAI API for targeted X/web search and model API; Cloudflare Workers AI for suitable inference tasks. The chosen xAI integration is Grok Console/API, not “Grok AI.”
- **BUILD:** Daytona is the required standard isolated build/test environment. Choose the output that fits the problem: spreadsheet, document, dashboard, or web demo.
- **DELIVERY:** existing HIO Cloudflare stack—Workers, Pages, D1, and optional R2—supports APIs, publication, structured state, and generated artifacts.
- **VALIDATE:** every prototype needs a defined experiment and recorded result before expansion.

This is the target architecture, not a claim that every provider is connected or production-tested. Keep Commerce and Bozq resources isolated.


## Final external provider register (2026-10-17)

[65 — Final External Provider Register for HIO MVP](docs/65-final-external-provider-register.md) is the canonical register for provider roles, free-tier limits, commercial-use restrictions, optional integrations, and connection verification. The chosen stack is sufficient to start one controlled MVP slice; the register does not claim credentials or integrations are already connected/tested. Jina's non-commercial Toy Experiment tier must not be used for commercial SaaS workloads. Keep Commerce and Bozq resources isolated.


## Implementation audit and execution prompt (2026-10-17)

Operator coding tasks can be reviewed and validated in a disposable Daytona sandbox from the **Konsol eksekusi coding** at `/agent/code` (see [docs/78](docs/78-daytona-sandbox-execution.md)). Sandbox validation is not a PR, merge, or deploy; real runs require `DAYTONA_API_KEY`.

The source-based implementation audit is [docs/66](docs/66-implementation-audit-before-commercial-mvp.md), the phased execution plan is [docs/67](docs/67-mvp-implementation-roadmap.md), and the repository-aware coding agent prompt is [docs/68](docs/68-master-system-prompt-hio-mvp.md). These distinguish the current founder/research foundation from the target commercial SaaS. They do not claim that a new audit test run, provider connection, Daytona build, or customer multi-tenancy has already passed.


## Customer UX and authentication implementation

- [MVP UX, Customer Journey, Onboarding & Authentication](docs/69-hio-mvp-ux-customer-journey-authentication.md)
- [Paste-ready Phase 1 Prompt — Clerk & Tenant Isolation](docs/70-master-implementation-prompt-phase-1-clerk-tenant-isolation.md)

Clerk is the proposed customer identity provider only after runtime compatibility and security gates pass. HIO continues to enforce workspace authorization internally; founder/operator access remains separate. Keep the publishable key separate from the server-only secret key; never publish credential values. See docs 69–70 for the precise boundary and execution gates.
