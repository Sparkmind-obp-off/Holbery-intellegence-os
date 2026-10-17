// Founder experience browser acceptance (local only; never targets production).
// Checks: sign-in, full decision path, visible-text technical-language leakage,
// empty/error states, accessibility (axe), mobile layout and logout.
import { readFileSync, mkdirSync } from "node:fs";
import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const base = "http://localhost:3000";
const secret = readFileSync(".dev.vars", "utf8").match(
  /^OPERATOR_SECRET=(.+)$/m,
)?.[1];
assert.ok(secret, "Run node scripts/init-local.mjs first");
mkdirSync("test-results", { recursive: true });

const TERMS = [
  /\bAPI\b/i,
  /\bendpoint/i,
  /\bpayload/i,
  /\bschema/i,
  /\bmigration/i,
  /\bSQL\b/i,
  /\bD1\b/,
  /\bWorker/,
  /\bdeploy/i,
  /\bcommit\b/i,
  /\brepositor/i,
  /\bsecret/i,
  /\btoken/i,
  /\bhash\b/i,
  /\bwebhook/i,
  /\bMCP\b/,
  /\bplugin/i,
  /\bfixture/i,
  /\bmock\b/i,
  /\bHTTP\b/,
  /\b(401|403|404|409|429|500|503)\b/,
  /\badapter/i,
  /\bconnector/i,
  /\bprovenance/i,
  /\bidempoten/i,
  /\bJSON\b/,
  /\bsynthetic/i,
  /\bundefined\b/,
  /\bnull\b/,
  /\[object/,
];
async function assertNoLeak(page, where) {
  const text = (await page.locator("body").innerText()).replace(
    /HIO_Private_Release/g,
    "",
  );
  const found = TERMS.filter((re) => re.test(text)).map(String);
  assert.deepEqual(found, [], `Technical words visible on ${where}: ${found}`);
}
async function axe(page, where) {
  const r = await new AxeBuilder({ page }).analyze();
  const serious = r.violations.filter((v) =>
    ["serious", "critical"].includes(v.impact),
  );
  assert.deepEqual(
    serious.map((v) => `${v.id}: ${v.nodes[0]?.target}`),
    [],
    `Accessibility problems on ${where}`,
  );
}

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox"],
});
const context = await browser.newContext({
  viewport: { width: 1366, height: 900 },
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("dialog", (d) => d.accept());
const go = async (label) => {
  await page.locator("#primary-nav a", { hasText: label }).click();
  await expect(page.locator(".loading")).toHaveCount(0);
};
const steps = [];
const step = (s) => {
  steps.push(s);
  console.log("PASS", s);
};
try {
  // Sign-in screen
  await page.goto(base + "/founder/login");
  await expect(page.locator("#login-panel")).toBeVisible();
  await expect(page.locator("#workspace")).toBeHidden();
  await expect(page.getByRole("button", { name: "Masuk" })).toBeEnabled();
  await assertNoLeak(page, "sign-in");
  await axe(page, "sign-in");
  await page.getByLabel("Kata sandi akses").fill("kata-sandi-salah");
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page.locator("#login-error")).toContainText(
    "Kata sandi tidak cocok",
  );
  await assertNoLeak(page, "wrong password");
  step(
    "Masuk: halaman bersih, kata sandi salah dijelaskan dengan bahasa biasa",
  );

  await page.getByLabel("Kata sandi akses").fill(secret);
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page.locator("#workspace")).toBeVisible();
  await expect(page.locator("#login-panel")).toBeHidden();
  await expect(page.locator("#page-content h1")).toContainText("Halo");
  await page.screenshot({
    path: "test-results/founder-01-beranda-kosong.png",
    fullPage: true,
  });
  await expect(page.locator("#home-finding")).toContainText(
    "HIO belum menemukan apa pun",
  );
  await expect(page.locator("#home-waiting")).toContainText(
    "Tidak ada yang menunggu",
  );
  await assertNoLeak(page, "Beranda (first use)");
  await axe(page, "Beranda");
  step("Beranda pertama kali: keadaan kosong jujur, tanpa angka karangan");

  for (const [label, heading] of [
    ["Intelijen Pasar", "Intelijen Pasar"],
    ["Peluang", "Peluang"],
    ["Produk & Eksperimen", "Produk & Eksperimen"],
    ["Insight & Publikasi", "Insight & Publikasi"],
    ["Pengaturan", "Pengaturan"],
  ]) {
    await go(label);
    await expect(page.locator("#page-content h1")).toHaveText(heading);
    await assertNoLeak(page, heading + " (empty)");
    await axe(page, heading);
  }
  await expect(page.locator("#settings-access")).toContainText(
    "Perlindungan akses aktif",
  );
  step(
    "Enam area utama: navigasi, keadaan kosong, aksesibilitas, tanpa istilah teknis",
  );

  // Load sample data from Beranda
  await go("Beranda");
  // With live research connected, sample data is the secondary option.
  await page.getByRole("button", { name: "Muat contoh data" }).first().click();
  await expect(page.locator("#notice")).toContainText("Contoh data dimuat");
  await expect(page.locator("#home-finding")).toContainText(
    "Hanya contoh data",
  );
  await expect(page.locator("#home-waiting")).toContainText("Beri keputusan");
  await assertNoLeak(page, "Beranda (sample)");
  await page.screenshot({
    path: "test-results/founder-02-beranda-contoh.png",
    fullPage: true,
  });
  step(
    "Contoh data dimuat dan diberi label jelas sebagai bukan temuan pasar nyata",
  );

  await go("Intelijen Pasar");
  await expect(page.locator("#market-evidence .evidence")).toHaveCount(3);
  await expect(page.locator(".sample-notice")).toBeVisible();
  await assertNoLeak(page, "Intelijen (sample)");
  step("Intelijen Pasar: 3 bukti, sumber, tanggal, batasan, bukti berlawanan");

  // Research question saved as a plan (no search)
  const plan = page.locator("#question-form");
  await plan
    .getByLabel("Apa yang ingin kamu ketahui?")
    .fill("Apakah toko daring kecil kesulitan mengatur stok?");
  await plan
    .getByLabel("Siapa yang mengalami masalahnya?")
    .fill("Pemilik toko daring kecil");
  await plan.getByLabel("Di mana?").fill("Jawa Timur");
  await plan
    .getByLabel("Masalah apa yang kamu duga?")
    .fill("Stok tidak cocok antara gudang dan toko");
  await plan
    .getByLabel("Siapa yang kamu duga mau membayar?")
    .fill("Pemilik toko");
  await page.getByRole("button", { name: "Simpan pertanyaan" }).click();
  await expect(page.locator("#notice")).toContainText(
    "Pertanyaan riset tersimpan",
  );
  await page.locator('[data-action="lihat-pertanyaan"]').first().click();
  await expect(page.locator("#dialog-content")).toContainText(
    "Yang bisa membantah",
  );
  await assertNoLeak(page, "rencana riset");
  await page.locator("#close-dialog").click();
  step("Pertanyaan riset disimpan dan dijelaskan sebagai rencana, bukan bukti");

  // Decision
  await go("Peluang");
  await expect(page.locator(".recommendation")).toContainText("Saran HIO");
  await assertNoLeak(page, "Peluang (sample)");
  await axe(page, "Peluang (sample)");
  await page.screenshot({
    path: "test-results/founder-03-peluang.png",
    fullPage: true,
  });
  await page.locator('input[name="pilihan"][value="setujui"]').check();
  await page
    .getByLabel("Alasan singkatmu")
    .fill("Bukti pendukung dan berlawanan ada; uji coba latihan tanpa biaya.");
  await page.getByRole("button", { name: "Simpan keputusan" }).click();
  await expect(page.locator("#notice")).toContainText("Persetujuan dicatat");
  await expect(page.locator(".history")).toContainText("Disetujui");
  step(
    "Keputusan: saran jelas, empat pilihan, konfirmasi, tercatat di riwayat",
  );

  // Experiment
  await go("Produk & Eksperimen");
  await page
    .getByLabel("Apa yang ingin kamu uji?")
    .fill("Apakah alur menjaga asal-usul bukti?");
  await page
    .getByLabel("Kapan uji coba dianggap berhasil?")
    .fill("Setiap bukti punya sumber dan tanggal");
  await page
    .getByLabel("Kapan uji coba harus dihentikan?")
    .fill("Jika ada bukti tanpa sumber");
  await page.getByRole("button", { name: "Buat uji coba" }).click();
  await expect(page.locator("#notice")).toContainText("Uji coba dibuat");
  await page
    .getByLabel("Apa yang benar-benar terjadi?")
    .fill("Semua bukti punya sumber.");
  await page
    .getByLabel("Apa pelajarannya, termasuk jika gagal?")
    .fill("Perlu bukti pasar nyata.");
  await page.getByRole("button", { name: "Catat hasil" }).click();
  await expect(page.locator("#notice")).toContainText(
    "Hasil dan pelajaran dicatat",
  );
  await expect(page.locator("#experiment-list")).toContainText("Selesai");
  await assertNoLeak(page, "Produk (done)");
  step("Uji coba Rp0 dibuat, hasil dan pelajaran dicatat permanen");

  await go("Beranda");
  await expect(page.locator("#home-progress")).toContainText(
    "Terbukti digunakan",
  );
  await assertNoLeak(page, "Beranda (done)");
  step("Papan kemajuan di Beranda mengikuti data nyata");

  // Error state: simulate a lost connection
  await page.route("**/api/founder/market", (r) => r.abort());
  await go("Intelijen Pasar");
  await expect(page.locator(".problem")).toContainText(
    "Koneksi internet terputus",
  );
  await assertNoLeak(page, "connection failure");
  await page.unroute("**/api/founder/market");
  await page.getByRole("button", { name: "Coba lagi" }).click();
  await expect(page.locator("#page-content h1")).toHaveText("Intelijen Pasar");
  // Error state: server disruption
  await page.route("**/api/founder/experiments", (r) =>
    r.fulfill({ status: 500, body: "Internal stack trace at D1 worker" }),
  );
  await go("Produk & Eksperimen");
  await expect(page.locator(".problem")).toContainText(
    "Ada gangguan di sistem",
  );
  await assertNoLeak(page, "server failure");
  await page.unroute("**/api/founder/experiments");
  step(
    "Gangguan dijelaskan: dampak, perlu tindakan atau tidak, satu langkah berikutnya",
  );

  // Live research through the founder UI (one real search + one AI analysis).
  if (process.env.HIO_E2E_LIVE === "yes") {
    await go("Intelijen Pasar");
    const live = page.locator("#research-form");
    await expect(live).toBeVisible();
    await live
      .getByLabel("Apa yang ingin kamu ketahui?")
      .fill(
        "Apakah penjual online kecil di Indonesia kesulitan membalas chat pembeli?",
      );
    await live
      .getByLabel("Siapa yang mengalami masalahnya?")
      .fill("Penjual online kecil");
    await live.getByLabel("Di mana?").fill("Indonesia");
    await live
      .getByLabel("Masalah apa yang kamu duga?")
      .fill("chat pembeli marketplace terlambat dibalas pesanan hilang");
    await live.locator('input[value="tavily"]').check();
    await live.getByLabel(/Saya setuju HIO memakai/).check();
    await live.getByRole("button", { name: "Jalankan riset" }).click();
    await expect(page.locator("#notice")).toContainText("Riset selesai", {
      timeout: 60000,
    });
    const result = page.locator("#research-results .research").first();
    await expect(result).toContainText("Interpretasi AI");
    await expect(result).toContainText("Saran HIO");
    await result.locator("summary").click();
    const first = result.locator(".evidence").first();
    await expect(first).toContainText("Temuan pasar nyata");
    await expect(first.locator("a[href^='http']")).toHaveCount(1);
    await assertNoLeak(page, "live research result");
    await axe(page, "live research result");
    await page.screenshot({
      path: "test-results/founder-05-riset-nyata.png",
      fullPage: true,
    });
    await result.locator('input[name="pilihan"][value="ubah"]').check();
    await result
      .getByLabel("Alasan singkatmu")
      .fill("Perlu keluhan langsung dari penjual.");
    await result.getByRole("button", { name: "Simpan keputusan" }).click();
    await expect(page.locator("#notice")).toContainText("perlu diubah");
    await expect(
      page.locator("#research-results .research").first(),
    ).toContainText("Perlu diubah dulu");
    step(
      "Riset nyata: satu pencarian, bukti bersumber, analisis AI berlabel, keputusan tercatat",
    );
  }

  // Maintenance is reachable only via Pengaturan > Lanjutan
  await go("Pengaturan");
  await expect(page.locator("#primary-nav")).not.toContainText("Pemeliharaan");
  await page.locator("details.advanced summary").click();
  await page.getByRole("link", { name: "Buka area pemeliharaan" }).click();
  await expect(page.locator("#breadcrumb")).toHaveText("Overview");
  await page.getByRole("link", { name: "← Ruang kerja founder" }).click();
  await expect(page.locator("#workspace")).toBeVisible();
  step("Area pemeliharaan terpisah, hanya lewat Pengaturan › Lanjutan");

  // Mobile
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    storageState: await context.storageState(),
  });
  const m = await mobile.newPage();
  await m.goto(base + "/peluang");
  await expect(m.locator("#page-content h1")).toHaveText("Peluang");
  const overflow = await m.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  assert.ok(overflow <= 1, "Horizontal overflow on mobile: " + overflow);
  await m.getByRole("button", { name: "Menu" }).click();
  await m.locator("#primary-nav a", { hasText: "Beranda" }).click();
  await expect(m.locator("#page-content h1")).toContainText("Halo");
  await m.screenshot({
    path: "test-results/founder-04-ponsel.png",
    fullPage: true,
  });
  await mobile.close();
  step("Tampilan ponsel: tanpa geser samping, menu berfungsi");

  // Logout
  await page.getByRole("button", { name: "Keluar" }).click();
  await expect(page.locator("#login-panel")).toBeVisible();
  await page.goto(base + "/peluang");
  await expect(page.locator("#login-panel")).toBeVisible();
  step("Keluar: sesi berakhir, data kembali terkunci");

  assert.deepEqual(errors, [], "Browser errors: " + errors.join("; "));
  console.log(`\nFounder browser acceptance: ${steps.length} checks passed.`);
} finally {
  await browser.close();
}
