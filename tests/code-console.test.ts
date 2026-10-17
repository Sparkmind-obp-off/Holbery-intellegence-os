import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { readFileSync, readdirSync } from "node:fs";
import app from "../src/index";

const migrations = () =>
  readdirSync("migrations")
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .map((f) => readFileSync("migrations/" + f, "utf8"))
    .join("\n");
class Statement {
  constructor(
    private db: DatabaseSync,
    private sql: string,
    private values: SQLInputValue[] = [],
  ) {}
  bind(...values: SQLInputValue[]) {
    return new Statement(this.db, this.sql, values);
  }
  async first<T = unknown>() {
    return (
      (this.db.prepare(this.sql).get(...this.values) as T | undefined) ?? null
    );
  }
  async all<T = unknown>() {
    return { results: this.db.prepare(this.sql).all(...this.values) as T[] };
  }
  async run() {
    const r = this.db.prepare(this.sql).run(...this.values);
    return { success: true, meta: { changes: Number(r.changes) } };
  }
}
class LocalD1 {
  db = new DatabaseSync(":memory:");
  constructor() {
    this.db.exec(migrations());
  }
  prepare(sql: string) {
    return new Statement(this.db, sql);
  }
  async batch(statements: Statement[]) {
    this.db.exec("BEGIN");
    try {
      const out = [];
      for (const s of statements) out.push(await s.run());
      this.db.exec("COMMIT");
      return out;
    } catch (e) {
      this.db.exec("ROLLBACK");
      throw e;
    }
  }
}
let storage: LocalD1;
let cookie = "";
const secret = "agent-workspace-test-secret-never-production";
const env = (
  overrides: { OPERATOR_NAME?: string; GROQ_API_KEY?: string } = {},
) => ({
  DB: storage as unknown as D1Database,
  OPERATOR_SECRET: secret,
  SESSION_SECRET: "agent-workspace-test-session-secret-never-production",
  OPERATOR_NAME: "agent-test-owner",
  HIO_ENVIRONMENT: "local",
  ...overrides,
});
async function request(
  path: string,
  method = "GET",
  body?: unknown,
  bindings: Record<string, unknown> = {},
) {
  return app.request(
    "https://hio.test" + path,
    {
      method,
      headers: {
        Origin: "https://hio.test",
        "X-HIO-Request": "operator",
        "Content-Type": "application/json",
        ...(cookie ? { Cookie: cookie } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    },
    env(bindings),
  );
}
async function login() {
  const r = await request("/api/session", "POST", { secret });
  expect(r.status).toBe(200);
  cookie = r.headers.get("set-cookie")!.split(";")[0]!;
}

const OWNER = "agent-test-owner";
const now = () => new Date().toISOString();
function insertTask(id: string, owner = OWNER, status = "draft") {
  storage.db
    .prepare(
      "INSERT INTO agent_code_tasks(id,owner_id,objective,status,base_ref,branch_name,title,summary,files_json,checks_json,created_at,updated_at) VALUES (?,?,?,?,'main',NULL,?,?,?,?,?,?)",
    )
    .run(
      id,
      owner,
      "Tambah fitur uji konsol eksekusi",
      status,
      "Task konsol",
      "Ringkasan task konsol",
      JSON.stringify([
        { path: "src/a.ts", content: "export const a = 1;\n", rationale: "r1" },
        { path: "src/b.ts", content: "export const b = 2;\n", rationale: "r2" },
      ]),
      JSON.stringify(["npm test"]),
      now(),
      now(),
    );
}
function insertRun(taskId: string, owner = OWNER, status = "running") {
  storage.db
    .prepare(
      "INSERT INTO agent_code_execution_runs(task_id,run_id,owner_id,status,current_step,started_at,updated_at,finished_at,error_code,evidence_json) VALUES (?,?,?,?,?,?,?,?,?,?)",
    )
    .run(
      taskId,
      "00000000-0000-4000-8000-0000000000aa",
      owner,
      status,
      status === "running" ? "typecheck" : "completed",
      now(),
      now(),
      status === "running" ? null : now(),
      status === "failed" ? "checks_failed" : null,
      JSON.stringify({
        provider: "daytona",
        sandboxCreated: true,
        repairAttempts: 0,
        steps: [{ name: "install", exitCode: 0, output: "ok" }],
      }),
    );
}
const ID1 = "00000000-0000-4000-8000-000000000101";
const ID2 = "00000000-0000-4000-8000-000000000102";

describe("Coding Agent Execution Console", () => {
  beforeEach(() => {
    storage = new LocalD1();
    cookie = "";
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    storage.db.close();
  });

  it("redirects anonymous visitors and serves a CSP-compatible page to the operator", async () => {
    const anon = await request("/agent/code");
    expect(anon.status).toBe(302);
    expect(anon.headers.get("location")).toBe("/");
    await login();
    const r = await request("/agent/code");
    expect(r.status).toBe(200);
    const html = await r.text();
    expect(html).toContain('href="/static/code-console.css"');
    expect(html).toContain('src="/static/code-console.js" defer');
    expect(html).not.toContain("<style");
    expect(html).not.toContain("<script>");
    expect(html).not.toMatch(/style="/);
    expect((await request("/agent/code/")).status).toBe(301);
    const agent = await (await request("/agent")).text();
    expect(agent).toContain('href="/agent/code"');
  });

  it("ships console assets that never render untrusted markup or inline styles", () => {
    const js = readFileSync("public/static/code-console.js", "utf8");
    expect(js).not.toMatch(
      /innerHTML|outerHTML|insertAdjacentHTML|eval\(|new Function/,
    );
    expect(js).not.toMatch(/style:\s*"/);
    expect(js).not.toMatch(/localStorage|sessionStorage|document\.cookie/);
    expect(js).toContain('"X-HIO-Request": "operator"');
    expect(
      readFileSync("public/static/code-console.css", "utf8").length,
    ).toBeGreaterThan(1000);
  });

  it("lists tasks with file counts and the latest execution status, scoped to the owner", async () => {
    await login();
    insertTask(ID1);
    insertTask(ID2, "someone-else");
    insertRun(ID1, OWNER, "failed");
    insertRun(ID2, "someone-else", "passed");
    const r = await request("/api/v1/agent/code-tasks");
    expect(r.status).toBe(200);
    const { items: tasks } = (await r.json()) as {
      items: Record<string, unknown>[];
    };
    expect(tasks).toHaveLength(1);
    expect(tasks[0]).toMatchObject({
      id: ID1,
      file_count: 2,
      check_count: 1,
      execution_status: "failed",
      execution_step: "completed",
    });
  });

  it("reports tasks without a run record as having no execution status", async () => {
    await login();
    insertTask(ID1);
    const { items: tasks } = (await (
      await request("/api/v1/agent/code-tasks")
    ).json()) as {
      items: Record<string, unknown>[];
    };
    expect(tasks[0]!.execution_status).toBeNull();
    const ex = await request("/api/v1/agent/code-tasks/" + ID1 + "/execution");
    expect(ex.status).toBe(404);
    expect(((await ex.json()) as { error: string }).error).toBe(
      "execution_not_found",
    );
  });

  it("returns persisted execution evidence only to the owning operator", async () => {
    await login();
    insertTask(ID1);
    insertRun(ID1);
    insertTask(ID2, "someone-else");
    insertRun(ID2, "someone-else");
    const mine = await request(
      "/api/v1/agent/code-tasks/" + ID1 + "/execution",
    );
    expect(mine.status).toBe(200);
    const body = (await mine.json()) as { execution: Record<string, unknown> };
    expect(body.execution).toMatchObject({
      taskId: ID1,
      status: "running",
      currentStep: "typecheck",
    });
    expect(
      (body.execution.evidence as { steps: unknown[] }).steps,
    ).toHaveLength(1);
    expect(
      (await request("/api/v1/agent/code-tasks/" + ID2 + "/execution")).status,
    ).toBe(404);
    expect((await request("/api/v1/agent/code-tasks/" + ID2)).status).toBe(404);
    expect(
      (await request("/api/v1/agent/code-tasks/not-a-uuid/execution")).status,
    ).toBe(400);
  });

  it("rejects execution honestly when Daytona is not configured, without creating a run", async () => {
    await login();
    insertTask(ID1);
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const r = await request(
      "/api/v1/agent/code-tasks/" + ID1 + "/execute",
      "POST",
    );
    expect(r.status).toBe(503);
    expect(((await r.json()) as { error: string }).error).toBe(
      "daytona_not_configured",
    );
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(
      (await request("/api/v1/agent/code-tasks/" + ID1 + "/execution")).status,
    ).toBe(404);
  });

  it("requires the operator mutation header before starting an execution", async () => {
    await login();
    insertTask(ID1);
    const r = await app.request(
      "https://hio.test/api/v1/agent/code-tasks/" + ID1 + "/execute",
      {
        method: "POST",
        headers: { Origin: "https://hio.test", Cookie: cookie },
      },
      env({ DAYTONA_API_KEY: "daytona-test-key-never-production" } as never),
    );
    expect([400, 403]).toContain(r.status);
  });

  it("limits each owner to one running sandbox execution", async () => {
    await login();
    insertTask(ID1);
    insertTask(ID2);
    insertRun(ID2, OWNER, "running");
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const r = await request(
      "/api/v1/agent/code-tasks/" + ID1 + "/execute",
      "POST",
      undefined,
      { DAYTONA_API_KEY: "daytona-test-key-never-production" },
    );
    expect(r.status).toBe(429);
    expect(((await r.json()) as { error: string }).error).toBe(
      "owner_execution_limit",
    );
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
