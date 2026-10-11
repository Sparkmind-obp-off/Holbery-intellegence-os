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
  await page.goto(base);
  await expect(page.locator("#login-panel")).toBeVisible();
  await page.getByLabel("Kredensial operator").fill(secret);
  await page.getByRole("button", { name: "Masuk ke workspace" }).click();
  await expect(page.locator("#workspace")).toBeVisible();
  await expect(page.locator("#page-content h1")).toHaveText(
    "Evidence before exposure.",
  );
  await page.screenshot({
    path: "test-results/overview-desktop.png",
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
    .fill("Next gate: approve isolated private preview resources.");
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
  for (const path of [
    "/",
    "/sources",
    "/runs",
    "/evidence",
    "/clusters",
    "/opportunities",
    "/decisions",
    "/experiments",
    "/plugins",
    "/settings",
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
    "Manual version 0.1.0",
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
    "PASS: actual local Wrangler/D1 API + browser source→evidence→decision→experiment→learning; 11 desktop routes WCAG smoke; mobile/keyboard/logout; disabled-plugin checks.",
  );
} finally {
  await browser.close();
  await api.dispose();
}
