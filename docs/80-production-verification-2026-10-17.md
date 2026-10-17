# 80 — Production verification record (2026-10-17)

Deployed: Pages deployment `07793273` = commit `1b291f3` (main). D1 `hio-production` migrations 0001–0011 applied (backups in operator workspace before 0007 and 0011). No secret values are recorded here.

| Area | Check | Result |
|---|---|---|
| Daytona | `npm run test:daytona-live` (real API): create → `started` → `echo HIO_DAYTONA_OK && node --version` → delete | VERIFIED LIVE — exit 0, output `HIO_DAYTONA_OK / v25.9.0`, sandbox 404 after delete, 0 remaining |
| Daytona | Org without default region | FAILED for one key (`This organization does not have a default region`); production uses the key whose org has region `us` + `DAYTONA_TARGET=us` |
| Coding agent | Production `POST /execute` task `5430c771…` | VERIFIED LIVE — run `d19ad35f…`, clone/write + 7/7 checks exit 0, `sandboxDisposed=true`, 29 s, mid-run poll showed `running/typecheck` |
| Coding agent | Bounded repair (local HIO → real Daytona, isolated fixture `src/hio-repair-probe.ts`) | VERIFIED LOCAL — `format` exit 1 → 1 Groq repair → all checks exit 0, sandbox disposed |
| Coding agent | Access control (prod) | anon 401, missing CSRF header 403, cross-origin 403, unknown task 404, 1 concurrent run per owner (429, offline test) |
| Groq | `openai/gpt-oss-120b` chat completion | VERIFIED LIVE — 200 in ~0.3 s; invalid key → 401; production proposal path 201 |
| Clerk | `npm run test:clerk-live` against production | VERIFIED LIVE — real SignIn mounted, Backend-API sign-in token → session, `/api/customer/me` 200, brief created + listed, tampered token 401, anonymous 401, Clerk token on founder API 401, founder cookie on customer API 401 |
| Clerk | Instance type | development instance (`HIO_ALLOW_DEV_CLERK_IN_PROD=yes`), invite-only. Must move to a production instance before public traffic |
| Tavily | `/search` max_results 1 | VERIFIED LIVE — 200, 1 result with URL |
| Firecrawl | `/v1/team/credit-usage` (no credit spend) | VERIFIED LIVE (auth) — 200; search path not exercised |
| Apify | `/v2/users/me` (no spend) | VERIFIED LIVE (auth) — 200, FREE plan; actor run not exercised |
| GitHub (Worker PR submission) | — | BLOCKED by policy: the available token has admin/delete_repo/workflow scopes; not installed. Needs a fine-grained token limited to this repo (Contents + Pull requests: read/write) |

Test data in production: one Clerk test user (`hio-e2e+clerk_test@…`, Clerk test address), its invite, personal workspace and one brief; coding task `5430c771…` (docs-only proposal, never merged).
