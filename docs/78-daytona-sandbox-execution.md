# Daytona Coding Execution Adapter

## Purpose

HIO uses Daytona as the isolated execution provider for coding-task proposals. The Cloudflare Worker remains the authenticated control plane; generated code is written and tested only inside a disposable Daytona sandbox. This adapter does not submit a pull request, merge code, or deploy anything.

## Runtime configuration

Configure these Worker secrets/variables outside source control:

- `DAYTONA_API_KEY` (secret, required): Daytona API key.
- `DAYTONA_API_URL` (optional): API base URL; defaults to `https://app.daytona.io/api`.
- `DAYTONA_TOOLBOX_URL` (optional): toolbox proxy base URL; defaults to `https://proxy.app.daytona.io/toolbox`.
- `GROQ_API_KEY` (existing secret): required for proposal generation and automatic repair.

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

If a check after dependency installation fails, HIO can ask Groq for a bounded repair proposal, validate its paths against the original approved file set, write it to the sandbox, and rerun checks from typecheck. At most two repair proposals are applied. An invalid repair, failed write, missing provider, or repeated failure stops the loop. The endpoint returns per-step exit codes and bounded output.

Evidence is written to `agent_code_events` and `audit_events`. The sandbox is deleted in a `finally` cleanup path; Daytona's auto-delete interval is also configured as a backstop.

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


## Execution progress endpoint

- `GET /api/v1/agent/code-tasks/{taskId}/execution` returns the latest run status, current step, timestamps, and bounded evidence for the authenticated owner.
- `POST .../{taskId}/execute` claims a run atomically. Concurrent requests for the same task receive `409 execution_already_running` instead of creating duplicate sandboxes.
- Migration `0010_agent_code_execution_runs.sql` adds the progress record. Apply it only through the reviewed HIO migration process before enabling the endpoint.
- The execute request is still a synchronous Worker request; progress polling can observe its work while it is active, but this is not a durable background job. A future durable orchestration provider would be needed to guarantee completion beyond request/runtime limits.

## Execution console (`/agent/code`)

The operator UI for this flow is the **Konsol eksekusi coding** at `/agent/code` (linked from the AI Workspace sidebar; anonymous visitors are redirected to `/`). It uses only the existing endpoints:

- `GET /api/v1/agent/code-tasks` — list; now also returns `file_count`, `check_count`, `execution_status`, `execution_step`, `execution_updated_at` (LEFT JOIN on the owner's run record; `null` means no run exists).
- `GET /api/v1/agent/code-tasks/{id}` — proposal review (files, rationale, AI-suggested checks).
- `POST /api/v1/agent/code-tasks/{id}/execute` — only after the operator ticks a confirmation checkbox and clicks once; a pending guard blocks duplicate submits. 502 with `runId` is rendered as a recorded failure, 409 as "already running" (monitor, no resubmit), 503 as "sandbox not configured".
- `GET /api/v1/agent/code-tasks/{id}/execution` — polled every 2 s while running (no overlapping requests, exponential backoff to 15 s on errors, paused while the tab is hidden, stopped on passed/failed or navigation). `404 execution_not_found` is shown as "no execution record", never as success. A dropped connection re-reads status before offering any retry.

Rendering rules: the seven fixed checks are shown from backend evidence only; repaired checks show every attempt in order (`exit 2 → 0`) and the latest attempt decides the state. Evidence now includes `sandboxDisposed` (true/false/null) so the report only claims cleanup when the backend confirmed it. Every final report states that sandbox validation is not a PR, merge, or production deploy. All task and log text is inserted via `textContent`; the page uses same-origin assets only (CSP-compatible, no inline styles).

Verification: `tests/code-console.test.ts` (route auth, CSP-safe assets, list fields, owner scoping, 404/503 honesty) and `npm run test:console` (local Playwright with stubbed API states: empty, network error, running→passed after repair, running→failed after 2 repairs, 503, 409, connection drop, 401, invalid id, mobile + axe). A real Daytona run remains **NOT VERIFIED** until `DAYTONA_API_KEY` is configured for the Worker.

The toolbox `process/execute` call now sends the Bearer API key (required by the Daytona toolbox API); previously every sandbox command would have been rejected.
