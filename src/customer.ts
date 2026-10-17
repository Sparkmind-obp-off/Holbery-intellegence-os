// Customer identity, workspace authorization and the minimal Phase 1 customer API.
// Clerk answers "who authenticated?"; this module answers "which workspace,
// with which role?" from HIO's own database. Customer requests never receive
// the founder/operator role and never reach founder routes.
import type { Context, Hono, Next } from "hono";
import { z } from "zod";
import { rateLimit, type Env } from "./auth";
import { clerkConfig, clerkPrimaryEmail, verifyClerkToken } from "./clerk";
import { digest } from "./contracts";

export type Role = "owner" | "member" | "viewer";
export type Permission =
  | "workspace.read"
  | "workspace.update"
  | "brief.read"
  | "brief.write";
const grants: Record<Role, Permission[]> = {
  owner: ["workspace.read", "workspace.update", "brief.read", "brief.write"],
  member: ["workspace.read", "brief.read", "brief.write"],
  viewer: ["workspace.read", "brief.read"],
};
export const can = (role: Role, p: Permission) => grants[role].includes(p);

export type Customer = {
  userId: string;
  clerkUserId: string;
  email: string;
  workspaceId: string;
  workspaceName: string;
  role: Role;
};
type CEnv = Env & { Variables: Env["Variables"] & { customer?: Customer } };

const now = () => new Date().toISOString();
const notices: Record<
  string,
  { judul: string; langkah: string; status: number }
> = {
  customer_auth_unavailable: {
    judul: "Masuk untuk pelanggan belum tersedia",
    langkah: "Fitur ini masih disiapkan. Coba lagi nanti.",
    status: 503,
  },
  customer_unauthenticated: {
    judul: "Kamu belum masuk atau sesimu sudah berakhir",
    langkah: "Masuk lagi untuk melanjutkan.",
    status: 401,
  },
  customer_not_invited: {
    judul: "Akses masih terbatas untuk undangan",
    langkah:
      "HIO sedang dalam uji coba terbatas. Minta undangan, lalu masuk dengan email yang diundang.",
    status: 403,
  },
  customer_email_unverified: {
    judul: "Email belum terverifikasi",
    langkah: "Selesaikan verifikasi email, lalu masuk lagi.",
    status: 403,
  },
  customer_disabled: {
    judul: "Akun ini tidak aktif",
    langkah: "Hubungi tim HIO bila menurutmu ini keliru.",
    status: 403,
  },
  customer_forbidden: {
    judul: "Kamu tidak punya akses ke ruang kerja ini",
    langkah: "Kembali ke ruang kerjamu sendiri.",
    status: 403,
  },
  customer_rate_limited: {
    judul: "Terlalu banyak percobaan",
    langkah: "Tunggu sekitar satu menit, lalu coba lagi.",
    status: 429,
  },
  customer_origin_denied: {
    judul: "Permintaan ditolak demi keamanan",
    langkah: "Muat ulang halaman, lalu coba lagi.",
    status: 403,
  },
  customer_invalid_input: {
    judul: "Isian belum lengkap atau terlalu panjang",
    langkah: "Periksa kembali isianmu.",
    status: 400,
  },
  customer_not_found: {
    judul: "Data tidak ditemukan",
    langkah: "Kembali ke daftar untuk melihat data terbaru.",
    status: 404,
  },
  customer_temporarily_unavailable: {
    judul: "Layanan masuk sedang terganggu",
    langkah: "Coba lagi beberapa saat lagi.",
    status: 503,
  },
};
function deny(c: Context<CEnv>, code: keyof typeof notices) {
  const n = notices[code]!;
  return c.json(
    {
      error: {
        code,
        founder: {
          judul: n.judul,
          dampak: "",
          langkah: n.langkah,
          perluKamu: true,
        },
        requestId: c.get("requestId"),
      },
    },
    n.status as 400,
  );
}
async function audit(
  c: Context<CEnv>,
  actor: string,
  action: string,
  entity: string,
  outcome = "ok",
) {
  await c.env.DB.prepare("INSERT INTO audit_events VALUES (?,?,?,?,?,?,?,?)")
    .bind(
      crypto.randomUUID(),
      actor,
      action,
      entity,
      c.get("requestId"),
      outcome,
      now(),
      "{}",
    )
    .run();
}

function bearer(c: Context<CEnv>) {
  const h = c.req.header("Authorization") ?? "";
  const m = /^Bearer ([A-Za-z0-9_.-]+)$/.exec(h);
  return m ? m[1]! : null;
}

// Idempotent, race-safe provisioning: unique clerk_user_id and unique
// personal_owner_user_id make concurrent first sign-ins converge on one row.
async function provision(c: Context<CEnv>, clerkUserId: string, email: string) {
  const t = now();
  const userId = "usr_" + crypto.randomUUID().replace(/-/g, "");
  const wsId = "ws_" + crypto.randomUUID().replace(/-/g, "");
  await c.env.DB.batch([
    c.env.DB.prepare(
      "INSERT INTO users(id,clerk_user_id,email,state,created_at,updated_at) VALUES (?,?,?,'active',?,?) ON CONFLICT(clerk_user_id) DO NOTHING",
    ).bind(userId, clerkUserId, email, t, t),
    c.env.DB.prepare(
      "INSERT INTO workspaces(id,name,created_by_user_id,personal_owner_user_id,state,created_at,updated_at) SELECT ?,'Ruang kerja pribadi',u.id,u.id,'active',?,? FROM users u WHERE u.clerk_user_id=? ON CONFLICT(personal_owner_user_id) DO NOTHING",
    ).bind(wsId, t, t, clerkUserId),
    c.env.DB.prepare(
      "INSERT INTO workspace_memberships(workspace_id,user_id,role,status,created_at,updated_at) SELECT w.id,u.id,'owner','active',?,? FROM users u JOIN workspaces w ON w.personal_owner_user_id=u.id WHERE u.clerk_user_id=? ON CONFLICT(workspace_id,user_id) DO NOTHING",
    ).bind(t, t, clerkUserId),
    c.env.DB.prepare(
      "UPDATE customer_invites SET accepted_user_id=(SELECT id FROM users WHERE clerk_user_id=?), accepted_at=? WHERE email=? AND accepted_user_id IS NULL AND revoked_at IS NULL",
    ).bind(clerkUserId, t, email),
  ]);
}

// Resolves a verified customer and their authorized workspace. A client may
// *select* a workspace via X-HIO-Workspace, but only an active membership grants it.
export async function resolveCustomer(
  c: Context<CEnv>,
): Promise<Customer | keyof typeof notices> {
  const cfg = clerkConfig(c.env, new URL(c.req.url).origin);
  if (!cfg || !c.env.DB) return "customer_auth_unavailable";
  const token = bearer(c);
  if (!token) return "customer_unauthenticated";
  const v = await verifyClerkToken(token, cfg);
  if (!v.ok)
    return v.reason === "jwks_unavailable"
      ? "customer_temporarily_unavailable"
      : "customer_unauthenticated";
  const sub = v.identity.sub;

  let user = await c.env.DB.prepare(
    "SELECT id,email,state FROM users WHERE clerk_user_id=?",
  )
    .bind(sub)
    .first<{ id: string; email: string; state: string }>();
  if (!user) {
    // First sign-in: rate-limited per verified subject and globally.
    const key = "cust-provision:" + (await digest(sub)).slice(0, 24);
    if (
      !(await rateLimit(c, key, 5, 60)) ||
      !(await rateLimit(c, "cust-provision", 30, 60))
    )
      return "customer_rate_limited";
    const mail = await clerkPrimaryEmail(c.env.CLERK_SECRET_KEY!, sub);
    if (!mail.ok)
      return mail.reason === "unverified_email"
        ? "customer_email_unverified"
        : mail.reason === "provider_blocked"
          ? "customer_disabled"
          : "customer_temporarily_unavailable";
    if (c.env.HIO_CUSTOMER_SIGNUP !== "open") {
      const invite = await c.env.DB.prepare(
        "SELECT email FROM customer_invites WHERE email=? AND revoked_at IS NULL",
      )
        .bind(mail.email)
        .first();
      if (!invite) {
        await audit(
          c,
          "customer:" + sub.slice(0, 12),
          "customer.signin_not_invited",
          "invite",
          "denied",
        );
        return "customer_not_invited";
      }
    }
    await provision(c, sub, mail.email);
    user = await c.env.DB.prepare(
      "SELECT id,email,state FROM users WHERE clerk_user_id=?",
    )
      .bind(sub)
      .first<{ id: string; email: string; state: string }>();
    if (!user) return "customer_temporarily_unavailable";
    await audit(c, "customer:" + user.id, "customer.provisioned", user.id);
  }
  if (user.state !== "active") return "customer_disabled";

  const requested = c.req.header("X-HIO-Workspace");
  if (requested !== undefined && !/^ws_[a-f0-9]{32}$/.test(requested))
    return "customer_forbidden";
  const m = await c.env.DB.prepare(
    `SELECT w.id, w.name, m.role FROM workspace_memberships m JOIN workspaces w ON w.id=m.workspace_id
     WHERE m.user_id=? AND m.status='active' AND w.state='active' AND (? IS NULL OR w.id=?)
     ORDER BY (w.personal_owner_user_id=m.user_id) DESC, w.created_at LIMIT 1`,
  )
    .bind(user.id, requested ?? null, requested ?? null)
    .first<{ id: string; name: string; role: Role }>();
  if (!m) return "customer_forbidden";
  return {
    userId: user.id,
    clerkUserId: sub,
    email: user.email,
    workspaceId: m.id,
    workspaceName: m.name,
    role: m.role,
  };
}

const sameOrigin = (c: Context<CEnv>) =>
  c.req.header("Origin") === new URL(c.req.url).origin &&
  c.req.header("X-HIO-Request") === "customer";

export async function requireCustomer(c: Context<CEnv>, next: Next) {
  if (c.req.method !== "GET" && !sameOrigin(c))
    return deny(c, "customer_origin_denied");
  const r = await resolveCustomer(c);
  if (typeof r === "string") return deny(c, r);
  if (
    c.req.method !== "GET" &&
    !(await rateLimit(c, "cust-mut:" + r.userId, 30, 60))
  )
    return deny(c, "customer_rate_limited");
  c.set("customer", r);
  c.set("actor", "customer:" + r.userId);
  await next();
}
export const requirePermission =
  (p: Permission) => async (c: Context<CEnv>, next: Next) => {
    const cu = c.get("customer");
    if (!cu || !can(cu.role, p)) return deny(c, "customer_forbidden");
    await next();
  };

const briefBody = z
  .object({
    question: z.string().trim().min(3).max(500),
    segment: z.string().trim().min(3).max(120),
    geography: z.string().trim().min(2).max(120),
    problem: z.string().trim().min(3).max(500),
    constraints: z.string().trim().max(500).optional(),
  })
  .strict();
const briefView = (b: Record<string, unknown>) => ({
  id: String(b.id),
  pertanyaan: String(b.question),
  segmen: String(b.segment),
  wilayah: String(b.geography),
  masalah: String(b.problem),
  batasan: b.constraints ? String(b.constraints) : null,
  dibuat: String(b.created_at),
  diperbarui: String(b.updated_at),
});

export function registerCustomer(app: Hono<Env>) {
  const a = app as unknown as Hono<CEnv>;
  // Public, non-secret client configuration. The publishable key is designed
  // by Clerk to be exposed to browsers; the secret key never leaves the server.
  a.get("/api/customer/config", (c) => {
    const cfg = clerkConfig(c.env, new URL(c.req.url).origin);
    return c.json({
      tersedia: !!cfg,
      publishableKey: cfg ? c.env.CLERK_PUBLISHABLE_KEY : null,
      frontendApi: cfg ? cfg.issuer : null,
      undanganSaja: c.env.HIO_CUSTOMER_SIGNUP !== "open",
    });
  });
  a.use("/api/customer/me", requireCustomer);
  a.use("/api/customer/workspace", requireCustomer);
  a.use("/api/customer/briefs", requireCustomer);
  a.use("/api/customer/briefs/*", requireCustomer);

  a.get("/api/customer/me", (c) => {
    const cu = c.get("customer")!;
    return c.json({
      email: cu.email,
      ruangKerja: { id: cu.workspaceId, nama: cu.workspaceName },
      peran: cu.role,
    });
  });
  a.patch(
    "/api/customer/workspace",
    requirePermission("workspace.update"),
    async (c) => {
      const p = z
        .object({ nama: z.string().trim().min(1).max(80) })
        .strict()
        .safeParse(await c.req.json().catch(() => null));
      if (!p.success) return deny(c, "customer_invalid_input");
      const cu = c.get("customer")!;
      await c.env.DB.prepare(
        "UPDATE workspaces SET name=?, updated_at=? WHERE id=?",
      )
        .bind(p.data.nama, now(), cu.workspaceId)
        .run();
      await audit(
        c,
        "customer:" + cu.userId,
        "customer.workspace_renamed",
        cu.workspaceId,
      );
      return c.json({ pesan: "Nama ruang kerja disimpan." });
    },
  );
  a.get("/api/customer/briefs", requirePermission("brief.read"), async (c) => {
    const cu = c.get("customer")!;
    const rows = (
      await c.env.DB.prepare(
        "SELECT * FROM customer_briefs WHERE workspace_id=? ORDER BY created_at DESC LIMIT 50",
      )
        .bind(cu.workspaceId)
        .all<Record<string, unknown>>()
    ).results;
    return c.json({ brief: rows.map(briefView) });
  });
  a.post(
    "/api/customer/briefs",
    requirePermission("brief.write"),
    async (c) => {
      const p = briefBody.safeParse(await c.req.json().catch(() => null));
      if (!p.success) return deny(c, "customer_invalid_input");
      const cu = c.get("customer")!;
      const id = "brf_" + crypto.randomUUID().replace(/-/g, "");
      const t = now();
      await c.env.DB.prepare(
        "INSERT INTO customer_briefs(id,workspace_id,created_by_user_id,question,segment,geography,problem,constraints,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)",
      )
        .bind(
          id,
          cu.workspaceId,
          cu.userId,
          p.data.question,
          p.data.segment,
          p.data.geography,
          p.data.problem,
          p.data.constraints || null,
          t,
          t,
        )
        .run();
      await audit(c, "customer:" + cu.userId, "customer.brief_created", id);
      return c.json({ id, pesan: "Brief tersimpan." }, 201);
    },
  );
  // Every single-record read/write is scoped by workspace_id in SQL; a brief
  // from another workspace is indistinguishable from a missing one (404).
  const one = async (c: Context<CEnv>) => {
    const id = c.req.param("id") ?? "";
    if (!/^brf_[a-f0-9]{32}$/.test(id)) return null;
    return c.env.DB.prepare(
      "SELECT * FROM customer_briefs WHERE id=? AND workspace_id=?",
    )
      .bind(id, c.get("customer")!.workspaceId)
      .first<Record<string, unknown>>();
  };
  a.get(
    "/api/customer/briefs/:id",
    requirePermission("brief.read"),
    async (c) => {
      const b = await one(c);
      return b ? c.json(briefView(b)) : deny(c, "customer_not_found");
    },
  );
  a.patch(
    "/api/customer/briefs/:id",
    requirePermission("brief.write"),
    async (c) => {
      const b = await one(c);
      if (!b) return deny(c, "customer_not_found");
      const p = briefBody
        .partial()
        .strict()
        .safeParse(await c.req.json().catch(() => null));
      if (!p.success || !Object.keys(p.data).length)
        return deny(c, "customer_invalid_input");
      const merged = { ...b, ...p.data };
      const r = await c.env.DB.prepare(
        "UPDATE customer_briefs SET question=?,segment=?,geography=?,problem=?,constraints=?,updated_at=? WHERE id=? AND workspace_id=?",
      )
        .bind(
          merged.question,
          merged.segment,
          merged.geography,
          merged.problem,
          merged.constraints || null,
          now(),
          String(b.id),
          c.get("customer")!.workspaceId,
        )
        .run();
      if (!r.meta.changes) return deny(c, "customer_not_found");
      await audit(
        c,
        "customer:" + c.get("customer")!.userId,
        "customer.brief_updated",
        String(b.id),
      );
      return c.json({ pesan: "Brief diperbarui." });
    },
  );
  a.all("/api/customer/*", (c) => deny(c, "customer_not_found"));
}

// Founder/operator-only invite management. Registered after the founder guard,
// so it requires the operator session + same-origin X-HIO-Request: operator.
const inviteBody = z
  .object({ email: z.string().trim().toLowerCase().email().max(320) })
  .strict();
export function registerCustomerInvites(app: Hono<Env>) {
  app.get("/api/v1/customer-invites", async (c) => {
    const rows = (
      await c.env.DB.prepare(
        "SELECT email,created_at,accepted_at,revoked_at FROM customer_invites ORDER BY created_at DESC LIMIT 100",
      ).all()
    ).results;
    return c.json({ items: rows });
  });
  app.post("/api/v1/customer-invites", async (c) => {
    const p = inviteBody.safeParse(await c.req.json().catch(() => null));
    if (!p.success) return c.json({ error: "invalid_email" }, 400);
    const t = now();
    await c.env.DB.prepare(
      "INSERT INTO customer_invites(email,invited_by,created_at) VALUES (?,?,?) ON CONFLICT(email) DO UPDATE SET revoked_at=NULL",
    )
      .bind(p.data.email, c.get("actor"), t)
      .run();
    await c.env.DB.prepare("INSERT INTO audit_events VALUES (?,?,?,?,?,?,?,?)")
      .bind(
        crypto.randomUUID(),
        c.get("actor"),
        "customer.invited",
        "invite",
        c.get("requestId"),
        "ok",
        t,
        "{}",
      )
      .run();
    return c.json({ email: p.data.email, pesan: "Undangan dibuat." }, 201);
  });
  app.delete("/api/v1/customer-invites/:email", async (c) => {
    const p = inviteBody.safeParse({
      email: decodeURIComponent(c.req.param("email")),
    });
    if (!p.success) return c.json({ error: "invalid_email" }, 400);
    const r = await c.env.DB.prepare(
      "UPDATE customer_invites SET revoked_at=? WHERE email=? AND revoked_at IS NULL",
    )
      .bind(now(), p.data.email)
      .run();
    return r.meta.changes
      ? c.json({ pesan: "Undangan dicabut." })
      : c.json({ error: "not_found" }, 404);
  });
}
