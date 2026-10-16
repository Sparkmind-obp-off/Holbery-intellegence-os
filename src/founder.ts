// Founder experience layer.
// Translates internal records into plain Bahasa Indonesia response objects.
// The founder UI consumes ONLY these objects; it never sees internal codes,
// table names, raw errors or infrastructure details.
import type { Context, Hono } from "hono";
import { z } from "zod";
import { configured, type Env } from "./auth";
import { score } from "./contracts";
import { researchReady, sourceStatus } from "./research-routes";

export const APP_VERSION = "0.4.0";

export type FounderNotice = {
  judul: string;
  dampak: string;
  langkah: string;
  perluKamu: boolean;
};

const notices: Record<string, FounderNotice> = {
  unauthorized: {
    judul: "Kamu belum masuk atau sesimu sudah berakhir",
    dampak: "Data bisnismu tetap terlindungi dan tidak ada yang berubah.",
    langkah: "Masuk lagi dengan kata sandi aksesmu.",
    perluKamu: true,
  },
  wrong_password: {
    judul: "Kata sandi tidak cocok",
    dampak: "Kamu belum bisa membuka ruang kerja.",
    langkah:
      "Periksa kata sandi di pengelola kata sandimu lalu coba lagi. Jika hilang, lihat petunjuk pemulihan di bawah.",
    perluKamu: true,
  },
  not_configured: {
    judul: "Perlindungan akses belum siap",
    dampak: "Ruang kerja sengaja dikunci agar data tidak terbuka.",
    langkah:
      "Asisten AI perlu menyelesaikan pengaturan akses. Tidak ada yang perlu kamu siapkan sendiri.",
    perluKamu: false,
  },
  origin_denied: {
    judul: "Permintaan ditolak demi keamanan",
    dampak: "Tidak ada perubahan yang tersimpan.",
    langkah: "Muat ulang halaman, lalu coba lagi.",
    perluKamu: true,
  },
  rate_limited: {
    judul: "Terlalu banyak percobaan dalam waktu singkat",
    dampak: "Tidak ada perubahan yang tersimpan.",
    langkah: "Tunggu sekitar satu menit, lalu coba lagi.",
    perluKamu: true,
  },
  invalid_input: {
    judul: "Isian belum lengkap atau terlalu panjang",
    dampak: "Belum ada yang tersimpan.",
    langkah: "Periksa kembali setiap isian, lalu simpan lagi.",
    perluKamu: true,
  },
  not_found: {
    judul: "Data yang kamu cari tidak ditemukan",
    dampak: "Mungkin sudah kedaluwarsa atau belum pernah dibuat.",
    langkah: "Kembali ke Beranda untuk melihat data terbaru.",
    perluKamu: false,
  },
  evidence_gate: {
    judul: "Bukti belum cukup untuk disetujui",
    dampak: "Uji coba belum bisa dimulai.",
    langkah:
      "Pastikan ada bukti yang mendukung dan yang berlawanan terlebih dahulu. Kamu tetap bisa memilih untuk meneliti lebih lanjut atau menunda.",
    perluKamu: false,
  },
  approval_required: {
    judul: "Uji coba memerlukan persetujuanmu yang masih berlaku",
    dampak: "Uji coba belum dibuat.",
    langkah:
      "Buka Peluang, setujui uji coba terlebih dahulu, lalu kembali ke sini.",
    perluKamu: true,
  },
  already_completed: {
    judul: "Hasil uji coba ini sudah dicatat",
    dampak:
      "Hasil yang sudah dicatat tidak bisa diubah agar riwayat tetap jujur.",
    langkah: "Jika perlu, buat uji coba lanjutan.",
    perluKamu: false,
  },
  source_inactive: {
    judul: "Sumber informasi belum aktif",
    dampak: "Informasi baru belum bisa dikumpulkan.",
    langkah:
      "Asisten AI perlu mengaktifkan sumbernya. Tidak ada yang perlu kamu lakukan sekarang.",
    perluKamu: false,
  },
  owner_required: {
    judul: "Kamu belum memiliki akses ke bagian ini",
    dampak: "Bagian ini khusus untuk pemilik.",
    langkah: "Masuk dengan akses pemilik.",
    perluKamu: true,
  },
  duplicate: {
    judul: "Permintaan yang sama terdeteksi dua kali",
    dampak: "Tidak ada yang tersimpan ganda.",
    langkah: "Muat ulang halaman untuk melihat hasil terbaru.",
    perluKamu: false,
  },
  too_large: {
    judul: "Isian terlalu panjang",
    dampak: "Belum ada yang tersimpan.",
    langkah: "Persingkat tulisanmu, lalu simpan lagi.",
    perluKamu: true,
  },
  internal_error: {
    judul: "Ada gangguan di sistem",
    dampak: "Perubahan terakhirmu mungkin belum tersimpan.",
    langkah:
      "Coba lagi beberapa saat lagi. Jika terus terjadi, asisten AI akan memeriksanya; kamu tidak perlu memperbaiki apa pun.",
    perluKamu: false,
  },
};
Object.assign(notices, {
  provider_missing: {
    judul: "Sumber informasi belum tersambung",
    dampak: "Riset pasar nyata belum bisa dijalankan.",
    langkah:
      "Asisten AI perlu menyambungkan sumbernya. Tidak ada yang perlu kamu siapkan sendiri.",
    perluKamu: false,
  },
  research_paused: {
    judul: "Riset otomatis sedang dihentikan sementara",
    dampak:
      "Tidak ada pencarian baru yang dijalankan, jadi tidak ada kuota terpakai.",
    langkah: "Minta asisten AI menyalakannya kembali bila sudah siap.",
    perluKamu: false,
  },
  provider_daily_cap: {
    judul: "Batas riset harian tercapai",
    dampak:
      "Riset ini disimpan tetapi belum dijalankan, agar kuota layanan tidak habis.",
    langkah: "Coba lagi besok, atau pilih sumber informasi lain.",
    perluKamu: true,
  },
  provider_quota: {
    judul: "Batas penggunaan sumber informasi tercapai",
    dampak: "Pencarian belum bisa dilakukan dengan sumber ini.",
    langkah:
      "Pilih sumber informasi lain. Jika terus terjadi, asisten AI akan memeriksa kuota akun layanannya.",
    perluKamu: true,
  },
  provider_auth: {
    judul: "Sumber informasi menolak sambungan",
    dampak: "Pencarian dengan sumber ini tidak bisa dilakukan.",
    langkah:
      "Asisten AI perlu memperbarui sambungan ke sumber ini. Kamu tidak perlu menyiapkan apa pun.",
    perluKamu: false,
  },
  provider_unavailable: {
    judul: "Sumber informasi sedang tidak bisa dihubungi",
    dampak: "Pengumpulan informasi belum berhasil.",
    langkah: "Coba lagi beberapa menit lagi, atau pilih sumber lain.",
    perluKamu: true,
  },
  provider_timeout: {
    judul: "Sumber informasi terlalu lama merespons",
    dampak: "Hasil belum diterima. Kemungkinan kuota tetap terpakai satu kali.",
    langkah: "Tunggu sebentar lalu coba lagi, atau pilih sumber lain.",
    perluKamu: true,
  },
  no_results: {
    judul: "Tidak ada informasi yang relevan ditemukan",
    dampak: "Belum ada bukti untuk pertanyaan ini. Ini juga sebuah temuan.",
    langkah:
      "Coba ubah kata-kata pertanyaan, siapa yang mengalami masalah, atau wilayahnya.",
    perluKamu: true,
  },
  model_invalid_output: {
    judul: "Analisis AI belum bisa dipercaya",
    dampak:
      "Informasi sudah terkumpul dan tersimpan, tetapi kesimpulannya tidak ditampilkan karena tidak memenuhi pemeriksaan.",
    langkah:
      "Jalankan riset lagi. Bukti yang sudah terkumpul tetap bisa kamu baca.",
    perluKamu: true,
  },
  model_busy: {
    judul: "Analisis AI sedang sibuk",
    dampak:
      "Informasi sudah terkumpul dan tersimpan, tetapi analisisnya belum dibuat.",
    langkah: "Tunggu sekitar satu menit, lalu jalankan riset lagi.",
    perluKamu: true,
  },
  research_not_ready: {
    judul: "Riset ini belum selesai",
    dampak: "Keputusan baru bisa dicatat setelah analisis selesai.",
    langkah: "Tunggu riset selesai atau jalankan riset baru.",
    perluKamu: false,
  },
} satisfies Record<string, FounderNotice>);
const aliases: Record<string, string> = {
  provider_calls_disabled: "research_paused",
  invalid_json: "invalid_input",
  plugin_disabled: "source_inactive",
  permission_denied: "source_inactive",
  source_disabled: "source_inactive",
  plugin_integrity: "source_inactive",
  unreviewed_plugin: "source_inactive",
  already_installed: "duplicate",
  idempotency_conflict: "duplicate",
  body_too_large: "too_large",
};
export function founderNotice(code: string, path = ""): FounderNotice {
  if (code === "unauthorized" && path === "/api/session")
    return notices.wrong_password!;
  return notices[aliases[code] ?? code] ?? notices.internal_error!;
}

const unknownLabels: Record<string, string> = {
  "real source independence":
    "Apakah keluhan datang dari banyak orang yang berbeda",
  payer: "Siapa yang benar-benar mau membayar",
  severity: "Seberapa parah masalahnya bagi mereka",
  pricing: "Harga yang masuk akal",
  economics: "Apakah bisnisnya bisa untung",
  distribution: "Cara menjangkau calon pelanggan",
};
const choiceLabels: Record<string, string> = {
  approve_fixture: "Disetujui: uji coba latihan tanpa biaya",
  reject: "Ditolak",
  research: "Teliti lebih lanjut",
  hold: "Putuskan nanti",
};

const now = () => new Date().toISOString();
// Friendly display name; internal role-style names are shown as "Founder".
const displayName = (name?: string) =>
  !name || /operator|owner|admin|reviewer/i.test(name) ? "Founder" : name;
const inDays = (d: number) => new Date(Date.now() + d * 86400000).toISOString();

type Row = Record<string, unknown>;
async function rows(c: Context<Env>, sql: string, ...p: (string | number)[]) {
  return (
    await c.env.DB.prepare(sql)
      .bind(...p)
      .all<Row>()
  ).results;
}
async function one(c: Context<Env>, sql: string, ...p: (string | number)[]) {
  return c.env.DB.prepare(sql)
    .bind(...p)
    .first<Row>();
}
function problem(c: Context<Env>, code: string, status: 400 | 403 | 404 | 409) {
  return c.json({ error: { code, founder: founderNotice(code) } }, status);
}

function strengthLabel(support: number, counter: number, sample: boolean) {
  if (support + counter === 0)
    return {
      label: "Belum ada bukti",
      penjelasan: "Belum ada informasi yang terkumpul untuk peluang ini.",
    };
  if (sample)
    return {
      label: "Hanya contoh data",
      penjelasan:
        "Semua bukti di sini adalah contoh data untuk mencoba alur kerja, bukan temuan pasar nyata. Kekuatan bukti pasar: belum ada.",
    };
  if (support + counter < 5)
    return {
      label: "Lemah",
      penjelasan: "Jumlah bukti masih sangat sedikit untuk menarik kesimpulan.",
    };
  return {
    label: "Sedang",
    penjelasan: "Ada beberapa bukti, tetapi masih perlu pengujian.",
  };
}

// Sample observations are written by HIO itself, so they are presented in Indonesian.
const sampleQuotes: Record<string, string> = {
  "fixture-1":
    "Tim riset kecil kami sering kehilangan tautan sumber saat bertukar pekerjaan secara manual.",
  "fixture-2":
    "Rapat tinjauan riset mingguan butuh waktu ekstra untuk melacak kembali asal-usul informasi.",
  "fixture-3":
    "Spreadsheet bersama sudah cukup bagi kami; kami tidak akan membayar alat lain.",
};
function evidenceView(e: Row) {
  const sample = Number(e.synthetic) === 1;
  return {
    id: String(e.id),
    kutipan:
      (sample && sampleQuotes[String(e.external_id)]) ||
      String(e.observation).replace(/^SYNTHETIC:\s*/, ""),
    jenis: sample ? "Contoh data, bukan temuan pasar nyata" : "Temuan pasar",
    contoh: sample,
    hubungan:
      e.relationship === "counter"
        ? "Berlawanan dengan dugaan"
        : "Mendukung dugaan",
    mendukung: e.relationship !== "counter",
    sumber: sample ? "Contoh data internal HIO" : String(e.provider),
    tautanSumber: sample ? null : String(e.reference),
    tanggalSumber: null,
    tanggalDikumpulkan: String(e.captured_at),
    batasan: sample
      ? "Ditulis untuk latihan. Tidak mewakili pelanggan atau pasar mana pun."
      : "Satu pengamatan tunggal; belum tentu mewakili pasar.",
  };
}

async function opportunityView(c: Context<Env>) {
  const o = await one(
    c,
    "SELECT * FROM opportunities WHERE id=?",
    "research-workbench",
  );
  if (!o) return null;
  const evidence = await rows(
    c,
    "SELECT e.* FROM memberships m JOIN evidence e ON m.evidence_id=e.id WHERE m.cluster_id=? AND e.expires_at>? AND e.purged_at IS NULL ORDER BY e.id LIMIT 100",
    String(o.cluster_id),
    now(),
  );
  const support = evidence.filter((e) => e.relationship === "support").length;
  const counter = evidence.filter((e) => e.relationship === "counter").length;
  const sample =
    evidence.length === 0 || evidence.every((e) => Number(e.synthetic) === 1);
  const s = score(support, counter);
  const decisions = await rows(
    c,
    "SELECT id,choice,rationale,reviewer_notes,owner,review_at,created_at FROM decisions WHERE opportunity_id=? ORDER BY created_at DESC, rowid DESC LIMIT 50",
    String(o.id),
  );
  const latest = decisions[0];
  const approvalActive =
    !!latest &&
    latest.choice === "approve_fixture" &&
    String(latest.review_at) > now();
  const experiments = await rows(
    c,
    "SELECT id,status FROM experiments WHERE decision_id=?",
    latest ? String(latest.id) : "",
  );
  let status: string;
  if (!evidence.length) status = "Belum ada bukti";
  else if (!latest) status = "Menunggu persetujuanmu";
  else if (approvalActive && !experiments.length)
    status = "Disetujui, uji coba belum dibuat";
  else status = choiceLabels[String(latest.choice)] ?? "Sudah diputuskan";
  return {
    id: String(o.id),
    judul: "Alat kerja riset yang menjaga asal-usul informasi",
    contoh: true,
    labelContoh:
      "Peluang contoh untuk mencoba alur kerja. Dibangun dari contoh data, bukan dari pasar nyata.",
    dugaan:
      "Tim riset kecil mungkin kehilangan tautan sumber saat bertukar pekerjaan secara manual, dan mungkin menghargai alat yang menjaga jejaknya.",
    siapa: "Tim riset kecil (dugaan, belum terverifikasi)",
    caraSekarang:
      "Spreadsheet bersama dan serah terima manual (dari contoh data)",
    pembayar: "Belum diketahui",
    alasanPerhatian:
      "Ini satu-satunya peluang yang sudah punya bukti pendukung dan bukti berlawanan, sehingga cocok untuk mencoba alur keputusan dari awal sampai akhir.",
    ketidakpastian:
      "Belum ada bukti nyata dari pasar. Pembayar, harga, keuntungan, dan cara menjangkau pelanggan belum diketahui.",
    kekuatanBukti: strengthLabel(support, counter, sample),
    jumlahMendukung: support,
    jumlahBerlawanan: counter,
    rasioContoh:
      s.score === null
        ? null
        : `${support} dari ${support + counter} bukti mendukung dugaan (contoh data saja)`,
    yangBelumDiketahui: s.unknowns.map((u) => unknownLabels[u] ?? u),
    bukti: evidence.map(evidenceView),
    status,
    menungguKeputusan: evidence.length > 0 && !latest,
    bolehBuatUjiCoba: approvalActive && !experiments.length,
    bisaDisetujui: support > 0 && counter > 0,
    persetujuanAktif: approvalActive
      ? { id: String(latest!.id), berlakuSampai: String(latest!.review_at) }
      : null,
    jikaDisetujui:
      "Kamu bisa membuat satu uji coba latihan dengan biaya Rp0. Tidak ada yang diterbitkan, tidak ada orang yang dihubungi, dan tidak ada uang yang dikeluarkan.",
    riwayatKeputusan: decisions.map((d) => ({
      id: String(d.id),
      keputusan: choiceLabels[String(d.choice)] ?? "Keputusan",
      alasan: String(d.rationale),
      catatan: String(d.reviewer_notes),
      oleh: String(d.owner),
      tanggal: String(d.created_at),
      tinjauUlang: String(d.review_at),
    })),
  };
}

async function liveSummary(c: Context<Env>) {
  const ready = researchReady(c.env);
  const jobs = (
    await c.env.DB.prepare(
      "SELECT j.id,j.input_json,j.state,j.created_at,(SELECT COUNT(*) FROM research_decisions d WHERE d.job_id=j.id) dec FROM research_jobs j WHERE j.input_json NOT LIKE '%SYNTHETIC%' ORDER BY j.created_at DESC LIMIT 20",
    ).all<Row>()
  ).results;
  const real = await c.env.DB.prepare(
    "SELECT COUNT(DISTINCT p.observation_id) n FROM research_provenance p JOIN research_jobs j ON j.id=p.job_id WHERE j.input_json NOT LIKE '%SYNTHETIC%'",
  ).first<{ n: number }>();
  const q = (j: Row) =>
    String((JSON.parse(String(j.input_json)) as { question: string }).question);
  const latest = jobs[0];
  return {
    ready,
    realCount: Number(real?.n ?? 0),
    waiting: jobs
      .filter((j) => j.state === "complete" && Number(j.dec) === 0)
      .map((j) => q(j).slice(0, 140)),
    latest: latest
      ? {
          id: String(latest.id),
          pertanyaan: q(latest),
          tanggal: String(latest.created_at),
        }
      : null,
  };
}

async function sampleState(c: Context<Env>) {
  const plugin = await one(
    c,
    "SELECT enabled FROM plugins WHERE id='hio.fixture'",
  );
  const source = await one(
    c,
    "SELECT enabled,last_run_at FROM sources WHERE id='fixture'",
  );
  return {
    aktif:
      !!plugin &&
      Number(plugin.enabled) === 1 &&
      !!source &&
      Number(source.enabled) === 1,
    terakhirDimuat: source?.last_run_at ? String(source.last_run_at) : null,
  };
}

async function researchStage(c: Context<Env>) {
  const ready = researchReady(c.env);
  const r = (await c.env.DB.prepare(
    "SELECT (SELECT COUNT(*) FROM research_jobs WHERE state='complete' AND input_json NOT LIKE '%SYNTHETIC%') selesai, (SELECT COUNT(*) FROM research_decisions) keputusan, (SELECT COUNT(*) FROM research_provenance) bukti",
  ).first<Record<string, number>>())!;
  const connected = sourceStatus(c.env).filter((s) => s.tersambung).length;
  return {
    tahap: "Riset pasar nyata",
    memungkinkan:
      "HIO mencari di web, menyusun bukti bersumber, lalu meminta keputusanmu.",
    status: !ready
      ? "Belum dimulai"
      : Number(r.keputusan) > 0
        ? "Terbukti digunakan"
        : Number(r.selesai) > 0
          ? "Menunggu persetujuan"
          : "Lulus pemeriksaan",
    terverifikasi: ready
      ? `${connected} sumber informasi tersambung dan analisis AI aktif. ${r.selesai} riset selesai, ${r.bukti} bukti nyata tersimpan, ${r.keputusan} keputusan dicatat.`
      : "Sumber informasi nyata belum tersambung.",
    belumSelesai: ready
      ? "Bukti masih berupa cuplikan hasil pencarian; belum membaca halaman utuh atau berbicara dengan calon pelanggan."
      : "Seluruh pengumpulan informasi nyata.",
    perluKamu: ready && Number(r.keputusan) === 0,
    langkah: ready
      ? Number(r.selesai) > 0
        ? "Tinjau hasil riset dan beri keputusan."
        : "Jalankan riset pertama di Intelijen Pasar."
      : "Asisten AI menyambungkan sumber informasi.",
  };
}

async function progressBoard(c: Context<Env>) {
  const counts = (await one(
    c,
    "SELECT (SELECT COUNT(*) FROM evidence WHERE expires_at>? AND purged_at IS NULL) bukti, (SELECT COUNT(*) FROM evidence WHERE synthetic=0) buktiNyata, (SELECT COUNT(*) FROM decisions) keputusan, (SELECT COUNT(*) FROM experiments) ujiCoba, (SELECT COUNT(*) FROM experiments WHERE status='completed') ujiSelesai, (SELECT COUNT(*) FROM research_briefs) pertanyaan",
    now(),
  )) as Record<string, number>;
  const access = configured(c);
  return [
    {
      tahap: "Perlindungan akses",
      memungkinkan: "Hanya kamu yang bisa membuka data bisnis HIO.",
      status: access ? "Lulus pemeriksaan" : "Perlu diperbaiki",
      terverifikasi: access
        ? "Ruang kerja meminta kata sandi; tanpa masuk, data tidak bisa dibuka."
        : "Pengaturan akses belum lengkap, sehingga ruang kerja dikunci.",
      belumSelesai:
        "Latihan pemulihan kata sandi belum pernah dijalankan bersamamu.",
      perluKamu: false,
      langkah: access
        ? "Simpan kata sandimu di pengelola kata sandi."
        : "Asisten AI menyelesaikan pengaturan akses.",
    },
    {
      tahap: "Ruang kerja founder",
      memungkinkan:
        "Melihat temuan, bukti, dan keputusan dalam bahasa yang jelas.",
      status: "Lulus pemeriksaan",
      terverifikasi:
        "Tampilan baru diperiksa otomatis agar bebas istilah teknis.",
      belumSelesai:
        "Belum diterbitkan ke alamat utama; masih di versi pratinjau.",
      perluKamu: true,
      langkah: "Tinjau tampilan baru dan putuskan apakah boleh diterbitkan.",
    },
    {
      tahap: "Alur keputusan (dengan contoh data)",
      memungkinkan: "Mencoba alur dari bukti sampai keputusan dan uji coba.",
      status:
        Number(counts.ujiSelesai) > 0
          ? "Terbukti digunakan"
          : Number(counts.bukti) > 0
            ? "Sedang dikerjakan"
            : "Belum dimulai",
      terverifikasi: `${counts.bukti} contoh bukti aktif, ${counts.keputusan} keputusan, ${counts.ujiSelesai} uji coba selesai.`,
      belumSelesai: "Hanya memakai contoh data, bukan pasar nyata.",
      perluKamu: false,
      langkah:
        Number(counts.bukti) > 0
          ? "Tinjau peluang contoh dan beri keputusan."
          : "Muat contoh data dari Beranda untuk mencoba alurnya.",
    },
    await researchStage(c),
    {
      tahap: "Insight & publikasi",
      memungkinkan: "Menerbitkan insight berbasis bukti setelah kamu setujui.",
      status: "Belum dimulai",
      terverifikasi: "Belum ada insight yang dibuat atau diterbitkan.",
      belumSelesai: "Seluruh bagian ini.",
      perluKamu: false,
      langkah: "Menunggu riset pasar nyata.",
    },
  ];
}

const keyAvailable = (env: Env["Bindings"]) =>
  typeof env.GROQ_API_KEY === "string" && env.GROQ_API_KEY.length >= 16;

export function registerFounder(app: Hono<Env>) {
  // Internal call into reviewed, audited workflow routes (same session and protections).
  async function internal(
    c: Context<Env>,
    path: string,
    method = "GET",
    body?: unknown,
  ) {
    const origin = new URL(c.req.url).origin;
    const r = await app.request(
      origin + "/api" + path,
      {
        method,
        headers: {
          Origin: origin,
          "X-HIO-Request": "operator",
          "Content-Type": "application/json",
          Cookie: c.req.header("Cookie") ?? "",
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      },
      c.env,
    );
    const data = (await r.json()) as Row & { error?: { code: string } };
    return { ok: r.ok, status: r.status, data };
  }
  function relay(
    c: Context<Env>,
    r: { status: number; data: { error?: { code: string } } },
  ) {
    const code = r.data.error?.code ?? "internal_error";
    return c.json(
      { error: { code, founder: founderNotice(code) } },
      (r.status >= 400 && r.status < 600 ? r.status : 500) as 400,
    );
  }

  app.get("/api/founder/home", async (c) => {
    const opp = await opportunityView(c);
    const sample = await sampleState(c);
    const questions = await rows(
      c,
      "SELECT id,question,created_at FROM research_briefs ORDER BY created_at DESC LIMIT 3",
    );
    const experiments = await rows(
      c,
      "SELECT id,hypothesis,status,review_at FROM experiments ORDER BY created_at DESC LIMIT 5",
    );
    const running = experiments.filter((e) => e.status !== "completed");
    const waiting = [] as {
      judul: string;
      tautan: string;
      penjelasan: string;
    }[];
    if (opp?.menungguKeputusan)
      waiting.push({
        judul: "Beri keputusan untuk peluang contoh",
        tautan: "/peluang",
        penjelasan: "Ada bukti pendukung dan berlawanan yang siap kamu tinjau.",
      });
    if (opp?.bolehBuatUjiCoba)
      waiting.push({
        judul: "Buat uji coba yang sudah kamu setujui",
        tautan: "/produk",
        penjelasan:
          "Tentukan tujuan, ukuran berhasil, dan kapan harus berhenti.",
      });
    for (const e of running)
      waiting.push({
        judul: "Catat hasil uji coba",
        tautan: "/produk",
        penjelasan: String(e.hypothesis).slice(0, 120),
      });
    const live = await liveSummary(c);
    for (const r of live.waiting)
      waiting.unshift({
        judul: "Beri keputusan untuk hasil riset",
        tautan: "/intelijen",
        penjelasan: r,
      });
    const hasEvidence = !!opp && opp.bukti.length > 0;
    let next: { judul: string; alasan: string; tautan: string; aksi?: string };
    if (live.ready && !live.latest && !waiting.length)
      next = {
        judul: "Jalankan riset pasar nyata pertamamu",
        alasan:
          "Sumber informasi pasar nyata sudah tersambung. Tulis satu pertanyaan, HIO akan mencari di web, menyusun bukti beserta sumbernya, lalu meminta keputusanmu.",
        tautan: "/intelijen",
      };
    else if (!hasEvidence && !live.ready)
      next = {
        judul: "Coba alur kerja dengan contoh data",
        alasan:
          "Sumber informasi pasar nyata belum tersambung. Contoh data membantumu melihat bagaimana HIO menyajikan bukti dan meminta keputusan, tanpa risiko apa pun.",
        tautan: "/",
        aksi: "muat-contoh",
      };
    else if (waiting.length)
      next = {
        judul: waiting[0]!.judul,
        alasan: waiting[0]!.penjelasan,
        tautan: waiting[0]!.tautan,
      };
    else
      next = {
        judul: live.ready
          ? "Jalankan riset pasar berikutnya"
          : "Ajukan pertanyaan riset pasar pertamamu",
        alasan: live.ready
          ? "Belum ada yang menunggu keputusanmu. Ajukan pertanyaan berikutnya yang ingin kamu jawab tentang pasar."
          : "Langkah berikutnya adalah merumuskan pertanyaan nyata yang ingin kamu jawab.",
        tautan: "/intelijen",
      };
    return c.json({
      sapaan: displayName(c.env.OPERATOR_NAME),
      temuan: hasEvidence
        ? {
            ringkasan: `${opp!.jumlahMendukung} contoh keluhan tentang serah terima riset yang kehilangan sumber, dan ${opp!.jumlahBerlawanan} contoh yang menunjukkan spreadsheet sudah cukup.`,
            contoh: true,
            mengapaPenting: opp!.alasanPerhatian,
            kekuatanBukti: opp!.kekuatanBukti,
            belumDiketahui: opp!.yangBelumDiketahui,
          }
        : null,
      temuanPasarNyata: live.realCount,
      menungguKamu: waiting,
      kendala: live.ready
        ? []
        : [
            {
              judul: "Sumber informasi pasar nyata belum tersambung",
              dampak:
                "HIO belum bisa menemukan peluang dari pasar sungguhan. Yang tampil saat ini hanya contoh data.",
              perluKamu: false,
              langkah:
                "Asisten AI perlu menyambungkan sumbernya. Tidak ada yang perlu kamu lakukan sekarang.",
            },
          ],
      risetTerbaru: live.latest,
      langkahBerikutnya: next,
      contohData: sample,
      pertanyaanTerbaru: questions.map((q) => ({
        id: String(q.id),
        pertanyaan: String(q.question),
        tanggal: String(q.created_at),
      })),
      kemajuan: await progressBoard(c),
      versi: APP_VERSION,
    });
  });

  app.get("/api/founder/progress", async (c) =>
    c.json({ versi: APP_VERSION, tahap: await progressBoard(c) }),
  );

  app.post("/api/founder/sample", async (c) => {
    const registry = await internal(c, "/v1/plugins");
    if (!registry.ok) return relay(c, registry);
    const reg = registry.data as unknown as {
      items: { id: string }[];
      available: { id: string; permissions: string[] }[];
    };
    const manifest = reg.available.find((m) => m.id === "hio.fixture")!;
    if (!reg.items.some((p) => p.id === manifest.id)) {
      const r = await internal(c, "/v1/plugins", "POST", manifest);
      if (!r.ok) return relay(c, r);
    }
    for (const [path, body] of [
      [
        "/v1/plugins/hio.fixture",
        { enabled: true, grants: manifest.permissions },
      ],
      ["/v1/sources/fixture", { enabled: true }],
    ] as const) {
      const r = await internal(c, path, "PATCH", body);
      if (!r.ok) return relay(c, r);
    }
    const run = await internal(c, "/v1/runs", "POST", {
      sourceId: "fixture",
      key: "sample-" + crypto.randomUUID(),
      mode: "normal",
      limit: 4,
    });
    if (!run.ok) return relay(c, run);
    const r = (run.data as { run: { accepted: number; duplicates: number } })
      .run;
    return c.json({
      pesan: `Contoh data dimuat: ${r.accepted} bukti baru, ${r.duplicates} salinan dikenali dan tidak dihitung dua kali.`,
      catatan: "Ini contoh data untuk latihan, bukan temuan pasar nyata.",
    });
  });

  app.post("/api/founder/sample/stop", async (c) => {
    for (const [path, body] of [
      ["/v1/sources/fixture", { enabled: false }],
      ["/v1/plugins/hio.fixture", { enabled: false, grants: [] }],
    ] as const) {
      const r = await internal(c, path, "PATCH", body);
      if (!r.ok && r.status !== 404) return relay(c, r);
    }
    return c.json({
      pesan:
        "Contoh data dihentikan. Bukti dan keputusan yang sudah ada tetap tersimpan.",
    });
  });

  app.get("/api/founder/market", async (c) => {
    const evidence = await rows(
      c,
      "SELECT * FROM evidence WHERE expires_at>? AND purged_at IS NULL ORDER BY captured_at DESC,id LIMIT 50",
      now(),
    );
    const questions = await rows(
      c,
      "SELECT id,question,segment,geography,created_at FROM research_briefs ORDER BY created_at DESC LIMIT 50",
    );
    const clusters = await rows(
      c,
      "SELECT c.id, (SELECT COUNT(*) FROM memberships m JOIN evidence e ON e.id=m.evidence_id WHERE m.cluster_id=c.id AND e.expires_at>? AND e.purged_at IS NULL) n FROM clusters c LIMIT 20",
      now(),
    );
    return c.json({
      temuanPasarNyata: evidence.filter((e) => Number(e.synthetic) !== 1)
        .length,
      catatanSumber:
        "Sumber informasi pasar nyata belum tersambung. Semua bukti di bawah ini adalah contoh data untuk latihan.",
      bukti: evidence.map(evidenceView),
      pola: clusters
        .filter((p) => Number(p.n) > 0)
        .map((p) => ({
          judul: "Serah terima riset manual kehilangan sumber",
          jumlahBukti: Number(p.n),
          status: "Dugaan, belum terverifikasi",
          catatan:
            "Dikelompokkan dari contoh data. Beberapa contoh bukanlah tren pasar.",
        })),
      pertanyaan: questions.map((q) => ({
        id: String(q.id),
        pertanyaan: String(q.question),
        segmen: String(q.segment),
        wilayah: String(q.geography),
        tanggal: String(q.created_at),
        status: "Rencana riset tersimpan, belum ada bukti terkumpul",
      })),
    });
  });

  const questionInput = z
    .object({
      question: z.string(),
      segment: z.string(),
      geography: z.string(),
      problem: z.string(),
      payerHypothesis: z.string(),
    })
    .strict();
  app.post("/api/founder/questions", async (c) => {
    let body: z.infer<typeof questionInput>;
    try {
      body = questionInput.parse(await c.req.json());
    } catch {
      return problem(c, "invalid_input", 400);
    }
    const r = await internal(c, "/v1/intelligence", "POST", {
      ...body,
      connector: "manual",
    });
    if (!r.ok) return relay(c, r);
    return c.json(
      {
        id: String(r.data.id),
        pesan:
          "Pertanyaan riset tersimpan beserta rencana pemeriksaannya. Belum ada informasi yang dikumpulkan.",
      },
      201,
    );
  });

  app.get("/api/founder/questions/:id", async (c) => {
    const id = c.req.param("id");
    if (!/^[a-zA-Z0-9_-]{1,80}$/.test(id)) return problem(c, "not_found", 404);
    const b = await one(c, "SELECT * FROM research_briefs WHERE id=?", id);
    if (!b) return problem(c, "not_found", 404);
    return c.json({
      id,
      pertanyaan: String(b.question),
      segmen: String(b.segment),
      wilayah: String(b.geography),
      dugaanMasalah: String(b.problem),
      dugaanPembayar: String(b.payer_hypothesis),
      tanggal: String(b.created_at),
      status: "Rencana riset — belum ada bukti terkumpul",
      yangAkanDicari: [
        "Apakah masalah ini muncul berulang dari orang yang berbeda, bukan dari unggahan ulang",
        "Bagaimana mereka mengatasinya sekarang dan berapa biayanya",
        "Apakah ada tanda mendesak dari tindakan nyata, bukan hanya obrolan",
        "Siapa yang memegang anggaran dan pernah menunjukkan niat membeli",
      ],
      yangBisaMembantah: [
        "Alternatif yang sudah ada menyelesaikan masalah dengan murah",
        "Minat tidak berubah menjadi anggaran atau pembelian",
        "Contoh hanya berasal dari satu komunitas, satu wilayah, atau sumber yang sama",
      ],
      belumDiketahui: [
        "Seberapa sering masalah terjadi",
        "Seberapa mendesak",
        "Kesediaan membayar",
        "Harga dan biaya menjangkau pelanggan",
        "Pesaing dan aturan yang berlaku",
      ],
      bolehSekarang: ["Teliti lebih lanjut", "Tunda", "Tolak dugaan ini"],
      belumBoleh: [
        "Masuk pasar",
        "Menghubungi orang secara otomatis",
        "Mengeluarkan uang",
        "Menyatakan permintaan pasar sudah terbukti",
      ],
    });
  });

  app.get("/api/founder/opportunities", async (c) => {
    const o = await opportunityView(c);
    return c.json({
      peluang: o ? [o] : [],
      catatan:
        "Peluang dari pasar nyata akan muncul setelah sumber informasi nyata tersambung.",
    });
  });

  const decisionBody = z
    .object({
      pilihan: z.enum(["setujui", "tolak", "ubah", "nanti"]),
      alasan: z.string().trim().min(1).max(2000),
      catatan: z.string().trim().max(2000).optional(),
    })
    .strict();
  app.post("/api/founder/decisions", async (c) => {
    let b: z.infer<typeof decisionBody>;
    try {
      b = decisionBody.parse(await c.req.json());
    } catch {
      return problem(c, "invalid_input", 400);
    }
    const choice = {
      setujui: "approve_fixture",
      tolak: "reject",
      ubah: "research",
      nanti: "hold",
    }[b.pilihan];
    const notes = b.catatan?.trim() || "Tidak ada catatan tambahan.";
    const r = await internal(c, "/v1/decisions", "POST", {
      opportunityId: "research-workbench",
      choice,
      rationale:
        b.pilihan === "ubah" ? `Perlu diubah dulu: ${b.alasan}` : b.alasan,
      reviewerNotes: notes,
      reviewAt: inDays(7),
    });
    if (!r.ok) return relay(c, r);
    const msg = {
      setujui:
        "Persetujuan dicatat. Kamu sekarang bisa membuat satu uji coba latihan tanpa biaya di Produk & Eksperimen.",
      tolak: "Penolakan dicatat. Tidak ada tindakan lanjutan yang dijalankan.",
      ubah: "Dicatat: peluang perlu diubah atau diteliti lagi sebelum diputuskan.",
      nanti:
        "Dicatat: keputusan ditunda. Kami akan mengingatkan untuk meninjau ulang dalam 7 hari.",
    }[b.pilihan];
    return c.json({ id: String(r.data.id), pesan: msg }, 201);
  });

  app.get("/api/founder/experiments", async (c) => {
    const opp = await opportunityView(c);
    const list = await rows(
      c,
      "SELECT * FROM experiments ORDER BY created_at DESC LIMIT 50",
    );
    return c.json({
      bisaMembuat: !!opp?.bolehBuatUjiCoba,
      persetujuan: opp?.persetujuanAktif ?? null,
      ujiCoba: list.map((e) => ({
        id: String(e.id),
        tujuan: String(e.hypothesis),
        ukuranBerhasil: String(e.success_criteria),
        kapanBerhenti: String(e.stop_criteria),
        biaya: "Rp0 (uji coba latihan)",
        status: e.status === "completed" ? "Selesai" : "Sedang berjalan",
        selesai: e.status === "completed",
        tinjauUlang: String(e.review_at),
        hasil: e.outcome ? String(e.outcome) : null,
        pelajaran: e.learning ? String(e.learning) : null,
        dibuat: String(e.created_at),
      })),
    });
  });

  const experimentBody = z
    .object({
      tujuan: z.string(),
      ukuranBerhasil: z.string(),
      kapanBerhenti: z.string(),
    })
    .strict();
  app.post("/api/founder/experiments", async (c) => {
    let b: z.infer<typeof experimentBody>;
    try {
      b = experimentBody.parse(await c.req.json());
    } catch {
      return problem(c, "invalid_input", 400);
    }
    const opp = await opportunityView(c);
    if (!opp?.bolehBuatUjiCoba || !opp.persetujuanAktif)
      return problem(c, "approval_required", 403);
    const r = await internal(c, "/v1/experiments", "POST", {
      opportunityId: "research-workbench",
      decisionId: opp.persetujuanAktif.id,
      hypothesis: b.tujuan,
      successCriteria: b.ukuranBerhasil,
      stopCriteria: b.kapanBerhenti,
      budgetMinor: 0,
      currency: "IDR",
      reviewAt: inDays(7),
    });
    if (!r.ok) return relay(c, r);
    return c.json(
      {
        id: String(r.data.id),
        pesan:
          "Uji coba dibuat dengan biaya Rp0. Catat hasilnya setelah selesai.",
      },
      201,
    );
  });

  app.post("/api/founder/experiments/:id/result", async (c) => {
    const id = c.req.param("id");
    if (!/^[a-zA-Z0-9_-]{1,80}$/.test(id)) return problem(c, "not_found", 404);
    let b: { hasil: string; pelajaran: string };
    try {
      b = z
        .object({ hasil: z.string(), pelajaran: z.string() })
        .strict()
        .parse(await c.req.json());
    } catch {
      return problem(c, "invalid_input", 400);
    }
    const r = await internal(c, `/v1/experiments/${id}/outcome`, "POST", {
      outcome: b.hasil,
      learning: b.pelajaran,
      actualCostMinor: 0,
    });
    if (!r.ok) return relay(c, r);
    return c.json({
      pesan: "Hasil dan pelajaran dicatat. Catatan ini tidak bisa diubah.",
    });
  });

  app.get("/api/founder/settings", async (c) => {
    const sample = await sampleState(c);
    return c.json({
      akses: {
        aktif: configured(c),
        status: configured(c)
          ? "Aktif — ruang kerja hanya bisa dibuka dengan kata sandi aksesmu."
          : "Belum aktif — ruang kerja dikunci sampai pengaturan akses selesai.",
        caraMasuk:
          "Buka alamat HIO, masukkan kata sandi akses, lalu tekan Masuk. Sesi berlaku 8 jam; setelah itu kamu diminta masuk lagi.",
        pemulihan:
          "Kata sandimu disimpan di folder pribadi pemilik (HIO_Private_Release di AI Drive). Jika hilang atau bocor, minta asisten AI membuat kata sandi baru. Kamu tidak perlu menyiapkan apa pun secara teknis; kata sandi lama otomatis tidak berlaku.",
        pengguna: displayName(c.env.OPERATOR_NAME),
      },
      sumber: [
        {
          nama: "Contoh data internal",
          status: sample.aktif ? "Aktif" : "Tidak aktif",
          penjelasan:
            "Data latihan buatan HIO untuk mencoba alur kerja. Tidak pernah dianggap sebagai bukti pasar.",
        },
        ...sourceStatus(c.env).map((s) => ({
          nama: s.nama,
          status: s.tersambung ? "Tersambung" : "Belum tersambung",
          penjelasan: s.tersambung
            ? "Dipakai hanya saat kamu menjalankan riset. Setiap riset memakai satu pencarian."
            : "Belum tersambung.",
        })),
        {
          nama: "Analisis AI",
          status: keyAvailable(c.env) ? "Tersambung" : "Belum tersambung",
          penjelasan:
            "Membaca cuplikan yang terkumpul dan menyusun ringkasan, bukti pendukung dan berlawanan. Hasilnya selalu diberi label interpretasi AI.",
        },
      ],
      privasi: [
        "Bukti disimpan paling lama 30 hari, lalu isinya dihapus. Jejak keputusan tetap disimpan.",
        "HIO tidak menerbitkan, menghubungi orang, atau mengeluarkan uang tanpa persetujuanmu.",
        "Jangan memasukkan data pribadi pelanggan atau kata sandi ke kolom isian.",
      ],
      versi: APP_VERSION,
    });
  });
}
