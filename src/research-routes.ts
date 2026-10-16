// Founder-facing live research routes. Mounted under the authenticated /api/* guard.
import type { Context, Hono } from "hono";
import type { Env } from "./auth";
import { founderNotice } from "./founder";
import {
  DAILY_CAP,
  GROQ_MODEL,
  buildQuery,
  callsEnabled,
  guardDossier,
  hash,
  interpret,
  keyFor,
  reserve,
  researchInput,
  searchProvider,
  usageToday,
  type Dossier,
  type Observation,
  type Provider,
} from "./research";

const now = () => new Date().toISOString();
type Row = Record<string, unknown>;

const providerLabel: Record<string, string> = {
  tavily: "Pencarian web umum",
  firecrawl: "Pencarian web dengan ringkasan halaman",
  apify: "Hasil pencarian Google",
};
const stateLabel: Record<string, string> = {
  queued: "Menunggu dijalankan",
  acquiring: "Sedang mengumpulkan informasi",
  acquired: "Informasi terkumpul",
  synthesizing: "Sedang menganalisis",
  complete: "Selesai — menunggu keputusanmu",
  empty: "Tidak ada informasi yang relevan ditemukan",
  blocked: "Belum bisa dijalankan",
  failed: "Pengumpulan informasi belum berhasil",
  cancelled: "Dibatalkan",
};
const strengthLabel: Record<string, string> = {
  "belum-cukup": "Belum cukup bukti",
  lemah: "Lemah",
  sedang: "Sedang",
};
const adviceLabel: Record<string, string> = {
  "teliti-lagi": "Teliti lebih lanjut dulu",
  "uji-kecil": "Layak diuji kecil-kecilan",
  hentikan: "Hentikan dugaan ini",
};
const choiceLabel: Record<string, string> = {
  setujui: "Disetujui untuk lanjut",
  tolak: "Ditolak",
  ubah: "Perlu diubah dulu",
  nanti: "Putuskan nanti",
};

function fail(
  c: Context<Env>,
  code: string,
  status: 400 | 403 | 404 | 409 | 503,
) {
  return c.json({ error: { code, founder: founderNotice(code) } }, status);
}
function audit(
  c: Context<Env>,
  action: string,
  entity: string,
  outcome = "ok",
) {
  return c.env.DB.prepare(
    "INSERT INTO audit_events VALUES (?,?,?,?,?,?,?,?)",
  ).bind(
    crypto.randomUUID(),
    c.get("actor"),
    action,
    entity,
    c.get("requestId"),
    outcome,
    now(),
    "{}",
  );
}

export function sourceStatus(env: Env["Bindings"]) {
  return (["tavily", "firecrawl", "apify"] as const).map((p) => ({
    id: p,
    nama: providerLabel[p]!,
    tersambung: !!keyFor(env, p),
  }));
}
export function researchReady(env: Env["Bindings"]) {
  return (
    callsEnabled(env) &&
    !!keyFor(env, "groq") &&
    sourceStatus(env).some((s) => s.tersambung)
  );
}

async function setState(
  c: Context<Env>,
  id: string,
  state: string,
  extra: { error?: string | null; dossier?: unknown; score?: unknown } = {},
) {
  await c.env.DB.prepare(
    "UPDATE research_jobs SET state=?, error_code=?, dossier_json=COALESCE(?,dossier_json), score_json=COALESCE(?,score_json), updated_at=? WHERE id=?",
  )
    .bind(
      state,
      extra.error ?? null,
      extra.dossier === undefined ? null : JSON.stringify(extra.dossier),
      extra.score === undefined ? null : JSON.stringify(extra.score),
      now(),
      id,
    )
    .run();
}
async function receipt(
  c: Context<Env>,
  jobId: string,
  provider: string,
  operation: string,
) {
  const id = crypto.randomUUID();
  await c.env.DB.prepare(
    "INSERT INTO research_receipts(id,job_id,provider,operation,status,request_units,created_at) VALUES (?,?,?,?,'reserved',1,?)",
  )
    .bind(id, jobId, provider, operation, now())
    .run();
  return async (
    status: "succeeded" | "failed" | "uncertain",
    error: string | null = null,
    usage: unknown = null,
  ) =>
    c.env.DB.prepare(
      "UPDATE research_receipts SET status=?, error_code=?, measured_usage_json=?, completed_at=? WHERE id=?",
    )
      .bind(status, error, usage ? JSON.stringify(usage) : null, now(), id)
      .run();
}

async function observationsFor(c: Context<Env>, jobId: string) {
  return (
    await c.env.DB.prepare(
      "SELECT o.id,o.source_url,o.title,o.excerpt,p.provider,p.retrieved_at,p.published_at FROM research_provenance p JOIN research_observations o ON o.id=p.observation_id WHERE p.job_id=? ORDER BY p.rowid",
    )
      .bind(jobId)
      .all<Row>()
  ).results;
}

export async function jobView(c: Context<Env>, job: Row) {
  const input = JSON.parse(String(job.input_json)) as Record<string, string>;
  const obs = await observationsFor(c, String(job.id));
  const dossier = job.dossier_json
    ? (JSON.parse(String(job.dossier_json)) as Dossier & {
        catatanPengaman?: string[];
        sumberBerbeda?: number;
        pendukungIndependen?: number;
      })
    : null;
  const support = new Set(dossier?.buktiMendukung ?? []);
  const counter = new Set(dossier?.buktiBerlawanan ?? []);
  const interested = new Set(dossier?.sumberBerkepentingan ?? []);
  const decisions = (
    await c.env.DB.prepare(
      "SELECT id,choice,rationale,owner,created_at FROM research_decisions WHERE job_id=? ORDER BY created_at DESC, rowid DESC",
    )
      .bind(String(job.id))
      .all<Row>()
  ).results;
  const state = String(job.state);
  return {
    id: String(job.id),
    pertanyaan: input.question,
    segmen: input.segment,
    wilayah: input.geography,
    dugaanMasalah: input.problem,
    sumber: providerLabel[String(job.source_provider)] ?? "Sumber web",
    status:
      state === "complete" && decisions.length
        ? `Diputuskan: ${choiceLabel[String(decisions[0]!.choice)] ?? "Keputusan"}`
        : (stateLabel[state] ?? "Tidak diketahui"),
    selesai: state === "complete",
    gagal: ["failed", "blocked", "empty"].includes(state),
    masalah: job.error_code ? founderNotice(String(job.error_code)) : null,
    dibuat: String(job.created_at),
    bukti: obs.map((o, i) => ({
      nomor: i + 1,
      judul: String(o.title),
      kutipan: String(o.excerpt),
      tautanSumber: String(o.source_url),
      situs: new URL(String(o.source_url)).hostname.replace(/^www\./, ""),
      tanggalSumber: o.published_at ? String(o.published_at) : null,
      tanggalDikumpulkan: String(o.retrieved_at),
      hubungan: support.has(i + 1)
        ? "Mendukung dugaan"
        : counter.has(i + 1)
          ? "Berlawanan atau tidak relevan"
          : "Belum dinilai",
      mendukung: support.has(i + 1),
      berkepentingan: interested.has(i + 1),
      berlawanan: counter.has(i + 1),
      jenis: "Temuan pasar nyata (cuplikan hasil pencarian publik)",
      batasan: interested.has(i + 1)
        ? "Ditulis oleh pihak yang menjual solusi untuk masalah ini; ini klaim penulis, bukan keluhan pelanggan yang teramati."
        : "Cuplikan dari hasil pencarian; belum dibaca utuh dan belum tentu mewakili pasar.",
    })),
    analisis: dossier
      ? {
          label: "Interpretasi AI — bukan fakta terverifikasi",
          ringkasan: dossier.ringkasan,
          pola: dossier.pola,
          kekuatanBukti:
            strengthLabel[dossier.kekuatanBukti] ?? "Belum cukup bukti",
          alasanKekuatan: dossier.alasanKekuatan,
          saran: adviceLabel[dossier.saran] ?? "Teliti lebih lanjut dulu",
          saranKode: dossier.saran,
          alasanSaran: dossier.alasanSaran,
          penjelasanLain: dossier.penjelasanLain,
          belumDiketahui: dossier.belumDiketahui,
          langkahBerikutnya: dossier.langkahValidasiBerikutnya,
          catatanPengaman: dossier.catatanPengaman ?? [],
          jumlahMendukung: support.size,
          jumlahBerlawanan: counter.size,
          sumberBerbeda: dossier.sumberBerbeda ?? 0,
          pendukungIndependen: dossier.pendukungIndependen ?? support.size,
          batasanSampel: `Berdasarkan ${obs.length} cuplikan hasil pencarian dari satu kali pencarian. Ini bukan survei dan bukan bukti tren pasar.`,
        }
      : null,
    menungguKeputusan: state === "complete" && decisions.length === 0,
    riwayatKeputusan: decisions.map((d) => ({
      keputusan: choiceLabel[String(d.choice)] ?? "Keputusan",
      alasan: String(d.rationale),
      oleh: String(d.owner),
      tanggal: String(d.created_at),
    })),
    jikaDisetujui:
      "Keputusanmu dicatat sebagai izin untuk merancang uji kecil berikutnya. Tidak ada yang diterbitkan, tidak ada orang yang dihubungi, dan tidak ada uang yang dikeluarkan secara otomatis.",
  };
}

export function registerResearch(app: Hono<Env>) {
  app.get("/api/founder/research/sources", async (c) => {
    const used = await usageToday(c);
    return c.json({
      aktif: callsEnabled(c.env),
      analisisTersedia: !!keyFor(c.env, "groq"),
      sumber: sourceStatus(c.env).map((s) => ({
        ...s,
        sisaHariIni: Math.max(0, DAILY_CAP[s.id] - (used[s.id] ?? 0)),
        batasHarian: DAILY_CAP[s.id],
      })),
      sisaAnalisisHariIni: Math.max(0, DAILY_CAP.groq - (used.groq ?? 0)),
      catatanBiaya:
        "Setiap riset memakai satu pencarian dan satu analisis AI dari kuota akun layanan yang tersambung. Hasil Google lewat Apify memakan biaya kecil dari kredit akun (sekitar Rp75 per riset; plafon pengaman maksimal sekitar Rp8.000 yang diwajibkan layanan).",
    });
  });

  app.get("/api/founder/research", async (c) => {
    const jobs = (
      await c.env.DB.prepare(
        "SELECT * FROM research_jobs WHERE input_json NOT LIKE '%SYNTHETIC%' ORDER BY created_at DESC LIMIT 30",
      ).all<Row>()
    ).results;
    return c.json({
      riset: await Promise.all(jobs.map((j) => jobView(c, j))),
    });
  });

  app.get("/api/founder/research/:id", async (c) => {
    const id = c.req.param("id");
    if (!/^[a-zA-Z0-9-]{1,80}$/.test(id)) return fail(c, "not_found", 404);
    const job = await c.env.DB.prepare("SELECT * FROM research_jobs WHERE id=?")
      .bind(id)
      .first<Row>();
    if (!job) return fail(c, "not_found", 404);
    return c.json(await jobView(c, job));
  });

  app.post("/api/founder/research", async (c) => {
    let input;
    try {
      input = researchInput.parse(await c.req.json());
    } catch {
      return fail(c, "invalid_input", 400);
    }
    const provider = input.provider as Provider;
    if (!callsEnabled(c.env)) return fail(c, "research_paused", 503);
    const sourceKey = keyFor(c.env, provider);
    const modelKey = keyFor(c.env, "groq");
    if (!sourceKey || !modelKey) return fail(c, "provider_missing", 503);

    const id = crypto.randomUUID();
    const t = now();
    const query = buildQuery(input);
    await c.env.DB.batch([
      c.env.DB.prepare(
        "INSERT INTO research_jobs(id,owner,idempotency_key,input_hash,input_json,source_provider,state,created_at,updated_at,expires_at,approved_at) VALUES (?,?,?,?,?,?,'acquiring',?,?,?,?)",
      ).bind(
        id,
        c.get("actor"),
        crypto.randomUUID(),
        await hash(JSON.stringify(input)),
        JSON.stringify({ ...input, query }),
        provider,
        t,
        t,
        new Date(Date.now() + 90 * 86400000).toISOString(),
        t,
      ),
      audit(c, "research.approved", id),
    ]);

    // 1) one source request
    if (!(await reserve(c, provider, DAILY_CAP[provider]))) {
      await setState(c, id, "blocked", { error: "provider_daily_cap" });
      return c.json(await viewById(c, id), 201);
    }
    const done = await receipt(c, id, provider, "search");
    const res = await searchProvider(
      provider,
      sourceKey,
      query,
      input.maxResults,
    );
    if (!res.ok) {
      await done(res.uncertain ? "uncertain" : "failed", res.code);
      await setState(c, id, "failed", { error: res.code });
      await audit(c, "research.source_failed", id, res.code).run();
      return c.json(await viewById(c, id), 201);
    }
    await done("succeeded", null, { results: res.items.length });
    if (!res.items.length) {
      await setState(c, id, "empty", { error: "no_results" });
      return c.json(await viewById(c, id), 201);
    }
    await storeObservations(c, id, provider, res.items);
    await setState(c, id, "synthesizing");

    // 2) one AI interpretation
    if (!(await reserve(c, "groq", DAILY_CAP.groq))) {
      await setState(c, id, "blocked", { error: "provider_daily_cap" });
      return c.json(await viewById(c, id), 201);
    }
    const mdone = await receipt(c, id, "groq", GROQ_MODEL);
    const ai = await interpret(modelKey, input, res.items);
    if (!ai.ok) {
      const code = ai.code === "provider_quota" ? "model_busy" : ai.code;
      await mdone(ai.uncertain ? "uncertain" : "failed", code);
      await setState(c, id, "failed", { error: code });
      return c.json(await viewById(c, id), 201);
    }
    await mdone("succeeded", null, ai.usage);
    const guarded = guardDossier(ai.dossier, res.items);
    await setState(c, id, "complete", {
      dossier: guarded,
      score: {
        kekuatan: guarded.kekuatanBukti,
        mendukung: guarded.buktiMendukung.length,
        berlawanan: guarded.buktiBerlawanan.length,
        sumberBerbeda: guarded.sumberBerbeda,
        model: GROQ_MODEL,
      },
    });
    await audit(c, "research.complete", id).run();
    return c.json(await viewById(c, id), 201);
  });

  app.post("/api/founder/research/:id/decision", async (c) => {
    const id = c.req.param("id");
    if (!/^[a-zA-Z0-9-]{1,80}$/.test(id)) return fail(c, "not_found", 404);
    let b: { pilihan: string; alasan: string };
    try {
      b = (await c.req.json()) as typeof b;
      if (
        !["setujui", "tolak", "ubah", "nanti"].includes(b.pilihan) ||
        typeof b.alasan !== "string" ||
        !b.alasan.trim() ||
        b.alasan.length > 2000
      )
        throw new Error();
    } catch {
      return fail(c, "invalid_input", 400);
    }
    const job = await c.env.DB.prepare(
      "SELECT state FROM research_jobs WHERE id=?",
    )
      .bind(id)
      .first<{ state: string }>();
    if (!job) return fail(c, "not_found", 404);
    if (job.state !== "complete") return fail(c, "research_not_ready", 409);
    const did = crypto.randomUUID();
    await c.env.DB.batch([
      c.env.DB.prepare(
        "INSERT INTO research_decisions VALUES (?,?,?,?,?,?)",
      ).bind(did, id, b.pilihan, b.alasan.trim(), c.get("actor"), now()),
      audit(c, "research.decision." + b.pilihan, id),
    ]);
    const msg: Record<string, string> = {
      setujui:
        "Persetujuan dicatat. Langkah berikutnya: rancang uji kecil berdasarkan saran validasi. Tidak ada tindakan ke luar yang dijalankan.",
      tolak: "Penolakan dicatat. Tidak ada tindakan lanjutan.",
      ubah: "Dicatat: dugaan ini perlu diubah atau diteliti ulang.",
      nanti: "Dicatat: keputusan ditunda.",
    };
    return c.json({ id: did, pesan: msg[b.pilihan] }, 201);
  });
}

async function viewById(c: Context<Env>, id: string) {
  const job = await c.env.DB.prepare("SELECT * FROM research_jobs WHERE id=?")
    .bind(id)
    .first<Row>();
  return jobView(c, job!);
}

async function storeObservations(
  c: Context<Env>,
  jobId: string,
  provider: string,
  items: Observation[],
) {
  const t = now();
  const stmts: D1PreparedStatement[] = [];
  for (const o of items) {
    const h = await hash(o.url + "\n" + o.excerpt);
    stmts.push(
      c.env.DB.prepare(
        "INSERT OR IGNORE INTO research_observations VALUES (?,?,?,?,?,?,'public-secondary-observation')",
      ).bind(
        "obs-" + h.slice(0, 32),
        c.get("actor"),
        h,
        o.url,
        o.title,
        o.excerpt,
      ),
      c.env.DB.prepare(
        "INSERT OR IGNORE INTO research_provenance SELECT ?,?,id,?,?,?,?,?,'search-snippet',? FROM research_observations WHERE owner=? AND content_hash=?",
      ).bind(
        crypto.randomUUID(),
        jobId,
        provider,
        o.url,
        t,
        o.publishedAt,
        o.publishedAt ? "provider-reported" : "unknown",
        provider + "-search",
        c.get("actor"),
        h,
      ),
    );
  }
  await c.env.DB.batch(stmts);
}
