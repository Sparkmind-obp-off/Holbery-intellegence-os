import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { readFileSync, readdirSync } from "node:fs";
import app from "../src/index";

const migrations = () => readdirSync("migrations").filter((f) => f.endsWith(".sql")).sort().map((f) => readFileSync("migrations/" + f, "utf8")).join("\n");
class Statement {
  constructor(private db: DatabaseSync, private sql: string, private values: SQLInputValue[] = []) {}
  bind(...values: SQLInputValue[]) { return new Statement(this.db, this.sql, values); }
  async first<T = unknown>() { return (this.db.prepare(this.sql).get(...this.values) as T | undefined) ?? null; }
  async all<T = unknown>() { return { results: this.db.prepare(this.sql).all(...this.values) as T[] }; }
  async run() { const r = this.db.prepare(this.sql).run(...this.values); return { success: true, meta: { changes: Number(r.changes) } }; }
}
class LocalD1 {
  db = new DatabaseSync(":memory:");
  constructor() { this.db.exec(migrations()); }
  prepare(sql: string) { return new Statement(this.db, sql); }
  async batch(statements: Statement[]) {
    this.db.exec("BEGIN");
    try { const out = []; for (const s of statements) out.push(await s.run()); this.db.exec("COMMIT"); return out; }
    catch (e) { this.db.exec("ROLLBACK"); throw e; }
  }
}
let storage: LocalD1;
let cookie = "";
const secret = "agent-workspace-test-secret-never-production";
const env = (overrides: { OPERATOR_NAME?: string; GROQ_API_KEY?: string } = {}) => ({
  DB: storage as unknown as D1Database,
  OPERATOR_SECRET: secret,
  SESSION_SECRET: "agent-workspace-test-session-secret-never-production",
  OPERATOR_NAME: "agent-test-owner",
  HIO_ENVIRONMENT: "local",
  ...overrides,
});
async function request(path: string, method = "GET", body?: unknown, bindings: Record<string, unknown> = {}) {
  return app.request("https://hio.test" + path, {
    method,
    headers: { Origin: "https://hio.test", "X-HIO-Request": "operator", "Content-Type": "application/json", ...(cookie ? { Cookie: cookie } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  }, env(bindings));
}
async function login() {
  const r = await request("/api/session", "POST", { secret });
  expect(r.status).toBe(200);
  cookie = r.headers.get("set-cookie")!.split(";")[0]!;
}

describe("AI Agent Workspace", () => {
  beforeEach(() => { storage = new LocalD1(); cookie = ""; });
  afterEach(() => { vi.unstubAllGlobals(); storage.db.close(); });

  it("protects the workspace page and chat APIs with the existing operator session", async () => {
    expect((await request("/agent")).status).toBe(302);
    expect((await request("/api/v1/agent/conversations")).status).toBe(401);
    await login();
    expect((await request("/agent")).status).toBe(200);
    expect((await request("/api/v1/agent/conversations")).status).toBe(200);
  });

  it("serves workspace styles and behavior as same-origin assets compatible with the global CSP", async () => {
    await login();
    const r = await request("/agent");
    const html = await r.text();
    expect(html).toContain('href="/static/agent.css"');
    expect(html).toContain('src="/static/agent.js" defer');
    expect(html).not.toContain("<style>");
    expect(html).not.toContain("<script>");
    expect(readFileSync("public/static/agent.css", "utf8").length).toBeGreaterThan(100);
    expect(readFileSync("public/static/agent.js", "utf8").length).toBeGreaterThan(100);
  });


  it("creates a persisted, schema-validated plan without executing tools", async () => {
    await login();
    const plan = {
      title: "Validasi ide produk",
      summary: "Rencana terbatas untuk memeriksa masalah dan menyiapkan draft.",
      steps: [
        { title: "Cari bukti", description: "Cari sumber publik relevan dan simpan tautan.", tool: "research.search", risk: "read_only" },
        { title: "Analisis", description: "Bandingkan bukti dan catat ketidakpastian.", tool: "workspace.analyze", risk: "read_only" },
        { title: "Susun draft", description: "Siapkan draft ringkasan untuk ditinjau pemilik.", tool: "artifact.draft", risk: "draft_only" }
      ]
    };
    const mockFetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(plan) } }], usage: { total_tokens: 99 } }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", mockFetch);
    const r = await request("/api/v1/agent/runs", "POST", { objective: "Validasi ide produk digital untuk penjual online." }, { GROQ_API_KEY: "fake-test-key-only" });
    expect(r.status).toBe(201);
    const body = await r.json() as { run: { id: string; status: string }; plan: { steps: unknown[] }; executionStarted: boolean };
    expect(body.run.status).toBe("planned");
    expect(body.plan.steps).toHaveLength(3);
    expect(body.executionStarted).toBe(false);
    expect(storage.db.prepare("SELECT COUNT(*) AS n FROM agent_runs").get()).toMatchObject({ n: 1 });
    expect(storage.db.prepare("SELECT COUNT(*) AS n FROM agent_steps").get()).toMatchObject({ n: 3 });
    expect(storage.db.prepare("SELECT COUNT(*) AS n FROM agent_run_events").get()).toMatchObject({ n: 1 });
  });

  it("rejects malformed model plans and does not persist them", async () => {
    await login();
    const mockFetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ title: "Plan", summary: "Too few steps", steps: [] }) } }] }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", mockFetch);
    const r = await request("/api/v1/agent/runs", "POST", { objective: "Rencanakan riset pasar untuk produk digital." }, { GROQ_API_KEY: "fake-test-key-only" });
    expect(r.status).toBe(502);
    expect((await r.json() as { error: string }).error).toBe("invalid_plan");
    expect(storage.db.prepare("SELECT COUNT(*) AS n FROM agent_runs").get()).toMatchObject({ n: 0 });
  });

  it("scopes agent run details to the authenticated owner", async () => {
    await login();
    const plan = { title: "Rencana", summary: "Rencana uji.", steps: [
      { title: "Cari", description: "Cari bukti.", tool: "research.search", risk: "read_only" },
      { title: "Analisis", description: "Analisis bukti.", tool: "workspace.analyze", risk: "read_only" },
      { title: "Draft", description: "Tulis draft.", tool: "artifact.draft", risk: "draft_only" }
    ] };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(plan) } }] }), { status: 200, headers: { "Content-Type": "application/json" } })));
    const created = await request("/api/v1/agent/runs", "POST", { objective: "Rencanakan tugas validasi produk." }, { GROQ_API_KEY: "fake-test-key-only" });
    const body = await created.json() as { run: { id: string } };
    const otherOwner = await request("/api/v1/agent/runs/" + body.run.id, "GET", undefined, { OPERATOR_NAME: "different-owner" });
    expect(otherOwner.status).toBe(404);
  });
\n  it("returns an honest unavailable state when no provider key is configured", async () => {
    await login();
    const r = await request("/api/v1/agent/chat", "POST", { message: "Bantu rancang produk digital." });
    expect(r.status).toBe(503);
    expect((await r.json() as { error: string }).error).toBe("provider_missing");
    expect(storage.db.prepare("SELECT COUNT(*) AS n FROM agent_conversations").get()).toMatchObject({ n: 0 });
  });

  it("calls the configured model and persists both sides of a successful conversation", async () => {
    await login();
    const mockFetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ choices: [{ message: { content: "Ini jawaban uji." } }], usage: { total_tokens: 17 } }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", mockFetch);
    const r = await request("/api/v1/agent/chat", "POST", { message: "Halo AI" }, { GROQ_API_KEY: "fake-test-key-only" });
    expect(r.status).toBe(200);
    const body = await r.json() as { conversationId: string; message: { content: string }; provider: string };
    expect(body.message.content).toBe("Ini jawaban uji.");
    expect(body.provider).toBe("groq");
    expect(mockFetch).toHaveBeenCalledOnce();
    expect(storage.db.prepare("SELECT COUNT(*) AS n FROM agent_messages").get()).toMatchObject({ n: 2 });
  });

  it("does not allow another owner identity to read a conversation", async () => {
    await login();
    const mockFetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ choices: [{ message: { content: "Jawaban." } }] }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", mockFetch);
    const created = await request("/api/v1/agent/chat", "POST", { message: "Buat rencana" }, { GROQ_API_KEY: "fake-test-key-only" });
    const body = await created.json() as { conversationId: string };
    const otherOwner = await request("/api/v1/agent/conversations/" + body.conversationId + "/messages", "GET", undefined, { OPERATOR_NAME: "different-owner" });
    expect(otherOwner.status).toBe(404);
  });
});