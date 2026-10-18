// Clerk Production cutover preflight (read-only). Exit 0 only when every gate
// passes. Env: CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY (never printed).
const pk = process.env.CLERK_PUBLISHABLE_KEY || "";
const sk = process.env.CLERK_SECRET_KEY || "";
const gates = [];
const gate = (name, ok, detail = "") => gates.push({ name, ok, detail });
const m = /^pk_(live|test)_([A-Za-z0-9+/=]+)$/.exec(pk);
gate("publishable key is pk_live", m?.[1] === "live");
gate("secret key is sk_live", /^sk_live_[A-Za-z0-9]{20,}$/.test(sk));
const fapi = m ? atob(m[2]).replace(/\$$/, "") : "";
gate("frontend API host derived", /^[a-z0-9.-]+\.[a-z]{2,}$/.test(fapi), fapi);
const doh = async (name, type = "CNAME") => {
  const r = await fetch(
    `https://cloudflare-dns.com/dns-query?name=${name}&type=${type}`,
    { headers: { accept: "application/dns-json" } },
  );
  const d = await r.json();
  return (d.Answer || []).map((a) => a.data.replace(/\.$/, ""));
};
let domains = [];
try {
  const r = await fetch("https://api.clerk.com/v1/instance", {
    headers: { Authorization: "Bearer " + sk },
  });
  const d = await r.json();
  gate("Backend API auth", r.ok, "HTTP " + r.status);
  gate(
    "instance is production",
    d.environment_type === "production",
    d.environment_type,
  );
  const dr = await fetch("https://api.clerk.com/v1/domains", {
    headers: { Authorization: "Bearer " + sk },
  });
  const dd = await dr.json();
  domains = Array.isArray(dd) ? dd : dd.data || [];
} catch (e) {
  gate("Backend API reachable", false, String(e.message));
}
for (const dom of domains)
  for (const c of dom.cname_targets || []) {
    const got = await doh(c.host);
    const ok = got.some((v) => v === c.value.replace(/\.$/, ""));
    gate(
      `DNS ${c.host} → ${c.value}`,
      ok || !c.required,
      got.join(",") || "NXDOMAIN",
    );
  }
try {
  const r = await fetch(`https://${fapi}/.well-known/jwks.json`);
  const keys = r.ok ? (await r.json()).keys || [] : [];
  gate(
    "JWKS reachable with RS256 key",
    keys.some((k) => k.alg === "RS256"),
    "HTTP " + r.status,
  );
} catch (e) {
  gate("JWKS reachable", false, String(e.cause?.code || e.message));
}
for (const g of gates)
  console.log(
    (g.ok ? "PASS " : "FAIL ") +
      g.name +
      (g.detail ? "  (" + g.detail + ")" : ""),
  );
const ok = gates.every((g) => g.ok);
console.log(
  ok
    ? "PREFLIGHT PASS — cutover may proceed"
    : "PREFLIGHT FAIL — do not cut over",
);
process.exit(ok ? 0 : 1);
