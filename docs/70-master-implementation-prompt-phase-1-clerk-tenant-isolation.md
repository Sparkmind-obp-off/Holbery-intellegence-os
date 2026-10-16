# 70 — Master Implementation Prompt: HIO Phase 1 Customer Identity, Clerk & Tenant Isolation

**Use this as the paste-ready prompt in Genspark GenCode (or another repository-aware coding agent).** Open the local checkout of `Sparkmind-obp-off/Holbery-intellegence-os` first.

## Mission

Implement **Phase 1 only** of the HIO MVP roadmap: customer identity and tenant isolation, using Clerk as the proposed customer identity provider after a compatibility spike. Make the existing HIO application safe to evolve from founder/operator-only access into a controlled multi-tenant SaaS.

Do not stop at a proposal: inspect the repository, run the baseline, make the smallest safe implementation, run tests, and report exact evidence. Do not claim completion if tests/configuration cannot be verified.

**Scope boundary:** HIO repository and its dedicated Cloudflare resources only. Do not touch HOLBERY Commerce, Bozq One System, or any other repository/project. Do not deploy to production or perform a production authentication cutover in this phase.

## Read first

Read and reconcile these canonical documents:
- `README.md`
- `docs/62-founder-first-release-readiness.md`
- `docs/66-implementation-audit-before-commercial-mvp.md`
- `docs/67-mvp-implementation-roadmap.md`
- `docs/68-master-system-prompt-hio-mvp.md`
- `docs/69-hio-mvp-ux-customer-journey-authentication.md`

If the repository contradicts the documents, trust inspected source and test evidence, update the findings, and explain the discrepancy.

## Critical credential handling — Clerk

The owner reports that Clerk credentials are available. This is **not proof that they are correctly configured or connected**. Never ask the owner to paste credential values into chat, prompts, GitHub, issue comments, source files, D1, UI, or logs. Never print or echo secret values or fragments.

**Do not combine all Clerk credentials into one secret.** Use distinct names and scopes:
- `CLERK_PUBLISHABLE_KEY`: public/client configuration; it is designed to be exposed to the browser according to Clerk's documentation. Use the exact key prefix/value supplied by the Clerk dashboard and the framework's documented public-variable convention. Do not treat it as an authentication secret.
- `CLERK_SECRET_KEY`: server-only secret; store only as an encrypted Cloudflare Pages/Workers secret or the approved local secret manager. Never expose it to browser bundles or logs.
- `CLERK_WEBHOOK_SECRET`: only if a webhook is actually implemented and signature-verified; otherwise do not add it yet.
- Google OAuth client configuration should be configured in the Clerk dashboard using the exact allowed origin/redirect URIs. Do not duplicate Google client secrets into HIO unless the selected documented integration explicitly requires them.
- Use separate development/preview and production credentials/configuration. Never use production secrets in local tests or preview by default.
- If a credential has been exposed in chat, repository, terminal output, screenshots, or browser bundle, stop and recommend rotating it through the provider dashboard. Do not rotate production keys autonomously unless specifically authorized and a recovery plan is verified.

Use the repository's actual Cloudflare secret/configuration method. A key being present in a dashboard is not connectivity proof. For tests, use mock/test identities and fake keys. Never read secrets back from Cloudflare; inspect only names/presence/configuration status through authorized metadata where supported.

## Phase 0 prerequisite inside this task: baseline only

Before editing:
1. Record current branch, HEAD commit, clean/dirty worktree, package manager and Node version.
2. Inspect app entry points, routes, UI, `src/auth.ts`, request middleware, `wrangler.jsonc`, D1 migrations, tests, deployment scripts and all authorization guards.
3. Run the repository's baseline checks that are safe and available: `npm ci`, `npm run check`, `npm run security:check`, `npm run test:founder`, and `npm run test:e2e`. If a command cannot run, record the exact reason; do not silently skip.
4. Inspect existing founder login/session behavior and production readiness documentation. Do not change it just to make new tests pass.
5. Write a brief baseline report and proceed only if no unknown destructive or release-blocking condition is present. If baseline is broken, isolate pre-existing failures and continue only with safe work.

## Architecture decisions

1. **Clerk authenticates customers; HIO authorizes access.** A valid Clerk identity alone never grants access to arbitrary HIO data.
2. Keep existing founder/operator authentication and its `owner-operator` role separate. Customer auth must never create or inherit this role.
3. Use additive D1 migrations only. Do not edit applied migrations, drop/rename tables, delete rows, or modify historical founder sessions/research data.
4. Default first customer to one personal workspace after verified authentication. Do not force an organization name, team invite, or lengthy profile.
5. Keep customer self-registration disabled or behind a controlled beta feature flag until abuse controls, rate limits, recovery, and cross-tenant tests pass. In development, use test accounts.
6. Never trust client-supplied user IDs, workspace IDs, role names, membership IDs, or organization IDs without server-side authorization.
7. Preserve the existing UI language and patterns; build the minimum coherent flow, not a full redesign. Follow doc 69 for UX behavior.

## Step 1 — Clerk compatibility spike (must pass before broad integration)

Check the official current Clerk docs and the actual runtime/framework compatibility. HIO currently uses Hono and Cloudflare Pages/Workers; do not assume a Next.js-specific SDK will work here.

Implement a minimal development-only proof:
- Clerk sign-in options: Google OAuth and verified email link/code as supported by the chosen Clerk configuration.
- Session token is verified server-side using an officially supported method compatible with the deployed runtime, or cryptographic verification against trusted Clerk JWKS/public keys with strict signature algorithm, issuer, audience, expiry and not-before validation.
- Never merely decode a JWT and trust its payload.
- Validate the expected Clerk application/domain and allowed origins.
- Confirm sign-out/session expiry behavior.
- Keep the existing founder authentication path intact throughout the spike.
- If correct verification is not practical in the actual Hono/Workers runtime, stop and document the incompatibility. Do not ship insecure verification or undertake a framework rewrite without an explicit decision.

Record the exact integration method, SDK/version or verifier, required non-secret configuration names, development setup, and known limitations.

## Step 2 — Internal identity and tenant model

Inspect existing schema before choosing names. Add a new migration only if needed, with tables equivalent to:
- `users`: internal ID, Clerk subject/user ID (unique), verified email/identity metadata only as needed, timestamps, disabled/deleted state.
- `workspaces`: internal ID, display name, creator, timestamps, state.
- `workspace_memberships`: workspace ID, internal user ID, explicit role, status, timestamps, unique user/workspace relationship.
- `customer_sessions` only if required by the selected session design; do not duplicate or weaken Clerk's session lifecycle unnecessarily.
- Audit events for important identity/membership changes, using the existing audit model where possible.

Use foreign keys and unique constraints appropriate to the current SQLite/D1 version. Avoid storing more personal data than necessary. Use stable internal IDs; store Clerk's user ID as an external subject mapping, not as permission by itself.

Provisioning must be safe and idempotent: first verified sign-in creates exactly one internal user and one personal workspace/membership; repeated requests must not create duplicates. Handle concurrent first sign-ins and partial failures without granting access to an unowned workspace.

## Step 3 — Authorization enforcement

Create centralized server-side helpers for:
- resolving verified customer identity;
- resolving workspace membership and role;
- requiring a specific permission;
- distinguishing customer, founder/operator and unauthenticated requests.

Apply authorization to every customer-owned read/write path and background job touched in this phase. Audit all routes, including less obvious paths and artifact/download endpoints if they exist. If a route has no customer workflow yet, keep it founder-only or disabled rather than exposing it.

For each customer request:
1. Verify the Clerk session/token.
2. Resolve or provision the internal user.
3. Resolve workspace membership using server-side database state.
4. Check the required permission.
5. Scope every query/mutation to the authorized workspace.
6. Emit a safe audit event for sensitive actions where appropriate.

Do not accept a browser-supplied workspace ID as authority. If the route accepts one to select a workspace, validate active membership before using it. Do not silently convert an owner-only route into a customer route.

## Step 4 — Session, origin and abuse protections

- Enforce the framework's secure cookie/session behavior or a verified bearer-token pattern supported by the Clerk integration.
- Preserve origin/CSRF protections for state-changing requests. Confirm the existing `X-HIO-Request` convention is appropriate for each customer flow rather than weakening it globally.
- Rate-limit sign-in callback/provisioning, email verification/resend where handled by HIO, workspace creation, and sensitive mutations using server-side keys that cannot be bypassed by changing browser identifiers.
- Fail closed on missing/invalid provider configuration, bad signature, wrong issuer/audience, expired/revoked session where supported, disabled user, inactive membership and insufficient role.
- Return generic customer-facing errors and request IDs; never expose provider secrets, token contents, SQL internals or stack traces.
- Do not store raw Clerk session tokens in D1 or logs.

## Step 5 — Minimum customer UX for Phase 1

Implement only the routes/states required to prove customer auth and isolation:
- Sign-in entry with “Continue with Google” and “Continue with email” where configured.
- Pending/verification, callback success/failure, expired session, sign-out and access-denied states.
- First-run state with a short welcome and personal workspace; optional workspace display name.
- Clear recovery/retry messages and return-to-intended-destination behavior.
- Customer area must not show founder/operator navigation or diagnostics.
- Hide or disable incomplete features rather than showing dead buttons.
- Keep visual design consistent with doc 69: premium, restrained, responsive, keyboard-accessible, plain language.

Do not implement the entire FIND → BUILD → VALIDATE journey in Phase 1; this phase establishes the safe identity foundation for later phases.

## Step 6 — Required tests

Add/update tests to prove at minimum:
- valid Clerk test identity maps to exactly one internal user/workspace;
- repeat/concurrent provisioning is idempotent;
- unauthenticated customer request is denied;
- invalid signature, wrong issuer/audience, expired token and malformed claims are denied;
- customer A cannot read/write customer B's brief, evidence, job, artifact, usage or validation record where those resources/routes exist;
- client-supplied workspace ID does not bypass membership;
- inactive membership/disabled user/insufficient role is denied;
- customer cannot access founder/operator APIs or maintenance screens;
- founder/operator login and existing workflows remain intact;
- session expiry/sign-out/revocation behavior matches the integration;
- origin/CSRF protections and rate limits still work;
- no secret appears in response bodies, logs, test snapshots, browser bundles or built assets.

Use mocked Clerk/JWKS responses and local D1 for deterministic tests. Do not call production Clerk, production D1 or production APIs from unit tests.

Run at least: `npm run check`, `npm run security:check`, `npm run test:founder`, `npm run test:e2e`, and any new targeted auth/tenant tests. Record exact pass/fail counts and failures.

## Step 7 — Docs and configuration

Update relevant documentation with:
- Clerk's exact role and boundary (identity provider, not HIO authorization);
- required secret/configuration names and which are public vs server-only;
- how to configure development vs production without publishing values;
- Google OAuth origin/redirect configuration instructions;
- tested integration method, tests, known limitations and rollback path;
- explicit statement that credential availability is not proof of a working connection.

Never put actual values into docs. Update docs 62, 67, 68, 69 and README as appropriate. Add a concise implementation report under `docs/` and link it from README.

## Step 8 — Release and production safety

- Do not deploy to production.
- Do not change production secrets, rotate credentials, enable public self-registration, alter Cloudflare access policy, run production migrations or cut over founder auth.
- Do not enable billing, external publishing, outreach, or paid build execution.
- Use a development/preview environment isolated from production. Verify preview has no binding to production D1.
- If a migration is added, test it against local D1 and confirm additive/backward-compatible behavior.
- Prepare a rollback note and list exactly what remains before production cutover.

## Definition of done

Phase 1 is done only when:
1. The Clerk compatibility spike has evidence in the actual Hono/Workers runtime.
2. Internal user/workspace/membership mapping is implemented safely and idempotently.
3. Every applicable customer route enforces workspace authorization.
4. Negative cross-tenant tests pass, and founder/operator tests still pass.
5. Baseline and new tests have actual recorded results.
6. Documentation and configuration instructions match code.
7. No production deploy/cutover occurred and no secrets were exposed.

If a gate cannot pass, do not fake success. Implement only safe, independently testable parts, state the blocker and leave the feature disabled.

## Final report format (Indonesian)

Report:
- **Status:** PASS / PARTIAL / BLOCKED
- **Commit/branch:** exact values
- **Files changed:** paths and purpose
- **Clerk integration:** method/version, environment tested, no secret values
- **Identity/tenant model:** schema and enforcement points
- **Tests:** exact commands and counts, with failures
- **Security checks:** cross-tenant, founder/customer separation, secret scan
- **Not done / blockers:** explicit list
- **Production status:** state “not deployed” unless verified otherwise
- **Next step:** exact next phase gate

Begin by auditing the local checkout. Then execute Phase 1 in small reversible checkpoints.