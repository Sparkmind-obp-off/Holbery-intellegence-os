import { getCookie, setCookie } from "hono/cookie";
import type { Context } from "hono";
import { digest } from "./contracts";
export type Env = {
  Bindings: {
    DB: D1Database;
    OPERATOR_SECRET?: string;
    SESSION_SECRET?: string;
    OPERATOR_NAME?: string;
    HIO_ENVIRONMENT?: string;
    HIO_ACCOUNT_ID?: string;
    HIO_PAGES_PROJECT?: string;
    TAVILY_API_KEY?: string;
    FIRECRAWL_API_KEY?: string;
    APIFY_TOKEN?: string;
    GROQ_API_KEY?: string;
    GITHUB_TOKEN?: string;
    HIO_RESEARCH_ENABLED?: string;
  };
  Variables: { requestId: string; actor: string; role: string };
};
export async function equal(a: string, b: string): Promise<boolean> {
  const ah = await digest(a),
    bh = await digest(b);
  let mismatch = 0;
  for (let i = 0; i < ah.length; i++)
    mismatch |= ah.charCodeAt(i) ^ bh.charCodeAt(i);
  return mismatch === 0;
}
export function configured(c: Context<Env>): boolean {
  return (
    !!c.env.OPERATOR_SECRET &&
    c.env.OPERATOR_SECRET.length >= 32 &&
    c.env.OPERATOR_SECRET.length <= 256 &&
    !!c.env.SESSION_SECRET &&
    c.env.SESSION_SECRET.length >= 32
  );
}
async function sign(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return [
    ...new Uint8Array(
      await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)),
    ),
  ]
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("");
}
export async function authenticated(c: Context<Env>): Promise<boolean> {
  if (!configured(c)) return false;
  const cookie = getCookie(c, "hio_session");
  if (!cookie) return false;
  const parts = cookie.split(".");
  if (parts.length !== 3) return false;
  const [expires, nonce, sig] = parts;
  if (
    !expires ||
    !nonce ||
    !sig ||
    !/^\d{13}$/.test(expires) ||
    !/^[a-f0-9-]{36}$/.test(nonce) ||
    !/^[a-f0-9]{64}$/.test(sig)
  )
    return false;
  const exp = Number(expires);
  if (exp <= Date.now() || exp > Date.now() + 8 * 3600000) return false;
  if (
    !(await equal(
      sig,
      await sign(`${expires}.${nonce}`, c.env.SESSION_SECRET!),
    ))
  )
    return false;
  const session = await c.env.DB.prepare(
    "SELECT token_hash FROM sessions WHERE token_hash=? AND expires_at>?",
  )
    .bind(await digest(cookie), Date.now())
    .first();
  if (session) c.set("role", "owner-operator");
  return !!session;
}
export async function establishSession(c: Context<Env>) {
  const value = `${Date.now() + 8 * 3600000}.${crypto.randomUUID()}`;
  const token = `${value}.${await sign(value, c.env.SESSION_SECRET!)}`;
  await c.env.DB.batch([
    c.env.DB.prepare("DELETE FROM sessions WHERE expires_at<=?").bind(
      Date.now(),
    ),
    c.env.DB.prepare("INSERT INTO sessions VALUES (?,?,?)").bind(
      await digest(token),
      Number(value.split(".")[0]),
      new Date().toISOString(),
    ),
  ]);
  setCookie(c, "hio_session", token, {
    httpOnly: true,
    secure: new URL(c.req.url).protocol === "https:",
    sameSite: "Strict",
    path: "/",
    maxAge: 8 * 3600,
  });
}
export async function revokeSession(c: Context<Env>) {
  const token = getCookie(c, "hio_session");
  if (token)
    await c.env.DB.prepare("DELETE FROM sessions WHERE token_hash=?")
      .bind(await digest(token))
      .run();
}
export function safeMutation(c: Context<Env>) {
  return (
    c.req.header("Origin") === new URL(c.req.url).origin &&
    c.req.header("X-HIO-Request") === "operator"
  );
}
export async function rateLimit(
  c: Context<Env>,
  key: string,
  max: number,
  seconds: number,
) {
  const now = Math.floor(Date.now() / 1000),
    start = now - (now % seconds);
  const r = await c.env.DB.prepare(
    "INSERT INTO rate_limits(key,window_start,count) VALUES (?,?,1) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN window_start=excluded.window_start THEN count+1 ELSE 1 END, window_start=excluded.window_start RETURNING count",
  )
    .bind(key, start)
    .first<{ count: number }>();
  return (r?.count ?? max + 1) <= max;
}
