# HIO One-Shot Autonomous Secrets & Production Release — Master Prompt

**Primary instruction for the authorized coding agent.** This document supersedes any older instruction that requires the owner to enter secrets manually, postpones production release because customers do not exist yet, or prohibits handing the generated owner credentials back to the owner.

**Canonical repository:** https://github.com/Sparkmind-obp-off/Holbery-intellegence-os  
**Goal:** finish the current HIO product release autonomously. Do not stop after writing a plan or documentation.

## 1. Outcome required

Operate as the implementation/release agent, using the already authorized Cloudflare BYOK connection and the canonical GitHub repository. Execute the tasks end-to-end:

1. Verify the existing dedicated HIO Pages and D1 resources.
2. Generate two strong, independent production secrets.
3. Configure both as Cloudflare **Production Secrets** for the existing HIO Pages project.
4. Deploy the production application with the normal release guard (not a setup-only/locked deployment).
5. Validate the deployed app, owner login, secret-management screen, and persisted Intelligence Desk workflow.
6. Return the exact generated secret values to the owner in the **final private response** so the owner knows the credentials. Do not return them in intermediate progress messages, tool logs, GitHub, source code, page HTML, API responses, build artifacts, or public documentation.

No customer base, sales, or paid integration is needed to complete this early-stage release. Do not create unnecessary security ceremony, new product features, a new repository, or duplicate infrastructure. Keep the existing basic authentication and secret protections intact; never hardcode secrets into a public app or public repository.

## 2. Use the verified HIO resources; do not duplicate them blindly

The repository's latest release records these dedicated resources. Re-verify them live before use; if an identifier has changed, use actual Cloudflare metadata, not this prompt as an authority to guess.

- Cloudflare Pages project: `holbery-intelligence-os`
- Pages project ID recorded in inventory: `764e8875-45c9-4621-92c9-af9fd98496e2`
- Production URL: `https://holbery-intelligence-os.pages.dev`
- Production D1: `hio-production`
- D1 ID recorded in inventory: `ce92c645-7ce2-4edf-8ffa-ce0d16115bbe`
- Application binding: `DB`
- Production branch: `main`
- Existing migration history recorded: `0001_core.sql`, `0002_sessions.sql`, `0003_secret_rotation_metadata.sql`, `0004_research_briefs.sql`

These resources are already the intended newly provisioned HIO stack. **Do not create duplicate Pages/D1 resources** if Cloudflare verifies these are the dedicated HIO resources. Never use Commerce or Bozq resources.

## 3. No-manual-work policy

- Do not ask the owner to open the dashboard and enter the two secrets manually when the existing authenticated BYOK connection has permission to configure them.
- Do not ask the owner to generate the values, copy commands, run a terminal, make a code change, or operate deployment controls.
- Use the connected Cloudflare account and the repo's release tooling. If a genuine missing authorization/connection prevents a write, report the exact missing integration/permission; do not pretend it succeeded and do not substitute a manual checklist as the deliverable.
- Preview is optional and must not block the approved direct production release. Do not create a preview DB or paid service without a concrete requirement.

## 4. Generate both secrets and retain them for handoff

Generate values using a cryptographically secure random generator inside the authorized execution environment. A suitable choice is **48 random bytes encoded as base64url per secret** (about 64 URL-safe characters). Values must be independent.

- `OPERATOR_SECRET`: meets the app's 32–256 character requirement.
- `SESSION_SECRET`: at least 32 random characters and independent from `OPERATOR_SECRET`.

Do not reuse the Cloudflare API token, a GitHub token, the same value for both secrets, a human password, or any credential belonging to another project.

Keep the generated values in process memory or a tightly permissioned, temporary, git-ignored handoff file only for as long as necessary. Disable shell tracing and redact command output. Do not place values in command-line arguments, shell history, Git, logs, screenshots, build output, public artefacts, or application settings. Remove the temporary handoff file after the final handoff has been assembled. Make sure repository status is clean and the secret scanner passes.

## 5. Configure Cloudflare Production Secrets

Using the actual, verified Cloudflare account and project:

1. Check the existing secret *names/types/presence* without requesting the raw values of any existing secret.
2. Generate a new `OPERATOR_SECRET` and a new `SESSION_SECRET` as above. Because old Cloudflare secret values may not be retrievable, do not try to extract them. Rotate/replace them with the newly generated values.
3. Write them to the **Production** environment as encrypted Cloudflare Pages secrets, not plaintext `vars`. Use the installed/pinned Wrangler version or Cloudflare API capability supported by the authenticated account. Prefer stdin/secure input; values must not appear in command arguments or tool output.
4. Confirm both names are configured as secret-type entries for the correct project and environment. Do not assume a successful local command means the platform accepted them.
5. Do not store the generated values in `wrangler.jsonc`, source files, README, inventory JSON, D1, or the deployed client.
6. If either secret write fails, do not claim configured/deployed. Keep the values long enough to retry safely, then report the exact non-sensitive error. Do not ask the owner to manually type them in this environment; identify the missing Cloudflare capability.

Cloudflare documents that Pages secrets are encrypted bindings available to server-side functions, and their configured values cannot be viewed again after setting them: https://developers.cloudflare.com/pages/functions/bindings/ . This is why you must generate the value, configure it, and preserve the original value for the owner's final handoff before discarding the in-memory value.

## 6. Deploy the real application

Before release:

- Pull/verify the latest canonical `main` and confirm the intended committed SHA.
- Ensure production binding `DB` points to the verified HIO D1 ID.
- Inspect remote migration history and schema. Apply only pending reviewed migrations, if any; do not re-run migrations blindly or drop data.
- Run `npm ci --ignore-scripts`, `npm run check`, `npm run security:check`, and the repository's prescribed local browser E2E if the environment supports it.
- Commit/push any required source fixes to the existing repo before deploying; no force pushes, no secrets committed.
- Invoke the canonical release guard with production approval and remote-migration verification. Use `HIO_ALLOW_LOCKED_DEPLOY` **unset**. The release must reject a missing required secret rather than hiding the failure behind the locked mode.
- If release checks fail, fix actual defects and rerun them. Do not weaken tests, disable authentication, change the DB binding, or claim success prematurely.
- Perform the production deployment to `holbery-intelligence-os` using branch `main`. Confirm deployment ID, deployed commit, URL, and resource bindings from Cloudflare's actual response/metadata.

Known intended guarded release flags, only after remote target/migration validation and a clean committed working tree:

```sh
HIO_RELEASE_APPROVED=yes HIO_PRODUCTION_APPROVED=yes HIO_TARGET_BRANCH=main HIO_REMOTE_MIGRATIONS_VERIFIED=yes npm run deploy
```

Use the repository's script and actual connected BYOK credential. Never print the token. Do not bypass the guard by directly invoking a raw deploy command if the approved guard is available.

## 7. Production acceptance tests — real URL only

After the deployment has succeeded, run and capture non-sensitive evidence for:

1. `GET /`, `GET /static/app.js`, and the live health/readiness endpoint.
2. Unauthenticated private APIs deny access; no secret or session data is returned.
3. Owner login with the newly generated `OPERATOR_SECRET` succeeds; invalid login fails.
4. `/secrets` and its inventory APIs work only after owner authentication. Inventory status is accurate; no API, HTML or logs return any raw secret.
5. Authenticated logout/revocation works and the old session is rejected.
6. Create a uniquely identified, **synthetic** Intelligence Desk brief via the real API, read it back, reload, and verify D1 persistence. Do not store real customer details or sensitive content.
7. Verify existing fixture/source/plugin permission gates continue to deny unapproved external actions.
8. No real collection, LLM inference, outreach or spending is required. Do not fabricate market evidence or claim market validation.
9. Re-check public repository diff, deployed bundle and test/log artefacts for secret leakage using redacted scanners. The final handoff may reveal the values only in the owner's private final response.

If an acceptance test fails, fix and redeploy. If account permission, real BYOK authorization, or Cloudflare itself blocks the work, state **BLOCKED — NOT DEPLOYED/NOT VALIDATED** with evidence. No guessing, no fake outputs, no manual-work diversion.

## 8. Final private handoff — must include the actual credentials

After the secret write succeeds and the production deployment is verified, your final response to the owner must include:

- Live production URL, deployment ID, deployed commit SHA, Pages project name, actual D1 name/ID/binding.
- Actual pass/fail outcomes for health, authenticated login, logout/session revocation, Secrets Owner screen, and persisted Intelligence Desk test.
- The exact generated `OPERATOR_SECRET` value.
- The exact generated `SESSION_SECRET` value.
- A concise instruction to keep these values private and rotate them if exposed.

**Do not omit the raw secret values from the final private response just because Cloudflare will not read them back.** The requirement is to give the owner the exact values generated by the agent, while ensuring they are not committed to GitHub or exposed by the app. Do not claim the secret was set unless Cloudflare confirmed the write. Do not claim deployment/validation success unless the real production tests passed.

If credentials were successfully configured but deployment later fails for a separate reason, provide the exact generated values in the final private response with the deployment failure clearly labelled, so the owner does not lose the only recoverable copy. Never silently discard configured values without handing them to the owner.

Begin now with the live repo/account preflight, then execute the work in this same session. Do not stop at analysis or another plan.


## Product direction synchronization (2026-10-12)

HIO's target is an evidence-to-execution business workspace, not a generic chatbot. This target does not imply shipped parity. Use docs/50 for capability states and release truth, docs/51 for Genspark/G2 benchmark, docs/52 for target architecture, docs/53 for production/commercial gates, and docs/54 for market validation. Keep fixtures distinct from live data. Production login remains blocked pending secure Owner configuration of distinct OPERATOR_SECRET and SESSION_SECRET values and verified authenticated production tests.

## 12. HIO coding console, Groq, GitHub source-of-truth — mandatory continuation

This addendum is the active continuation rule for the October 17 coding-console release. It does not override security controls or authorize unrelated projects.

### Source of truth and GitHub requirement
- Canonical source is `main` in `Sparkmind-obp-off/Holbery-intellegence-os`. A Cloudflare deployment, local branch, Genspark workspace, or commit hash mentioned in a report is not proof that the source exists in GitHub.
- Before claiming completion, verify the exact commit and every required source file through GitHub. Never force-push, rewrite history, or overwrite unrelated commits. Never create or enable GitHub Actions/workflows; do not depend on Actions/Checks to validate work.
- The deployed coding-console report identifies commit `dac6fdf714be2bbfc79e0cbecfccaadb5b30ceb6`, but that SHA was not found in GitHub at the time this addendum was written. Recover the exact source from the authorized implementation workspace, inspect the diff against current `main`, run the repository checks, and push a normal fast-forward commit to `main`. If that workspace/source is inaccessible, report that exact blocker; do not reconstruct or claim to push code you do not possess.
- Keep the HIO repository separate from HOLBERY Commerce, Bozq One System, ORDVELA, and other projects.

### Groq integration — prove runtime, do not just see a secret name
- Existing HIO research and coding-agent code uses Groq's OpenAI-compatible endpoint and `GROQ_API_KEY`; the configured research model is `openai/gpt-oss-120b`. Groq is not Grok Console/xAI. Do not silently swap one provider for the other.
- Inspect `src/research.ts`, `src/coding-agent.ts`, provider limits, request validation, error mapping, timeouts, audit events, and tests before changing code. Reuse the existing integration where it is correct; avoid duplicate clients and hard-coded credentials.
- Verify whether the Production secret is actually configured without attempting to read or print its value. A masked/empty value in Cloudflare metadata is not proof that a key is valid.
- Use a low-risk, bounded, authenticated test that makes one real Groq request only if the configured key is present and the provider is enabled. Record only provider name, model, HTTP outcome, latency, and sanitized error category. Never log prompts containing secrets, the key, or raw authorization headers. Do not run up billable or quota-consuming loops.
- A missing, invalid, unauthorized, or quota-exhausted key must be reported truthfully. Do not claim Groq is connected until a real provider request succeeds. Keep the application usable when Groq is unavailable and return clear, non-sensitive errors.

### Daytona coding execution
- Confirm `DAYTONA_API_KEY` is configured as a Cloudflare Production Secret before attempting a live sandbox. If absent, do not fabricate a sandbox run.
- Create one minimal, disposable test task only after reviewing the exact proposed file paths. Verify clone, file write, seven fixed checks, bounded repair behavior (at most two attempts), per-step evidence, and confirmed sandbox disposal. No automatic PR, merge, or deployment from a sandbox result.
- Keep the current human approval gate, file allowlist, output caps, request timeouts, concurrency guard, and audit trail. Do not broaden path permissions to make a test pass.

### Product outcome and honest readiness
- Preserve the product flow **FIND → BUILD → VALIDATE → LAUNCH**. Findings must include source URLs/timestamps and uncertainty; generated ideas are hypotheses until validated. Do not create fake demand evidence, customers, sales, or provider connections.
- Deliver product artifacts in the right format (for example spreadsheet, document, or working web demo) only after the objective and evidence justify that format. Prioritize low/no-cost providers and clearly label unavailable integrations. No paid service, new infrastructure, production migration, secret rotation, or deployment unless separately authorized.
- Completion report must separate: (1) code in GitHub `main`, (2) production deployment, (3) configured secret presence, (4) real provider test, (5) Daytona runtime test, and (6) product readiness. Each claim needs observable evidence; list unresolved blockers without calling the whole system complete.
