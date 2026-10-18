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
const PK = "pk_test_" + btoa("unit-test-ox.clerk.accounts.dev$");
const ISS = "https://unit-test-ox.clerk.accounts.dev";
const ORIGIN = "https://hio.test";
let keys: CryptoKeyPair;
let jwk: JsonWebKey & { kid?: string };
const env = (o: Record<string, unknown> = {}) => ({
  DB: storage as unknown as D1Database,
  OPERATOR_SECRET: "clerk-test-operator-secret-never-production",
  SESSION_SECRET: "clerk-test-session-secret-never-production",
  OPERATOR_NAME: "clerk-test-owner",
  HIO_ENVIRONMENT: "local",
  HIO_CUSTOMER_AUTH: "enabled",
  CLERK_PUBLISHABLE_KEY: PK,
  CLERK_SECRET_KEY: "sk_test_unitTestSecretNeverProduction0000",
  ...o,
});
const b64u = (b: ArrayBuffer | Uint8Array | string) =>
  btoa(
    typeof b === "string"
      ? b
      : String.fromCharCode(...new Uint8Array(b instanceof Uint8Array ? b : b)),
  )
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
async function token(
  claims: Record<string, unknown> = {},
  header: Record<string, unknown> = {},
  signer = keys.privateKey,
) {
  const t = Math.floor(Date.now() / 1000);
  const h = b64u(
    JSON.stringify({ alg: "RS256", kid: "kid-1", typ: "JWT", ...header }),
  );
  const p = b64u(
    JSON.stringify({
      iss: ISS,
      sub: "user_" + "a".repeat(20),
      sid: "sess_" + "b".repeat(20),
      azp: ORIGIN,
      iat: t - 1,
      nbf: t - 1,
      exp: t + 60,
      sts: "active",
      ...claims,
    }),
  );
  const sig = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    signer,
    new TextEncoder().encode(h + "." + p),
  );
  return h + "." + p + "." + b64u(sig);
}
const users: Record<string, { email: string; verified?: boolean }> = {};
function stubProviders() {
  const f = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url === ISS + "/.well-known/jwks.json")
      return new Response(JSON.stringify({ keys: [jwk] }));
    const m = /api\.clerk\.com\/v1\/users\/(.+)$/.exec(url);
    if (m) {
      const u = users[decodeURIComponent(m[1]!)];
      if (!u) return new Response("{}", { status: 404 });
      return new Response(
        JSON.stringify({
          primary_email_address_id: "e1",
          email_addresses: [
            {
              id: "e1",
              email_address: u.email,
              verification: {
                status: u.verified === false ? "unverified" : "verified",
              },
            },
          ],
        }),
      );
    }
    return new Response("unexpected " + url, { status: 599 });
  });
  vi.stubGlobal("fetch", f);
  return f;
}
async function call(
  path: string,
  tok: string | null,
  method = "GET",
  body?: unknown,
  o: Record<string, unknown> = {},
  extra: Record<string, string> = {},
) {
  return app.request(
    ORIGIN + path,
    {
      method,
      headers: {
        Origin: ORIGIN,
        ...(method !== "GET" ? { "X-HIO-Request": "customer" } : {}),
        "Content-Type": "application/json",
        ...(tok ? { Authorization: "Bearer " + tok } : {}),
        ...extra,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    },
    env(o),
  );
}
const invite = (email: string) =>
  storage.db
    .prepare(
      "INSERT INTO customer_invites(email,invited_by,created_at) VALUES (?,?,?)",
    )
    .run(email, "test", new Date().toISOString());
const A = "user_" + "a".repeat(20);
const B = "user_" + "c".repeat(20);
const brief = {
  question: "Apa masalah utama UMKM?",
  segment: "UMKM kuliner",
  geography: "Jakarta",
  problem: "Pencatatan stok manual",
};

describe("Clerk Phase 1 — customer identity and tenant isolation (offline)", () => {
  beforeEach(async () => {
    storage = new LocalD1();
    keys = (await crypto.subtle.generateKey(
      {
        name: "RSASSA-PKCS1-v1_5",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["sign", "verify"],
    )) as CryptoKeyPair;
    jwk = {
      ...(await crypto.subtle.exportKey("jwk", keys.publicKey)),
      kid: "kid-1",
      alg: "RS256",
      use: "sig",
    };
    const { resetJwksCache } = await import("../src/clerk");
    resetJwksCache();
    for (const k of Object.keys(users)) delete users[k];
    users[A] = { email: "alice@example.com" };
    users[B] = { email: "bob@example.com" };
    stubProviders();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    storage.db.close();
  });

  it("exposes only the publishable key in public config and is off unless enabled", async () => {
    const on = (await (
      await call("/api/customer/config", null)
    ).json()) as Record<string, unknown>;
    expect(on).toMatchObject({
      tersedia: true,
      publishableKey: PK,
      frontendApi: ISS,
    });
    expect(JSON.stringify(on)).not.toContain("sk_test");
    const off = (await (
      await call("/api/customer/config", null, "GET", undefined, {
        HIO_CUSTOMER_AUTH: undefined,
      })
    ).json()) as Record<string, unknown>;
    expect(off.tersedia).toBe(false);
    expect(
      (
        await call("/api/customer/me", await token(), "GET", undefined, {
          HIO_CUSTOMER_AUTH: undefined,
        })
      ).status,
    ).toBe(503);
  });

  it("refuses a development Clerk key in production unless explicitly allowed", async () => {
    const r = await call("/api/customer/me", await token(), "GET", undefined, {
      HIO_ENVIRONMENT: "production",
    });
    expect(r.status).toBe(503);
    invite("alice@example.com");
    const ok = await call("/api/customer/me", await token(), "GET", undefined, {
      HIO_ENVIRONMENT: "production",
      HIO_ALLOW_DEV_CLERK_IN_PROD: "yes",
    });
    expect(ok.status).toBe(200);
  });

  it("rejects missing, forged, expired, wrong-issuer, wrong-party, alg=none and HS256 tokens", async () => {
    invite("alice@example.com");
    expect((await call("/api/customer/me", null)).status).toBe(401);
    const other = (await crypto.subtle.generateKey(
      {
        name: "RSASSA-PKCS1-v1_5",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["sign", "verify"],
    )) as CryptoKeyPair;
    const t = Math.floor(Date.now() / 1000);
    const bad = [
      await token({}, {}, other.privateKey),
      await token({ exp: t - 60 }),
      await token({ iss: "https://evil.clerk.accounts.dev" }),
      await token({ azp: "https://evil.example" }),
      await token({ nbf: t + 600 }),
      await token({ sts: "pending" }),
      await token({ sub: "not-a-user" }),
      (await token({}, { alg: "none" })).split(".").slice(0, 2).join(".") +
        ".x",
      await token({}, { alg: "HS256" }),
      await token({}, { kid: "unknown" }),
      "garbage",
    ];
    for (const b of bad)
      expect((await call("/api/customer/me", b)).status).toBe(401);
    expect((await call("/api/customer/me", await token())).status).toBe(200);
  });

  it("is invite-only: uninvited and unverified users are not provisioned", async () => {
    const r = await call("/api/customer/me", await token());
    expect(r.status).toBe(403);
    expect(((await r.json()) as { error: { code: string } }).error.code).toBe(
      "customer_not_invited",
    );
    expect(
      storage.db.prepare("SELECT COUNT(*) n FROM users").get(),
    ).toMatchObject({ n: 0 });
    users[A]!.verified = false;
    invite("alice@example.com");
    const u = await call("/api/customer/me", await token());
    expect(((await u.json()) as { error: { code: string } }).error.code).toBe(
      "customer_email_unverified",
    );
  });

  it("provisions one user + personal workspace idempotently and records the invite", async () => {
    invite("alice@example.com");
    const tok = await token();
    const [r1, r2] = await Promise.all([
      call("/api/customer/me", tok),
      call("/api/customer/me", tok),
    ]);
    expect(r1.status).toBe(200);
    expect(r2.status).toBe(200);
    const me = (await r1.json()) as {
      email: string;
      peran: string;
      ruangKerja: { id: string };
    };
    expect(me).toMatchObject({ email: "alice@example.com", peran: "owner" });
    expect(
      storage.db.prepare("SELECT COUNT(*) n FROM users").get(),
    ).toMatchObject({ n: 1 });
    expect(
      storage.db.prepare("SELECT COUNT(*) n FROM workspaces").get(),
    ).toMatchObject({ n: 1 });
    expect(
      storage.db.prepare("SELECT accepted_user_id FROM customer_invites").get(),
    ).not.toMatchObject({ accepted_user_id: null });
  });

  it("isolates tenants: another workspace's brief is a 404 and cannot be selected or edited", async () => {
    invite("alice@example.com");
    invite("bob@example.com");
    const ta = await token({ sub: A });
    const tb = await token({ sub: B, sid: "sess_" + "d".repeat(20) });
    const created = await call("/api/customer/briefs", ta, "POST", brief);
    expect(created.status).toBe(201);
    const { id } = (await created.json()) as { id: string };
    const meA = (await (await call("/api/customer/me", ta)).json()) as {
      ruangKerja: { id: string };
    };
    expect((await call("/api/customer/briefs/" + id, tb)).status).toBe(404);
    expect(
      (
        await call("/api/customer/briefs/" + id, tb, "PATCH", {
          segment: "diretas",
        })
      ).status,
    ).toBe(404);
    expect(
      (
        (await (await call("/api/customer/briefs", tb)).json()) as {
          brief: unknown[];
        }
      ).brief,
    ).toHaveLength(0);
    expect(
      (
        await call(
          "/api/customer/me",
          tb,
          "GET",
          undefined,
          {},
          { "X-HIO-Workspace": meA.ruangKerja.id },
        )
      ).status,
    ).toBe(403);
    expect((await call("/api/customer/briefs/" + id, ta)).status).toBe(200);
  });

  it("enforces role permissions (viewer cannot write)", async () => {
    invite("alice@example.com");
    const ta = await token();
    await call("/api/customer/me", ta);
    storage.db.prepare("UPDATE workspace_memberships SET role='viewer'").run();
    expect((await call("/api/customer/briefs", ta, "POST", brief)).status).toBe(
      403,
    );
    expect(
      (await call("/api/customer/workspace", ta, "PATCH", { nama: "X" }))
        .status,
    ).toBe(403);
    expect((await call("/api/customer/briefs", ta)).status).toBe(200);
  });

  it("requires same-origin + X-HIO-Request: customer for mutations", async () => {
    invite("alice@example.com");
    const ta = await token();
    const noHeader = await app.request(
      ORIGIN + "/api/customer/briefs",
      {
        method: "POST",
        headers: {
          Origin: ORIGIN,
          Authorization: "Bearer " + ta,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(brief),
      },
      env(),
    );
    expect(noHeader.status).toBe(403);
    const cross = await app.request(
      ORIGIN + "/api/customer/briefs",
      {
        method: "POST",
        headers: {
          Origin: "https://evil.example",
          "X-HIO-Request": "customer",
          Authorization: "Bearer " + ta,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(brief),
      },
      env(),
    );
    expect(cross.status).toBe(403);
  });

  it("keeps customers and founders separate in both directions", async () => {
    invite("alice@example.com");
    const ta = await token();
    expect((await call("/api/v1/agent/code-tasks", ta)).status).toBe(401);
    expect((await call("/api/v1/customer-invites", ta)).status).toBe(401);
    const login = await app.request(
      ORIGIN + "/api/session",
      {
        method: "POST",
        headers: {
          Origin: ORIGIN,
          "X-HIO-Request": "operator",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          secret: "clerk-test-operator-secret-never-production",
        }),
      },
      env(),
    );
    const cookie = login.headers.get("set-cookie")!.split(";")[0]!;
    const asFounder = await app.request(
      ORIGIN + "/api/customer/me",
      { headers: { Cookie: cookie } },
      env(),
    );
    expect(asFounder.status).toBe(401);
    const inv = await app.request(
      ORIGIN + "/api/v1/customer-invites",
      {
        method: "POST",
        headers: {
          Origin: ORIGIN,
          "X-HIO-Request": "operator",
          Cookie: cookie,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: "Carol@Example.com" }),
      },
      env(),
    );
    expect(inv.status).toBe(201);
    expect(
      storage.db
        .prepare(
          "SELECT email FROM customer_invites WHERE email='carol@example.com'",
        )
        .get(),
    ).toBeTruthy();
  });

  it("serves the customer pages with a CSP that allows only this Clerk instance", async () => {
    const r = await app.request(ORIGIN + "/masuk", {}, env());
    expect(r.status).toBe(200);
    const csp = r.headers.get("content-security-policy")!;
    expect(csp).toContain("script-src 'self' " + ISS);
    expect(csp).toContain("frame-ancestors 'none'");
    const html = await r.text();
    expect(html).toContain('src="/static/customer.js"');
    expect(html).not.toMatch(/<script>|sk_test/);
    const founder = await app.request(ORIGIN + "/", {}, env());
    expect(founder.headers.get("content-security-policy")).not.toContain(
      "clerk",
    );
  });

  it("serves a public landing page at / with separate customer and founder entry points", async () => {
    const r = await app.request(ORIGIN + "/", {}, env());
    expect(r.status).toBe(200);
    const html = await r.text();
    expect(html).toContain('href="/masuk"');
    expect(html).toContain('href="/founder/login"');
    expect(html).not.toMatch(
      /Kata sandi akses|login-password|<script|style="|sk_test|OPERATOR/,
    );
    expect(r.headers.get("content-security-policy")).toContain(
      "script-src 'self'",
    );
    expect(r.headers.get("content-security-policy")).not.toContain("clerk");
    // No fabricated social proof.
    expect(html).not.toMatch(/testimoni|pengguna aktif|ISO 27001|SOC ?2/i);
  });

  it("keeps the founder sign-in at /founder/login and redirects signed-in founders to /founder", async () => {
    const anon = await app.request(ORIGIN + "/founder/login", {}, env());
    expect(anon.status).toBe(200);
    expect(await anon.text()).toContain("Kata sandi akses");
    expect(
      (await app.request(ORIGIN + "/agent", {}, env())).headers.get("location"),
    ).toBe("/founder/login");
    const login = await app.request(
      ORIGIN + "/api/session",
      {
        method: "POST",
        headers: {
          Origin: ORIGIN,
          "X-HIO-Request": "operator",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          secret: "clerk-test-operator-secret-never-production",
        }),
      },
      env(),
    );
    const cookie = login.headers.get("set-cookie")!.split(";")[0]!;
    const signedIn = await app.request(
      ORIGIN + "/founder/login",
      { headers: { Cookie: cookie } },
      env(),
    );
    expect(signedIn.status).toBe(302);
    expect(signedIn.headers.get("location")).toBe("/founder");
    // A Clerk customer token is not a founder session.
    invite("alice@example.com");
    const asCustomer = await app.request(
      ORIGIN + "/founder/login",
      { headers: { Authorization: "Bearer " + (await token()) } },
      env(),
    );
    expect(asCustomer.status).toBe(200);
    expect(
      (
        await app.request(
          ORIGIN + "/api/v1/me",
          { headers: { Authorization: "Bearer " + (await token()) } },
          env(),
        )
      ).status,
    ).toBe(401);
  });

  it("ends the founder session on logout", async () => {
    const login = await app.request(
      ORIGIN + "/api/session",
      {
        method: "POST",
        headers: {
          Origin: ORIGIN,
          "X-HIO-Request": "operator",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          secret: "clerk-test-operator-secret-never-production",
        }),
      },
      env(),
    );
    const cookie = login.headers.get("set-cookie")!.split(";")[0]!;
    expect(
      (
        await app.request(
          ORIGIN + "/api/v1/me",
          { headers: { Cookie: cookie } },
          env(),
        )
      ).status,
    ).toBe(200);
    const out = await app.request(
      ORIGIN + "/api/session",
      {
        method: "DELETE",
        headers: {
          Origin: ORIGIN,
          "X-HIO-Request": "operator",
          Cookie: cookie,
        },
      },
      env(),
    );
    expect(out.status).toBeLessThan(300);
    expect(
      (
        await app.request(
          ORIGIN + "/api/v1/me",
          { headers: { Cookie: cookie } },
          env(),
        )
      ).status,
    ).toBe(401);
  });

  it("fails closed on mismatched or wrong-environment Clerk keys", async () => {
    const { clerkConfig } = await import("../src/clerk");
    const livePk = "pk_live_" + btoa("clerk.example.com$");
    const liveSk = "sk_live_" + "x".repeat(40);
    const base = { HIO_CUSTOMER_AUTH: "enabled" } as never as Record<
      string,
      string
    >;
    const cfg = (o: Record<string, string | undefined>) =>
      clerkConfig({ ...base, ...o } as never, "https://hio.test");
    // live pair in production: accepted; dev override is irrelevant
    expect(
      cfg({
        HIO_ENVIRONMENT: "production",
        CLERK_PUBLISHABLE_KEY: livePk,
        CLERK_SECRET_KEY: liveSk,
      }),
    ).not.toBeNull();
    expect(
      cfg({
        HIO_ENVIRONMENT: "production",
        CLERK_PUBLISHABLE_KEY: livePk,
        CLERK_SECRET_KEY: liveSk,
        HIO_ALLOW_DEV_CLERK_IN_PROD: "yes",
      })?.issuer,
    ).toBe("https://clerk.example.com");
    // live keys outside production: refused
    expect(
      cfg({
        HIO_ENVIRONMENT: "local",
        CLERK_PUBLISHABLE_KEY: livePk,
        CLERK_SECRET_KEY: liveSk,
      }),
    ).toBeNull();
    // mismatched pairs: refused
    expect(
      cfg({
        HIO_ENVIRONMENT: "production",
        CLERK_PUBLISHABLE_KEY: livePk,
        CLERK_SECRET_KEY: "sk_test_" + "y".repeat(40),
      }),
    ).toBeNull();
    expect(
      cfg({
        HIO_ENVIRONMENT: "local",
        CLERK_PUBLISHABLE_KEY: PK,
        CLERK_SECRET_KEY: liveSk,
      }),
    ).toBeNull();
    // dev keys in production without the override: refused
    expect(
      cfg({
        HIO_ENVIRONMENT: "production",
        CLERK_PUBLISHABLE_KEY: PK,
        CLERK_SECRET_KEY: "sk_test_" + "y".repeat(40),
      }),
    ).toBeNull();
  });
});
