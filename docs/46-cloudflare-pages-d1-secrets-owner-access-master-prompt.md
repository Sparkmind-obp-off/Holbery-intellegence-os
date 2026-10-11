# HIO Cloudflare Pages + D1 Provisioning & Secrets Owner Access — Master Prompt

**Status:** execution prompt; not proof that Cloudflare resources have been created.  
**Repository:** `Sparkmind-obp-off/Holbery-intellegence-os`  
**Current known state:** MVP implementation, local validation and GitHub push were reported complete. Cloudflare production is explicitly **BLOCKED — NOT DEPLOYED**. `wrangler.jsonc` currently uses the local placeholder database `hio-local` and all-zero database ID; do not deploy this configuration as production.

---

## MASTER PROMPT — copy into the authorized coding agent

You are the release engineer responsible for finishing the Cloudflare BYOK provisioning and deployment of **HOLBERY Intelligence OS (HIO)**. Execute the work, not merely describe it. Use the existing canonical repository:

`https://github.com/Sparkmind-obp-off/Holbery-intellegence-os`

### 1. Mission and release outcome

Provision a **brand-new, dedicated Cloudflare Pages project** and a **brand-new, dedicated Cloudflare D1 database** for HOLBERY Intelligence OS (HIO). These are mandatory new resources, not optional alternatives and not a reuse of any existing project/database. Bind the application to the newly created D1, configure production secrets securely, apply reviewed migrations, deploy, and validate the real Cloudflare-hosted application. “HIO”, “Holbery Intelligence OS”, and “Library Intelligence OS” in the user's request refer to this same target system; provision one dedicated Pages project and its own dedicated D1 database for this system, not separate duplicate stacks.

The target outcome is evidence-backed:

`IMPLEMENTED + TESTED + PUSHED + CLOUDFLARE-DEPLOYED + PRODUCTION-VALIDATED`

Never report a stage as complete without direct evidence from the relevant system.

### 2. Isolation is mandatory

- Suggested Pages project name: `holbery-intelligence-os`.
- Suggested production D1 name: `hio-production`.
- Application D1 binding name: `DB`.
- Use a separate preview D1 (suggested `hio-preview`) if a preview deployment is created. Never let preview and production share a database.
- Creating new resources is mandatory. First confirm the exact Cloudflare account and check for name conflicts. If a suggested name already exists, do not treat that old resource as satisfying this request and do not adopt, overwrite, or modify it; choose a unique HIO-specific name (for example, append a short unique suffix) and create a brand-new project/database. Record the actual newly created IDs.
- Do not use, query for application data from, bind to, migrate, rename, or modify HOLBERY Commerce, Bozq One System, or any unrelated project/database. Bozq is private/internal and must remain completely separate.
- Keep the existing HIO GitHub repository and preserve all original specification documents. Do not create a replacement repo.
- Do not add GitHub Actions/CI as a workaround for deployment.
- No custom-domain/DNS changes, Access-policy changes, paid integrations, destructive operations, or unrelated resource modifications without separate explicit approval.

### 3. Preflight before writing or creating resources

1. Verify Cloudflare account identity and permissions with the authenticated BYOK credentials. Never print or commit the token.
2. Inspect current repository branch, commit, working tree, `wrangler.jsonc`, `package.json`, deployment guard, migrations, README and audit report.
3. Verify remote repository head and make sure the intended commit is the one being released.
4. Check whether the proposed Pages/D1 names already exist in the selected account. Record only safe metadata and resource IDs.
5. Review every migration in order. Confirm whether each is additive, idempotent where applicable, and compatible with the shipped app. Do not run remote migrations until the target D1 is confirmed to be the newly created HIO database.
6. Run the project’s prescribed local checks and deployment guard. Resolve real failures; do not weaken tests or remove security checks just to obtain a green result.
7. If authentication, permissions, account selection, or resource ownership is ambiguous, stop before creating/modifying cloud resources and report the exact blocker. Do not guess.

### 4. Provision Pages and D1

- Create the new Pages project for HIO using the supported Cloudflare workflow available in this environment.
- Create a new D1 database dedicated to HIO production; create a separate preview database if preview is used.
- Capture actual account/project/database identifiers from Cloudflare responses. Never fabricate IDs.
- Update the project’s deployment configuration to use the actual production D1 name and ID, binding `DB`, and the correct migrations directory. Keep local-development configuration safe and clearly separated from production.
- If the application requires environment-specific configuration, explicitly configure preview and production environments so neither can silently fall back to the all-zero local placeholder.
- Ensure build output, Pages Functions/Worker routing and bindings match the existing application framework. Use the existing project design; do not rewrite the application unnecessarily.
- Store a minimal resource inventory in repository documentation: project name, non-secret identifiers, environment, binding name, creation/verification date. Never store tokens, passwords, session secrets, or their raw values in GitHub.
- If Cloudflare resources cannot be created through available tools, do not pretend they exist. Provide exact reproducible commands or UI steps and mark provisioning blocked.

### 5. Secrets & Owner Access — mandatory policy

The owner must retain **practical, documented control** over every secret needed to operate HIO. A dedicated authenticated owner-facing screen named **“Secrets Owner”** (also acceptable UI title: “Secrets Opener”) is mandatory. It must visibly expose the *secret inventory, configuration status, environment, purpose, and owner management/recovery actions* to the authenticated owner. It must **not** expose raw secret values in the app UI/API, because that would create a credential leak and Cloudflare may not permit secret readback. Raw values remain accessible through the owner-controlled password manager/provider credential page at creation time, or must be replaced through secure rotation.

#### 5.1 Required owner capabilities

- The owner can access the correct Cloudflare account/project and manage production and preview secrets.
- Provide a private, owner-facing secret inventory: secret name, purpose, environment, required/optional status, where it is configured, which service uses it, last rotation date (if known), and safe rotation/recovery steps. Never include secret values.
- Provide an explicit setup/update/rotation procedure using the Cloudflare dashboard or authenticated Wrangler commands supported by the installed version.
- The owner must be able to replace/revoke a secret without editing application source code, exposing it in Git, or rebuilding unrelated systems.
- Document how to recover from accidental loss or suspected compromise: rotate/revoke at the issuing provider, update the Cloudflare secret, redeploy/restart if required, and verify the dependent function.
- Use least privilege, separate preview from production, and use different values for unrelated purposes. Never reuse credentials from HOLBERY Commerce or Bozq.
- Secrets must never be returned by application APIs, displayed in frontend HTML, written to logs, added to telemetry, embedded in build artifacts, or included in test screenshots/reports.
- Add automated checks that reject accidental secret exposure in tracked files and build output where feasible. Tests must use synthetic values, not real production secrets.

#### 5.2 Mandatory owner-facing “Secrets Owner / Secrets Opener” screen

Implement and expose a dedicated owner-only page in the HIO application, linked from its authenticated navigation/settings, with a predictable route such as `/secrets`. The screen must be real and functional, not a mockup.

It must:
- Require the same fail-closed operator authentication and authorization as other sensitive settings. Anonymous users and ordinary non-owner users (if roles are added later) must not access it.
- Display a clear inventory of the runtime secrets actually required by the code: key name, plain-language purpose, preview/production environment, required/optional status, configured/missing/unknown status, last rotation date if recorded, dependent feature/service, and safe rotation/recovery procedure.
- Determine configured/missing state server-side for an explicit allowlist of secret names; never accept a client-supplied arbitrary environment-variable name and never return secret values, prefixes, suffixes, hashes of secret values, or token fragments.
- For platform-managed secret configuration that cannot be read from runtime, show “status unknown—verify in Cloudflare” rather than pretending to know. Provide clear navigation/instructions to the correct Cloudflare Pages project/environment and safe commands for setting/replacing a secret.
- Provide owner actions that are safe in the running application: view the inventory, copy non-secret setup/rotation instructions, mark rotation date/status as metadata where persistence is available, and open the relevant Cloudflare management instructions. Do not pretend a runtime web app can change Cloudflare bindings/secrets unless an explicitly authorized backend provisioning mechanism actually exists.
- Never embed a Cloudflare API token with secret-write/read privileges into the browser or add a “reveal all secrets” endpoint. Do not implement secret-value viewing, copy-to-clipboard of configured values, a debug dump, or frontend secret storage.
- Distinguish “configured” from “owner can recover the raw value”: a secret can be configured at Cloudflare while its old value is unreadable. The screen must explain that the owner may need to rotate it and securely save the replacement in their password manager.
- Include tests for anonymous denial, authorized access, accurate configured/missing/unknown states, output redaction, hostile input, and confirmation that no secret value enters HTML, JSON responses, logs, or build artifacts.
- Include accessible empty, loading, and error states; never display raw errors from the Cloudflare API that might contain sensitive metadata.

If this screen cannot determine the configured state reliably from the runtime platform, be honest in the UI and use “unknown / verify in Cloudflare”. Do not fabricate status. “Secrets Owner is visible and functional” means an authenticated owner can inspect and manage the *inventory and safe operating procedures*; it never means publishing raw production credentials.

#### 5.3 Important platform limitation: secrets may not be readable after saving

Cloudflare may allow a secret to be **written or replaced without allowing its existing value to be retrieved**. Do not promise that a previously configured value can always be revealed later.

Therefore:
- For generated secrets whose raw value must be retained for recovery, generate them locally with a cryptographically secure random generator and show the value **once, directly to the owner in the authorized secure setup environment**. Save it only in an owner-controlled password manager/secret vault. Do not print it into GitHub, ordinary logs, chat transcripts, screenshots, or the application.
- For provider-issued credentials (API keys/tokens), retrieve them from the issuing provider’s official credential-management page when possible. If the provider shows a credential only once, store it in the owner’s password manager at creation time.
- If this coding environment cannot securely reveal a generated secret to the owner or cannot establish a secure handoff, do not generate a production secret and then claim the owner can recover it. Instead, instruct the owner to generate or enter it directly in Cloudflare’s authenticated secret UI/terminal and verify only that the secret is configured, without reading it back.
- Never create an “admin endpoint,” debug page, frontend secret viewer, or API response that reveals secret values. Owner access is delivered through authorized Cloudflare controls and a clear rotation process, not a secret-exfiltration feature.
- Do not place raw secret values in command-line arguments if they may be captured by shell history or process listings. Prefer interactive secret input or the platform’s secure secret prompt.
- If the app requires `OPERATOR_SECRET`, `SESSION_SECRET`, or other runtime secrets, confirm the exact names and requirements from the code. Configure each in the appropriate environment using Cloudflare secret storage, not plaintext vars or source control. Keep local `.dev.vars` ignored and local-only.
- Validate presence/configuration without printing values. Never echo tokens or secrets into tool output. Report configured/missing/rotation-needed status only.

#### 5.4 Secret register format (values must never appear)

Maintain a safe register like this:

| Secret name | Purpose | Environment | Required? | Owner-managed location | Rotation/recovery |
|---|---|---|---|---|---|
| `OPERATOR_SECRET` (if required by current code) | Operator login | Preview/Production separately | Verify in code | Cloudflare secret storage | Set a new value securely; test login; invalidate prior access as applicable |
| `SESSION_SECRET` (if required by current code) | Signing/authentication sessions | Preview/Production separately | Verify in code | Cloudflare secret storage | Rotate with documented session invalidation impact |
| Provider credentials (only when a real connector is approved) | Authenticate to a named provider | Per environment | No until feature requires it | Provider vault + Cloudflare secret storage | Revoke at provider, replace, verify |

This table is a template, not permission to invent new runtime variables. The codebase determines the actual required secret names.

### 6. Migrations and database safety

- Confirm the newly created D1 database ID/name before any remote migration.
- Review migration SQL and order. Do not drop tables or erase data.
- Apply the existing migrations to the new HIO D1 only, using the project’s pinned Wrangler and the documented remote migration process.
- Verify migration history and schema after applying. Check key tables, indexes and foreign keys where supported.
- If a migration fails, stop, capture the non-sensitive error, inspect database state and plan a forward fix. Do not blindly rerun destructive SQL.
- Document rollback limitations: app rollback must remain schema-compatible; prefer forward-fix for additive schemas. Do not claim production backup/restore is verified unless actually tested.
- Ensure preview uses its own database and never runs production migrations against preview.

### 7. Deploy in controlled stages

1. Complete preflight and local test suite.
2. Configure the new project and D1 binding.
3. Configure required secrets through secure Cloudflare secret storage; verify only their presence and runtime behavior.
4. Deploy to an isolated preview if supported, with a separate preview database.
5. Verify preview health, login/logout, session invalidation, source/plugin permission gates, D1 persistence and the full fixture workflow.
6. Obtain/confirm the authorized production release target before production migration/deployment.
7. Apply migrations to the confirmed new production D1 and deploy the production Pages project.
8. Record the actual deployed URL, deployment identifier/version, project name and D1 identifier.
9. Run production smoke tests with synthetic/fixture data only. Do not insert real customer or sensitive business data.
10. If validation fails, stop further rollout, preserve evidence, and use the documented compatible rollback/forward-fix plan.

Do not report a sandbox preview as a Cloudflare Pages deployment. Do not treat a successful GitHub push as proof of deployment.

### 8. Required verification

Run and report what actually applies:
- package install and project checks (typecheck, lint, format, unit/integration tests, production build);
- local D1 migration and browser E2E;
- Cloudflare account/project/database identity checks;
- actual deployment command result and deployment ID;
- public health/readiness route;
- unauthenticated private API returns the expected denial;
- valid owner login succeeds; invalid login fails; logout and session revocation work;
- authenticated CRUD/read workflow persists across reloads;
- source/plugin kill switches and permission checks work;
- workflow from fixture collection → normalized/deduplicated evidence → dossier → human decision → zero-cost experiment → outcome/learning works;
- the authenticated “Secrets Owner / Secrets Opener” page works, accurately labels unknown states, and never exposes raw values;
- no secret values appear in responses, logs, source, build output or screenshots;
- preview and production bindings point to their own respective databases.

Never use a fake success response to satisfy a test. Label tests as passed, failed, skipped or blocked, with scope.

### 9. GitHub and documentation

- Preserve all original specification files.
- Update configuration and add an operations document containing: resource inventory (non-secret metadata), secret register (names/purpose/status only), provisioning steps, migration procedure, deploy/validation evidence, rollback notes and remaining blockers.
- Do not commit any real credentials, local `.dev.vars`, production data, token dumps, or private screenshots.
- Run security scan and `git diff --check`; review the complete diff.
- Commit and push to the existing canonical repository only after checks pass. Verify remote HEAD equals the intended commit. Never force-push.
- If a Cloudflare resource/deploy stage is blocked, still commit safe documentation/config changes if useful, but report the exact remaining action and do not mark the release complete.

### 10. Final report — required format

Return a concise evidence-based report with these exact status dimensions:

- **GitHub:** repository, branch, commit SHA, push verification, working-tree status.
- **Cloudflare account:** verified / blocked (never print the token).
- **Pages:** newly created / blocked; exact new project name and real URL if deployed. An old existing project does not satisfy this requirement.
- **D1:** newly created / blocked; exact new database name and ID. An old existing database does not satisfy this requirement.
- **Binding:** environment → database mapping.
- **Migrations:** exact applied migrations and verification result.
- **Secrets Owner / Secrets Opener:** authenticated UI route, access-control result, required names and configured/missing/unknown status, owner management location, safe rotation instructions. Never report or display raw values.
- **Tests:** pass/fail/skipped/blocked, with scope.
- **Deployment:** actual deployment ID and URL, or explicitly **BLOCKED — NOT DEPLOYED**.
- **Production validation:** each smoke check and evidence.
- **Risks/blockers:** specific next action, responsible actor, and why it is needed.

Only declare **PRODUCTION-VALIDATED** if the actual Cloudflare deployment URL was tested against the newly provisioned HIO Pages project and dedicated HIO D1, and the critical authenticated workflow passed. Otherwise report the precise achieved state.

Begin by inspecting the canonical repository and authenticated Cloudflare account. Execute the safe, authorized steps immediately. Ask only when an actual permission, ownership, or destructive-risk boundary requires the owner’s decision.
