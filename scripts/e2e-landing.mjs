// Public landing page acceptance (local or HIO_BASE). Read-only: no sign-in.
import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { chromium, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const base = process.env.HIO_BASE || "http://localhost:3000";
mkdirSync("test-results", { recursive: true });
const b = await chromium.launch();
const out = [];
for (const [name, viewport] of [
  ["desktop", { width: 1280, height: 900 }],
  ["mobile", { width: 390, height: 844 }],
]) {
  const p = await (await b.newContext({ viewport })).newPage();
  const errs = [];
  p.on("pageerror", (e) => errs.push(String(e)));
  // The founder sign-in page probes the session (401 when anonymous): expected.
  p.on(
    "console",
    (m) =>
      m.type() === "error" &&
      !/Failed to load resource/.test(m.text()) &&
      errs.push(m.text()),
  );
  const r = await p.goto(base + "/");
  assert.equal(r.status(), 200);
  await expect(p.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(p.locator('a[href="/masuk"]').first()).toBeVisible();
  await expect(p.locator('a[href="/founder/login"]')).toBeVisible();
  await expect(p.locator("#login-panel")).toHaveCount(0);
  const overflow = await p.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  assert.equal(overflow, false, name + " horizontal overflow");
  const axe = await new AxeBuilder({ page: p }).analyze();
  const serious = axe.violations.filter((v) =>
    ["serious", "critical"].includes(v.impact),
  );
  assert.deepEqual(
    serious.map((v) => v.id),
    [],
    name + " axe",
  );
  await p.screenshot({
    path: `test-results/landing-${name}.png`,
    fullPage: true,
  });
  await p.keyboard.press("Tab");
  assert.equal(
    await p.evaluate(() => document.activeElement.className),
    "skip-link",
  );
  await p.locator('a[href="/founder/login"]').click();
  await expect(p).toHaveURL(base + "/founder/login");
  await expect(p.getByLabel("Kata sandi akses")).toBeVisible();
  await p.goto(base + "/");
  await p.locator("a.lp-signin").click();
  await expect(p).toHaveURL(base + "/masuk");
  assert.deepEqual(errs, [], name + " page errors");
  out.push("PASS landing " + name);
}
await b.close();
console.log(out.join("\n"));
