# 62 — Founder-first release readiness (canonical board)

**This is the single canonical readiness record for HIO from v0.3.0 onward.** Older gate tables (README release section, `implementation-status-and-audit.md`, docs 43/53/59) are historical evidence only; where they conflict, this file wins. The founder-facing board shown on Beranda (`/api/founder/progress`) is derived live from code + database state and must stay consistent with this file.

Last verified: 2026-10-16 (sandbox), repository version 0.3.0. Directive: `docs/55-founder-first-ui-master-system-prompt.md`.

## Board

| Stage | Founder status | What was actually verified | Open / blocker | Founder action? |
| --- | --- | --- | --- | --- |
| Founder workspace (Task 1) | Lulus pemeriksaan (local) | 6-area plain-Indonesian UI; 17 founder unit tests + 13 browser checks (leakage, a11y axe serious/critical = 0, mobile 390px, empty/loading/error, approval flow, logout) | **Not published to production** | Yes — approve publication (see deployment risk) |
| Founder access (Task 2) | Lulus pemeriksaan | Production probe (read-only, 2026-10-16): `/` 200, all private data 401, wrong password 401, cross-origin sign-in 403, HSTS + CSP present. Local: first sign-in, wrong password, expired session, logout, unauthorized requests, locked state when not configured | Recovery drill with founder never run; founder receipt of credential still unacknowledged (from 2026-10-11 release) | Optional — confirm credential is in a password manager |
| Decision path (sample data) | Terbukti digunakan (local) | sample → evidence (support+counter, dedup) → recommendation → approve/reject/edit/later → single-use Rp0 experiment → immutable result; all through audited workflow routes | Sample data only | No |
| Real market research | Belum dimulai (in this repo) | Research questions persist as plans; no real source connected in repository code | See deployment risk: production has an unrepositoried research engine | No (next phase) |
| Insight & publication | Belum dimulai | Honest placeholder screen; nothing generated or published | Whole module | No |

## Access decision (Task 2)

- **Exposure:** `holbery-intelligence-os.pages.dev` is reachable on the public internet. No Cloudflare Access gate is present (no Access headers/redirect).
- **Decision:** keep the existing, tested in-app login (HMAC-signed, D1-revocable, HttpOnly/SameSite=Strict, 8-hour session, origin+header CSRF check, login rate limit). It is fail-closed: missing secrets lock the workspace. Not removed, not weakened.
- **Not done:** adding Cloudflare Access would change account-level configuration and was not authorized; it is an optional future hardening layer, not a requirement.
- **Founder never prepares secrets.** Credential lives in the restricted Owner AI Drive folder `HIO_Private_Release` (from the 2026-10-11 release). Recovery = ask the AI agent to generate and set a new credential via official Cloudflare tooling; old value stops working. No secret value is printed in UI, logs, Git or this document.

## Deployment risk — blocks publication (founder decision)

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
