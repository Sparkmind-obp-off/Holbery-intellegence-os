import { APP_VERSION } from "./founder";

const head = (title: string, script: string, css: string) =>
  `<!doctype html>
<html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${title}</title><link rel="stylesheet" href="/static/${css}"><script src="/static/${script}" defer></script></head>`;

// Founder workspace: plain Bahasa Indonesia, six stable areas.
export function founderShell(locked = false) {
  const nav = [
    ["/", "beranda", "Beranda"],
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
<section id="login-panel" class="login" aria-labelledby="login-title"><section class="login-card"><p class="brand"><span class="brand-mark" aria-hidden="true">H</span> HOLBERY Intelligence OS</p><h1 id="login-title">Ruang keputusan bisnismu</h1><p class="lead">HIO mengamati pasar, menyusun bukti, lalu meminta persetujuanmu sebelum melakukan langkah penting.</p><p id="access-state" class="access-state ${locked ? "warn" : "ok"}" role="status">${locked ? "Ruang kerja sedang dikunci karena pengaturan akses belum selesai. Data bisnismu tidak terbuka. Asisten AI akan menyelesaikannya; kamu tidak perlu menyiapkan apa pun." : "Perlindungan akses aktif. Masukkan kata sandi aksesmu untuk masuk."}</p><form id="login-form" data-locked="${locked}"><label for="login-password">Kata sandi akses</label><input id="login-password" type="password" autocomplete="current-password" required maxlength="256" disabled><button type="submit" disabled>Masuk</button></form><div id="login-error" role="alert"></div><details class="recovery"><summary>Lupa kata sandi?</summary><p>Kata sandi akses dibagikan melalui tautan pribadi dari asisten AI. Jika tautannya tidak kamu temukan atau kamu curiga kata sandi bocor, minta asisten AI membuat kata sandi baru. Kata sandi lama otomatis tidak berlaku. Kamu tidak perlu mengatur apa pun sendiri.</p></details></section></section>
<div id="workspace" hidden><header class="topbar"><a class="brand" href="/"><span class="brand-mark" aria-hidden="true">H</span><span>HOLBERY <small>Intelligence OS</small></span></a><button id="menu-toggle" class="ghost" aria-controls="primary-nav" aria-expanded="false">Menu</button><nav id="primary-nav" aria-label="Navigasi utama">${nav}</nav><div class="account"><span id="founder-name">Founder</span><button id="logout-button" class="ghost">Keluar</button></div></header>
<main id="main-content" tabindex="-1"><div id="notice" role="status" aria-live="polite"></div><div id="page-content" aria-live="polite"></div></main>
<footer class="footer"><span>HIO menyiapkan bukti. Keputusan tetap di tanganmu.</span></footer></div>
<dialog id="detail-dialog" aria-labelledby="dialog-title"><header><h2 id="dialog-title">Detail</h2><button id="close-dialog" class="ghost" aria-label="Tutup">Tutup</button></header><div id="dialog-content"></div></dialog></body></html>`;
}

// Owner-only maintenance area (technical). Reached only via an explicit link in Pengaturan.
export function maintenanceShell() {
  return `${head("Pemeliharaan · HIO", "maintenance.js", "style.css")}
<body><a class="skip-link" href="#main-content">Lewati navigasi</a>
<section id="login-panel" hidden aria-labelledby="login-title"><div class="login-card"><h1 id="login-title">Sesi berakhir</h1><p><a href="/">Kembali ke ruang kerja untuk masuk lagi</a></p><form id="login-form" hidden><input id="operator-secret" data-locked="true" disabled></form><p id="login-error"></p></div></section>
<div id="workspace"><aside id="sidebar"><a class="wordmark" href="/"><span class="brand-mark">H</span><span>HOLBERY<small>PEMELIHARAAN</small></span></a><p class="nav-label">KEMBALI</p><nav aria-label="Kembali"><a href="/" data-external="true">← Ruang kerja founder</a></nav><p class="nav-label">TECHNICAL DIAGNOSTICS</p><nav aria-label="Diagnostik"><a href="/pemeliharaan" data-page="overview">Overview</a><a href="/pemeliharaan/intelligence" data-page="intelligence">Research briefs</a><a href="/pemeliharaan/sources" data-page="sources">Source registry</a><a href="/pemeliharaan/runs" data-page="runs">Collection runs</a><a href="/pemeliharaan/evidence" data-page="evidence">Evidence store</a><a href="/pemeliharaan/clusters" data-page="clusters">Problem clusters</a><a href="/pemeliharaan/opportunities" data-page="opportunities">Opportunity dossier</a><a href="/pemeliharaan/decisions" data-page="decisions">Decision ledger</a><a href="/pemeliharaan/experiments" data-page="experiments">Experiments</a><a href="/pemeliharaan/plugins" data-page="plugins">Plugins & MCP</a><a href="/pemeliharaan/settings" data-page="settings">Settings & audit</a><a href="/pemeliharaan/secrets" data-page="secrets">Secrets Owner</a><a href="/pemeliharaan/manual" data-page="manual">Technical manual</a></nav><div class="sidebar-bottom"><span class="status-dot"></span> Owner-only maintenance<small>v${APP_VERSION}</small></div></aside>
<div class="workspace-body"><header id="topbar"><button id="menu-toggle" class="quiet" aria-controls="sidebar" aria-expanded="false" aria-label="Buka navigasi">☰</button><p>PEMELIHARAAN <span>/</span> <strong id="breadcrumb">Overview</strong></p><div class="operator"><span class="pill warm">TECHNICAL</span><span id="operator-name">Owner</span><button id="logout-button" class="quiet">Keluar</button></div></header><main id="main-content" tabindex="-1"><div id="notice" role="status" aria-live="polite"></div><section id="page-content" aria-live="polite"></section></main><footer>Area teknis khusus pemilik. Tidak diperlukan untuk pekerjaan sehari-hari.<span>HIO / ${APP_VERSION}</span></footer></div></div>
<dialog id="detail-dialog" aria-labelledby="dialog-title"><header><h2 id="dialog-title">Record detail</h2><button id="close-dialog" class="quiet" aria-label="Tutup detail">×</button></header><div id="dialog-content"></div></dialog></body></html>`;
}

export function notFoundPage() {
  return `<!doctype html>
<html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Halaman tidak ditemukan · HIO</title><link rel="stylesheet" href="/static/founder.css"></head>
<body><main class="login"><section class="login-card"><p class="brand"><span class="brand-mark" aria-hidden="true">H</span> HOLBERY Intelligence OS</p><h1>Halaman tidak ditemukan</h1><p class="lead">Alamat ini tidak ada atau sudah dipindahkan. Data bisnismu tidak terpengaruh.</p><a class="button" href="/">Kembali ke Beranda</a></section></main></body></html>`;
}
