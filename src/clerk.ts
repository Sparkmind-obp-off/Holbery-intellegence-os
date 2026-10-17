// Clerk session-token verification for Hono on Cloudflare Workers.
// Method: Clerk "manual JWT verification" (official docs), implemented with
// Web Crypto: strict RS256 signature against the instance JWKS, then iss,
// azp, exp, nbf, iat and sts checks. A decoded payload is never trusted
// before its signature is verified.
import type { Env } from "./auth";

export type ClerkConfig = {
  issuer: string;
  jwksUrl: string;
  authorizedParties: string[];
};
export type VerifiedIdentity = { sub: string; sid: string; exp: number };
export type VerifyResult =
  | { ok: true; identity: VerifiedIdentity }
  | { ok: false; reason: string };

const CLOCK_SKEW_S = 5;
const MAX_TOKEN_BYTES = 8192;
const JWKS_TTL_MS = 10 * 60 * 1000;

// The publishable key is base64("<frontend-api-host>$"). Deriving the issuer
// from it binds verification to exactly this Clerk instance.
export function issuerFromPublishableKey(pk: string | undefined) {
  const m = /^pk_(test|live)_([A-Za-z0-9+/=]+)$/.exec(pk ?? "");
  if (!m) return null;
  try {
    const host = atob(m[2]!);
    if (!host.endsWith("$")) return null;
    const h = host.slice(0, -1);
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(h)) return null;
    return { issuer: "https://" + h, live: m[1] === "live" };
  } catch {
    return null;
  }
}

export function clerkConfig(
  env: Env["Bindings"],
  requestOrigin: string,
): ClerkConfig | null {
  if (env.HIO_CUSTOMER_AUTH !== "enabled") return null;
  if (!env.CLERK_SECRET_KEY || env.CLERK_SECRET_KEY.length < 20) return null;
  const derived = issuerFromPublishableKey(env.CLERK_PUBLISHABLE_KEY);
  if (!derived) return null;
  // Live keys must never be used by a non-production environment and vice versa.
  const prod = env.HIO_ENVIRONMENT === "production";
  if (derived.live !== prod && env.HIO_ALLOW_DEV_CLERK_IN_PROD !== "yes")
    return null;
  const parties = (env.CLERK_AUTHORIZED_PARTIES ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return {
    issuer: derived.issuer,
    jwksUrl: derived.issuer + "/.well-known/jwks.json",
    authorizedParties: parties.length ? parties : [requestOrigin],
  };
}

const b64urlBytes = (s: string) => {
  const b = atob(
    s.replace(/-/g, "+").replace(/_/g, "/") +
      "=".repeat((4 - (s.length % 4)) % 4),
  );
  return Uint8Array.from(b, (ch) => ch.charCodeAt(0));
};
const b64urlJson = (s: string) =>
  JSON.parse(new TextDecoder().decode(b64urlBytes(s))) as Record<
    string,
    unknown
  >;

type Jwk = {
  kid: string;
  kty: string;
  alg?: string;
  n: string;
  e: string;
  use?: string;
};
let jwksCache: { url: string; at: number; keys: Jwk[] } | null = null;
export function resetJwksCache() {
  jwksCache = null;
}
async function jwks(
  url: string,
  f: typeof fetch,
  force = false,
): Promise<Jwk[]> {
  if (
    !force &&
    jwksCache &&
    jwksCache.url === url &&
    Date.now() - jwksCache.at < JWKS_TTL_MS
  )
    return jwksCache.keys;
  const r = await f(url, { headers: { Accept: "application/json" } });
  if (!r.ok) throw new Error("jwks_unavailable");
  const d = (await r.json()) as { keys?: Jwk[] };
  const keys = (d.keys ?? []).filter(
    (k) => k.kty === "RSA" && typeof k.kid === "string",
  );
  jwksCache = { url, at: Date.now(), keys };
  return keys;
}

export async function verifyClerkToken(
  token: string,
  cfg: ClerkConfig,
  f: typeof fetch = fetch,
  nowS = Math.floor(Date.now() / 1000),
): Promise<VerifyResult> {
  if (!token || token.length > MAX_TOKEN_BYTES)
    return { ok: false, reason: "malformed" };
  const parts = token.split(".");
  if (parts.length !== 3 || parts.some((p) => !/^[A-Za-z0-9_-]+$/.test(p)))
    return { ok: false, reason: "malformed" };
  let header: Record<string, unknown>;
  try {
    header = b64urlJson(parts[0]!);
  } catch {
    return { ok: false, reason: "malformed" };
  }
  // Algorithm pinned: rejects "none", HS256 key-confusion and anything else.
  if (header.alg !== "RS256" || typeof header.kid !== "string")
    return { ok: false, reason: "bad_algorithm" };

  let keys: Jwk[];
  try {
    keys = await jwks(cfg.jwksUrl, f);
    if (!keys.some((k) => k.kid === header.kid))
      keys = await jwks(cfg.jwksUrl, f, true);
  } catch {
    return { ok: false, reason: "jwks_unavailable" };
  }
  const jwk = keys.find((k) => k.kid === header.kid);
  if (!jwk || (jwk.alg && jwk.alg !== "RS256"))
    return { ok: false, reason: "unknown_key" };

  let valid = false;
  try {
    const key = await crypto.subtle.importKey(
      "jwk",
      { kty: "RSA", n: jwk.n, e: jwk.e, alg: "RS256", ext: true },
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"],
    );
    valid = await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      key,
      b64urlBytes(parts[2]!),
      new TextEncoder().encode(parts[0] + "." + parts[1]),
    );
  } catch {
    valid = false;
  }
  if (!valid) return { ok: false, reason: "bad_signature" };

  let c: Record<string, unknown>;
  try {
    c = b64urlJson(parts[1]!);
  } catch {
    return { ok: false, reason: "malformed" };
  }
  const num = (v: unknown) =>
    typeof v === "number" && Number.isFinite(v) ? v : null;
  const exp = num(c.exp),
    nbf = num(c.nbf),
    iat = num(c.iat);
  if (c.iss !== cfg.issuer) return { ok: false, reason: "bad_issuer" };
  if (exp === null || exp + CLOCK_SKEW_S < nowS)
    return { ok: false, reason: "expired" };
  if (nbf !== null && nbf - CLOCK_SKEW_S > nowS)
    return { ok: false, reason: "not_yet_valid" };
  if (iat !== null && iat - CLOCK_SKEW_S > nowS)
    return { ok: false, reason: "not_yet_valid" };
  // azp is set by Clerk to the browser origin that minted the token.
  if (c.azp !== undefined && !cfg.authorizedParties.includes(String(c.azp)))
    return { ok: false, reason: "bad_party" };
  if (c.sts !== undefined && c.sts !== "active")
    return { ok: false, reason: "pending" };
  if (typeof c.sub !== "string" || !/^user_[A-Za-z0-9]{10,64}$/.test(c.sub))
    return { ok: false, reason: "bad_subject" };
  if (typeof c.sid !== "string" || !/^sess_[A-Za-z0-9]{10,64}$/.test(c.sid))
    return { ok: false, reason: "bad_session" };
  return { ok: true, identity: { sub: c.sub, sid: c.sid, exp: exp } };
}

// Server-to-server lookup of the verified user's primary, verified email.
// Called only during provisioning (first sign-in), never per request.
export async function clerkPrimaryEmail(
  secretKey: string,
  clerkUserId: string,
  f: typeof fetch = fetch,
): Promise<{ ok: true; email: string } | { ok: false; reason: string }> {
  try {
    const r = await f(
      "https://api.clerk.com/v1/users/" + encodeURIComponent(clerkUserId),
      { headers: { Authorization: "Bearer " + secretKey } },
    );
    if (!r.ok) return { ok: false, reason: "lookup_failed" };
    const u = (await r.json()) as {
      primary_email_address_id?: string;
      banned?: boolean;
      locked?: boolean;
      email_addresses?: {
        id: string;
        email_address: string;
        verification?: { status?: string };
      }[];
    };
    if (u.banned || u.locked) return { ok: false, reason: "provider_blocked" };
    const e = u.email_addresses?.find(
      (x) => x.id === u.primary_email_address_id,
    );
    if (!e || e.verification?.status !== "verified")
      return { ok: false, reason: "unverified_email" };
    return { ok: true, email: e.email_address.trim().toLowerCase() };
  } catch {
    return { ok: false, reason: "lookup_failed" };
  }
}
