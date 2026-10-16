# 62 — Founder-first release readiness (canonical board)

**This is the single canonical readiness record for HIO from v0.3.0 onward.** Older gate tables (README release section, `implementation-status-and-audit.md`, docs 43/53/59) are historical evidence only; where they conflict, this file wins. The founder-facing board shown on Beranda (`/api/founder/progress`) is derived live from code + database state and must stay consistent with this file.

Last verified: 2026-10-16, repository version 0.4.0. Directive: `docs/55-founder-first-ui-master-system-prompt.md`.

## Production deployment — 2026-10-16

- Deployment `5bab2058-dcdf-4e07-9b08-08c995e73fce`, runtime commit `60097fe`, branch `main`, via guarded `scripts/deploy.mjs` (BYOK, account `a167a50f…`, project `holbery-intelligence-os`, D1 `hio-production`).
- Verified live: `/api/health` → version 0.4.0, database true, authentication true, liveCollection/aiInference true (all four provider secrets bound). Founder pages 200; private data 401; wrong password → plain "Kata sandi tidak cocok"; `/pemeliharaan` anonymous → redirect; unknown URL 404 (was 500). Short live log tail: no provider key found.
- **Not tested by the agent:** an authenticated research run on production (requires the founder password, which the agent does not hold). Live research itself was tested end-to-end against the real providers in the sandbox, including through the browser UI.
- Rollback: previous production deployment `5980463f` (commit `1ecb319`, unrepositoried research engine) can be restored from the Cloudflare dashboard; schema change 0006 is additive and harmless to it.

## Board

| Stage | Founder status | What was actually verified | Open / blocker | Founder action? |
| --- | --- | --- | --- | --- |
| Founder workspace (Task 1) | Lulus pemeriksaan (live) | 6-area plain-Indonesian UI; 17 founder unit tests + 13 browser checks (leakage, a11y axe serious/critical = 0, mobile 390px, empty/loading/error, approval flow, logout) | Published 2026-10-16 (deployment 5bab2058) | No |
| Founder access (Task 2) | Lulus pemeriksaan | Production probe (read-only, 2026-10-16): `/` 200, all private data 401, wrong password 401, cross-origin sign-in 403, HSTS + CSP present. Local: first sign-in, wrong password, expired session, logout, unauthorized requests, locked state when not configured | Recovery drill with founder never run; founder receipt of credential still unacknowledged (from 2026-10-11 release) | Optional — confirm credential is in a password manager |
| Decision path (sample data) | Terbukti digunakan (local) | sample → evidence (support+counter, dedup) → recommendation → approve/reject/edit/later → single-use Rp0 experiment → immutable result; all through audited workflow routes | Sample data only | No |
| Real market research (v0.4.0) | Lulus pemeriksaan | Tavily, Firecrawl, Apify (Google) + Groq `openai/gpt-oss-120b`. Live runs on all three sources returned sourced evidence + guarded AI dossier; browser check #14 runs one real search through the UI (bukti, label AI, keputusan, axe, leakage). 13 research unit tests with mocked providers | Evidence = search snippets only; no full-page reading or interviews. Daily caps tavily 20 / firecrawl 10 / apify 3 / groq 30 | Yes — review results and decide |
| Insight & publication | Belum dimulai | Honest placeholder screen; nothing generated or published | Whole module | No |

## Access decision (Task 2)

- **Exposure:** `holbery-intelligence-os.pages.dev` is reachable on the public internet. No Cloudflare Access gate is present (no Access headers/redirect).
- **Decision:** keep the existing, tested in-app login (HMAC-signed, D1-revocable, HttpOnly/SameSite=Strict, 8-hour session, origin+header CSRF check, login rate limit). It is fail-closed: missing secrets lock the workspace. Not removed, not weakened.
- **Not done:** adding Cloudflare Access would change account-level configuration and was not authorized; it is an optional future hardening layer, not a requirement.
- **Founder never prepares secrets.** Credential lives in the restricted Owner AI Drive folder `HIO_Private_Release` (from the 2026-10-11 release). Recovery = ask the AI agent to generate and set a new credential via official Cloudflare tooling; old value stops working. No secret value is printed in UI, logs, Git or this document.

## Research engine recovery (decision A, 2026-10-16)

The unrepositoried production research engine was rebuilt in the repository (`src/research.ts`, `src/research-routes.ts`) against the exact production schema, recovered verbatim as `migrations/0005_live_research.sql` (wrangler recognises it as already applied). Additive `0006_research_decisions.sql` applied remotely after a private pre-change export (`~/.hio-backups/`, SHA-256 `f76083fa…224d`). Existing production rows untouched; synthetic smoke jobs hidden from founder views.

Safeguards: per-run approval checkbox; one source request + one model call per run; atomic daily caps; per-call receipts; Apify `maxTotalChargeUsd=0.5` (the actor's minimum; measured actual ≈ $0.0045/run); web text framed to the model as data; schema-validated output (list→sentence tolerated, everything else strict); deterministic guard lowers strength/advice when support is from <2 sites, mostly from solution vendors, or lacks counter-evidence; out-of-range citations dropped; separate plain notices for busy source vs busy AI. Kill switch: `HIO_RESEARCH_ENABLED=false`.

Defects found by testing and fixed: Apify rejected plafond <$0.50; Apify needs 15–25 s (own 55 s timeout); model returned a list for one field (every analysis was rejected); vendor-written articles were counted as customer complaints; evidence tags rendered as large circles.

**Security note:** the four provider keys were pasted in chat on 2026-10-16. They live only in Cloudflare Production `secret_text` and a 0600 sandbox file outside the repo. Rotate them at each provider, then re-run `wrangler pages secret put`.

## Deployment risk — historical (pre-v0.4.0)

Production `/api/health` reports `researchPipeline` and the live `app.js` contains a "Research Engine" (Tavily/Firecrawl/Apify/Groq jobs, `/api/v1/research/*`). **That code exists in no branch of the GitHub repository** (`git log --all -S researchPipeline` is empty). Deploying this repository as-is would remove that feature from production and could orphan its D1 tables.

Required before publishing v0.3.0: recover the deployed research-engine source (from whoever deployed it, or from the Cloudflare deployment bundle) and merge it behind the founder layer — or explicitly decide to retire it. Until then, v0.3.0 is verified locally only.

## What changed for the founder (v0.3.0)

- New default workspace: Beranda, Intelijen Pasar, Peluang, Produk & Eksperimen, Insight & Publikasi, Pengaturan.
- Every error carries `{judul, dampak, langkah, perluKamu}` in plain Indonesian (`src/founder.ts`).
- Founder response objects (`/api/founder/*`) — the founder UI never reads raw tables, codes, or internal IDs as copy.
- Technical screens moved unchanged to `/pemeliharaan/*` (owner-only, not in navigation; link under Pengaturan › Lanjutan). Old URLs redirect to the matching founder area.
- Fixed a pre-existing production defect: unknown URLs returned HTTP 500 (Pages wrapper dropped Hono's notFound handler). Now a friendly 404 page / plain JSON notice.

## Verification commands

```
npm run check            # types, lint, format, 58 unit tests, build
npm run test:founder     # 13 founder browser checks (local server required)
npm run test:e2e         # legacy maintenance-area browser acceptance
```

Tests: `tests/founder.test.ts` (language leakage on shell, script copy and every API response; access; workflow; error mapping; unknown addresses), `scripts/e2e-founder.mjs` (visible-text leakage, axe, mobile, failure simulation).

## Known limitations

- Technical-term leakage test is pattern-based; it catches the listed vocabulary, not every possible jargon word.
- Recommendation copy is rule-based (support+counter present), not AI.
- Experiments still require the legacy "fixture" approval type internally; real-money or external actions remain impossible by schema (`budget_minor=0`).
