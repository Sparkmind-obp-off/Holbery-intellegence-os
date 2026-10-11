import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { chromium } from "@playwright/test";

// Explicitly authorized synthetic HIO test only. Never run the fixture suite on cloud.
if (process.env.HIO_PRODUCTION_SMOKE_APPROVED !== "yes") {
  console.error("BLOCKED: explicit production smoke approval required.");
  process.exit(2);
}
const base = "https://holbery-intelligence-os.pages.dev";
const account = "a167a50f1272635d3c1145aab3cd8f98";
const database = "ce92c645-7ce2-4edf-8ffa-ce0d16115bbe";
const root = ".local/production-release";
const secrets = JSON.parse(readFileSync(root + "/credentials.json", "utf8"));
assert.ok(secrets.project === "holbery-intelligence-os");
assert.ok(secrets.environment === "production");
const sensitive = [secrets.OPERATOR_SECRET, secrets.SESSION_SECRET];
const gates = {};
let cookie = "";
let browser;
let browserContext;
let briefId;
let stage = "preflight";
function clean(text) {
  assert.ok(
    sensitive.every((secret) => !text.includes(secret)),
    "Sensitive credential found in response; response withheld.",
  );
}
async function cloud(path, data) {
  const response = await fetch("https://api.cloudflare.com/client/v4" + path, {
    method: data ? "POST" : "GET",
    headers: {
      Authorization: "Bearer " + process.env.CLOUDFLARE_API_TOKEN,
      "Content-Type": "application/json",
    },
    body: data ? JSON.stringify(data) : undefined,
  });
  const value = await response.json();
  assert.ok(response.ok && value.success, "Cloudflare verification failed.");
  return value.result;
}
async function call(
  path,
  status,
  { method = "GET", data, session = cookie } = {},
) {
  const response = await fetch(base + path, {
    method,
    redirect: "manual",
    headers: {
      Origin: base,
      "X-HIO-Request": "operator",
      "Content-Type": "application/json",
      ...(session ? { Cookie: session } : {}),
    },
    body: data ? JSON.stringify(data) : undefined,
  });
  const text = await response.text();
  clean(text);
  assert.ok(response.status === status, path + ": unexpected HTTP status.");
  return { response, text };
}
try {
  const project = await cloud(
    `/accounts/${account}/pages/projects/holbery-intelligence-os`,
  );
  assert.ok(project.id === "764e8875-45c9-4621-92c9-af9fd98496e2");
  assert.ok(project.production_branch === "main");
  assert.ok(
    project.deployment_configs.production.d1_databases.DB.id === database,
  );
  gates.resourceIdentity = "PASS";
  await call("/", 200);
  await call("/static/app.js", 200);
  const health = JSON.parse((await call("/api/health", 200)).text);
  assert.ok(health.database && health.authentication);
  assert.ok(!health.liveCollection && !health.aiInference);
  gates.publicReadiness = "PASS";
  await call("/api/v1/summary", 401);
  await call("/api/v1/secrets", 401);
  await call("/secrets", 401);
  gates.unauthenticatedDenial = "PASS";
  await call("/api/session", 401, {
    method: "POST",
    data: { secret: "synthetic-wrong-login" },
  });
  gates.wrongLogin = "PASS";
  const login = await call("/api/session", 200, {
    method: "POST",
    data: { secret: secrets.OPERATOR_SECRET },
  });
  const header = login.response.headers.get("set-cookie");
  assert.ok(
    header &&
      /HttpOnly/i.test(header) &&
      /Secure/i.test(header) &&
      /SameSite=Strict/i.test(header),
  );
  cookie = header.split(";")[0];
  await call("/api/v1/me", 200);
  gates.correctLogin = "PASS";
  const inventory = JSON.parse((await call("/api/v1/secrets", 200)).text);
  assert.ok(inventory.runtimeEnvironment === "production");
  assert.ok(
    inventory.items
      .filter((s) => s.environment === "production")
      .every((s) => s.status === "configured"),
  );
  await call("/secrets", 200);
  gates.ownerInventoryRedaction = "PASS";
  const question =
    "SYNTHETIC production release verification " + crypto.randomUUID();
  const created = JSON.parse(
    (
      await call("/api/v1/intelligence", 201, {
        method: "POST",
        data: {
          question,
          segment: "Synthetic test segment",
          geography: "Synthetic environment",
          problem: "Release persistence test, not customer evidence",
          payerHypothesis: "Synthetic hypothesis; no budget or payment",
          connector: "manual",
        },
      })
    ).text,
  );
  assert.ok(
    created.plan.executionEnabled === false && created.plan.budgetMinor === 0,
  );
  briefId = created.id;
  const detail = JSON.parse(
    (await call("/api/v1/intelligence/" + briefId, 200)).text,
  );
  assert.ok(detail.question === question);
  assert.ok(detail.plan.executionEnabled === false);
  const rows = await cloud(
    `/accounts/${account}/d1/database/${database}/query`,
    {
      sql: "SELECT id, question FROM research_briefs WHERE id=?",
      params: [briefId],
    },
  );
  assert.ok(
    rows[0].results.length === 1 && rows[0].results[0].question === question,
  );
  gates.syntheticD1Persistence = "PASS";
  const plugins = JSON.parse((await call("/api/v1/plugins", 200)).text);
  const sources = JSON.parse((await call("/api/v1/sources", 200)).text);
  assert.ok(plugins.items.every((p) => !p.enabled));
  assert.ok(sources.items.every((s) => !s.enabled));
  gates.externalExecutionDisabled = "PASS";
  browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  browserContext = await browser.newContext();
  const page = await browserContext.newPage();
  const errors = [];
  page.on("pageerror", () => errors.push("pageerror"));
  stage = "browser-initial-login";
  await page.goto(base);
  await page.getByLabel("Kredensial operator").fill(secrets.OPERATOR_SECRET);
  await page.getByRole("button", { name: "Masuk ke workspace" }).click();
  await page.locator("#workspace").waitFor({ state: "visible" });
  clean(await page.content());
  stage = "browser-intelligence-load";
  await page.goto(base + "/intelligence");
  await page.getByText(question, { exact: true }).waitFor();
  stage = "browser-intelligence-reload";
  await page.reload();
  await page.getByText(question, { exact: true }).waitFor();
  stage = "browser-secrets";
  await page.goto(base + "/secrets");
  await page
    .getByRole("heading", { name: "Secrets Owner", exact: true })
    .waitFor();
  clean(await page.content());
  assert.ok(errors.length === 0, "Browser runtime error observed.");
  gates.productionBrowserReload = "PASS";
  // Revoke every session created by this test; never log raw cookies.
  const browserCookies = await browserContext.cookies(base);
  const browserCookie = browserCookies.find((c) => c.name === "hio_session");
  assert.ok(browserCookie);
  await call("/api/session", 200, {
    method: "DELETE",
    session: "hio_session=" + browserCookie.value,
  });
  await call("/api/v1/me", 401, {
    session: "hio_session=" + browserCookie.value,
  });
  await call("/api/session", 200, { method: "DELETE" });
  await call("/api/v1/me", 401);
  gates.logoutAndSessionRevocation = "PASS";
  cookie = "";
  await call("/secrets", 401);
  gates.responseCredentialScan = "PASS";
  const report = {
    testedAt: new Date().toISOString(),
    base,
    database,
    briefId,
    gates,
    limitations: [
      "Synthetic test brief intentionally retained; no customer evidence or spending",
      "Owner download acknowledgement and cloud restore drill are separate gates",
    ],
  };
  writeFileSync(
    root + "/production-smoke.json",
    JSON.stringify(report, null, 2),
    { mode: 0o600 },
  );
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  // Only the first diagnostic line, scrubbed of credentials; never dump browser call logs.
  let diagnostic = String(error?.message ?? "Unknown failure").split("\n")[0];
  for (const value of [
    ...sensitive,
    cookie,
    process.env.CLOUDFLARE_API_TOKEN,
    process.env.GSK_TOKEN,
  ].filter(Boolean))
    diagnostic = diagnostic.split(value).join("[REDACTED]");
  diagnostic = diagnostic.slice(0, 300);
  writeFileSync(
    root + "/production-smoke-failure.json",
    JSON.stringify(
      {
        testedAt: new Date().toISOString(),
        gates,
        briefId,
        stage,
        status: "FAIL",
        diagnostic,
      },
      null,
      2,
    ),
    { mode: 0o600 },
  );
  console.error(
    "FAIL: production smoke incomplete; safe gate report retained. No exception values printed.",
  );
  process.exitCode = 1;
} finally {
  if (browserContext) {
    try {
      const list = await browserContext.cookies(base);
      const s = list.find((item) => item.name === "hio_session");
      if (s)
        await call("/api/session", 200, {
          method: "DELETE",
          session: "hio_session=" + s.value,
        });
    } catch {
      /* A revoked session already returns 401. */
    }
  }
  if (cookie) {
    try {
      await call("/api/session", 200, { method: "DELETE" });
    } catch {
      /* Fail safely. */
    }
  }
  if (browser) await browser.close();
}
