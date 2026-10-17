# Daytona Coding Execution Adapter

## Purpose

HIO uses Daytona as the isolated execution provider for coding-task proposals. The Cloudflare Worker remains the authenticated control plane; generated code is written and tested only inside a disposable Daytona sandbox. This adapter does not submit a pull request, merge code, or deploy anything.

## Runtime configuration

Configure these Worker secrets/variables outside source control:

- `DAYTONA_API_KEY` (secret, required): Daytona API key.
- `DAYTONA_API_URL` (optional): API base URL; defaults to `https://app.daytona.io/api`.
- `DAYTONA_TOOLBOX_URL` (optional): toolbox proxy base URL; defaults to `https://proxy.app.daytona.io/toolbox`.
- `GROQ_API_KEY` (existing secret): required for proposal generation, not for sandbox adapter initialization.

Never put provider credentials in the repository, task payload, sandbox environment, logs, or generated files.

## API

After an authenticated operator has created a draft via `POST /api/v1/agent/code-tasks`, execute its proposal with:

```http
POST /api/v1/agent/code-tasks/{taskId}/execute
Content-Type: application/json
X-HIO-Request: operator
```

The endpoint has no request body. It verifies ownership and draft status, validates all proposed file paths, creates a disposable Daytona sandbox, clones the public HIO repository, writes only the proposal's allowed source files, then runs the following checks in order:

1. `npm ci`
2. `npm run typecheck`
3. `npm run lint`
4. `npm run format:check`
5. `npm test`
6. `npm run security:check`
7. `npm run build`

Execution stops at the first non-zero exit code. The result includes per-step exit codes and bounded output. Evidence is written to `agent_code_events` and `audit_events`. The sandbox is deleted in a `finally` cleanup path; Daytona's auto-delete interval is also configured as a backstop.

## Safety boundaries

- Only tasks owned by the authenticated operator and in `draft` status can execute.
- File changes are limited to 1–3 files in the allowed `src/`, `tests/`, `public/static/`, or `docs/` path families. Authentication, secrets, security, dependency lockfiles, workflow, and deployment files are denied.
- Shell commands are fixed by the server; task objectives cannot supply commands.
- File contents are base64 encoded and passed to a quoted shell command; file paths are validated before writing.
- Output is capped and never includes API keys.
- No GitHub Actions, production migration, automatic PR submission, merge, or deployment is part of this endpoint.
- A passing sandbox result validates only the proposal against the cloned default branch; it does not establish that the proposal was merged or deployed.

## Verification status

Unit tests cover path restrictions, missing credentials, sandbox creation headers, and command exit-code parsing. Runtime integration remains unverified until an operator runs the unit suite and provides a valid Daytona key in the configured Worker environment. Do not report a successful sandbox run without the returned per-step evidence.
