import { Hono, type Context } from "hono";
import { serveStatic } from "hono/cloudflare-workers";
import { bodyLimit } from "hono/body-limit";
import { deleteCookie } from "hono/cookie";
import { z, ZodError } from "zod";
import {
  configured,
  authenticated,
  equal,
  establishSession,
  revokeSession,
  safeMutation,
  rateLimit,
  type Env,
} from "./auth";
import {
  sourcePatch,
  runInput,
  decisionInput,
  experimentInput,
  outcomeInput,
  manifestSchema,
  manifests,
  pluginPatch,
  toolInput,
  toolOutput,
  fixtures,
  normalize,
  digest,
  score,
  id,
} from "./contracts";
import {
  founderShell,
  maintenanceShell,
  notFoundPage,
  customerShell,
  landingPage,
} from "./view";
import { registerFounder, founderNotice, APP_VERSION } from "./founder";
import { registerResearch, researchReady } from "./research-routes";
import {
  registerAgentWorkspace,
  agentWorkspacePage,
  codeConsolePage,
} from "./agent-workspace";
import { registerCodingAgent } from "./coding-agent";
import { registerCustomer, registerCustomerInvites } from "./customer";
import { issuerFromPublishableKey } from "./clerk";
import { briefInput, researchPlan } from "./intelligence";
import {
  secretInventory,
  rotationInput,
  canManageSecrets,
  type Rotation,
} from "./secrets";

const app = new Hono<Env>();
// Customer pages load Clerk's browser SDK from the instance's own Frontend API.
// Founder pages keep the strict self-only policy.
function customerCsp(pk?: string) {
  const host = issuerFromPublishableKey(pk)?.issuer ?? "";
  const clerk = host ? " " + host : "";
  return `default-src 'self'; script-src 'self'${clerk} https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' https://img.clerk.com data:; connect-src 'self'${clerk}; frame-src 'self'${clerk} https://challenges.cloudflare.com; worker-src 'self' blob:; frame-ancestors 'none'; base-uri 'none'; form-action 'self'`;
}
const now = () => new Date().toISOString();
class Fault extends Error {
  constructor(
    public code: string,
    public status: 400 | 401 | 403 | 404 | 409 | 429 | 503,
    message: string,
  ) {
    super(message);
  }
}
function fail(
  code: string,
  status: 400 | 401 | 403 | 404 | 409 | 429 | 503,
  message: string,
): never {
  throw new Fault(code, status, message);
}
function auditStatement(
  c: Context<Env>,
  action: string,
  entityId: string,
  outcome = "ok",
  metadata: Record<string, unknown> = {},
) {
  return c.env.DB.prepare(
    "INSERT INTO audit_events VALUES (?,?,?,?,?,?,?,?)",
  ).bind(
    crypto.randomUUID(),
    c.get("actor") || "anonymous",
    action,
    entityId,
    c.get("requestId"),
    outcome,
    now(),
    JSON.stringify(metadata),
  );
}
async function audit(
  c: Context<Env>,
  action: string,
  entityId: string,
  outcome = "ok",
) {
  await auditStatement(c, action, entityId, outcome).run();
}
async function input<T>(c: Context<Env>, schema: z.ZodType<T>): Promise<T> {
  try {
    return schema.parse(await c.req.json());
  } catch (e) {
    if (e instanceof ZodError) throw e;
    return fail("invalid_json", 400, "A valid JSON body is required.");
  }
}
async function get<T>(
  c: Context<Env>,
  sql: string,
  ...params: (string | number)[]
): Promise<T> {
  const item = await c.env.DB.prepare(sql)
    .bind(...params)
    .first<T>();
  if (!item) return fail("not_found", 404, "Record not found.");
  return item;
}
async function list(
  c: Context<Env>,
  sql: string,
  ...params: (string | number)[]
) {
  return (
    await c.env.DB.prepare(sql)
      .bind(...params)
      .all()
  ).results;
}
async function plugin(c: Context<Env>, pluginId: string, grant: string) {
  const p = await get<{
    enabled: number;
    grants_json: string;
    manifest_json: string;
  }>(c, "SELECT * FROM plugins WHERE id=?", pluginId);
  const m = manifestSchema.parse(JSON.parse(p.manifest_json));
  const builtIn = manifests.find((v) => v.id === pluginId);
  if (JSON.stringify(m) !== JSON.stringify(builtIn))
    return fail(
      "plugin_integrity",
      403,
      "Plugin manifest does not match the reviewed built-in version.",
    );
  if (!p.enabled) return fail("plugin_disabled", 403, "Plugin is disabled.");
  if (!(JSON.parse(p.grants_json) as string[]).includes(grant))
    return fail("permission_denied", 403, "Explicit plugin grant is missing.");
  return m;
}
app.use("*", async (c, next) => {
  c.set("requestId", crypto.randomUUID());
  c.set("actor", "anonymous");
  c.header("X-Request-ID", c.get("requestId"));
  c.header("Cache-Control", "no-store");
  c.header("X-Content-Type-Options", "nosniff");
  c.header("Referrer-Policy", "no-referrer");
  c.header(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
  );
  c.header("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (new URL(c.req.url).protocol === "https:")
    c.header("Strict-Transport-Security", "max-age=31536000");
  await next();
});
app.use(
  "/api/*",
  bodyLimit({
    maxSize: 16384,
    onError: (c) =>
      c.json(
        {
          error: {
            code: "body_too_large",
            message: "Body exceeds 16 KB",
            founder: founderNotice("body_too_large"),
            requestId: c.get("requestId"),
          },
        },
        413,
      ),
  }),
);
app.onError(async (e, c) => {
  const status =
    e instanceof Fault ? e.status : e instanceof ZodError ? 400 : 500;
  const code =
    e instanceof Fault
      ? e.code
      : e instanceof ZodError
        ? "invalid_input"
        : "internal_error";
  const message =
    e instanceof Fault
      ? e.message
      : e instanceof ZodError
        ? "Input violates the API contract."
        : "Request failed safely. Check service readiness and request ID.";
  if (c.req.path.startsWith("/api/") && c.env.DB) {
    try {
      await audit(c, "request.denied", "api", code);
    } catch {
      /* Never leak storage errors or credentials. */
    }
  }
  return c.json(
    {
      error: {
        code,
        message,
        founder: founderNotice(code, c.req.path),
        requestId: c.get("requestId"),
      },
    },
    status,
  );
});
app.get("/api/health", async (c) => {
  let database = false;
  if (c.env.DB) {
    try {
      await c.env.DB.prepare("SELECT id FROM sources LIMIT 1").first();
      await c.env.DB.prepare("SELECT token_hash FROM sessions LIMIT 1").first();
      await c.env.DB.prepare(
        "SELECT secret_name FROM secret_rotations LIMIT 1",
      ).first();
      await c.env.DB.prepare("SELECT id FROM research_briefs LIMIT 1").first();
      await c.env.DB.prepare(
        "SELECT id FROM research_decisions LIMIT 1",
      ).first();
      database = true;
    } catch {
      /* Migration missing. */
    }
  }
  return c.json(
    {
      service: "HIO",
      version: APP_VERSION,
      database,
      authentication: configured(c),
      mode: "fixture-and-research-planning",
      releaseState: configured(c)
        ? "operator-configured"
        : "setup-required-locked",
      liveCollection: researchReady(c.env),
      aiInference: researchReady(c.env),
    },
    database && configured(c) ? 200 : 503,
  );
});
app.post("/api/session", async (c) => {
  if (!configured(c) || !c.env.DB)
    return fail(
      "not_configured",
      503,
      "Operator authentication or database is not configured.",
    );
  if (!safeMutation(c))
    return fail("origin_denied", 403, "Same-origin operator request required.");
  c.set("actor", "anonymous");
  if (!(await rateLimit(c, "login", 10, 60))) {
    c.header("Retry-After", "60");
    return fail(
      "rate_limited",
      429,
      "Login attempts are limited; retry after 60 seconds.",
    );
  }
  const b = await input(
    c,
    z.object({ secret: z.string().min(1).max(256) }).strict(),
  );
  if (!(await equal(b.secret, c.env.OPERATOR_SECRET!)))
    return fail("unauthorized", 401, "Invalid operator credentials.");
  c.set("actor", c.env.OPERATOR_NAME || "operator");
  await audit(c, "session.login", "operator");
  await establishSession(c);
  return c.json({ actor: c.get("actor"), expiresIn: 28800 });
});
// Customer API: Clerk identity + HIO workspace authorization. Mounted before
// the founder guard and fully separate from it.
registerCustomer(app);
app.use("/api/*", async (c, next) => {
  if (c.req.path.startsWith("/api/customer/")) return next();
  if (!(await authenticated(c)))
    return fail(
      "unauthorized",
      401,
      "Sign in with the configured operator credential.",
    );
  c.set("actor", c.env.OPERATOR_NAME || "operator");
  if (!c.env.DB)
    return fail("not_configured", 503, "Database binding is unavailable.");
  if (c.req.method !== "GET" && !safeMutation(c))
    return fail("origin_denied", 403, "Same-origin operator request required.");
  if (c.req.method !== "GET" && !(await rateLimit(c, "mutations", 60, 60))) {
    c.header("Retry-After", "60");
    return fail(
      "rate_limited",
      429,
      "Mutation quota reached; retry after 60 seconds.",
    );
  }
  await next();
});
app.get("/api/v1/me", (c) =>
  c.json({
    actor: c.get("actor"),
    role: "owner-operator",
    workspace: "holbery-hio",
    mode: "fixture-only",
  }),
);
registerFounder(app);
registerResearch(app);
registerAgentWorkspace(app);
registerCodingAgent(app);
registerCustomerInvites(app);
app.delete("/api/session", async (c) => {
  await revokeSession(c);
  await audit(c, "session.logout", "operator");
  deleteCookie(c, "hio_session", { path: "/" });
  return c.json({ ok: true });
});
app.get("/api/v1/summary", async (c) =>
  c.json(
    await get(
      c,
      "SELECT (SELECT COUNT(*) FROM evidence WHERE expires_at>? AND purged_at IS NULL) evidence_count, (SELECT COUNT(*) FROM runs) run_count, (SELECT COUNT(*) FROM decisions) decision_count, (SELECT COUNT(*) FROM experiments WHERE status='completed') completed_count",
      now(),
    ),
  ),
);
app.get("/api/v1/intelligence", async (c) =>
  c.json({
    mode: "planning-only",
    items: await list(
      c,
      "SELECT id,question,segment,geography,connector,created_at FROM research_briefs ORDER BY created_at DESC LIMIT 50",
    ),
  }),
);
app.get("/api/v1/intelligence/:id", async (c) => {
  const brief = await get<{ plan_json: string }>(
    c,
    "SELECT * FROM research_briefs WHERE id=?",
    id.parse(c.req.param("id")),
  );
  const { plan_json, ...record } = brief;
  return c.json({ ...record, plan: JSON.parse(plan_json) });
});
app.post("/api/v1/intelligence", async (c) => {
  const b = await input(c, briefInput);
  const briefId = crypto.randomUUID();
  const plan = researchPlan(b);
  await c.env.DB.batch([
    c.env.DB.prepare(
      "INSERT INTO research_briefs VALUES (?,?,?,?,?,?,?,?,?,?)",
    ).bind(
      briefId,
      b.question,
      b.segment,
      b.geography,
      b.problem,
      b.payerHypothesis,
      b.connector,
      JSON.stringify(plan),
      now(),
      c.get("actor"),
    ),
    auditStatement(c, "intelligence.plan_created", briefId),
  ]);
  return c.json({ id: briefId, plan }, 201);
});
app.get("/api/v1/sources", async (c) =>
  c.json({
    items: await list(
      c,
      "SELECT * FROM sources ORDER BY created_at DESC LIMIT 50",
    ),
  }),
);
app.patch("/api/v1/sources/:id", async (c) => {
  const sourceId = id.parse(c.req.param("id"));
  await get(c, "SELECT id FROM sources WHERE id=?", sourceId);
  const b = await input(c, sourcePatch);
  await c.env.DB.batch([
    c.env.DB.prepare(
      "UPDATE sources SET enabled=?,reviewed_at=? WHERE id=?",
    ).bind(b.enabled ? 1 : 0, now(), sourceId),
    auditStatement(c, b.enabled ? "source.enable" : "source.disable", sourceId),
  ]);
  return c.json({ ok: true });
});
app.get("/api/v1/plugins", async (c) =>
  c.json({
    items: await list(c, "SELECT * FROM plugins ORDER BY id LIMIT 50"),
    available: manifests,
  }),
);
app.post("/api/v1/plugins", async (c) => {
  const m = await input(c, manifestSchema);
  const builtIn = manifests.find((v) => v.id === m.id);
  if (JSON.stringify(m) !== JSON.stringify(builtIn))
    return fail(
      "unreviewed_plugin",
      403,
      "Only exact reviewed built-in manifests can be installed.",
    );
  const exists = await c.env.DB.prepare("SELECT id FROM plugins WHERE id=?")
    .bind(m.id)
    .first();
  if (exists)
    return fail("already_installed", 409, "Plugin is already installed.");
  await c.env.DB.batch([
    c.env.DB.prepare("INSERT INTO plugins VALUES (?,?,0,?,?)").bind(
      m.id,
      JSON.stringify(m),
      "[]",
      now(),
    ),
    auditStatement(c, "plugin.install", m.id),
  ]);
  return c.json({ id: m.id, enabled: false, grants: [] }, 201);
});
app.patch("/api/v1/plugins/:id", async (c) => {
  const pluginId = z
    .enum(["hio.fixture", "hio.mcp-fixture"])
    .parse(c.req.param("id"));
  const p = await get<{ manifest_json: string }>(
    c,
    "SELECT manifest_json FROM plugins WHERE id=?",
    pluginId,
  );
  const m = manifestSchema.parse(JSON.parse(p.manifest_json));
  const b = await input(c, pluginPatch);
  if (b.grants.some((v) => !m.permissions.includes(v)))
    return fail(
      "permission_denied",
      403,
      "Grant exceeds requested capability.",
    );
  if (b.enabled && !m.permissions.every((v) => b.grants.includes(v)))
    return fail(
      "permission_denied",
      403,
      "Enablement requires explicit grants.",
    );
  await c.env.DB.batch([
    c.env.DB.prepare(
      "UPDATE plugins SET enabled=?,grants_json=?,updated_at=? WHERE id=?",
    ).bind(b.enabled ? 1 : 0, JSON.stringify(b.grants), now(), pluginId),
    auditStatement(
      c,
      b.enabled ? "plugin.grant_enable" : "plugin.disable_revoke",
      pluginId,
    ),
  ]);
  return c.json({ ok: true });
});
app.post("/api/v1/runs", async (c) => {
  const b = await input(c, runInput);
  const m = await plugin(c, "hio.fixture", "fixture.read");
  const source = await get<{ enabled: number; retention_days: number }>(
    c,
    "SELECT * FROM sources WHERE id=?",
    b.sourceId,
  );
  if (!source.enabled)
    return fail("source_disabled", 403, "Source is disabled.");
  const hash = await digest(JSON.stringify(b));
  const prior = await c.env.DB.prepare("SELECT * FROM runs WHERE request_key=?")
    .bind(b.key)
    .first<{ request_hash: string }>();
  if (prior) {
    if (prior.request_hash !== hash)
      return fail(
        "idempotency_conflict",
        409,
        "Key was already used for different input.",
      );
    return c.json({ run: prior, replayed: true });
  }
  const recent = await c.env.DB.prepare(
    "SELECT id FROM runs WHERE source_id=? AND started_at>? LIMIT 1",
  )
    .bind(b.sourceId, new Date(Date.now() - 2000).toISOString())
    .first();
  if (recent) {
    c.header("Retry-After", "2");
    return fail(
      "rate_limited",
      429,
      "Fixture runs require a two-second interval.",
    );
  }
  const runId = "run-" + (await digest(b.key)).slice(0, 32),
    timestamp = now(),
    success = b.mode === "normal";
  const errorCode =
    b.mode === "failure"
      ? "fixture_unavailable"
      : b.mode === "rate_limit"
        ? "fixture_rate_limited"
        : null;
  const statements: D1PreparedStatement[] = [
    c.env.DB.prepare(
      "INSERT OR IGNORE INTO runs SELECT ?,?,?,?, ?,?,0,0,?,0,?,?,?,? WHERE EXISTS(SELECT 1 FROM sources WHERE id=? AND enabled=1) AND EXISTS(SELECT 1 FROM plugins WHERE id='hio.fixture' AND enabled=1 AND grants_json='[\"fixture.read\"]') AND NOT EXISTS(SELECT 1 FROM runs WHERE source_id=? AND started_at>?)",
    ).bind(
      runId,
      b.sourceId,
      b.key,
      hash,
      success ? "succeeded" : "failed",
      success ? b.limit : 0,
      errorCode,
      timestamp,
      timestamp,
      m.version,
      await digest(JSON.stringify(m)),
      b.sourceId,
      b.sourceId,
      new Date(Date.now() - 2000).toISOString(),
    ),
  ];
  const rows = fixtures.slice(0, b.limit);
  const expires = new Date(
    Date.now() + source.retention_days * 86400000,
  ).toISOString();
  if (success)
    for (const row of rows) {
      const normalized = normalize(row.observation),
        fingerprint = await digest(normalized),
        evidenceId = "ev-" + fingerprint.slice(0, 32);
      statements.push(
        c.env.DB.prepare(
          "INSERT OR IGNORE INTO evidence SELECT ?,?,?,?,?,?,?,?,?,?,?,?,1,?,?,NULL WHERE EXISTS(SELECT 1 FROM runs WHERE id=? AND request_hash=?)",
        ).bind(
          evidenceId,
          b.sourceId,
          runId,
          row.externalId,
          `fixture://${row.externalId}`,
          "hio-first-party",
          "fixture/v1",
          row.observation,
          normalized,
          fingerprint,
          row.relationship,
          JSON.stringify({
            directness: "synthetic",
            independence: "single fixture",
            completeness: "test excerpt",
            commercial: "unverified",
          }),
          timestamp,
          expires,
          runId,
          hash,
        ),
      );
      statements.push(
        c.env.DB.prepare(
          "INSERT OR IGNORE INTO provenance SELECT ?,?,id,?,?,CASE WHEN external_id=? AND run_id=? THEN 0 ELSE 1 END FROM evidence WHERE fingerprint=? AND EXISTS(SELECT 1 FROM runs WHERE id=? AND request_hash=?)",
        ).bind(
          runId,
          row.externalId,
          `fixture://${row.externalId}`,
          timestamp,
          row.externalId,
          runId,
          fingerprint,
          runId,
          hash,
        ),
      );
      statements.push(
        c.env.DB.prepare(
          "INSERT OR IGNORE INTO memberships SELECT 'workflow-friction',id,relationship FROM evidence WHERE fingerprint=? AND EXISTS(SELECT 1 FROM runs WHERE id=? AND request_hash=?)",
        ).bind(fingerprint, runId, hash),
      );
    }
  statements.push(
    c.env.DB.prepare(
      "UPDATE runs SET accepted=(SELECT COUNT(*) FROM provenance WHERE run_id=? AND duplicate=0), duplicates=(SELECT COUNT(*) FROM provenance WHERE run_id=? AND duplicate=1) WHERE id=? AND request_hash=?",
    ).bind(runId, runId, runId, hash),
  );
  statements.push(
    c.env.DB.prepare(
      "UPDATE sources SET last_run_at=? WHERE id=? AND EXISTS(SELECT 1 FROM runs WHERE id=? AND request_hash=?)",
    ).bind(timestamp, b.sourceId, runId, hash),
  );
  statements.push(
    auditStatement(
      c,
      "collection.attempt",
      runId,
      "attempted",

      { mode: b.mode, limit: b.limit },
    ),
  );
  await c.env.DB.batch(statements);
  const run = await c.env.DB.prepare("SELECT * FROM runs WHERE id=?")
    .bind(runId)
    .first<{ request_hash: string }>();
  if (!run) {
    await plugin(c, "hio.fixture", "fixture.read");
    const current = await get<{ enabled: number }>(
      c,
      "SELECT enabled FROM sources WHERE id=?",
      b.sourceId,
    );
    if (!current.enabled)
      return fail(
        "source_disabled",
        403,
        "Source was disabled before collection committed.",
      );
    c.header("Retry-After", "2");
    return fail(
      "rate_limited",
      429,
      "Another run committed first. Retry after two seconds.",
    );
  }
  if (run.request_hash !== hash)
    return fail(
      "idempotency_conflict",
      409,
      "Key was concurrently used for different input.",
    );
  return c.json({ run, replayed: false }, 201);
});
app.get("/api/v1/runs", async (c) =>
  c.json({
    items: await list(
      c,
      "SELECT * FROM runs ORDER BY started_at DESC LIMIT 50",
    ),
  }),
);
app.get("/api/v1/evidence", async (c) => {
  const q = z
    .string()
    .max(120)
    .parse(c.req.query("q") || "");
  const offset = z.coerce
    .number()
    .int()
    .min(0)
    .max(100000)
    .parse(c.req.query("offset") || 0);
  return c.json({
    items: await list(
      c,
      "SELECT * FROM evidence WHERE expires_at>? AND purged_at IS NULL AND observation LIKE ? ORDER BY captured_at DESC,id LIMIT 25 OFFSET ?",
      now(),
      `%${q}%`,
      offset,
    ),
    offset,
    nextOffset: offset + 25,
  });
});
app.get("/api/v1/evidence/:id", async (c) => {
  const evidenceId = id.parse(c.req.param("id"));
  return c.json({
    evidence: await get(
      c,
      "SELECT * FROM evidence WHERE id=? AND expires_at>? AND purged_at IS NULL",
      evidenceId,
      now(),
    ),
    provenance: await list(
      c,
      "SELECT * FROM provenance WHERE evidence_id=? ORDER BY captured_at DESC LIMIT 50",
      evidenceId,
    ),
  });
});
app.get("/api/v1/clusters", async (c) =>
  c.json({
    items: await list(
      c,
      "SELECT c.*, (SELECT COUNT(*) FROM memberships m JOIN evidence e ON e.id=m.evidence_id WHERE m.cluster_id=c.id AND e.expires_at>? AND e.purged_at IS NULL) evidence_count FROM clusters c LIMIT 50",
      now(),
    ),
  }),
);
async function dossier(c: Context<Env>, opportunityId: string) {
  const opportunity = await get(
    c,
    "SELECT * FROM opportunities WHERE id=?",
    opportunityId,
  );
  const evidence = await list(
    c,
    "SELECT e.* FROM memberships m JOIN evidence e ON m.evidence_id=e.id JOIN opportunities o ON o.cluster_id=m.cluster_id WHERE o.id=? AND e.expires_at>? AND e.purged_at IS NULL ORDER BY e.id LIMIT 100",
    opportunityId,
    now(),
  );
  const support = evidence.filter((e) => e.relationship === "support").length,
    counter = evidence.filter((e) => e.relationship === "counter").length;
  return {
    opportunity,
    evidence,
    score: score(support, counter),
    decisions: await list(
      c,
      "SELECT * FROM decisions WHERE opportunity_id=? ORDER BY created_at DESC LIMIT 50",
      opportunityId,
    ),
  };
}
app.get("/api/v1/opportunities", async (c) =>
  c.json({ items: await list(c, "SELECT * FROM opportunities LIMIT 50") }),
);
app.get("/api/v1/opportunities/:id", async (c) =>
  c.json(await dossier(c, id.parse(c.req.param("id")))),
);
app.get("/api/v1/decisions", async (c) =>
  c.json({
    items: await list(
      c,
      "SELECT * FROM decisions ORDER BY created_at DESC LIMIT 50",
    ),
  }),
);
app.post("/api/v1/decisions", async (c) => {
  const b = await input(c, decisionInput);
  const d = await dossier(c, b.opportunityId);
  if (
    b.choice === "approve_fixture" &&
    (!d.score.factors.support || !d.score.factors.counter)
  )
    return fail(
      "evidence_gate",
      409,
      "Approval requires supporting and counter-evidence; only a zero-cost fixture test can be approved.",
    );
  const decisionId = crypto.randomUUID();
  await c.env.DB.batch([
    c.env.DB.prepare("INSERT INTO decisions VALUES (?,?,?,?,?,?,?,?,?)").bind(
      decisionId,
      b.opportunityId,
      b.choice,
      b.rationale,
      b.reviewerNotes,
      c.get("actor"),
      b.reviewAt,
      JSON.stringify({
        evidenceIds: d.evidence.map((e) => e.id),
        score: d.score,
        classification: "synthetic-fixture-snapshot",
      }),
      now(),
    ),
    auditStatement(c, "decision.record", decisionId),
  ]);
  return c.json({ id: decisionId }, 201);
});
app.get("/api/v1/experiments", async (c) =>
  c.json({
    items: await list(
      c,
      "SELECT * FROM experiments ORDER BY created_at DESC LIMIT 50",
    ),
  }),
);
app.post("/api/v1/experiments", async (c) => {
  const b = await input(c, experimentInput);
  const d = await get<{ choice: string; review_at: string }>(
    c,
    "SELECT * FROM decisions WHERE id=? AND opportunity_id=?",
    b.decisionId,
    b.opportunityId,
  );
  const latest = await get<{ id: string }>(
    c,
    "SELECT id FROM decisions WHERE opportunity_id=? ORDER BY created_at DESC,rowid DESC LIMIT 1",
    b.opportunityId,
  );
  if (
    d.choice !== "approve_fixture" ||
    d.review_at <= now() ||
    latest.id !== b.decisionId
  )
    return fail(
      "approval_required",
      403,
      "Latest decision must be an unexpired fixture approval.",
    );
  const experimentId = crypto.randomUUID();
  await c.env.DB.batch([
    c.env.DB.prepare(
      "INSERT INTO experiments(id,opportunity_id,decision_id,owner,hypothesis,success_criteria,stop_criteria,budget_minor,currency,review_at,created_at) VALUES (?,?,?,?,?,?,?,0,'IDR',?,?)",
    ).bind(
      experimentId,
      b.opportunityId,
      b.decisionId,
      c.get("actor"),
      b.hypothesis,
      b.successCriteria,
      b.stopCriteria,
      b.reviewAt,
      now(),
    ),
    auditStatement(c, "experiment.approved_fixture", experimentId),
  ]);
  return c.json({ id: experimentId }, 201);
});
app.post("/api/v1/experiments/:id/outcome", async (c) => {
  const experimentId = id.parse(c.req.param("id"));
  const b = await input(c, outcomeInput);
  const e = await get<{ status: string }>(
    c,
    "SELECT * FROM experiments WHERE id=?",
    experimentId,
  );
  if (e.status === "completed")
    return fail(
      "already_completed",
      409,
      "Outcome is immutable; create a new follow-up experiment.",
    );
  const result = await c.env.DB.batch([
    c.env.DB.prepare(
      "UPDATE experiments SET outcome=?,learning=?,actual_cost_minor=0,status='completed',completed_at=? WHERE id=? AND status='approved_fixture'",
    ).bind(b.outcome, b.learning, now(), experimentId),
    auditStatement(c, "experiment.outcome", experimentId),
  ]);
  if (result[0]?.meta.changes !== 1)
    return fail("already_completed", 409, "Outcome already recorded.");
  return c.json({ ok: true });
});
app.post("/api/v1/mcp/call", async (c) => {
  const b = await input(c, toolInput);
  await plugin(c, "hio.mcp-fixture", "evidence.read");
  const records = await list(
    c,
    "SELECT id,observation FROM evidence WHERE expires_at>? AND purged_at IS NULL ORDER BY id LIMIT ?",
    now(),
    b.params.arguments.limit,
  );
  const output = toolOutput.parse({
    items: records.map((r) => ({
      id: r.id,
      observation: r.observation,
      synthetic: true,
    })),
    classification: "untrusted-source-data",
  });
  await audit(c, "mcp.fixture.evidence.list", "hio.mcp-fixture");
  return c.json({
    jsonrpc: "2.0",
    id: b.id,
    result: output,
    transport: "local-reviewed-fixture-not-remote-MCP",
  });
});
app.get("/api/v1/audit", async (c) =>
  c.json({
    items: await list(
      c,
      "SELECT * FROM audit_events ORDER BY occurred_at DESC LIMIT 50",
    ),
  }),
);
app.use("/api/v1/secrets*", async (c, next) => {
  if (!canManageSecrets(c.get("role")))
    return fail(
      "owner_required",
      403,
      "Only the authenticated owner can manage secret metadata.",
    );
  await next();
});
app.get("/api/v1/secrets", async (c) => {
  if (new URL(c.req.url).search)
    return fail(
      "invalid_input",
      400,
      "Secret inventory does not accept variable names or query parameters.",
    );
  const rotations = await c.env.DB.prepare(
    "SELECT * FROM secret_rotations ORDER BY environment,secret_name",
  ).all<Rotation>();
  return c.json(secretInventory(c.env, rotations.results));
});
app.post("/api/v1/secrets/rotation", async (c) => {
  const b = await input(c, rotationInput);
  const timestamp = now();
  await c.env.DB.batch([
    c.env.DB.prepare(
      "INSERT INTO secret_rotations VALUES (?,?,?,?,?) ON CONFLICT(secret_name,environment) DO UPDATE SET rotated_at=excluded.rotated_at,recorded_at=excluded.recorded_at,recorded_by=excluded.recorded_by",
    ).bind(b.name, b.environment, b.rotatedAt, timestamp, c.get("actor")),
    auditStatement(c, "secret.rotation_metadata", b.name, "owner_reported", {
      environment: b.environment,
      rotatedAt: b.rotatedAt,
    }),
  ]);
  return c.json({
    ok: true,
    notice:
      "Metadata recorded only. No Cloudflare secret was changed or verified by this action.",
  });
});
app.get("/api/v1/settings", (c) =>
  c.json({
    mode: "fixture-only",
    externalNetwork: false,
    spending: false,
    manualVersion: "0.1.0",
    reviewDate: "2026-10-11",
    retentionDays: 30,
    roles: ["owner-operator"],
    limits: { bodyBytes: 16384, recordsPerRun: 4, mutationsPerMinute: 60 },
    limitations: [
      "No real source connectors",
      "No remote MCP transport or custom MCP server",
      "No LLM or embeddings",
      "Single operator; team SSO/RBAC not implemented",
      "No automatic retention job; operator-triggered purge",
      "No public launch, outreach or payment integration",
    ],
  }),
);
app.post("/api/v1/settings/purge-expired", async (c) => {
  const timestamp = now();
  const result = await c.env.DB.batch([
    c.env.DB.prepare(
      "UPDATE evidence SET observation='[expired fixture content]',normalized_text='',quality_json='{}',purged_at=? WHERE expires_at<=? AND purged_at IS NULL",
    ).bind(timestamp, timestamp),
    auditStatement(c, "retention.purge_expired", "evidence"),
  ]);
  return c.json({ purged: result[0]?.meta.changes ?? 0 });
});
// Customer area (invite-only beta). No founder navigation or diagnostics.
for (const path of ["/masuk", "/ruang", "/ruang/brief"])
  app.get(path, (c) => {
    c.header(
      "Content-Security-Policy",
      customerCsp(c.env.CLERK_PUBLISHABLE_KEY),
    );
    return c.html(customerShell());
  });

// Public landing page: the single public entry point. No session is read.
app.get("/", (c) => c.html(landingPage()));
// Founder entry points. /founder/login and /founder render the same founder
// shell (it shows the sign-in panel until the operator session is valid);
// a signed-in founder visiting /founder/login is sent to the dashboard.
app.get("/founder/login", async (c) => {
  if (configured(c) && (await authenticated(c)))
    return c.redirect("/founder", 302);
  return c.html(founderShell(!configured(c)));
});
app.get("/founder/", (c) => c.redirect("/founder", 301));
app.get("/founder/login/", (c) => c.redirect("/founder/login", 301));
// Founder workspace. Plain-language screens only.
const founderPaths = [
  "/founder",
  "/intelijen",
  "/peluang",
  "/produk",
  "/publikasi",
  "/pengaturan",
];
for (const path of founderPaths) {
  app.get(path, (c) => c.html(founderShell(!configured(c))));
  if (path !== "/founder") app.get(path + "/", (c) => c.redirect(path, 301));
}
// Owner-only AI workspace beta; reuses the existing HIO operator session.
app.get("/agent", async (c) => {
  if (!(await authenticated(c))) return c.redirect("/founder/login", 302);
  return c.html(agentWorkspacePage());
});
app.get("/agent/", (c) => c.redirect("/agent", 301));
app.get("/agent/code", async (c) => {
  if (!(await authenticated(c))) return c.redirect("/founder/login", 302);
  return c.html(codeConsolePage());
});
app.get("/agent/code/", (c) => c.redirect("/agent/code", 301));
// Owner-only maintenance area: hidden from founder navigation, never the landing page.
const maintenancePages = [
  "overview",
  "intelligence",
  "sources",
  "runs",
  "evidence",
  "clusters",
  "opportunities",
  "decisions",
  "experiments",
  "plugins",
  "settings",
  "secrets",
  "manual",
];
app.get("/pemeliharaan/", (c) => c.redirect("/pemeliharaan", 301));
app.get("/pemeliharaan/:page?", async (c) => {
  const page = c.req.param("page") || "overview";
  if (!maintenancePages.includes(page)) return c.redirect("/pemeliharaan", 302);
  if (!(await authenticated(c))) return c.redirect("/pengaturan", 302);
  if (page === "secrets" && !canManageSecrets(c.get("role")))
    return c.redirect("/pengaturan", 302);
  return c.html(maintenanceShell());
});
// Legacy engineering URLs map to the matching founder area.
const legacy: Record<string, string> = {
  "/intelligence": "/intelijen",
  "/sources": "/pengaturan",
  "/runs": "/intelijen",
  "/evidence": "/intelijen",
  "/clusters": "/intelijen",
  "/opportunities": "/peluang",
  "/decisions": "/peluang",
  "/experiments": "/produk",
  "/plugins": "/pengaturan",
  "/settings": "/pengaturan",
  "/secrets": "/pengaturan",
  "/manual": "/pengaturan",
};
for (const [from, to] of Object.entries(legacy))
  app.get(from, (c) => c.redirect(to, 301));
app.use("/static/*", serveStatic({ root: "./public" }));
// Explicit catch-all: the Pages build wrapper cannot forward Hono's notFound
// handler (it becomes undefined and produced 500s). Pages get a friendly 404.
const notFound = (c: Context<Env>) =>
  c.req.path.startsWith("/api/")
    ? c.json(
        {
          error: {
            code: "not_found",
            message: "Route not found",
            founder: founderNotice("not_found"),
            requestId: c.get("requestId"),
          },
        },
        404,
      )
    : c.html(notFoundPage(), 404);
app.notFound(notFound);
app.all("*", notFound);
export default app;
