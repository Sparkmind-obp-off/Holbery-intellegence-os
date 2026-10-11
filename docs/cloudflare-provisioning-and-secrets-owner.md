# HIO BYOK provisioning and Secrets Owner operations

Date: 2026-10-11 UTC. Canonical repository: Sparkmind-obp-off/Holbery-intellegence-os, main. Session started at upstream `49261ec92d02c9fe9135ceb3da30d1df7005d261` after safely fast-forwarding two owner documentation commits. This report supersedes the earlier resource-authorization blocker: the new owner prompt explicitly authorized dedicated resources and additive migrations.

**Current state: IMPLEMENTED + TESTED locally + dedicated production resources PROVISIONED + remote schema VERIFIED. BLOCKED — NOT DEPLOYED / NOT PRODUCTION-VALIDATED.** GitHub release commit/push is recorded after verification in the audit/session report.

## Actual new resource inventory

Account verified by BYOK `wrangler whoami`: sparkmind.support@gmail.com; account ID `a167a50f1272635d3c1145aab3cd8f98`.

| Resource | Actual new name/ID | Created/verified | State |
| --- | --- | --- | --- |
| Pages | `holbery-intelligence-os`; project ID `764e8875-45c9-4621-92c9-af9fd98496e2` | Created 2026-10-11 06:21:42 UTC | Created by CLI in this session; main production branch; no deployment |
| Production D1 | `hio-production`; `ce92c645-7ce2-4edf-8ffa-ce0d16115bbe` | Created 2026-10-11 06:21:46 UTC | New dedicated DB, region ENAM, production binding `DB` |
| Preview D1 | Requested name `hio-preview`; **no ID** | Create attempted 06:21 UTC | Cloudflare rejected: maximum number of D1 databases reached. Not reused, not created |
| Pages subdomain | `holbery-intelligence-os.pages.dev` | Returned by Cloudflare | Reserved address only; **not a deployed application URL** |

Minimal machine-readable inventory: [cloudflare-resource-inventory.json](cloudflare-resource-inventory.json). Final Cloudflare API recheck at 06:41:34 UTC found **zero deployments**, correct new production binding and no preview DB binding. No unrelated application database was queried for data or modified. No upgrade, database deletion, DNS/domain or Access-policy change performed.

## Environment isolation

- Root `wrangler.jsonc`: actual production DB and explicit production environment. Preview override has `d1_databases: []`; cannot fall back silently to production.
- Cloudflare Pages project deployment configuration: Production → DB above; Preview → no D1, intentionally blocked until capacity exists.
- `local/wrangler.jsonc`: all-zero local-only ID, hio-local; never a deploy target.
- `scripts/local-dev.mjs`: copies build into ignored local/dist, loads ignored local-only secrets, starts Wrangler in actual local cwd and explicitly overrides CLI D1 binding to all-zero/local environment. This avoids pinned Pages dev's nested configuration rediscovery choosing root bindings. Local development never accesses remote D1.
- Account selection is stored as non-secret inventory/vars and passed to deployment CLI through `CLOUDFLARE_ACCOUNT_ID`. Pinned Pages rejects `account_id` in its config; unsupported field was removed rather than weakening validation.

## Provisioning and migration execution evidence

Commands actually executed with pinned Wrangler 4.149.0:

```sh
npx wrangler whoami
npx wrangler pages project list
npx wrangler d1 list
npx wrangler pages project create holbery-intelligence-os --production-branch main
npx wrangler d1 create hio-production
npx wrangler d1 create hio-preview # FAILED: account quota; no preview ID
npx wrangler d1 info hio-production
npx wrangler d1 migrations apply hio-production --remote
npx wrangler d1 migrations apply hio-production --remote # no migrations to apply
```

Cloudflare project GET verified exact creation timestamps/IDs before its binding PATCH. Only the newly created project's environment configuration was updated. D1 info confirmed matching new ID and zero tables before migration. Migrations reviewed in order:

1. `0001_core.sql`: additive initial tables/indexes and clearly synthetic source/cluster/opportunity seed; no deletes or drops.
2. `0002_sessions.sql`: additive revocable hashed session table/index.
3. `0003_secret_rotation_metadata.sql`: additive allowlisted secret name/environment and date/actor metadata only. No secret values stored.

All three applied remotely to the new production DB. At 06:29:13 UTC migration history, table/index schema, `PRAGMA table_info(secret_rotations)` and `PRAGMA foreign_key_check` verified; FK check returned no violations. Raw CREATE SQL is intentionally not rerunnable by itself; Wrangler migration history makes repeat application safe. A compound verification including `PRAGMA integrity_check` returned SQLITE_AUTH; reran supported read-only queries successfully. Remote integrity_check is **not passed/claimed**. Local integrity/snapshot restore tests pass. Production backup/restore and RPO/RTO remain unverified.

## Secret register — names and state, never values

Cloudflare environment secret-list commands and metadata confirmed these missing at 06:41 UTC:

| Name | Purpose / dependency | Environment | Required | Current platform state | Owner-managed location |
| --- | --- | --- | --- | --- | --- |
| OPERATOR_SECRET | Owner login | Production | Yes; 32–256 characters | Missing | Owner vault + Pages Production secret storage |
| SESSION_SECRET | HMAC session signing | Production | Yes; >=32 random characters | Missing | Separate owner vault entry + Pages Production secret storage |
| OPERATOR_SECRET | Owner login | Preview | Yes when preview deploys | Missing | Different preview vault entry + Pages Preview secret storage |
| SESSION_SECRET | HMAC session signing | Preview | Yes when preview deploys | Missing | Different preview signing key + Pages Preview secret storage |

Local .dev.vars contains local-only credentials and is ignored; never reused in cloud. OPERATOR_NAME is an optional non-secret label, not a credential. No approved provider connector needs credentials. CLOUDFLARE_API_TOKEN is an external deployment credential managed by the owner/Deploy panel and must never be an application binding or browser asset.

**Secure handoff blocker:** this environment cannot show generated production secrets once into an owner-controlled vault without leaking through ordinary tool/chat output. Therefore no production or preview secrets were generated, written to files, handed off or installed. The owner must generate/save independent values in their own password manager and enter them directly in Cloudflare or a secure authenticated terminal. No secret readback/reveal is promised.

## Owner setup and recovery — do not send credentials in chat

Correct owner management page:

https://dash.cloudflare.com/a167a50f1272635d3c1145aab3cd8f98/pages/view/holbery-intelligence-os/settings

1. Sign in to the verified Cloudflare account; choose this new Pages project, not parent-brand or Bozq resources.
2. Select **Production** in Variables and Secrets. Add OPERATOR_SECRET and SESSION_SECRET as encrypted **Secret** entries, not plaintext variables. Generate and save independent values in the owner vault first. Enter securely directly in the dashboard.
3. For preview later, choose **Preview**, use two different values, and only deploy after a separate new preview DB is provisioned.
4. Verify secret **names/types/presence**, never read values back. Deploy/redeploy selected environment so its new deployment receives the updated values, then verify health and login/logout.

Wrangler alternative from an owner-controlled interactive secure terminal (value prompt; no values in command arguments/history):

```sh
npx wrangler pages secret put OPERATOR_SECRET --project-name holbery-intelligence-os --env production
npx wrangler pages secret put SESSION_SECRET --project-name holbery-intelligence-os --env production
npx wrangler pages secret list --project-name holbery-intelligence-os --env production
# Repeat puts with --env preview using distinct preview values after its DB exists.
npx wrangler pages secret list --project-name holbery-intelligence-os --env preview
```

Pinned version 4.149.0 hides `--env` in Pages secrets help, but source handler supports it and both environment-specific **list** commands were executed successfully. `pages deploy` does NOT use `--env`; use `--branch main` or `--branch hio-preview`. Deployment output/secret-put value handling is never replaced with chat-based copying.

Loss/compromise: generate/save a replacement in the owner vault, replace through the selected Cloudflare environment, redeploy and test dependent functions. If OPERATOR_SECRET is compromised, rotate SESSION_SECRET too; changing the password alone does not revoke already signed sessions. Changing SESSION_SECRET rejects previous signed cookies on the new deployment. Revoke/rotate deployment tokens at Cloudflare's token management page and update the platform Deploy panel, never the app. For a future provider credential, revoke at its official provider first. Do not record the new value or hash in rotation metadata.

## Secrets Owner screen and APIs

- Owner-only `/secrets`, linked from authenticated navigation and settings.
- Anonymous UI route returns 401 login shell; private `/api/v1/secrets` returns 401. Authenticated single owner role is set server-side from a valid signed/revocable session; client role headers are ignored. Non-owner role gate is tested, but no multi-user ordinary-user account exists in this MVP.
- GET inventory checks only OPERATOR_SECRET/SESSION_SECRET against server runtime; never takes a client variable name. Query probing is rejected. Current runtime environment reports configured/missing readiness; other environments show **unknown—verify in Cloudflare**. Runtime cannot attest platform secret_text storage or raw-value recoverability.
- Local screen shows local configured and preview/production unknown; this does not contradict external Cloudflare metadata/list checks showing cloud secrets missing.
- POST `/api/v1/secrets/rotation` accepts only allowlisted name, environment, actual past rotation date. D1 stores owner-reported date/actor only; status does not become configured from this action.
- Copy controls copy safe instructions/commands only. No reveal endpoint, Cloudflare management token, secret update endpoint, raw errors, browser storage or raw values/hashes/fragments.

## Checks and real scope

- `npm ci --ignore-scripts`: pass on upstream baseline.
- `npm run check`: final pass (type/lint/format, **36 tests**, 56-module build, worker 113.75 kB).
- `npm run db:migrate:local`: three migrations; second invocation no changes.
- `npm run test:e2e`: final pass against actual local Wrangler/D1 + Chromium. Full fixture workflow, reload persistence, owner page/inventory, rotation metadata and safe instruction-copy, 12-page axe WCAG smoke, mobile/keyboard/logout and kill switches. No cloud credentials used. Screenshots are ignored synthetic/local artifacts.
- `node scripts/security-check.mjs dist local/dist <PM2 log paths>`: pass; tracked/new source, build artifacts and supplied process logs contain no configured secret values/token patterns. Synthetic leak fixture test confirms detection and redacted output. Heuristic, not exhaustive proof.
- `npm audit`: zero reported vulnerabilities.
- Main deploy guard with actual approved target flags: exit 2, **missing OPERATOR_SECRET/SESSION_SECRET**. Preview guard: exit 2, **missing isolated DB due quota**. Neither invoked upload/deploy.
- Resolved local runtime failure: nested Pages config discovery initially chose a blank local simulation under production DB ID; force-local mode meant no remote data access. Explicit CLI local UUID/environment overrides now pass readiness/E2E. A copy-instruction async test race was fixed by waiting for completion, not disabling assertions.
- Production health, anonymous API denial, valid/invalid login, logout/revocation, persisted workflow and owner page smoke: **BLOCKED / NOT PERFORMED** because Cloudflare deployment count is zero and owner secrets are absent. Production validity is not inferred from local tests, Pages resource creation or D1 migration.

## Release continuation and owner actions

1. **Owner:** set/save production credentials securely in the correct Cloudflare project/environment. Confirm only completion, not values.
2. **Owner / Cloudflare account administrator:** resolve D1 quota through an authorized capacity/plan decision or approved separate-account approach. No database deletion or paid upgrade authorized/performed by this session. Then create a brand-new isolated preview DB, record its real ID, configure/migrate it and validate cloud preview. If a preview-stage exception is desired, it requires an explicit owner release decision; it is not assumed.
3. **Release engineer:** recheck live resource/secret metadata, update verified inventory/config if needed, run tests/security scan, commit/push, deploy preview with its own DB, verify authenticated flow, then production main with its own DB and verify actual URL/deployment ID. Current safe guard never creates resources or remotely migrates them automatically.

Rollback: retain additive schema when rolling back a compatible app. Prefer forward-fix. Never drop populated tables or restore/delete production data without explicit approval and a verified recovery plan. No production application deployment or cloud backup restore exists to claim rollback rehearsal for.
