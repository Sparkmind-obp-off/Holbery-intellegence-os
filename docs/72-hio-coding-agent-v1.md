# HIO Coding Agent v1 — bounded implementation

**Status:** draft implementation; verification and deployment are pending.  
**Scope:** HIO repository only. No Commerce, Bozq One System, ORDVELA, or other project is touched.

## What this slice does

1. Accepts a coding objective and 1–3 explicit target file paths.
2. Reads those files from the HIO repository's public `main` source, with a 30 KB per-file bound.
3. Sends only the selected source and objective to the existing Groq model.
4. Requires a structured JSON proposal with complete replacement contents, a short rationale, and proposed checks.
5. Rejects paths outside `src/`, `tests/`, `public/static/`, and `docs/`; rejects authentication/security/secrets/config paths and rejects model output that escapes the user's selected paths.
6. Persists the proposal, task state, audit receipt, and events in the additive `0009_agent_code_tasks.sql` migration.
7. If `GITHUB_TOKEN` is configured, a separate explicit approval can create a branch and a **draft PR**. It never merges or deploys. Without that secret, proposals remain HIO drafts.

## Runtime contract

- `POST /api/v1/agent/code-tasks` body: `{ objective, targetFiles }`
- `GET /api/v1/agent/code-tasks`
- `GET /api/v1/agent/code-tasks/:id`
- `POST /api/v1/agent/code-tasks/:id/submit` body: `{ approve: true }`

The submit endpoint is intentionally separate from generation. A model proposal does not mutate GitHub until an authenticated owner explicitly approves submission.

## GitHub credential

The optional Cloudflare Worker secret is named `GITHUB_TOKEN`. For submission, it needs narrowly scoped access to the single HIO repository with **Contents: read/write** and **Pull requests: read/write**. Prefer a fine-grained token or GitHub App installation token restricted to this repository. Do not place it in source, D1, browser code, logs, or prompts. Never reuse an all-repositories personal access token if a narrower credential can be created.

The code hard-codes the HIO repository identifier and does not accept a repository name from user input. Branches use `hio-agent/<task-prefix>` and pull requests are created as drafts. The API token's permissions are still a deployment prerequisite; this session has not configured or inspected that secret.

## Current limitations — do not overclaim

- This is **a bounded coding-agent v1**, not a fully autonomous software engineer. It drafts whole-file replacements for up to three user-selected files; it does not yet discover the right files automatically, execute a sandbox, run tests itself, repair failing tests, or autonomously iterate.
- Proposed checks are instructions, not evidence that checks passed. GitHub Actions must run and report results; reviewers must inspect the diff before merge.
- The initial path allowlist excludes dependency files, migrations, authentication/security modules, workflows, and deployment configuration.
- GitHub submission is a multi-request operation. If GitHub fails mid-operation, inspect the task and branch before retrying; the task is marked failed to avoid an automatic duplicate.
- Public-source retrieval assumes this repository remains publicly readable. A future private-repository implementation should use a narrowly scoped read token and a reviewed file index.
- The D1 migration is additive and must be tested locally before any production migration. No production migration, deployment, PR merge, or secret update is performed by this feature branch.

## Required verification before release

1. `npm ci`
2. `npm run check`
3. `npm run security:check`
4. `npm run test:founder`
5. `npm run test:e2e`
6. Local D1 migration and route tests.
7. Review the GitHub API permission scope and test submission against a temporary branch.
8. Confirm CI results, then separately approve production migration/deployment.

## CI validation endpoint (v1.1)

After a coding task is submitted as a draft PR, the owner can request a read-only validation snapshot:

- `POST /api/v1/agent/code-tasks/:id/validate`
- The endpoint checks the task is owned by the current operator and is in `submitted` state.
- It reads the draft PR head SHA, GitHub check runs, and commit statuses; the aggregate state is `success`, `failure`, or `pending`.
- Each snapshot is recorded in task events and the existing audit log. It does not merge, alter, or deploy code.
- The optional token needs Pull requests: read and Checks: read (plus the existing repository access needed by the submission endpoint). Without a token, validation returns a clear 503 and does not call GitHub.
- A failed check is a signal for a human-reviewed repair proposal; the endpoint does not automatically modify code.
