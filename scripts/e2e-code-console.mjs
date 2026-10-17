// Coding Agent Execution Console browser acceptance (local only; never targets
// production). Uses a real operator session, then stubs the code-task API in the
// browser so every execution state can be exercised without Daytona or quota.
import { readFileSync, mkdirSync } from "node:fs";
import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const base = "http://localhost:3000";
const secret = readFileSync(".dev.vars", "utf8").match(
  /^OPERATOR_SECRET=(.+)$/m,
)?.[1];
assert.ok(secret, "Run node scripts/init-local.mjs first");
mkdirSync("test-results", { recursive: true });

const ID = "00000000-0000-4000-8000-00000000c0de";
const RUN = "00000000-0000-4000-8000-0000000000aa";
const iso = (s) => new Date(Date.UTC(2026, 9, 17, 9, 0, s)).toISOString();
const task = {
  id: ID,
  objective: "Tambah util format tanggal untuk laporan",
  status: "draft",
  base_ref: "main",
  branch_name: null,
  title: "Util format tanggal",
  summary: "Menambah helper formatDate dan tesnya.",
  pr_url: null,
  error_code: null,
  created_at: iso(0),
  updated_at: iso(1),
  submitted_at: null,
  file_count: 1,
  check_count: 1,
  execution_status: null,
  execution_step: null,
  execution_updated_at: null,
};
const detail = {
  task,
  files: [
    {
      path: "src/format-date.ts",
      content:
        'export const formatDate = (d: Date) => d.toISOString().slice(0, 10);\n// <img src=x onerror="window.__xss=1">\n',
      rationale: "Helper kecil yang dapat dites.",
    },
  ],
  checks: ["npm test"],
};
const step = (name, exitCode, output = name + " output") => ({
  name,
  exitCode,
  output,
});
const exec = (status, currentStep, steps, extra = {}) => ({
  execution: {
    taskId: ID,
    runId: RUN,
    status,
    currentStep,
    startedAt: iso(10),
    updatedAt: iso(20 + steps.length),
    finishedAt: status === "running" ? null : iso(60),
    errorCode: status === "failed" ? "checks_failed" : null,
    evidence: {
      provider: "daytona",
      sandboxCreated: true,
      sandboxDisposed: status === "running" ? null : true,
      repairAttempts: extra.repairAttempts ?? 0,
      steps,
    },
  },
});
const ALL = [
  "install",
  "typecheck",
  "lint",
  "format",
  "tests",
  "security",
  "build",
];

function stub(page, h) {
  const calls = { post: 0, poll: 0, maxConcurrentPolls: 0, inflight: 0 };
  page.route("**/api/v1/agent/code-tasks**", async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const json = (status, body) =>
      route.fulfill({
        status,
        contentType: "application/json",
        body: JSON.stringify(body),
      });
    if (url.pathname === "/api/v1/agent/code-tasks")
      return h.list ? h.list(route, json) : json(200, { items: [task] });
    if (url.pathname.endsWith("/execute")) {
      calls.post++;
      assert.equal(req.headers()["x-hio-request"], "operator");
      return h.execute(route, json);
    }
    if (url.pathname.endsWith("/execution")) {
      calls.poll++;
      calls.inflight++;
      calls.maxConcurrentPolls = Math.max(
        calls.maxConcurrentPolls,
        calls.inflight,
      );
      try {
        return await h.execution(route, json, calls);
      } finally {
        calls.inflight--;
      }
    }
    return json(200, detail);
  });
  return calls;
}
async function axe(page, where) {
  const r = await new AxeBuilder({ page }).analyze();
  const serious = r.violations.filter((v) =>
    ["serious", "critical"].includes(v.impact),
  );
  assert.deepEqual(
    serious.map((v) => v.id),
    [],
    "axe violations on " + where,
  );
}

const browser = await chromium.launch();
const results = [];
// One real sign-in (login is rate limited); its cookie is shared by scenarios.
const loginCtx = await browser.newContext();
const login = await loginCtx.request.post(base + "/api/session", {
  headers: { Origin: base, "X-HIO-Request": "operator" },
  data: { secret },
});
assert.equal(login.status(), 200, "login");
const storageState = await loginCtx.storageState();
await loginCtx.close();
async function scenario(name, fn, viewport) {
  const ctx = await browser.newContext({
    viewport: viewport || { width: 1280, height: 900 },
    storageState,
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => {
    if (m.type() === "error" && !/Failed to load resource/.test(m.text()))
      errors.push(m.text());
  });
  try {
    await fn(page);
    assert.deepEqual(errors, [], "page errors");
    results.push("PASS " + name);
  } catch (e) {
    await page.screenshot({
      path: "test-results/code-console-" + name.replace(/\W+/g, "-") + ".png",
      fullPage: true,
    });
    results.push("FAIL " + name + ": " + e.message);
  } finally {
    await ctx.close();
  }
}

// 1. Empty list.
await scenario("empty list", async (page) => {
  stub(page, { list: (_r, json) => json(200, { items: [] }) });
  await page.goto(base + "/agent/code");
  await expect(page.getByText("Belum ada coding task.")).toBeVisible();
  await axe(page, "empty");
});

// 2. List error (network) is not shown as data.
await scenario("list network error", async (page) => {
  stub(page, { list: (route) => route.abort("failed") });
  await page.goto(base + "/agent/code");
  await expect(page.getByText(/Daftar gagal dimuat/)).toBeVisible();
});

// 3. Detail, code viewer, no record, intentional + single execution, polling,
//    running -> failed check -> repair -> passed.
await scenario("execute running to passed after repair", async (page) => {
  let releasePost;
  const postDone = new Promise((r) => (releasePost = r));
  let phase = 0;
  const calls = stub(page, {
    execute: async (_r, json) => {
      await postDone;
      return json(200, { runId: RUN, status: "passed" });
    },
    execution: async (_r, json, c) => {
      await new Promise((r) => setTimeout(r, 300));
      if (c.post === 0) return json(404, { error: "execution_not_found" });
      if (phase <= 1)
        return json(
          200,
          exec("running", "typecheck", [step("clone", 0), step("install", 0)]),
        );
      if (phase === 2)
        return json(
          200,
          exec("running", "repair_applied", [
            step("clone", 0),
            step("install", 0),
            step("typecheck", 2, "src/format-date.ts(1,1): error TS2322"),
            step("repair:src/format-date.ts", 0),
          ]),
        );
      const steps = [
        step("clone", 0),
        step("install", 0),
        step("typecheck", 2, "error TS2322"),
        step("repair:src/format-date.ts", 0),
        ...ALL.slice(1).map((n) => step(n, 0)),
      ];
      return json(
        200,
        exec("passed", "completed", steps, { repairAttempts: 1 }),
      );
    },
  });
  await page.goto(base + "/agent/code?task=" + ID);
  await expect(page.locator("#cc-heading")).toHaveText(/Util format tanggal/);
  await page.locator(".cc-file summary").first().click();
  const code = page.locator(".cc-code").first();
  await expect(code).toContainText("formatDate");
  await expect(code).toContainText('<img src=x onerror="window.__xss=1">');
  assert.equal(await page.evaluate(() => window.__xss), undefined);
  await expect(
    page.getByText(/Belum ada catatan eksekusi untuk task ini/).first(),
  ).toBeVisible();
  assert.equal(calls.post, 0, "no automatic execution on open");
  const run = page.locator("#cc-run");
  await expect(run).toBeDisabled();
  await page.locator("#cc-confirm").check();
  await expect(run).toBeEnabled();
  // Two synchronous clicks on the same button: the second must be ignored.
  await page.evaluate(() => {
    const b = document.querySelector("#cc-run");
    b.click();
    b.click();
  });
  await expect(page.getByText("Mengirim permintaan eksekusi…")).toBeVisible();
  await expect(page.locator(".cc-current")).toContainText("TypeScript", {
    timeout: 8000,
  });
  await expect(page.locator(".cc-report")).toHaveCount(0);
  phase = 2;
  await expect(page.locator(".cc-step.bad")).toHaveCount(1, { timeout: 10000 });
  await expect(page.locator(".cc-report")).toHaveCount(0);
  phase = 3;
  releasePost();
  await expect(page.locator(".cc-report.ok")).toBeVisible({ timeout: 15000 });
  await expect(page.getByText("Lulus setelah perbaikan")).toBeVisible();
  await expect(page.getByText(/exit 2 → 0/)).toBeVisible();
  await expect(
    page.getByText(/sudah dihapus \(dikonfirmasi backend\)/),
  ).toBeVisible();
  await expect(
    page.getByText(/bukan pull request, bukan merge, dan bukan deploy/),
  ).toBeVisible();
  assert.equal(calls.post, 1, "exactly one execute request");
  await page
    .locator("#cc-exec")
    .screenshot({ path: "test-results/code-console-desktop-passed.png" });
  assert.equal(calls.maxConcurrentPolls, 1, "polls never overlap");
  const pollsAtEnd = calls.poll;
  await page.waitForTimeout(5000);
  assert.ok(calls.poll <= pollsAtEnd + 1, "polling stops after completion");
  await axe(page, "passed");
});

// 4. Failed run (502 with runId) after max repairs: shows failure, never success.
await scenario("execute failed after repairs", async (page) => {
  let done = false;
  stub(page, {
    execute: async (_r, json) => {
      await new Promise((r) => setTimeout(r, 2500));
      done = true;
      return json(502, { error: "checks_failed", runId: RUN });
    },
    execution: (_r, json, c) => {
      if (c.post === 0) return json(404, { error: "execution_not_found" });
      const steps = [
        step("clone", 0),
        step("install", 0),
        step("typecheck", 0),
        step("lint", 1, "lint error 1"),
        step("repair:src/format-date.ts", 0),
        step("typecheck", 0),
        step("lint", 1, "lint error 2"),
        step("repair:src/format-date.ts", 0),
        step("typecheck", 0),
        step("lint", 1, "lint error 3"),
      ];
      return json(
        200,
        done
          ? exec("failed", "failed", steps, { repairAttempts: 2 })
          : exec("running", "lint", steps.slice(0, 4)),
      );
    },
  });
  await page.goto(base + "/agent/code?task=" + ID);
  await page.locator("#cc-confirm").check();
  await page.locator("#cc-run").click();
  await expect(page.locator(".cc-report.bad")).toBeVisible({ timeout: 15000 });
  await expect(page.locator(".cc-report.ok")).toHaveCount(0);
  await expect(page.getByText(/exit 1 → 1 → 1/)).toBeVisible();
  await expect(page.getByText(/2 dari maks\. 2/)).toBeVisible();
});

// 5. Provider not configured (503) is an error and creates no fake run.
await scenario("daytona not configured", async (page) => {
  stub(page, {
    execute: (_r, json) =>
      json(503, { error: "daytona_not_configured", message: "x" }),
    execution: (_r, json) => json(404, { error: "execution_not_found" }),
  });
  await page.goto(base + "/agent/code?task=" + ID);
  await page.locator("#cc-confirm").check();
  await page.locator("#cc-run").click();
  await expect(page.getByText(/Sandbox belum dikonfigurasi/)).toBeVisible();
  await expect(page.locator(".cc-report")).toHaveCount(0);
});

// 6. Conflict (409 already running) shows warning and keeps monitoring.
await scenario("execution already running", async (page) => {
  stub(page, {
    execute: (_r, json) => json(409, { error: "execution_already_running" }),
    execution: (_r, json, c) =>
      c.post === 0
        ? json(404, { error: "execution_not_found" })
        : json(200, exec("running", "tests", [step("install", 0)])),
  });
  await page.goto(base + "/agent/code?task=" + ID);
  await page.locator("#cc-confirm").check();
  await page.locator("#cc-run").click();
  await expect(page.locator(".cc-alert.warn").first()).toContainText(
    /sedang dieksekusi/,
  );
  await expect(page.locator("#cc-run")).toHaveCount(0);
});

// 6b. Connection drops during the synchronous POST: status is re-read, no retry spam.
await scenario("connection drop during execute", async (page) => {
  const calls = stub(page, {
    execute: async (route) => {
      await new Promise((r) => setTimeout(r, 500));
      return route.abort("connectionreset");
    },
    execution: (_r, json, c) =>
      c.post === 0
        ? json(404, { error: "execution_not_found" })
        : json(200, exec("running", "tests", [step("install", 0)])),
  });
  await page.goto(base + "/agent/code?task=" + ID);
  await page.locator("#cc-confirm").check();
  await page.locator("#cc-run").click();
  await expect(page.getByText(/Hubungan ke server terputus/)).toBeVisible();
  await expect(page.locator(".cc-current")).toContainText("Tes");
  await expect(page.locator("#cc-run")).toHaveCount(0);
  assert.equal(calls.post, 1);
});

// 7. Session expiry during polling.
await scenario("session expired", async (page) => {
  stub(page, {
    execute: () => new Promise(() => {}),
    execution: (_r, json) => json(401, { error: "unauthorized" }),
  });
  await page.goto(base + "/agent/code?task=" + ID);
  await expect(page.getByText("Sesi berakhir")).toBeVisible();
});

// 8. Invalid task id.
await scenario("invalid task id", async (page) => {
  stub(page, {});
  await page.goto(base + "/agent/code?task=not-a-uuid");
  await expect(page.getByText(/ID task tidak valid/).first()).toBeVisible();
});

// 9. Mobile layout: list first, detail replaces it, back returns; no h-scroll.
await scenario(
  "mobile",
  async (page) => {
    stub(page, {
      execution: (_r, json) =>
        json(
          200,
          exec(
            "passed",
            "completed",
            ALL.map((n) => step(n, 0)),
          ),
        ),
    });
    await page.goto(base + "/agent/code");
    await page.locator(".cc-item").first().click();
    await expect(page.locator("#cc-back")).toBeVisible();
    await expect(page.locator(".cc-side")).toBeHidden();
    await expect(page.locator(".cc-report.ok")).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    assert.equal(overflow, false, "no horizontal overflow");
    await page.screenshot({
      path: "test-results/code-console-mobile.png",
      fullPage: true,
    });
    await axe(page, "mobile");
    await page.locator("#cc-back").click();
    await expect(page.locator(".cc-side")).toBeVisible();
  },
  { width: 390, height: 844 },
);

await browser.close();
for (const r of results) console.log(r);
const failed = results.filter((r) => r.startsWith("FAIL"));
console.log(
  `${results.length - failed.length}/${results.length} scenarios passed`,
);
process.exit(failed.length ? 1 : 0);
