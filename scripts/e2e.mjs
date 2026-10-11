import { readFileSync, mkdirSync } from "node:fs";
import assert from "node:assert/strict";
import { chromium, request, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const base = "http://localhost:3000"; // Deliberately cannot mutate production.
const secret = readFileSync(".dev.vars", "utf8").match(
  /^OPERATOR_SECRET=(.+)$/m,
)?.[1];
assert.ok(secret, "Run node scripts/init-local.mjs first");
mkdirSync("test-results", { recursive: true });
const api = await request.newContext({
  baseURL: base,
  extraHTTPHeaders: { Origin: base, "X-HIO-Request": "operator" },
});
async function call(path, method = "get", data, expected = 200) {
  const r = await api[method](
    "/api" + path,
    data === undefined ? {} : { data },
  );
  assert.equal(
    r.status(),
    expected,
    `${method} ${path}: expected ${expected}, got ${r.status()}`,
  );
  return r.json();
}
await call("/v1/sources", "get", undefined, 401);
await call("/v1/secrets", "get", undefined, 401);
await call("/health");
await call("/session", "post", { secret });
const registry = await call("/v1/plugins");
for (const manifest of registry.available) {
  if (!registry.items.some((p) => p.id === manifest.id))
    await call("/v1/plugins", "post", manifest, 201);
  await call("/v1/plugins/" + manifest.id, "patch", {
    enabled: true,
    grants: manifest.permissions,
  });
}
await call("/v1/sources/fixture", "patch", { enabled: true });
const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox"],
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => {
  if (m.type() === "error" && !/401/.test(m.text())) errors.push(m.text());
});
try {
  // Real local API, delayed before initial session lookup: login must wait for bootstrap.
  await page.route(
    "**/api/v1/me",
    async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await route.continue();
    },
    { times: 1 },
  );
  await page.goto(base);
  await expect(page.locator("#login-panel")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Masuk ke workspace" }),
  ).toBeDisabled();
  await expect(page.getByLabel("Kredensial operator")).toBeDisabled();
  await page.getByLabel("Kredensial operator").fill(secret);
  await page.getByRole("button", { name: "Masuk ke workspace" }).click();
  await expect(page.locator("#workspace")).toBeVisible();
  await page.waitForTimeout(1800);
  await expect(page.locator("#workspace")).toBeVisible();
  await expect(page.locator("#page-content h1")).toHaveText(
    "Evidence before exposure.",
  );
  await page.screenshot({
    path: "test-results/overview-desktop.png",
    fullPage: true,
  });
  await page.locator('nav a[href="/intelligence"]').click();
  await expect(page.locator("#intelligence-form")).toBeVisible();
  await page
    .locator("#field-question")
    .fill("Which Indonesian B2B teams need research provenance?");
  await page.locator("#field-segment").fill("Small B2B teams");
  await page.locator("#field-geography").fill("Indonesia");
  await page
    .locator("#field-problem")
    .fill('Repeated research <script>alert("untrusted")</script>');
  await page
    .locator("#field-payerHypothesis")
    .fill("Team lead with unverified budget");
  await page.locator("#field-connector").selectOption("custom-api");
  await page.locator('#intelligence-form button[type="submit"]').click();
  await expect(page.locator("#dialog-content")).toContainText(
    "unvalidated-research-plan",
  );
  await expect(page.locator("#dialog-content")).toContainText("research-only");
  await page.locator("#close-dialog").click();
  await page.reload();
  await expect(page.locator("#page-content")).toContainText(
    "Which Indonesian B2B teams",
  );
  await page.locator('[data-action="intelligence-detail"]').first().click();
  await expect(page.locator("#dialog-content")).toContainText(
    "counterEvidence",
  );
  await expect(page.locator("#dialog-content")).toContainText("custom-api");
  await page.locator("#close-dialog").click();
  await page.screenshot({
    path: "test-results/intelligence-desk-desktop.png",
    fullPage: true,
  });
  await page.locator('nav a[href="/runs"]').click();
  await expect(page.locator("#run-form")).toBeVisible();
  await page.locator("#field-key").fill("browser-" + crypto.randomUUID());
  await page.waitForTimeout(2200);
  await page.locator('#run-form button[type="submit"]').click();
  await expect(page.locator("#detail-dialog")).toBeVisible();
  await expect(page.locator("#dialog-content")).toContainText("succeeded");
  await page.locator("#close-dialog").click();
  await page.locator('nav a[href="/evidence"]').click();
  await expect(page.locator(".evidence-card")).toHaveCount(3);
  await page.getByRole("button", { name: "Lihat provenance" }).first().click();
  await expect(page.locator("#dialog-content")).toContainText("captured_at");
  await page.locator("#close-dialog").click();
  await page.locator('nav a[href="/opportunities"]').click();
  await expect(page.locator(".score")).toContainText("67");
  await page.locator("#field-choice").selectOption("approve_fixture");
  await page
    .locator("#field-rationale")
    .fill(
      "Synthetic browser workflow approved; no live spending or demand claim.",
    );
  await page
    .locator("#field-reviewerNotes")
    .fill("Counter-evidence: a spreadsheet might be sufficient.");
  await page.locator('#decision-form button[type="submit"]').click();
  await expect(page.locator("#notice")).toContainText(
    "Perubahan dikonfirmasi server",
  );
  await page.locator('nav a[href="/experiments"]').click();
  await expect(page.locator("#experiment-form")).toBeVisible();
  const latest = (await call("/v1/decisions")).items[0];
  await page.locator("#field-decisionId").selectOption(latest.id);
  await page
    .locator("#field-hypothesis")
    .fill("Browser fixture can preserve provenance and human review.");
  await page
    .locator("#field-successCriteria")
    .fill(
      "Three unique evidence records, counter-evidence and decision snapshot.",
    );
  await page
    .locator("#field-stopCriteria")
    .fill("Stop if provenance is absent; no external action.");
  await page.locator('#experiment-form button[type="submit"]').click();
  await expect(page.locator(".outcome-form").first()).toBeVisible();
  const outcome = page.locator(".outcome-form").first();
  await outcome
    .locator("textarea")
    .nth(0)
    .fill("Fixture E2E completed. No commercial or payment validation.");
  await outcome
    .locator("textarea")
    .nth(1)
    .fill("Next gate: authorize real sources and human-bounded market test.");
  await outcome.locator('button[type="submit"]').click();
  await expect(page.locator(".evidence-card").first()).toContainText(
    "completed",
  );
  await call("/v1/mcp/call", "post", {
    jsonrpc: "2.0",
    id: "browser-tool",
    method: "tools/call",
    params: { name: "evidence.list", arguments: { limit: 4 } },
  });
  await call(
    "/v1/mcp/call",
    "post",
    {
      jsonrpc: "2.0",
      id: "bad-tool",
      method: "tools/call",
      params: { name: "shell.exec", arguments: { limit: 4 } },
    },
    400,
  );
  await page.goto(base + "/secrets");
  await expect(page.locator("#page-content h1")).toHaveText("Secrets Owner");
  await expect(page.locator("#page-content")).toContainText(
    "Configured ≠ recoverable",
  );
  await expect(page.locator("table tbody tr")).toHaveCount(6);
  assert.ok(
    !(await page.content()).includes(secret),
    "Owner inventory HTML must not contain credential",
  );
  const inventory = await call("/v1/secrets");
  assert.ok(
    !JSON.stringify(inventory).includes(secret),
    "Inventory JSON must not contain credential",
  );
  assert.ok(
    inventory.items
      .filter((s) => s.environment === "local")
      .every((s) => s.status === "configured"),
  );
  assert.ok(
    inventory.items
      .filter((s) => s.environment !== "local")
      .every((s) => s.status === "unknown"),
  );
  await page.locator('[data-action="secret-instructions"]').first().click();
  await expect(page.locator("#notice")).toContainText("Instruksi");
  const copyVisible = await page.locator("#detail-dialog").isVisible();
  if (copyVisible) {
    await expect(page.locator("#dialog-content")).toContainText("No old value");
    await page.locator("#close-dialog").click();
  }
  await page.locator("#field-secretName").selectOption("SESSION_SECRET");
  await page.locator("#field-secretEnvironment").selectOption("local");
  await page.locator("#rotation-confirmation").check();
  await page.locator('#secret-rotation-form button[type="submit"]').click();
  await expect(page.locator("#detail-dialog")).toBeVisible();
  await expect(page.locator("#dialog-content")).toContainText(
    "No Cloudflare secret was changed",
  );
  await page.locator("#close-dialog").click();
  await page.reload();
  await expect(page.locator("#page-content")).toContainText(
    "owner-reported metadata",
  );
  await page.screenshot({
    path: "test-results/secrets-owner-desktop.png",
    fullPage: true,
  });
  for (const path of [
    "/",
    "/intelligence",
    "/sources",
    "/runs",
    "/evidence",
    "/clusters",
    "/opportunities",
    "/decisions",
    "/experiments",
    "/plugins",
    "/settings",
    "/secrets",
    "/manual",
  ]) {
    await page.goto(base + path);
    await expect(page.locator("#page-content h1")).toBeVisible();
    const a11y = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    assert.deepEqual(
      a11y.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => n.target),
      })),
      [],
      `Accessibility violations: ${path}`,
    );
  }
  await page.goto(base + "/manual");
  await expect(page.locator("#page-content")).toContainText(
    "Manual version 0.2.0",
  );
  await page.keyboard.press("Tab");
  assert.ok(
    await page.evaluate(() => document.activeElement !== document.body),
    "Keyboard focus should reach an interactive control",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base);
  await expect(page.locator("#page-content h1")).toBeVisible();
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
    "Mobile page should not overflow horizontally",
  );
  await page.locator("#menu-toggle").click();
  await expect(page.locator("#sidebar")).toHaveClass("open");
  await page.locator('nav a[href="/manual"]').click();
  await expect(page.locator("#page-content h1")).toHaveText("Manual & help");
  await expect(page.locator("#sidebar")).not.toHaveClass("open");
  await page.screenshot({
    path: "test-results/manual-mobile.png",
    fullPage: true,
  });
  await page.locator("#logout-button").click();
  await expect(page.locator("#login-panel")).toBeVisible();
  await page.reload();
  await expect(page.locator("#login-panel")).toBeVisible();
  assert.deepEqual(errors, [], "Unexpected browser JS/CSP errors");
  await call("/v1/plugins/hio.fixture", "patch", {
    enabled: false,
    grants: [],
  });
  await call(
    "/v1/runs",
    "post",
    {
      sourceId: "fixture",
      key: "disabled-" + crypto.randomUUID(),
      mode: "normal",
      limit: 4,
    },
    403,
  );
  await call("/v1/plugins/hio.mcp-fixture", "patch", {
    enabled: false,
    grants: [],
  });
  await call(
    "/v1/mcp/call",
    "post",
    {
      jsonrpc: "2.0",
      id: "disabled-tool",
      method: "tools/call",
      params: { name: "evidence.list", arguments: { limit: 4 } },
    },
    403,
  );
  await call("/v1/sources/fixture", "patch", { enabled: false });
  console.log(
    "PASS: actual local Wrangler/D1 API + browser source→evidence→decision→experiment→learning; 13 desktop routes WCAG smoke; persisted Intelligence Desk plan/reload and escaped source text; Secrets Owner inventory/metadata/redaction; mobile/keyboard/logout; disabled-plugin checks.",
  );
} finally {
  await browser.close();
  await api.dispose();
}
