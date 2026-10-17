// Live Clerk sign-in e2e (uses a real Clerk development instance + test user).
// Inputs via env: HIO_BASE, CLERK_TEST_IDENTIFIER, CLERK_TEST_USER_ID, CLERK_SECRET_KEY. Never prints them.
import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
const base = process.env.HIO_BASE || "http://localhost:3000";
const id = process.env.CLERK_TEST_IDENTIFIER;
const sk = process.env.CLERK_SECRET_KEY;
const userId = process.env.CLERK_TEST_USER_ID;
assert.ok(
  id && sk && userId,
  "CLERK_TEST_IDENTIFIER / CLERK_SECRET_KEY / CLERK_TEST_USER_ID required",
);
const b = await chromium.launch();
const p = await (await b.newContext()).newPage();
const errs = [];
p.on("pageerror", (e) => errs.push(String(e)));
const out = {};
try {
  await p.goto(base + "/masuk");
  await p.locator('input[name="identifier"]').waitFor({ timeout: 30000 });
  out.signInRendered = true; // real Clerk <SignIn/> mounted from the instance Frontend API
  // Sign in with a one-time sign-in token minted by the Clerk Backend API
  // (official testing flow; avoids the new-device email code). The password
  // UI path is not automated here.
  const tr = await fetch("https://api.clerk.com/v1/sign_in_tokens", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + sk,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_id: userId, expires_in_seconds: 120 }),
  });
  out.signInTokenStatus = tr.status;
  const ticket = (await tr.json()).token;
  const res = await p.evaluate(async (t) => {
    const si = await window.Clerk.client.signIn.create({
      strategy: "ticket",
      ticket: t,
    });
    if (si.status === "complete")
      await window.Clerk.setActive({ session: si.createdSessionId });
    return si.status;
  }, ticket);
  out.ticketSignIn = res;
  await p
    .locator("#customer-email")
    .filter({ hasText: "@" })
    .waitFor({ timeout: 30000 });
  out.signedIn = true;
  out.heading = await p.locator("#customer-content h1").innerText();
  out.email = (await p.locator("#customer-email").innerText()).replace(
    /^(.{3}).*@/,
    "$1…@",
  );
  await p.goto(base + "/ruang/brief");
  await p.locator("#question").waitFor({ timeout: 20000 });
  await p.fill("#question", "Apa hambatan utama UMKM kuliner mengelola stok?");
  await p.fill("#segment", "UMKM kuliner");
  await p.fill("#geography", "Jakarta");
  await p.fill("#problem", "Stok dicatat manual sehingga sering selisih");
  await p.getByRole("button", { name: "Simpan brief" }).click();
  await p.locator(".customer-list li").first().waitFor({ timeout: 20000 });
  out.briefsListed = await p.locator(".customer-list li").count();
  const token = await p.evaluate(() => window.Clerk.session.getToken());
  const r = await fetch(base + "/api/customer/me", {
    headers: { Authorization: "Bearer " + token },
  });
  out.apiMeStatus = r.status;
  const tampered =
    token.slice(0, -4) + (token.endsWith("AAAA") ? "BBBB" : "AAAA");
  out.tamperedStatus = (
    await fetch(base + "/api/customer/me", {
      headers: { Authorization: "Bearer " + tampered },
    })
  ).status;
  out.anonStatus = (await fetch(base + "/api/customer/me")).status;
  out.founderApiWithClerk = (
    await fetch(base + "/api/v1/agent/code-tasks", {
      headers: { Authorization: "Bearer " + token },
    })
  ).status;
} catch (e) {
  out.error = String(e.message).slice(0, 300);
  await p.screenshot({ path: "/tmp/clerk-live-fail.png", fullPage: true });
}
out.pageErrors = errs;
console.log(JSON.stringify(out, null, 1));
await b.close();
const pass =
  out.signedIn &&
  out.apiMeStatus === 200 &&
  out.tamperedStatus === 401 &&
  out.anonStatus === 401 &&
  out.founderApiWithClerk === 401 &&
  out.briefsListed >= 1;
console.log(pass ? "PASS live Clerk e2e" : "FAIL live Clerk e2e");
process.exit(pass ? 0 : 1);
