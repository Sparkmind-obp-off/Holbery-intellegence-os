import { APP_VERSION } from "./founder";

const head = (title: string, script: string, css: string) =>
  `<!doctype html>
<html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${title}</title><link rel="stylesheet" href="/static/${css}"><script src="/static/${script}" defer></script></head>`;

// Founder workspace: plain Bahasa Indonesia, six stable areas.
export function founderShell(locked = false) {
  const nav = [
    ["/founder", "beranda", "Beranda"],
    ["/intelijen", "intelijen", "Intelijen Pasar"],
    ["/peluang", "peluang", "Peluang"],
    ["/produk", "produk", "Produk & Eksperimen"],
    ["/publikasi", "publikasi", "Insight & Publikasi"],
    ["/pengaturan", "pengaturan", "Pengaturan"],
  ]
    .map(
      ([href, page, label]) =>
        `<a href="${href}" data-page="${page}">${label}</a>`,
    )
    .join("");
  return `${head("HOLBERY Intelligence OS", "founder.js", "founder.css")}
<body><a class="skip-link" href="#main-content">Lewati ke isi utama</a>
<section id="login-panel" class="login" aria-labelledby="login-title"><section class="login-card"><p class="brand"><span class="brand-mark" aria-hidden="true">H</span> HOLBERY Intelligence OS · Akses founder</p><h1 id="login-title">Ruang keputusan bisnismu</h1><p class="lead">HIO mengamati pasar, menyusun bukti, lalu meminta persetujuanmu sebelum melakukan langkah penting.</p><p id="access-state" class="access-state ${locked ? "warn" : "ok"}" role="status">${locked ? "Ruang kerja sedang dikunci karena pengaturan akses belum selesai. Data bisnismu tidak terbuka. Asisten AI akan menyelesaikannya; kamu tidak perlu menyiapkan apa pun." : "Perlindungan akses aktif. Masukkan kata sandi aksesmu untuk masuk."}</p><form id="login-form" data-locked="${locked}"><label for="login-password">Kata sandi akses</label><input id="login-password" type="password" autocomplete="current-password" required maxlength="256" disabled><button type="submit" disabled>Masuk</button></form><div id="login-error" role="alert"></div><details class="recovery"><summary>Lupa kata sandi?</summary><p>Kata sandimu tersimpan di folder pribadi pemilik <strong>HIO_Private_Release</strong> di AI Drive. Jika tidak ditemukan atau kamu curiga kata sandi bocor, minta asisten AI membuat kata sandi baru. Kata sandi lama otomatis tidak berlaku, dan kamu tidak perlu menyiapkan apa pun secara teknis.</p></details><p class="small founder-alt">Bukan founder? <a href="/masuk">Masuk sebagai pelanggan</a> · <a href="/">Kembali ke halaman utama</a></p></section></section>
<div id="workspace" hidden><header class="topbar"><a class="brand" href="/founder"><span class="brand-mark" aria-hidden="true">H</span><span>HOLBERY <small>Intelligence OS</small></span></a><button id="menu-toggle" class="ghost" aria-controls="primary-nav" aria-expanded="false">Menu</button><nav id="primary-nav" aria-label="Navigasi utama">${nav}</nav><div class="account"><a href="/agent" class="ghost">AI Workspace ↗</a><span id="founder-name">Founder</span><button id="logout-button" class="ghost">Keluar</button></div></header>
<main id="main-content" tabindex="-1"><div id="notice" role="status" aria-live="polite"></div><div id="page-content" aria-live="polite"></div></main>
<footer class="footer"><span>HIO menyiapkan bukti. Keputusan tetap di tanganmu.</span><span>Versi ${APP_VERSION}</span></footer></div>
<dialog id="detail-dialog" aria-labelledby="dialog-title"><header><h2 id="dialog-title">Detail</h2><button id="close-dialog" class="ghost" aria-label="Tutup">Tutup</button></header><div id="dialog-content"></div></dialog></body></html>`;
}

// Owner-only maintenance area (technical). Reached only via an explicit link in Pengaturan.
export function maintenanceShell() {
  return `${head("Pemeliharaan · HIO", "maintenance.js", "style.css")}
<body><a class="skip-link" href="#main-content">Lewati navigasi</a>
<section id="login-panel" hidden aria-labelledby="login-title"><div class="login-card"><h1 id="login-title">Sesi berakhir</h1><p><a href="/founder/login">Masuk lagi sebagai founder</a></p><form id="login-form" hidden><input id="operator-secret" data-locked="true" disabled></form><p id="login-error"></p></div></section>
<div id="workspace"><aside id="sidebar"><a class="wordmark" href="/founder"><span class="brand-mark">H</span><span>HOLBERY<small>PEMELIHARAAN</small></span></a><p class="nav-label">KEMBALI</p><nav aria-label="Kembali"><a href="/founder" data-external="true">← Ruang kerja founder</a></nav><p class="nav-label">TECHNICAL DIAGNOSTICS</p><nav aria-label="Diagnostik"><a href="/pemeliharaan" data-page="overview">Overview</a><a href="/pemeliharaan/intelligence" data-page="intelligence">Research briefs</a><a href="/pemeliharaan/sources" data-page="sources">Source registry</a><a href="/pemeliharaan/runs" data-page="runs">Collection runs</a><a href="/pemeliharaan/evidence" data-page="evidence">Evidence store</a><a href="/pemeliharaan/clusters" data-page="clusters">Problem clusters</a><a href="/pemeliharaan/opportunities" data-page="opportunities">Opportunity dossier</a><a href="/pemeliharaan/decisions" data-page="decisions">Decision ledger</a><a href="/pemeliharaan/experiments" data-page="experiments">Experiments</a><a href="/pemeliharaan/plugins" data-page="plugins">Plugins & MCP</a><a href="/pemeliharaan/settings" data-page="settings">Settings & audit</a><a href="/pemeliharaan/secrets" data-page="secrets">Secrets Owner</a><a href="/pemeliharaan/manual" data-page="manual">Technical manual</a></nav><div class="sidebar-bottom"><span class="status-dot"></span> Owner-only maintenance<small>v${APP_VERSION}</small></div></aside>
<div class="workspace-body"><header id="topbar"><button id="menu-toggle" class="quiet" aria-controls="sidebar" aria-expanded="false" aria-label="Buka navigasi">☰</button><p>PEMELIHARAAN <span>/</span> <strong id="breadcrumb">Overview</strong></p><div class="operator"><span class="pill warm">TECHNICAL</span><span id="operator-name">Owner</span><button id="logout-button" class="quiet">Keluar</button></div></header><main id="main-content" tabindex="-1"><div id="notice" role="status" aria-live="polite"></div><section id="page-content" aria-live="polite"></section></main><footer>Area teknis khusus pemilik. Tidak diperlukan untuk pekerjaan sehari-hari.<span>HIO / ${APP_VERSION}</span></footer></div></div>
<dialog id="detail-dialog" aria-labelledby="dialog-title"><header><h2 id="dialog-title">Record detail</h2><button id="close-dialog" class="quiet" aria-label="Tutup detail">×</button></header><div id="dialog-content"></div></dialog></body></html>`;
}

export function notFoundPage() {
  return `<!doctype html>
<html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Halaman tidak ditemukan · HIO</title><link rel="stylesheet" href="/static/founder.css"></head>
<body><main class="login"><section class="login-card"><p class="brand"><span class="brand-mark" aria-hidden="true">H</span> HOLBERY Intelligence OS</p><h1>Halaman tidak ditemukan</h1><p class="lead">Alamat ini tidak ada atau sudah dipindahkan. Data bisnismu tidak terpengaruh.</p><a class="button" href="/">Kembali ke Beranda</a></section></main></body></html>`;
}

// Customer area (Clerk). Separate from the founder workspace: no founder
// navigation, no diagnostics. Clerk's browser SDK is loaded by customer.js from
// the instance's own Frontend API (allowed only by the customer CSP).
export function customerShell() {
  return `<!doctype html>
<html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>HOLBERY Intelligence OS · Ruang pelanggan</title><link rel="stylesheet" href="/static/founder.css"><link rel="stylesheet" href="/static/customer.css"><script src="/static/clerk-id.js" defer></script><script src="/static/customer.js" defer></script></head>
<body><a class="skip-link" href="#main-content">Lewati ke isi utama</a>
<header class="topbar"><a class="brand" href="/ruang"><span class="brand-mark" aria-hidden="true">H</span><span>HOLBERY <small>Ruang pelanggan</small></span></a><nav id="customer-nav" aria-label="Navigasi pelanggan" hidden><a href="/ruang" data-page="ruang">Ruang kerja</a><a href="/ruang/brief" data-page="brief">Brief riset</a></nav><div class="account"><span id="customer-email"></span><div id="clerk-user-button"></div></div></header>
<main id="main-content" tabindex="-1"><div id="customer-notice" role="status" aria-live="polite"></div><section id="customer-content" aria-live="polite"><p class="lead">Memuat…</p></section><div id="clerk-sign-in"></div></main>
<footer class="footer"><span>Uji coba terbatas khusus undangan.</span><span>Versi ${APP_VERSION}</span></footer></body></html>`;
}

// Public landing page: the single public entry point. Only describes what HIO
// actually does today; no testimonials, numbers or certifications.
export function landingPage() {
  const cap = (
    name: string,
    status: "live" | "beta" | "planned",
    text: string,
  ) =>
    `<li class="cap"><div class="cap-head"><h3>${name}</h3><span class="cap-status ${status}">${status === "live" ? "Tersedia" : status === "beta" ? "Beta" : "Direncanakan"}</span></div><p>${text}</p></li>`;
  return `<!doctype html>
<html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><meta name="description" content="HOLBERY Intelligence OS: ruang kerja bisnis berbasis AI untuk riset pasar dengan bukti bersumber, analisis peluang, dan keputusan yang tetap di tanganmu."><title>HOLBERY Intelligence OS — Ruang kerja bisnis berbasis AI</title><link rel="stylesheet" href="/static/founder.css"><link rel="stylesheet" href="/static/landing.css"></head>
<body class="landing"><a class="skip-link" href="#main-content">Lewati ke isi utama</a>
<header class="lp-top"><a class="brand" href="/" aria-label="HOLBERY Intelligence OS, beranda"><span class="brand-mark" aria-hidden="true">H</span><span>HOLBERY <small>Intelligence OS</small></span></a><nav class="lp-nav" aria-label="Navigasi utama"><a href="#kemampuan">Kemampuan</a><a href="#ruang-kerja">Ruang kerja</a><a href="#akses">Akses</a><a class="button lp-signin" href="/masuk">Masuk</a></nav></header>
<main id="main-content" tabindex="-1">
<section class="lp-hero" aria-labelledby="hero-title"><p class="eyebrow">Ruang kerja bisnis berbasis AI</p><h1 id="hero-title">Riset pasar dengan bukti, keputusan tetap di tanganmu.</h1><p class="lead">HIO mencari informasi pasar dari web, menyusun bukti lengkap dengan sumbernya, memisahkan fakta dari tafsiran AI, lalu meminta persetujuanmu sebelum langkah penting.</p><div class="lp-cta"><a class="button" href="/masuk">Masuk ke ruang kerja</a><a class="button secondary" href="#akses">Minta undangan</a></div><p class="small">Saat ini uji coba terbatas khusus undangan.</p></section>
<section id="kemampuan" class="lp-section" aria-labelledby="cap-title"><h2 id="cap-title">Yang bisa dilakukan HIO</h2><p class="lead">Status di bawah apa adanya: yang tersedia sudah berjalan, yang lain masih dikembangkan.</p><ul class="caps">
${cap("Research", "live", "Riset pasar dari sumber web nyata. Setiap temuan menyertakan tautan sumber dan waktu pengambilan.")}
${cap("Analyze", "live", "Mengelompokkan masalah, menilai kekuatan bukti, dan menandai hal yang belum diketahui. Usulan produk tetap hipotesis sampai divalidasi.")}
${cap("Chat", "beta", "Asisten AI untuk menyusun strategi dan rencana validasi, saat ini untuk tim internal.")}
${cap("Build", "beta", "Agen coding yang mengusulkan perubahan kecil dan mengujinya di sandbox terisolasi. Tidak pernah merge atau deploy sendiri.")}
${cap("Create", "planned", "Menyusun dokumen dan materi peluncuran dari keputusan yang sudah disetujui.")}
</ul></section>
<section id="ruang-kerja" class="lp-section lp-split" aria-labelledby="ws-title"><div><h2 id="ws-title">Ruang kerja pelanggan</h2><p class="lead">Setiap pelanggan mendapat ruang kerja pribadi. Brief riset yang kamu simpan hanya terlihat oleh anggota ruang kerja itu, diperiksa di server untuk setiap permintaan.</p></div><ul class="plain lp-points"><li><strong>Brief riset</strong><span>Tulis pertanyaan, segmen, wilayah, dan masalah yang ingin dipahami.</span></li><li><strong>Bukti bersumber</strong><span>Fakta dan tafsiran AI ditampilkan terpisah.</span></li><li><strong>Kamu yang memutuskan</strong><span>Tidak ada publikasi, pengeluaran, atau tindakan eksternal tanpa persetujuan.</span></li></ul></section>
<section id="akses" class="lp-section lp-access" aria-labelledby="access-title"><h2 id="access-title">Akses</h2><div class="lp-cards"><article class="card"><h3>Pelanggan</h3><p>Sudah diundang? Masuk dengan email yang menerima undangan.</p><a class="button" href="/masuk">Masuk sebagai pelanggan</a></article><article class="card"><h3>Belum punya undangan</h3><p>HIO masih dalam uji coba terbatas. Undangan diberikan langsung oleh tim HOLBERY kepada calon pengguna yang dihubungi.</p><a class="button secondary" href="/masuk">Saya sudah punya undangan</a></article></div></section>
</main>
<footer class="footer lp-footer"><span>HOLBERY Intelligence OS · HIO menyiapkan bukti, keputusan tetap di tanganmu.</span><span><a href="/founder/login" class="lp-internal">Akses founder / internal</a> · Versi ${APP_VERSION}</span></footer>
</body></html>`;
}
