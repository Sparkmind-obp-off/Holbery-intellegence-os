# HOLBERY Intelligence OS

**Version:** 0.1.0 — fixture-only internal MVP, now including Secrets Owner.

**Repository:** https://github.com/Sparkmind-obp-off/Holbery-intellegence-os

**Release status (2026-10-11):** dedicated Pages + production D1 newly provisioned; remote schema verified; app and owner UI tested locally. **BLOCKED — NOT DEPLOYED / NOT PRODUCTION-VALIDATED.** Cloud secrets are missing and preview D1 creation reached account quota. Resource creation, migration and GitHub push are not deployment.

> **Evidence before exposure.** Synthetic fixtures and code completion are not commercial validation.

## Working product

Persisted `Source → bounded collection → normalize/deduplicate → evidence/provenance → fixed cluster → dossier → human decision → zero-cost fixture experiment → outcome/learning`.

- Responsive self-hosted UI, loading/empty/error/success states and `/manual`.
- Strict TypeScript/Zod, Hono, D1 transactional writes and migrations.
- Four-item synthetic connector with three unique observations, one repost, failure/rate-limit fixtures and idempotency conflict/replay checks.
- Source permission basis, kill switches, fingerprints, provider/method, timestamps, quality and duplicate provenance.
- Supporting/counter-evidence dossier, visible commercial unknowns and explainable deterministic **fixture score**, not proof of demand.
- Append-only human decisions with owner/rationale/reviewer notes/snapshot/review date; latest unexpired approval gates Rp0 experiments; immutable outcome/learning.
- Exact reviewed plugin manifests, install disabled/no grants, explicit grants, disable/revoke and audit.
- Local read-only MCP-style JSON-RPC fixture tool allowlist/validation/audit. **No remote MCP interoperability/server or AI model calls.**
- Fail-closed owner/operator authentication, signed/revocable HttpOnly/SameSite sessions, origin/header CSRF checks, body/rate limits, CSP and safe audit.
- **Secrets Owner `/secrets`:** owner-only inventory of actual required names, server-side configured/missing runtime checks, other environments unknown, management link, non-secret copy instructions, and persistent owner-reported rotation metadata. No secret values/fragments/hashes, Cloudflare write token, reveal endpoint or browser secret storage.

## Cloud resources — actual new IDs

| Environment/resource | Actual target | State |
| --- | --- | --- |
| Account | `a167a50f1272635d3c1145aab3cd8f98` / sparkmind.support@gmail.com | BYOK verified |
| New Pages | `holbery-intelligence-os`, ID `764e8875-45c9-4621-92c9-af9fd98496e2` | Created this session; **0 deployments** |
| Production `DB` | `hio-production`, ID `ce92c645-7ce2-4edf-8ffa-ce0d16115bbe` | New dedicated D1; three migrations verified |
| Preview `DB` | None; attempted new `hio-preview` | **Blocked by account D1 quota**, never shares production |
| Local `DB` | `hio-local`, all-zero ID in local-only config | Local simulation only |

Cloudflare reserved `holbery-intelligence-os.pages.dev`; it is **not a live deployment URL**. Production credentials OPERATOR_SECRET/SESSION_SECRET are missing; preview credentials also missing. No production credentials were generated without safe owner-vault handoff. No unrelated resource, DNS/custom domain or Access policy was modified; no paid upgrade or DB deletion.

[Verified resource inventory](docs/cloudflare-resource-inventory.json) · [Provisioning / secret ownership / recovery runbook](docs/cloudflare-provisioning-and-secrets-owner.md) · [Audit and release evidence](docs/implementation-status-and-audit.md).

## Local quick start

Linux/macOS and Node >=22.16; Windows native Cloudflare build compatibility is not claimed.

```sh
npm ci --ignore-scripts
node scripts/init-local.mjs
npm run db:migrate:local
npm run check
pm2 start ecosystem.config.cjs
curl http://localhost:3000/api/health
```

Root `wrangler.jsonc` is cloud configuration. `local/wrangler.jsonc` is local-only. Local launcher copies the build to ignored `local/dist`, starts in actual local cwd and explicitly overrides local D1 UUID/environment, so pinned Pages config rediscovery cannot silently simulate a different DB. Local migration script uses local config and local persistence. No local runtime remote-D1 access.

`init-local` generates only local secrets in ignored `.dev.vars` (0600, values not printed). Set a credential known to your local operator securely there; never reuse for cloud or commit/share the file. OPERATOR_SECRET must be 32–256 characters; SESSION_SECRET >=32. OPERATOR_NAME is a non-secret label. Local secrets also copied to ignored local/.dev.vars for the isolated launcher.

Sign in → install hio.fixture → explicitly grant fixture.read/enable → enable synthetic source → run fixture → inspect evidence/dossier → record decision → fixture experiment → outcome. hio.mcp-fixture/evidence.read is separately approved. E2E finishes with plugins/source disabled.

## Secrets Owner — practical owner control

Runtime page `/secrets`, linked from navigation/settings, requires the same valid owner session. Anonymous page returns 401 login shell; API inventory returns 401. Current MVP has one owner role; future non-owner role gate is explicit but multi-user identities do not ship.

The inventory checks only OPERATOR_SECRET and SESSION_SECRET. Current runtime environment shows configured/missing readiness. Other environments and platform secret_text attestation remain **unknown—verify in Cloudflare**. Recording rotation date never changes credential values or claims provider verification. Configured does not mean the old raw value is recoverable.

Owner setup page:
https://dash.cloudflare.com/a167a50f1272635d3c1145aab3cd8f98/pages/view/holbery-intelligence-os/settings

Generate/save independent production credentials in your own password manager; enter them directly as encrypted **Secrets** in **Production** Variables and Secrets. Later use different values in **Preview**. **Do not send values through chat, tool logs or screenshots.** The agent cannot securely show a production secret once into an owner vault, so none was generated/installed.

Alternative from an owner-controlled secure interactive terminal:

```sh
npx wrangler pages secret put OPERATOR_SECRET --project-name holbery-intelligence-os --env production
npx wrangler pages secret put SESSION_SECRET --project-name holbery-intelligence-os --env production
npx wrangler pages secret list --project-name holbery-intelligence-os --env production
```

Value goes into secure prompt, never command arguments. Pinned Wrangler supports secret `--env production|preview` (environment list verified). After setting/replacing, deploy/redeploy selected environment and verify readiness/login/logout. If compromise is suspected, rotate both login and signing credentials; SESSION_SECRET replacement rejects old sessions on the new deployment. Revoke deployment tokens at Cloudflare and update the Deploy panel, never the app. Old secrets may be unreadable; recover through replacement, not a reveal feature. Full runbook above covers scopes, preview, metadata and rollback.

## Routes and contracts

UI: `/`, `/sources`, `/runs`, `/evidence?q=...`, `/clusters`, `/opportunities`, `/decisions`, `/experiments`, `/plugins`, `/settings`, `/secrets`, `/manual`.

- Public `GET /api/health`: 200 only when migrations and auth config ready; otherwise 503.
- Sessions: POST `/api/session` `{secret}`, DELETE `/api/session`; mutating requests require matching Origin and X-HIO-Request: operator, plus signed session except login.
- Private `/api/v1`: me, summary, sources (GET/PATCH :id), plugins (GET/POST/PATCH :id), runs (GET/POST), evidence (GET q/offset, page size 25; GET :id), clusters, opportunities (GET/:id), decisions (GET/POST), experiments (GET/POST; POST :id/outcome), mcp/call (POST), audit (GET latest 50), settings (GET; POST settings/purge-expired), secrets (GET, no variable-name/query input), secrets/rotation (POST strict name/environment/past date metadata).
- Schemas in src/contracts.ts and src/secrets.ts. Errors `{error:{code,message,requestId}}`; no raw platform errors. History lists bounded to 50; overview aggregates server-side.

## Data and migration safety

Only D1 persists app state: sources, plugins/grants, runs, evidence, provenance, clusters/memberships, opportunities, decisions, experiments, audit, quotas and hashed sessions. `secret_rotations` stores name/environment/date/actor only, no secret values.

Migrations `0001_core.sql`, `0002_sessions.sql`, `0003_secret_rotation_metadata.sql` applied to local simulation and **new** production D1. Remote migration history/schema/indexes/FK check verified; repeat invocation no changes. Initial CREATE SQL is not independently rerunnable; migration history ensures repeat safety. No destructive SQL. Remote integrity_check is not supported by the observed D1 query interface and is not claimed passed. Local SQLite integrity/backup restore tests pass; production restore/RPO/RTO unverified.

Fixture content expires after 30 days, is hidden from reads and can be minimized by explicit owner purge. IDs/hash/provenance/governance remain; no real-provider deletion workflow. Expired sessions removed on login. Decisions/outcomes immutable. Roll back to a compatible app while retaining additive schema; prefer forward-fix. No dropping populated tables or destructive restoration without owner approval and verified backup.

## Checks

```sh
npm run check          # typecheck, lint, format, 36 tests, production build
npm audit             # 0 reported vulnerabilities at release review
npm run security:check # source + build credential heuristic scan
npx playwright install --with-deps chromium
npm run test:e2e       # localhost only; requires running Wrangler and .dev.vars
```

E2E: actual local Wrangler/D1 + Chromium full workflow, Secrets Owner inventory/rotation/reload/redaction, copy instructions, 12-route axe WCAG smoke, mobile/keyboard/logout and kill switches. Additional scan checks supplied PM2 logs/local build; synthetic leak fixture confirms scanner detects and redacts. Screenshots ignored. Full accessibility certification, live provider/AI/MCP transport, production auth/workflow and cloud backup restore are not claimed. Tooling deprecation/SQLite experimental warnings documented.

## Deployment continuation

Guarded npm deploy checks actual environment DB against verified inventory, new project/account identity, platform-secret names, release approvals, schema verification and clean git tree. Never provisions resources or migrates remotely itself. Pages deploy uses branch selection, not --env. Main guard currently blocks missing required secrets; preview guard blocks missing isolated DB. No upload/deployment occurred.

**Required next owner actions:** set/save production secrets securely; resolve preview D1 quota via an explicitly authorized capacity decision (no deletion or paid upgrade performed here). Then provision a brand-new preview DB, configure/migrate and validate cloud preview, followed by authorized main deployment and authenticated production smoke. Any preview-stage exception must be explicitly approved, not silently assumed.

## Architecture and preserved specifications

All original specification files, including upstream owner prompt 46, remain unchanged. [ADR 0001](docs/adr-0001-fixture-first-edge-monolith.md) explains fixture-first edge design; later provisioning runbook records actual production resource approval and current blockers.

Start: [charter](docs/00-project-charter.md), [principles](docs/01-strategy-principles.md), [architecture](docs/02-system-architecture.md), [evidence](docs/04-evidence-model.md), [data model](docs/05-logical-data-model.md), [source governance](docs/06-source-governance.md), [scoring](docs/07-opportunity-scoring.md), [test gate](docs/08-market-test-gate.md), [technology](docs/10-technology-decisions.md), [security](docs/11-security-privacy.md), [testing](docs/13-testing-acceptance.md).

Product/full-stack: [North Star](docs/16-product-north-star.md), [scope](docs/17-product-scope-and-personas.md), [UX](docs/18-ux-information-architecture.md), [frontend](docs/19-frontend-architecture.md), [API](docs/20-backend-api-architecture.md), [lifecycle](docs/21-database-and-data-lifecycle.md), [connectors](docs/22-integrations-and-connector-contract.md), [prompt security](docs/23-ai-evaluation-and-prompt-security.md), [privacy](docs/24-privacy-and-compliance-matrix.md), [design](docs/25-design-system-and-content-language.md), [learning](docs/27-experiment-and-learning-architecture.md), [release](docs/28-environments-deployment-and-release.md), [requirements](docs/30-product-requirements-and-acceptance.md), [runbook](docs/32-operator-runbook.md), [readiness](docs/33-product-readiness-checklist.md).

Plugin/MCP: [platform](docs/34-plugin-platform-architecture.md), [manifest](docs/35-plugin-manifest-and-capability-contract.md), [MCP](docs/36-mcp-integration-architecture.md), [SDK](docs/37-plugin-sdk-and-developer-experience.md), [trust](docs/38-plugin-security-lifecycle.md), [roadmap](docs/39-plugin-roadmap-and-reference-architecture.md). Delivery: [plan](docs/40-end-to-end-implementation-plan.md), [Manual](docs/41-in-app-manual-and-help-center.md), [master prompt](docs/42-holbery-intelligence-os-master-system-prompt.md), [phase gates](docs/43-one-shot-execution-plan-and-phase-gates.md), [contract](docs/44-one-shot-delivery-contract.md), [provisioning/owner prompt](docs/46-cloudflare-pages-d1-secrets-owner-access-master-prompt.md). Other original strategy/operations/decision-log docs remain in docs/.

## Boundaries

Separate from HOLBERY parent-brand and Bozq. No Bozq data moved/exposed; no unauthorized scraping, private-session circumvention, outreach/spam, fabricated real evidence, spending or public product launch. No real connectors/AI/remote MCP, automatic jobs, arbitrary plugin code, team SSO/RBAC, real payments or commercial validation. Owner retains consequential authority.
