# 79 — Clerk Phase 1: customer identity and tenant isolation

Status: implemented on `main`; enabled in production on the Clerk **development** instance (`unbiased-ox-5156.clerk.accounts.dev`) behind `HIO_ALLOW_DEV_CLERK_IN_PROD=yes`. Switch to a Clerk production instance (`pk_live_`/`sk_live_`) before public launch and remove that flag.

## Design
- Clerk answers *who authenticated*; HIO's D1 tables (`users`, `workspaces`, `workspace_memberships`, `customer_invites`, `customer_briefs`, migration `0011`) answer *which workspace with which role*.
- Server verification (`src/clerk.ts`): RS256 only, signature against the instance JWKS (cached 10 min, refetched on unknown `kid`), `iss` derived from the publishable key, `azp` must be an authorized party (default: request origin; override `CLERK_AUTHORIZED_PARTIES`), `exp/nbf/iat` with 5 s skew, `sts=active`, `sub`/`sid` format. Rejects `alg=none`, HS256, unknown keys, forged signatures.
- Invite-only beta: first sign-in looks up the verified primary email via the Clerk Backend API and provisions only if the email is invited (`HIO_CUSTOMER_SIGNUP=open` disables this). Provisioning is idempotent and race-safe (unique constraints).
- Customer API `/api/customer/*` (config, me, workspace PATCH, briefs CRUD) is mounted before and fully separate from the founder guard. Every record query is scoped by `workspace_id`; other tenants' records return 404. Roles: owner/member/viewer. Mutations need same-origin + `X-HIO-Request: customer`; per-user mutation rate limit.
- Founder-only invite management: `GET/POST /api/v1/customer-invites`, `DELETE /api/v1/customer-invites/:email` (operator session).
- Pages `/masuk`, `/ruang`, `/ruang/brief` use a separate CSP that only allows this Clerk instance; founder pages keep `'self'`-only CSP. Indonesian Clerk UI via `public/static/clerk-id.js` (generated from `@clerk/localizations` by `scripts/build-clerk-locale.mjs`).
- The secret key is server-only; `/api/customer/config` exposes only the publishable key.

## Configuration (Cloudflare Pages, production)
Secrets: `CLERK_SECRET_KEY`. Plain/secret: `CLERK_PUBLISHABLE_KEY`, `HIO_CUSTOMER_AUTH=enabled`, `HIO_ALLOW_DEV_CLERK_IN_PROD=yes` (dev instance only), optional `CLERK_AUTHORIZED_PARTIES` (comma list, e.g. both `https://holbery-intelligence-os.pages.dev,https://hio.holbery.biz.id`).

## Verification
- Offline: `tests/customer-clerk.test.ts` (10 tests: JWT negatives, invite-only, idempotent provisioning, tenant isolation, roles, CSRF, founder/customer separation, CSP).
- Live: `npm run test:clerk-live` (env `HIO_BASE`, `CLERK_TEST_IDENTIFIER`, `CLERK_TEST_USER_ID`, `CLERK_SECRET_KEY`) mounts the real Clerk SignIn, signs in a `+clerk_test` user via a Backend-API sign-in token, creates a brief, and checks tampered/anonymous/founder-route tokens are rejected. The interactive password + new-device email-code path is not automated.

## Route map (public landing + two separate sign-in paths)

| Route | Audience | Guard |
|---|---|---|
| `/` | public | none — landing page, `'self'`-only CSP, no session read |
| `/masuk`, `/ruang`, `/ruang/brief` | invited customer | page public; data via `/api/customer/*` with verified Clerk Bearer token + workspace membership |
| `/founder/login` | founder/operator | sign-in panel; signed-in operator → 302 `/founder` |
| `/founder`, `/intelijen`, `/peluang`, `/produk`, `/publikasi`, `/pengaturan` | founder | shell shows sign-in until `/api/v1/me` succeeds; all `/api/v1/*`, `/api/founder/*` require the operator session |
| `/agent`, `/agent/code`, `/pemeliharaan/*` | founder | server redirect to `/founder/login` (`/pemeliharaan` → `/pengaturan`) when no session |

A Clerk token never authenticates founder routes (401), and the founder cookie never authenticates `/api/customer/*` (401). Founder logout calls `DELETE /api/session` (server-side session deleted) and returns to `/founder/login`; customer logout is Clerk's UserButton sign-out → `/masuk`.
