import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import app from "../src/index";
import { founderShell } from "../src/view";
import { founderNotice } from "../src/founder";
import { LocalD1 } from "./helpers/local-d1";

import { TECHNICAL_TERMS } from "./helpers/terms";
// The private recovery folder name is shown verbatim so the founder can find it.
const ALLOWED_NAMES = /HIO_Private_Release/g;
function leaks(text: string) {
  const t = text.replace(ALLOWED_NAMES, "");
  return TECHNICAL_TERMS.filter((re) => re.test(t)).map(String);
}
// Collect every human-facing string value in a founder response object.
function strings(value: unknown, key = ""): string[] {
  if (typeof value === "string") {
    if (
      /^(id|tautan|aksi|tanggal\w*|berlakuSampai|tinjauUlang|dibuat|terakhirDimuat|versi)$/.test(
        key,
      )
    )
      return [];
    return [value];
  }
  if (Array.isArray(value)) return value.flatMap((v) => strings(v, key));
  if (value && typeof value === "object")
    return Object.entries(value).flatMap(([k, v]) => strings(v, k));
  return [];
}
function expectFounderSafe(value: unknown) {
  const found = strings(value).flatMap((s) =>
    leaks(s).map((term) => `${term} in "${s.slice(0, 90)}"`),
  );
  expect(found).toEqual([]);
}

let storage: LocalD1;
let cookie = "";
const secret = "test-only-secret-never-production-00000000";
const env = () => ({
  DB: storage as unknown as D1Database,
  OPERATOR_SECRET: secret,
  SESSION_SECRET: "test-session-signing-key-not-production-000000",
  OPERATOR_NAME: "Founder Uji",
  HIO_ENVIRONMENT: "local",
});
async function call(path: string, method = "GET", body?: unknown, e = env()) {
  return app.request(
    "https://hio.test" + path,
    {
      method,
      headers: {
        Origin: "https://hio.test",
        "X-HIO-Request": "operator",
        "Content-Type": "application/json",
        ...(cookie ? { Cookie: cookie } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    },
    e,
  );
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = any;
async function json(path: string, method = "GET", body?: unknown) {
  const r = await call(path, method, body);
  return { status: r.status, data: (await r.json()) as Json };
}
async function login() {
  const r = await call("/api/session", "POST", { secret });
  expect(r.status).toBe(200);
  cookie = r.headers.get("set-cookie")!.split(";")[0]!;
}
beforeEach(() => {
  storage = new LocalD1();
  cookie = "";
});
afterEach(() => storage.db.close());

describe("Founder language policy", () => {
  it("founder page shell contains no technical vocabulary", () => {
    for (const locked of [false, true]) {
      const visible = founderShell(locked)
        .replace(/<script[\s\S]*?<\/script>/g, "")
        .replace(/<[^>]+>/g, " ");
      expect(leaks(visible)).toEqual([]);
    }
  });
  it("founder screen script has no technical vocabulary in visible copy", () => {
    const source = readFileSync("public/static/founder.js", "utf8");
    // Visible copy lives in string/template literals made of human words.
    const literals = [...source.matchAll(/(["`])((?:(?!\1)[^\\]|\\.)*)\1/g)]
      .map((m) => m[2]!)
      .filter((s) => /\s/.test(s) && /[a-z]{3,}\s[a-z]{3,}/i.test(s))
      .map((s) => s.replace(/<[^>]+>/g, " ").replace(/\$\{[^}]*\}/g, " "))
      .filter((s) => !/^\s*$/.test(s));
    const offenders = literals.filter(
      (s) =>
        leaks(s).length &&
        // Non-visible identifiers (selectors, request paths, header names)
        !/^[\s#.[\]=a-z0-9'"/-]*$/i.test(s.trim()) &&
        !/X-HIO-Request|Content-Type|application\/json/.test(s),
    );
    expect(offenders).toEqual([]);
  });
  it("every internal problem code maps to a plain explanation with impact and next step", () => {
    for (const code of [
      "unauthorized",
      "not_configured",
      "origin_denied",
      "rate_limited",
      "invalid_input",
      "invalid_json",
      "not_found",
      "evidence_gate",
      "approval_required",
      "already_completed",
      "plugin_disabled",
      "permission_denied",
      "source_disabled",
      "idempotency_conflict",
      "body_too_large",
      "owner_required",
      "internal_error",
      "something_new_and_unknown",
    ]) {
      const n = founderNotice(code);
      expect(n.judul.length).toBeGreaterThan(5);
      expect(n.dampak.length).toBeGreaterThan(5);
      expect(n.langkah.length).toBeGreaterThan(5);
      expect(typeof n.perluKamu).toBe("boolean");
      expectFounderSafe(n);
    }
    expect(founderNotice("unauthorized", "/api/session").judul).toBe(
      "Kata sandi tidak cocok",
    );
  });
});

describe("Founder access", () => {
  it("all founder data is private; pages show sign-in only", async () => {
    for (const path of [
      "/api/founder/home",
      "/api/founder/market",
      "/api/founder/opportunities",
      "/api/founder/experiments",
      "/api/founder/settings",
      "/api/founder/progress",
    ]) {
      const r = await json(path);
      expect(r.status).toBe(401);
      expectFounderSafe(r.data.error.founder);
    }
    for (const path of ["/api/founder/sample", "/api/founder/decisions"])
      expect((await call(path, "POST", {})).status).toBe(401);
    for (const path of [
      "/founder",
      "/founder/login",
      "/intelijen",
      "/peluang",
      "/produk",
      "/publikasi",
      "/pengaturan",
    ]) {
      const r = await call(path);
      expect(r.status).toBe(200);
      const html = await r.text();
      expect(html).toContain("Kata sandi akses");
      expect(html).not.toContain(secret);
    }
  });
  it("wrong password gives a plain explanation; correct password opens; logout closes", async () => {
    const wrong = await json("/api/session", "POST", { secret: "salah" });
    expect(wrong.status).toBe(401);
    expect(wrong.data.error.founder.judul).toBe("Kata sandi tidak cocok");
    await login();
    expect((await call("/api/founder/home")).status).toBe(200);
    expect((await call("/api/session", "DELETE")).status).toBe(200);
    expect((await call("/api/founder/home")).status).toBe(401);
  });
  it("expired session is refused", async () => {
    await login();
    storage.db.exec("UPDATE sessions SET expires_at=0");
    expect((await call("/api/founder/home")).status).toBe(401);
  });
  it("maintenance area is hidden from founder navigation and owner-only", async () => {
    const html = founderShell(false);
    const nav = html.match(/<nav id="primary-nav"[\s\S]*?<\/nav>/)![0];
    expect(nav).not.toContain("pemeliharaan");
    expect((nav.match(/<a /g) || []).length).toBe(6);
    const anon = await call("/pemeliharaan");
    expect(anon.status).toBe(302);
    await login();
    expect((await call("/pemeliharaan")).status).toBe(200);
    expect((await call("/pemeliharaan/runs")).status).toBe(200);
  });
  it("old engineering addresses lead to the matching founder area", async () => {
    const map: Record<string, string> = {
      "/opportunities": "/peluang",
      "/experiments": "/produk",
      "/evidence": "/intelijen",
      "/settings": "/pengaturan",
      "/manual": "/pengaturan",
    };
    for (const [from, to] of Object.entries(map)) {
      const r = await call(from);
      expect(r.status).toBe(301);
      expect(r.headers.get("location")).toBe(to);
    }
  });
});

describe("Unknown addresses", () => {
  it("unknown pages show a friendly page, unknown data requests are explained", async () => {
    for (const path of ["/tidak-ada", "/peluang/xyz", "/static-x"]) {
      const r = await call(path);
      expect(r.status).toBe(404);
      const html = await r.text();
      expect(html).toContain("Halaman tidak ditemukan");
      expect(html.replace(/<[^>]+>/g, " ")).not.toMatch(/route|404|error/i);
    }
    const slash = await call("/peluang/");
    expect(slash.status).toBe(301);
    expect(slash.headers.get("location")).toBe("/peluang");
    await login();
    const api = await json("/api/founder/tidak-ada");
    expect(api.status).toBe(404);
    expect(api.data.error.founder.judul).toContain("tidak ditemukan");
  });
});

describe("Founder workflow", () => {
  it("first use: honest empty state, no invented findings or metrics", async () => {
    await login();
    const home = await json("/api/founder/home");
    expect(home.status).toBe(200);
    expect(home.data.temuan).toBeNull();
    expect(home.data.temuanPasarNyata).toBe(0);
    expect(home.data.menungguKamu).toEqual([]);
    expect(home.data.langkahBerikutnya.aksi).toBe("muat-contoh");
    expect(home.data.kendala[0].judul).toContain("belum tersambung");
    expectFounderSafe(home.data);
    const market = await json("/api/founder/market");
    expect(market.data.bukti).toEqual([]);
    expect(market.data.pola).toEqual([]);
    expectFounderSafe(market.data);
    const opp = await json("/api/founder/opportunities");
    expect(opp.data.peluang[0].kekuatanBukti.label).toBe("Belum ada bukti");
    expect(opp.data.peluang[0].menungguKeputusan).toBe(false);
    const exp = await json("/api/founder/experiments");
    expect(exp.data.bisaMembuat).toBe(false);
    expectFounderSafe(exp.data);
    const settings = await json("/api/founder/settings");
    expect(settings.data.akses.aktif).toBe(true);
    expect(JSON.stringify(settings.data)).not.toContain(secret);
    expectFounderSafe(settings.data);
  });

  it("full path: sample → evidence → recommendation → approval → experiment → result", async () => {
    await login();
    const loaded = await json("/api/founder/sample", "POST", {});
    expect(loaded.status).toBe(200);
    expect(loaded.data.pesan).toContain("3 bukti baru");
    expect(loaded.data.pesan).toContain("1 salinan");
    expectFounderSafe(loaded.data);

    const home = await json("/api/founder/home");
    expect(home.data.temuan.contoh).toBe(true);
    expect(home.data.temuan.kekuatanBukti.label).toBe("Hanya contoh data");
    expect(home.data.temuanPasarNyata).toBe(0);
    expect(home.data.menungguKamu[0].tautan).toBe("/peluang");
    expectFounderSafe(home.data);

    const market = await json("/api/founder/market");
    expect(market.data.bukti).toHaveLength(3);
    for (const e of market.data.bukti) {
      expect(e.contoh).toBe(true);
      expect(e.jenis).toBe("Contoh data, bukan temuan pasar nyata");
      expect(e.tanggalDikumpulkan).toBeTruthy();
      expect(e.kutipan).not.toContain("SYNTHETIC");
    }
    expect(market.data.bukti.filter((e: Json) => !e.mendukung)).toHaveLength(1);
    expectFounderSafe(market.data);

    const opp = (await json("/api/founder/opportunities")).data.peluang[0];
    expect(opp.status).toBe("Menunggu persetujuanmu");
    expect(opp.bisaDisetujui).toBe(true);
    expect(opp.jumlahMendukung).toBe(2);
    expect(opp.jumlahBerlawanan).toBe(1);
    expect(opp.yangBelumDiketahui).toContain(
      "Siapa yang benar-benar mau membayar",
    );
    expectFounderSafe(opp);

    // Experiment cannot be created before approval.
    const early = await json("/api/founder/experiments", "POST", {
      tujuan: "Uji alur",
      ukuranBerhasil: "Bukti terlacak",
      kapanBerhenti: "Jika jejak hilang",
    });
    expect(early.status).toBe(403);
    expect(early.data.error.founder.judul).toContain("persetujuanmu");

    const approve = await json("/api/founder/decisions", "POST", {
      pilihan: "setujui",
      alasan: "Ada bukti pendukung dan berlawanan; uji coba tanpa biaya.",
    });
    expect(approve.status).toBe(201);
    expectFounderSafe(approve.data);
    const after = (await json("/api/founder/opportunities")).data.peluang[0];
    expect(after.status).toBe("Disetujui, uji coba belum dibuat");
    expect(after.riwayatKeputusan[0].keputusan).toContain("Disetujui");

    const created = await json("/api/founder/experiments", "POST", {
      tujuan: "Apakah alur menjaga asal-usul bukti?",
      ukuranBerhasil: "Setiap bukti punya sumber dan tanggal",
      kapanBerhenti: "Jika ada bukti tanpa sumber",
    });
    expect(created.status).toBe(201);
    // Approval is single-use: no second experiment, nothing left waiting.
    const home2 = (await json("/api/founder/home")).data;
    expect(
      home2.menungguKamu.some((w: Json) => w.judul.startsWith("Buat uji coba")),
    ).toBe(false);
    expect(home2.menungguKamu[0].judul).toBe("Catat hasil uji coba");
    expect((await json("/api/founder/experiments")).data.bisaMembuat).toBe(
      false,
    );
    const second = await json("/api/founder/experiments", "POST", {
      tujuan: "Uji kedua",
      ukuranBerhasil: "x",
      kapanBerhenti: "y",
    });
    expect(second.status).toBe(403);
    const list = (await json("/api/founder/experiments")).data;
    expect(list.ujiCoba[0].status).toBe("Sedang berjalan");
    expect(list.ujiCoba[0].biaya).toContain("Rp0");
    const result = await json(
      `/api/founder/experiments/${list.ujiCoba[0].id}/result`,
      "POST",
      { hasil: "Semua bukti punya sumber.", pelajaran: "Perlu data nyata." },
    );
    expect(result.status).toBe(200);
    const again = await json(
      `/api/founder/experiments/${list.ujiCoba[0].id}/result`,
      "POST",
      { hasil: "Ubah", pelajaran: "Ubah" },
    );
    expect(again.status).toBe(409);
    expect(again.data.error.founder.judul).toContain("sudah dicatat");
    expectFounderSafe(again.data.error.founder);
    const done = (await json("/api/founder/experiments")).data.ujiCoba[0];
    expect(done.selesai).toBe(true);
    const progress = (await json("/api/founder/progress")).data.tahap;
    expect(progress.find((s: Json) => s.tahap.startsWith("Alur")).status).toBe(
      "Terbukti digunakan",
    );
    // Every decision passes through the audited workflow.
    const audit = storage.db
      .prepare("SELECT action FROM audit_events ORDER BY occurred_at")
      .all()
      .map((r) => String((r as { action: string }).action));
    expect(audit).toEqual(
      expect.arrayContaining([
        "collection.attempt",
        "decision.record",
        "experiment.approved_fixture",
        "experiment.outcome",
      ]),
    );
  });

  it("reject, edit-first and decide-later are valid outcomes and block experiments", async () => {
    await login();
    await json("/api/founder/sample", "POST", {});
    for (const [pilihan, label] of [
      ["tolak", "Ditolak"],
      ["ubah", "Teliti lebih lanjut"],
      ["nanti", "Putuskan nanti"],
    ]) {
      const r = await json("/api/founder/decisions", "POST", {
        pilihan,
        alasan: "Belum cukup bukti nyata.",
      });
      expect(r.status).toBe(201);
      const o = (await json("/api/founder/opportunities")).data.peluang[0];
      expect(o.status).toBe(label);
      expect((await json("/api/founder/experiments")).data.bisaMembuat).toBe(
        false,
      );
    }
  });

  it("approval without both supporting and opposing evidence is refused plainly", async () => {
    await login();
    const r = await json("/api/founder/decisions", "POST", {
      pilihan: "setujui",
      alasan: "Coba",
    });
    expect(r.status).toBe(409);
    expect(r.data.error.founder.judul).toBe(
      "Bukti belum cukup untuk disetujui",
    );
    expectFounderSafe(r.data.error.founder);
  });

  it("invalid or empty input is explained, not echoed", async () => {
    await login();
    for (const [path, body] of [
      ["/api/founder/decisions", { pilihan: "hapus", alasan: "x" }],
      ["/api/founder/questions", { question: "a" }],
      ["/api/founder/experiments", {}],
    ] as const) {
      const r = await json(path, "POST", body);
      expect(r.status).toBe(400);
      expect(r.data.error.founder.judul).toContain("Isian");
    }
  });

  it("research question is saved and explained as a plan, not evidence", async () => {
    await login();
    const r = await json("/api/founder/questions", "POST", {
      question: "Apakah toko daring kecil kesulitan mengatur stok?",
      segment: "Pemilik toko daring kecil",
      geography: "Jawa Timur",
      problem: "Stok sering tidak cocok antara gudang dan toko",
      payerHypothesis: "Pemilik toko",
    });
    expect(r.status).toBe(201);
    expectFounderSafe(r.data);
    const q = (await json("/api/founder/questions/" + r.data.id)).data;
    expect(q.status).toContain("belum ada bukti");
    expect(q.belumBoleh).toContain("Mengeluarkan uang");
    expectFounderSafe(q);
    const m = (await json("/api/founder/market")).data;
    expect(m.pertanyaan).toHaveLength(1);
    expect(m.bukti).toHaveLength(0);
    expect((await json("/api/founder/questions/tidak-ada")).status).toBe(404);
  });

  it("stopping sample data keeps history and is reversible", async () => {
    await login();
    await json("/api/founder/sample", "POST", {});
    const stop = await json("/api/founder/sample/stop", "POST", {});
    expect(stop.status).toBe(200);
    expect((await json("/api/founder/home")).data.contohData.aktif).toBe(false);
    expect((await json("/api/founder/market")).data.bukti).toHaveLength(3);
    await new Promise((r) => setTimeout(r, 2100));
    expect((await json("/api/founder/sample", "POST", {})).status).toBe(200);
  });

  it("locked workspace when access is not configured", async () => {
    const locked = {
      ...env(),
      OPERATOR_SECRET: undefined,
      SESSION_SECRET: undefined,
    };
    const page = await call(
      "/founder/login",
      "GET",
      undefined,
      locked as never,
    );
    expect(await page.text()).toContain("Ruang kerja sedang dikunci");
    const r = await call(
      "/api/session",
      "POST",
      { secret: "x" },
      locked as never,
    );
    expect(r.status).toBe(503);
    const body = (await r.json()) as Json;
    expect(body.error.founder.judul).toBe("Perlindungan akses belum siap");
    expect(body.error.founder.perluKamu).toBe(false);
  });
});
