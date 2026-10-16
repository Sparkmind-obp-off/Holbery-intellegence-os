// HIO founder workspace. Plain Bahasa Indonesia only.
// Consumes founder-oriented response objects; never shows internal codes.
const $ = (s) => document.querySelector(s);
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const pages = {
  beranda: { path: "/", title: "Beranda" },
  intelijen: { path: "/intelijen", title: "Intelijen Pasar" },
  peluang: { path: "/peluang", title: "Peluang" },
  produk: { path: "/produk", title: "Produk & Eksperimen" },
  publikasi: { path: "/publikasi", title: "Insight & Publikasi" },
  pengaturan: { path: "/pengaturan", title: "Pengaturan" },
};
const fallbackProblem = {
  judul: "Ada gangguan di sistem",
  dampak: "Perubahan terakhirmu mungkin belum tersimpan.",
  langkah:
    "Coba lagi beberapa saat lagi. Jika terus terjadi, asisten AI akan memeriksanya; kamu tidak perlu memperbaiki apa pun.",
  perluKamu: false,
};
const offlineProblem = {
  judul: "Koneksi internet terputus",
  dampak: "HIO belum bisa memuat atau menyimpan data.",
  langkah: "Periksa koneksi internetmu, lalu coba lagi.",
  perluKamu: true,
};
let renderToken = 0;
let bootstrapping = true;

class Problem extends Error {
  constructor(info, status) {
    super(info.judul);
    this.info = info;
    this.status = status;
  }
}
const day = (s) =>
  s
    ? new Date(s).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";
const dayTime = (s) =>
  s
    ? new Date(s).toLocaleString("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

async function api(path, method = "GET", body) {
  let response;
  try {
    response = await fetch("/api" + path, {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-HIO-Request": "operator",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: "same-origin",
    });
  } catch {
    throw new Problem(offlineProblem, 0);
  }
  let data = {};
  try {
    data = await response.json();
  } catch {
    /* Non-readable reply is treated as a general disruption. */
  }
  if (!response.ok) {
    if (response.status === 401 && path !== "/session") showLogin(true);
    throw new Problem(data.error?.founder || fallbackProblem, response.status);
  }
  return data;
}

// ---------- shared building blocks ----------
const tag = (text, tone = "") =>
  `<span class="tag ${tone}">${esc(text)}</span>`;
const sampleTag = () => tag("Contoh data", "sample");
const statusTone = (s) =>
  /Lulus|Terbukti|Disetujui|Aktif|Selesai/.test(s)
    ? "good"
    : /Perlu|Menunggu/.test(s)
      ? "attention"
      : /Belum|Tidak/.test(s)
        ? "muted"
        : "info";
const card = (title, body, extra = "", id = "") =>
  `<section class="card"${id ? ` id="${id}"` : ""}><header class="card-head"><h2>${esc(title)}</h2>${extra}</header>${body}</section>`;
const emptyState = (title, text, action = "") =>
  `<div class="empty"><p class="empty-title">${esc(title)}</p><p>${esc(text)}</p>${action}</div>`;
const problemBox = (p) =>
  `<div class="problem" role="alert"><p class="problem-title">${esc(p.judul)}</p><p><strong>Dampaknya:</strong> ${esc(p.dampak)}</p><p><strong>${p.perluKamu ? "Yang perlu kamu lakukan" : "Langkah berikutnya"}:</strong> ${esc(p.langkah)}</p>${p.perluKamu ? "" : '<p class="small">Kamu tidak perlu melakukan apa pun saat ini.</p>'}</div>`;
const pageHead = (title, lead, extra = "") =>
  `<header class="page-head"><div><h1>${esc(title)}</h1><p class="lead">${esc(lead)}</p></div>${extra}</header>`;
const field = (name, label, hint = "", type = "textarea", max = 500) =>
  `<div class="field"><label for="f-${name}">${esc(label)}</label>${hint ? `<p class="hint" id="h-${name}">${esc(hint)}</p>` : ""}${type === "textarea" ? `<textarea id="f-${name}" name="${name}" required minlength="3" maxlength="${max}"${hint ? ` aria-describedby="h-${name}"` : ""}></textarea>` : `<input id="f-${name}" name="${name}" type="text" required minlength="3" maxlength="${max}"${hint ? ` aria-describedby="h-${name}"` : ""}>`}</div>`;
const sampleNotice = () =>
  `<aside class="sample-notice"><strong>Ini contoh data, bukan temuan pasar nyata.</strong> Contoh data dipakai untuk mencoba alur kerja. Jangan gunakan untuk keputusan bisnis sungguhan.</aside>`;

function notice(message, tone = "good") {
  const el = $("#notice");
  el.className = message ? "notice " + tone : "";
  el.textContent = message;
}
function showProblemNotice(p) {
  const el = $("#notice");
  el.className = "notice bad";
  el.innerHTML = problemBox(p);
}

function evidenceItem(e) {
  return `<article class="evidence ${e.mendukung ? "support" : "counter"}"><div class="evidence-meta">${tag(e.hubungan, e.mendukung ? "good" : "attention")}${e.contoh ? sampleTag() : ""}</div><blockquote>${esc(e.kutipan)}</blockquote><dl class="facts"><div><dt>Sumber</dt><dd>${e.tautanSumber ? `<a href="${esc(e.tautanSumber)}" target="_blank" rel="noopener noreferrer">${esc(e.sumber)}</a>` : esc(e.sumber)}</dd></div><div><dt>Tanggal sumber</dt><dd>${e.tanggalSumber ? day(e.tanggalSumber) : "Tidak berlaku (contoh data)"}</dd></div><div><dt>Dikumpulkan</dt><dd>${dayTime(e.tanggalDikumpulkan)}</dd></div><div><dt>Batasan</dt><dd>${esc(e.batasan)}</dd></div></dl></article>`;
}

// ---------- Beranda ----------
async function beranda() {
  const d = await api("/founder/home");
  const finding = d.temuan
    ? `<p class="big">${esc(d.temuan.ringkasan)}</p>${sampleTag()}<dl class="facts two"><div><dt>Mengapa penting</dt><dd>${esc(d.temuan.mengapaPenting)}</dd></div><div><dt>Kekuatan bukti</dt><dd><strong>${esc(d.temuan.kekuatanBukti.label)}</strong> — ${esc(d.temuan.kekuatanBukti.penjelasan)}</dd></div></dl><h3>Yang masih belum diketahui</h3><ul class="plain">${d.temuan.belumDiketahui.map((u) => `<li>${esc(u)}</li>`).join("")}</ul><p><a class="link" href="/peluang">Lihat peluang dan buktinya →</a></p>`
    : emptyState(
        "HIO belum menemukan apa pun",
        "Sumber informasi pasar nyata belum tersambung, dan contoh data belum dimuat. Belum ada temuan yang bisa ditampilkan.",
      );
  const next = d.langkahBerikutnya;
  const nextAction =
    next.aksi === "muat-contoh"
      ? `<button data-action="muat-contoh">Muat contoh data</button><p class="small">Aman: tidak ada yang diterbitkan, tidak ada orang yang dihubungi, dan tidak ada biaya.</p>`
      : `<a class="button" href="${esc(next.tautan)}">Buka</a>`;
  const waiting = d.menungguKamu.length
    ? `<ul class="todo">${d.menungguKamu.map((w) => `<li><a href="${esc(w.tautan)}"><strong>${esc(w.judul)}</strong><span>${esc(w.penjelasan)}</span></a></li>`).join("")}</ul>`
    : emptyState(
        "Tidak ada yang menunggu persetujuanmu",
        "Saat HIO membutuhkan keputusanmu, akan muncul di sini.",
      );
  const blockers = d.kendala
    .map(
      (k) =>
        `<li><strong>${esc(k.judul)}</strong><p>${esc(k.dampak)}</p><p class="small">${k.perluKamu ? "Perlu tindakanmu: " : "Tidak perlu tindakanmu. "}${esc(k.langkah)}</p></li>`,
    )
    .join("");
  return (
    pageHead(
      `Halo, ${d.sapaan}`,
      "Ini yang penting saat ini: temuan, keputusan yang menunggumu, dan langkah berikutnya.",
    ) +
    `<section class="next" aria-labelledby="next-title"><p class="eyebrow">Langkah yang disarankan</p><h2 id="next-title">${esc(next.judul)}</h2><p>${esc(next.alasan)}</p>${nextAction}</section>` +
    `<div class="grid">` +
    card(
      "Yang HIO temukan",
      finding,
      tag(`${d.temuanPasarNyata} temuan pasar nyata`, "muted"),
      "home-finding",
    ) +
    card(
      "Menunggu persetujuanmu",
      waiting,
      d.menungguKamu.length
        ? tag(`${d.menungguKamu.length} hal`, "attention")
        : "",
      "home-waiting",
    ) +
    `</div>` +
    card("Kendala saat ini", `<ul class="blockers">${blockers}</ul>`) +
    card(
      "Kemajuan HIO",
      progressTable(d.kemajuan),
      `<span class="small">Diperbarui dari pemeriksaan nyata, bukan dari rencana.</span>`,
      "home-progress",
    ) +
    (d.contohData.aktif
      ? `<p class="small">Contoh data sedang aktif${d.contohData.terakhirDimuat ? ` (terakhir dimuat ${dayTime(d.contohData.terakhirDimuat)})` : ""}. <button class="ghost inline" data-action="hentikan-contoh">Hentikan contoh data</button></p>`
      : "")
  );
}
function progressTable(stages) {
  return `<ol class="progress">${stages
    .map(
      (s) =>
        `<li><div class="progress-head"><strong>${esc(s.tahap)}</strong>${tag(s.status, statusTone(s.status))}</div><p>${esc(s.memungkinkan)}</p><dl class="facts"><div><dt>Yang sudah diperiksa</dt><dd>${esc(s.terverifikasi)}</dd></div><div><dt>Yang belum selesai</dt><dd>${esc(s.belumSelesai)}</dd></div><div><dt>${s.perluKamu ? "Perlu tindakanmu" : "Langkah berikutnya"}</dt><dd>${esc(s.langkah)}</dd></div></dl></li>`,
    )
    .join("")}</ol>`;
}

// ---------- Intelijen Pasar ----------
async function intelijen() {
  const d = await api("/founder/market");
  const patterns = d.pola.length
    ? d.pola
        .map(
          (p) =>
            `<article class="pattern"><h3>${esc(p.judul)}</h3><p>${tag(p.status, "attention")} ${sampleTag()}</p><p>${p.jumlahBukti} bukti terkait. ${esc(p.catatan)}</p></article>`,
        )
        .join("")
    : emptyState(
        "Belum ada pola yang terlihat",
        "Pola muncul setelah ada beberapa bukti yang saling berkaitan.",
      );
  const evidence = d.bukti.length
    ? (d.bukti.some((e) => e.contoh) ? sampleNotice() : "") +
      d.bukti.map(evidenceItem).join("")
    : emptyState(
        "Belum ada bukti",
        "Sumber informasi pasar nyata belum tersambung. Kamu bisa memuat contoh data dari Beranda untuk melihat cara HIO menyajikan bukti.",
        '<a class="link" href="/">Ke Beranda →</a>',
      );
  const questions = d.pertanyaan.length
    ? `<ul class="questions">${d.pertanyaan.map((q) => `<li><button class="row-button" data-action="lihat-pertanyaan" data-id="${esc(q.id)}"><strong>${esc(q.pertanyaan)}</strong><span>${esc(q.segmen)} · ${esc(q.wilayah)} · ${day(q.tanggal)}</span><span class="small">${esc(q.status)}</span></button></li>`).join("")}</ul>`
    : emptyState(
        "Belum ada pertanyaan riset",
        "Tulis pertanyaan pertama yang ingin kamu jawab tentang pasar.",
      );
  return (
    pageHead(
      "Intelijen Pasar",
      "Pengamatan, masalah yang berulang, sumber, tanggal, serta bukti yang mendukung maupun yang membantah.",
      tag(`${d.temuanPasarNyata} temuan pasar nyata`, "muted"),
    ) +
    `<aside class="info">${esc(d.catatanSumber)}</aside>` +
    card("Pola yang terlihat", patterns) +
    card("Bukti yang ditemukan", evidence, "", "market-evidence") +
    card(
      "Ajukan pertanyaan riset",
      `<form id="question-form" class="form"><p class="small">HIO akan menyimpan pertanyaanmu dan menyusun apa yang perlu dicari, apa yang bisa membantah, dan apa yang belum diketahui. Belum ada informasi yang dikumpulkan secara otomatis. Jangan masukkan data pribadi atau kata sandi.</p>${field("question", "Apa yang ingin kamu ketahui?", "Contoh: Apakah toko daring kecil di Jawa Timur kesulitan mengatur stok?")}${field("segment", "Siapa yang mengalami masalahnya?", "Contoh: Pemilik toko daring dengan 1–5 karyawan", "input", 120)}${field("geography", "Di mana?", "Contoh: Indonesia, Jawa Timur", "input", 120)}${field("problem", "Masalah apa yang kamu duga?")}${field("payerHypothesis", "Siapa yang kamu duga mau membayar?", "", "textarea", 300)}<div class="actions"><button type="submit">Simpan pertanyaan</button></div></form>`,
      "",
      "question-card",
    ) +
    card("Pertanyaan riset tersimpan", questions)
  );
}
async function showQuestion(id) {
  const q = await api("/founder/questions/" + encodeURIComponent(id));
  const list = (items) =>
    `<ul class="plain">${items.map((v) => `<li>${esc(v)}</li>`).join("")}</ul>`;
  openDialog(
    "Rencana riset",
    `<p class="big">${esc(q.pertanyaan)}</p><p>${tag(q.status, "muted")}</p><dl class="facts"><div><dt>Siapa</dt><dd>${esc(q.segmen)}</dd></div><div><dt>Di mana</dt><dd>${esc(q.wilayah)}</dd></div><div><dt>Dugaan masalah</dt><dd>${esc(q.dugaanMasalah)}</dd></div><div><dt>Dugaan pembayar</dt><dd>${esc(q.dugaanPembayar)}</dd></div></dl><h3>Yang akan dicari</h3>${list(q.yangAkanDicari)}<h3>Yang bisa membantah dugaan ini</h3>${list(q.yangBisaMembantah)}<h3>Yang belum diketahui</h3>${list(q.belumDiketahui)}<h3>Boleh dilakukan sekarang</h3>${list(q.bolehSekarang)}<h3>Belum boleh dilakukan</h3>${list(q.belumBoleh)}`,
  );
}

// ---------- Peluang ----------
async function peluang() {
  const d = await api("/founder/opportunities");
  if (!d.peluang.length)
    return (
      pageHead(
        "Peluang",
        "Siapa yang punya masalah, seberapa mendesak, dan mengapa layak diperhatikan.",
      ) + emptyState("Belum ada peluang", d.catatan)
    );
  return (
    pageHead(
      "Peluang",
      "Siapa yang punya masalah, seberapa mendesak, dan mengapa layak diperhatikan.",
    ) + d.peluang.map(opportunityBlock).join("")
  );
}
function opportunityBlock(o) {
  const evidence = o.bukti.length
    ? o.bukti.map(evidenceItem).join("")
    : emptyState(
        "Belum ada bukti untuk peluang ini",
        "Muat contoh data dari Beranda untuk melihat bukti pendukung dan bukti berlawanan.",
        '<a class="link" href="/">Ke Beranda →</a>',
      );
  const history = o.riwayatKeputusan.length
    ? `<ol class="history">${o.riwayatKeputusan.map((h) => `<li><strong>${esc(h.keputusan)}</strong> <span class="small">${dayTime(h.tanggal)} · oleh ${esc(h.oleh)}</span><p>${esc(h.alasan)}</p>${h.catatan && h.catatan !== "Tidak ada catatan tambahan." ? `<p class="small">Catatan: ${esc(h.catatan)}</p>` : ""}</li>`).join("")}</ol>`
    : emptyState(
        "Belum ada keputusan",
        "Keputusanmu akan tercatat di sini bersama alasannya.",
      );
  return `<article class="opportunity" id="opportunity-${esc(o.id)}">
${o.contoh ? sampleNotice() : ""}
${card(
  o.judul,
  `<p class="big">${esc(o.dugaan)}</p><p>${tag(o.status, statusTone(o.status))} ${tag("Dugaan, belum terverifikasi", "attention")}</p><dl class="facts two"><div><dt>Siapa yang punya masalah</dt><dd>${esc(o.siapa)}</dd></div><div><dt>Cara mereka mengatasinya sekarang</dt><dd>${esc(o.caraSekarang)}</dd></div><div><dt>Siapa yang mungkin membayar</dt><dd>${esc(o.pembayar)}</dd></div><div><dt>Mengapa layak diperhatikan</dt><dd>${esc(o.alasanPerhatian)}</dd></div><div><dt>Kekuatan bukti</dt><dd><strong>${esc(o.kekuatanBukti.label)}</strong> — ${esc(o.kekuatanBukti.penjelasan)}</dd></div><div><dt>Jumlah bukti</dt><dd>${o.jumlahMendukung} mendukung · ${o.jumlahBerlawanan} berlawanan${o.rasioContoh ? `<br><span class="small">${esc(o.rasioContoh)}</span>` : ""}</dd></div></dl><h3>Ketidakpastian</h3><p>${esc(o.ketidakpastian)}</p><h3>Yang belum diketahui</h3><ul class="plain">${o.yangBelumDiketahui.map((u) => `<li>${esc(u)}</li>`).join("")}</ul>`,
)}
${card("Bukti pendukung dan berlawanan", evidence)}
${decisionCard(o)}
${card("Riwayat keputusan", history)}
</article>`;
}
function decisionCard(o) {
  if (!o.bukti.length)
    return card(
      "Keputusanmu",
      emptyState(
        "Belum bisa diputuskan",
        "Keputusan baru bisa diambil setelah ada bukti untuk ditinjau.",
      ),
    );
  if (o.persetujuanAktif)
    return card(
      "Keputusanmu",
      o.bolehBuatUjiCoba
        ? `<p>Kamu sudah menyetujui uji coba latihan. Persetujuan berlaku sampai <strong>${day(o.persetujuanAktif.berlakuSampai)}</strong>.</p><a class="button" href="/produk">Buat uji coba</a>`
        : `<p>Kamu sudah menyetujui dan uji cobanya sudah dibuat.</p><a class="link" href="/produk">Lihat uji coba →</a>`,
    );
  const recommendation = o.bisaDisetujui
    ? "Saran HIO: setujui satu uji coba latihan tanpa biaya untuk mencoba alur keputusan. Alasannya, sudah ada bukti pendukung dan bukti berlawanan, dan uji coba ini tidak punya risiko. Namun ingat: semua bukti di sini adalah contoh data, jadi ini bukan keputusan bisnis nyata."
    : "Saran HIO: belum cukup bukti. Teliti lebih lanjut atau tunda dulu. Tidak melakukan apa-apa juga pilihan yang sah.";
  return card(
    "Keputusanmu",
    `<p class="recommendation">${esc(recommendation)}</p><p><strong>Jika kamu setujui:</strong> ${esc(o.jikaDisetujui)}</p><form id="decision-form" class="form"><fieldset><legend>Pilih keputusan</legend><div class="choices"><label class="choice"><input type="radio" name="pilihan" value="setujui" required${o.bisaDisetujui ? "" : " disabled"}><span><strong>Setujui</strong><small>Izinkan satu uji coba latihan tanpa biaya</small></span></label><label class="choice"><input type="radio" name="pilihan" value="tolak"><span><strong>Tolak</strong><small>Peluang ini tidak dilanjutkan</small></span></label><label class="choice"><input type="radio" name="pilihan" value="ubah"><span><strong>Ubah dulu</strong><small>Perlu diteliti atau disesuaikan</small></span></label><label class="choice"><input type="radio" name="pilihan" value="nanti"><span><strong>Putuskan nanti</strong><small>Ingatkan lagi dalam 7 hari</small></span></label></div></fieldset><div class="field"><label for="f-alasan">Alasan singkatmu</label><textarea id="f-alasan" name="alasan" required maxlength="2000"></textarea></div><div class="field"><label for="f-catatan">Catatan tambahan (boleh dikosongkan)</label><textarea id="f-catatan" name="catatan" maxlength="2000"></textarea></div><div class="actions"><button type="submit">Simpan keputusan</button><span class="small">Tidak ada tindakan ke luar yang dijalankan saat kamu menyimpan.</span></div></form>`,
    "",
    "decision-card",
  );
}

// ---------- Produk & Eksperimen ----------
async function produk() {
  const d = await api("/founder/experiments");
  const create = d.bisaMembuat
    ? card(
        "Buat uji coba yang sudah kamu setujui",
        `<form id="experiment-form" class="form"><p class="small">Biaya: Rp0. Tidak ada yang diterbitkan, dihubungi, atau dibeli. Persetujuan berlaku sampai ${day(d.persetujuan.berlakuSampai)}.</p>${field("tujuan", "Apa yang ingin kamu uji?", "Tulis dugaan yang bisa terbukti salah.")}${field("ukuranBerhasil", "Kapan uji coba dianggap berhasil?")}${field("kapanBerhenti", "Kapan uji coba harus dihentikan?")}<div class="actions"><button type="submit">Buat uji coba</button></div></form>`,
        "",
        "experiment-card",
      )
    : `<aside class="info">Uji coba baru bisa dibuat setelah kamu menyetujuinya di halaman Peluang. <a class="link" href="/peluang">Ke Peluang →</a></aside>`;
  const list = d.ujiCoba.length
    ? d.ujiCoba
        .map(
          (e) =>
            `<article class="experiment"><div class="progress-head"><strong>${esc(e.tujuan)}</strong>${tag(e.status, e.selesai ? "good" : "info")}</div><dl class="facts two"><div><dt>Ukuran berhasil</dt><dd>${esc(e.ukuranBerhasil)}</dd></div><div><dt>Kapan berhenti</dt><dd>${esc(e.kapanBerhenti)}</dd></div><div><dt>Biaya</dt><dd>${esc(e.biaya)}</dd></div><div><dt>Tinjau ulang</dt><dd>${day(e.tinjauUlang)}</dd></div></dl>${e.selesai ? `<h3>Hasil</h3><p>${esc(e.hasil)}</p><h3>Pelajaran</h3><p>${esc(e.pelajaran)}</p>` : `<form class="form result-form" data-id="${esc(e.id)}"><div class="field"><label for="r-hasil-${esc(e.id)}">Apa yang benar-benar terjadi?</label><textarea id="r-hasil-${esc(e.id)}" name="hasil" required maxlength="2000"></textarea></div><div class="field"><label for="r-pelajaran-${esc(e.id)}">Apa pelajarannya, termasuk jika gagal?</label><textarea id="r-pelajaran-${esc(e.id)}" name="pelajaran" required maxlength="2000"></textarea></div><div class="actions"><button type="submit">Catat hasil</button><span class="small">Hasil yang dicatat tidak bisa diubah.</span></div></form>`}</article>`,
        )
        .join("")
    : emptyState(
        "Belum ada uji coba",
        "Uji coba muncul di sini setelah kamu menyetujui peluang dan membuatnya.",
      );
  return (
    pageHead(
      "Produk & Eksperimen",
      "Konsep, uji coba, ukuran berhasil dan berhenti, hasil nyata, dan keputusan untuk lanjut, ubah, atau berhenti.",
    ) +
    create +
    card("Uji coba", list, "", "experiment-list")
  );
}

// ---------- Insight & Publikasi ----------
async function publikasi() {
  return (
    pageHead(
      "Insight & Publikasi",
      "Insight berbasis bukti, draf, status tinjauan, persetujuanmu, dan tanggapan setelah terbit.",
    ) +
    card(
      "Belum ada insight",
      emptyState(
        "Bagian ini belum tersedia",
        "Insight hanya akan dibuat dari bukti pasar nyata, dan tidak akan pernah diterbitkan tanpa persetujuanmu. Saat ini sumber informasi pasar nyata belum tersambung, jadi belum ada yang bisa ditulis dengan jujur.",
      ) +
        `<h3>Cara kerjanya nanti</h3><ol class="steps"><li>HIO menyusun draf insight dari bukti nyata, lengkap dengan sumber dan batasannya.</li><li>Kamu meninjau, mengubah, menyetujui, atau menolak.</li><li>Hanya setelah kamu setujui, insight diterbitkan.</li><li>HIO mencatat tanggapan yang benar-benar terjadi.</li></ol>`,
    )
  );
}

// ---------- Pengaturan ----------
async function pengaturan() {
  const d = await api("/founder/settings");
  return (
    pageHead(
      "Pengaturan",
      "Akses, sumber informasi, privasi, dan pemulihan akun.",
    ) +
    card(
      "Akses kamu",
      `<p>${tag(d.akses.aktif ? "Perlindungan akses aktif" : "Perlindungan akses belum aktif", d.akses.aktif ? "good" : "attention")}</p><p>${esc(d.akses.status)}</p><dl class="facts"><div><dt>Masuk sebagai</dt><dd>${esc(d.akses.pengguna)}</dd></div><div><dt>Cara masuk</dt><dd>${esc(d.akses.caraMasuk)}</dd></div><div><dt>Jika lupa atau bocor</dt><dd>${esc(d.akses.pemulihan)}</dd></div></dl>`,
      "",
      "settings-access",
    ) +
    card(
      "Sumber informasi",
      `<ul class="sources">${d.sumber.map((s) => `<li><div class="progress-head"><strong>${esc(s.nama)}</strong>${tag(s.status, statusTone(s.status))}</div><p>${esc(s.penjelasan)}</p></li>`).join("")}</ul>`,
    ) +
    card(
      "Privasi",
      `<ul class="plain">${d.privasi.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>`,
    ) +
    `<details class="advanced"><summary>Lanjutan: area pemeliharaan</summary><p>Area ini berisi detail teknis untuk pemeliharaan sistem. Kamu tidak memerlukannya untuk pekerjaan sehari-hari.</p><a class="link" href="/pemeliharaan" data-external="true">Buka area pemeliharaan →</a></details>`
  );
}

const renderers = {
  beranda,
  intelijen,
  peluang,
  produk,
  publikasi,
  pengaturan,
};
function pageFromPath() {
  const path = location.pathname;
  return Object.keys(pages).find((k) => pages[k].path === path) || "beranda";
}
async function render(focus = false) {
  const token = ++renderToken;
  const page = pageFromPath();
  document.title = `${pages[page].title} · HIO`;
  document.querySelectorAll("#primary-nav a").forEach((a) => {
    const active = a.dataset.page === page;
    a.classList.toggle("active", active);
    if (active) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  $("#page-content").innerHTML =
    '<div class="loading" role="status"><span class="spinner" aria-hidden="true"></span> Memuat…</div>';
  try {
    const html = await renderers[page]();
    if (token !== renderToken) return;
    $("#page-content").innerHTML = html;
    if (focus) $("#main-content").focus();
  } catch (e) {
    if (token !== renderToken) return;
    if (e instanceof Problem && e.status === 401) return;
    $("#page-content").innerHTML =
      pageHead(pages[page].title, "") +
      problemBox(e instanceof Problem ? e.info : fallbackProblem) +
      '<button data-action="muat-ulang">Coba lagi</button>';
  }
}
async function act(button, work) {
  button.disabled = true;
  notice("");
  try {
    const message = await work();
    await render();
    if (message) notice(message);
  } catch (e) {
    if (!(e instanceof Problem && e.status === 401))
      showProblemNotice(e instanceof Problem ? e.info : fallbackProblem);
  } finally {
    button.disabled = false;
  }
}

// ---------- dialog ----------
function openDialog(title, html) {
  $("#dialog-title").textContent = title;
  $("#dialog-content").innerHTML = html;
  $("#detail-dialog").showModal();
}

// ---------- access ----------
function showLogin(expired = false) {
  $("#workspace").hidden = true;
  $("#login-panel").hidden = false;
  $("#login-password").value = "";
  if (expired)
    $("#login-error").innerHTML = problemBox({
      judul: "Sesimu sudah berakhir",
      dampak: "Data bisnismu tetap terlindungi dan tidak ada yang berubah.",
      langkah: "Masuk lagi dengan kata sandi aksesmu.",
      perluKamu: true,
    });
}
function showWorkspace(name) {
  $("#founder-name").textContent =
    !name || /operator|owner|admin|reviewer/i.test(name) ? "Founder" : name;
  $("#login-panel").hidden = true;
  $("#workspace").hidden = false;
  $("#login-error").textContent = "";
}

// ---------- events ----------
document.addEventListener("click", async (e) => {
  const link = e.target.closest("a[href^='/']");
  if (
    link &&
    !link.dataset.external &&
    !e.ctrlKey &&
    !e.metaKey &&
    !e.shiftKey &&
    Object.values(pages).some((p) => p.path === new URL(link.href).pathname)
  ) {
    e.preventDefault();
    history.pushState({}, "", link.href);
    $("#primary-nav").classList.remove("open");
    $("#menu-toggle").setAttribute("aria-expanded", "false");
    notice("");
    if ($("#detail-dialog").open) $("#detail-dialog").close();
    await render(true);
    return;
  }
  const button = e.target.closest("[data-action]");
  if (!button) return;
  const a = button.dataset.action;
  if (a === "muat-ulang") return render();
  if (a === "lihat-pertanyaan")
    return act(button, async () => {
      await showQuestion(button.dataset.id);
    });
  if (a === "muat-contoh")
    return act(
      button,
      async () => (await api("/founder/sample", "POST", {})).pesan,
    );
  if (a === "hentikan-contoh")
    return act(
      button,
      async () => (await api("/founder/sample/stop", "POST", {})).pesan,
    );
});
document.addEventListener("submit", async (e) => {
  const form = e.target;
  if (form.id === "login-form") return;
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  const button = form.querySelector('button[type="submit"]');
  if (form.id === "question-form")
    return act(button, async () => {
      const r = await api("/founder/questions", "POST", {
        question: data.question,
        segment: data.segment,
        geography: data.geography,
        problem: data.problem,
        payerHypothesis: data.payerHypothesis,
      });
      return r.pesan;
    });
  if (form.id === "decision-form") {
    if (
      data.pilihan === "setujui" &&
      !confirm(
        "Setujui satu uji coba latihan tanpa biaya? Tidak ada yang diterbitkan, dihubungi, atau dibeli.",
      )
    )
      return;
    return act(button, async () => {
      const r = await api("/founder/decisions", "POST", {
        pilihan: data.pilihan,
        alasan: data.alasan,
        ...(data.catatan ? { catatan: data.catatan } : {}),
      });
      return r.pesan;
    });
  }
  if (form.id === "experiment-form")
    return act(button, async () => {
      const r = await api("/founder/experiments", "POST", {
        tujuan: data.tujuan,
        ukuranBerhasil: data.ukuranBerhasil,
        kapanBerhenti: data.kapanBerhenti,
      });
      return r.pesan;
    });
  if (form.classList.contains("result-form"))
    return act(button, async () => {
      const r = await api(
        `/founder/experiments/${encodeURIComponent(form.dataset.id)}/result`,
        "POST",
        { hasil: data.hasil, pelajaran: data.pelajaran },
      );
      return r.pesan;
    });
});
$("#login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (bootstrapping || e.target.dataset.locked === "true") return;
  const button = e.target.querySelector("button");
  button.disabled = true;
  $("#login-error").textContent = "";
  try {
    const d = await api("/session", "POST", {
      secret: $("#login-password").value,
    });
    $("#login-password").value = "";
    showWorkspace(d.actor);
    await render(true);
  } catch (error) {
    $("#login-error").innerHTML = problemBox(
      error instanceof Problem ? error.info : fallbackProblem,
    );
  } finally {
    button.disabled = false;
  }
});
$("#logout-button").addEventListener("click", async () => {
  try {
    await api("/session", "DELETE");
  } catch {
    /* Session already ended; show sign-in regardless. */
  }
  showLogin();
  $("#login-error").innerHTML =
    '<p class="small">Kamu sudah keluar. Sampai jumpa lagi.</p>';
});
$("#menu-toggle").addEventListener("click", () => {
  const open = $("#primary-nav").classList.toggle("open");
  $("#menu-toggle").setAttribute("aria-expanded", String(open));
});
$("#close-dialog").addEventListener("click", () => $("#detail-dialog").close());
window.addEventListener("popstate", () => render());
(async () => {
  const locked = $("#login-form").dataset.locked === "true";
  try {
    const me = await api("/v1/me");
    showWorkspace(me.actor);
    await render();
  } catch {
    $("#workspace").hidden = true;
    $("#login-panel").hidden = false;
    $("#login-error").textContent = "";
  } finally {
    bootstrapping = false;
    $("#login-password").disabled = locked;
    $("#login-form button").disabled = locked;
  }
})();
