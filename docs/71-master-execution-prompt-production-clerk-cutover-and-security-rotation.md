# 71 — Master Execution Prompt: HIO Production Clerk Cutover & Security Rotation

**Tujuan:** gunakan prompt ini di agent coding/operasi yang membuka checkout terbaru repository Sparkmind-obp-off/Holbery-intellegence-os. Ini adalah tahap berikutnya setelah landing page publik dan jalur founder/pelanggan terpisah.

## Misi

Verifikasi keadaan repository dan Cloudflare yang sebenarnya, selesaikan integrasi Clerk Production jika prasyaratnya tersedia, pertahankan login founder, rotasi kredensial yang terpapar secara bertahap, lalu buktikan hasil dengan tes. Jangan berhenti pada rencana.

## Baseline yang wajib diverifikasi ulang

- Cloudflare Pages project: holbery-intelligence-os.
- Domain: https://hio.holbery.biz.id.
- Jalur publik: /; pelanggan: /masuk; founder: /founder/login; dashboard founder: /founder.
- Deployment terakhir yang sebelumnya teramati: 22f7ee2a-1074-40ab-a82c-d9332f545fcc, commit 81740c2288a580939418549abef655ae7db1a5cd. Jangan menganggapnya masih terbaru sebelum memeriksa.
- Laporan terakhir menyebut Clerk Development instance masih digunakan, dengan HIO_ALLOW_DEV_CLERK_IN_PROD=yes, sedangkan Clerk Production belum dikonfigurasi/terverifikasi. Perlakukan ini sebagai laporan, bukan fakta terkini sebelum diaudit.
- Spesifikasi Phase 1: docs/70-master-implementation-prompt-phase-1-clerk-tenant-isolation.md. Baca README, docs/62, docs/66–70, dan readiness board kanonis sebelum mengubah apa pun.

## Batas keras

1. HIO dan resource Cloudflare HIO saja. Jangan menyentuh HOLBERY Commerce, Bozq One System, ORDVELA, atau proyek lain.
2. Jangan membuat atau mengaktifkan GitHub Actions/CI.
3. Jangan menampilkan, mencetak, menebak, meng-hash, atau mengungkap sebagian nilai secret di chat, Git, PR, log, UI/API, bundle browser, D1, screenshot, maupun dokumen.
4. Jangan meminta pengguna menempelkan key rahasia ke chat. Periksa hanya nama/presence secret dan metadata non-rahasia.
5. Jangan mematikan fallback Development sebelum konfigurasi Production terbukti tersedia dan rencana rollback siap. Setelah cutover Production berhasil, fallback Development tidak boleh tetap diterima di production.
6. Jangan mengubah/merotasi credential produksi kecuali akses dan otorisasi yang sesuai tersedia serta jalur pemulihan terverifikasi. Jika tidak, lanjutkan pekerjaan aman dan laporkan blocker secara spesifik.
7. Tidak ada migrasi destruktif, penghapusan data, perubahan DNS/domain/Access policy, upgrade berbayar, atau perubahan resource lintas proyek.
8. Jangan deploy atau melakukan cutover autentikasi production sebelum preflight lolos dan rilis memang diotorisasi. Menulis prompt ini bukan izin otomatis untuk tindakan konsekuensial.

## Tahapan eksekusi

### 1. Audit aktual
- Periksa branch, HEAD, worktree, package scripts, auth middleware/routes, Clerk integration, Cloudflare config, migration, dan release scripts.
- Periksa metadata Pages project, deployment terbaru, domain, dan secret names/presence melalui API resmi yang diizinkan. Jangan membaca nilai secret. Jika API tidak bisa membuktikan presence, tandai UNKNOWN; jangan menebak.
- Bedakan hasil lokal, metadata konfigurasi, dan tes live. Berikan tabel ringkas item/sumber/status/bukti/blocker.

### 2. Prasyarat Clerk Production
Gunakan dokumentasi resmi Clerk terkini dan uji kesesuaian runtime Hono + Cloudflare Pages/Workers. Pastikan:
- Production instance tersedia untuk hio.holbery.biz.id dan verifikasi domain/DNS selesai.
- Allowed origins, callback/redirect, sign-out URLs, Google OAuth, dan email terverifikasi dikonfigurasi untuk domain production.
- CLERK_PUBLISHABLE_KEY dan CLERK_SECRET_KEY adalah konfigurasi berbeda; secret key server-side saja.
- Token diverifikasi menggunakan SDK yang didukung atau JWKS dengan signature, issuer, audience, expiry, not-before, dan aplikasi/domain yang diharapkan. Jangan sekadar decode JWT.
- Clerk menjawab identitas; HIO tetap memeriksa user, workspace, membership, dan role pada setiap request.
- Customer session tidak pernah memberi hak founder/operator. Founder auth harus tetap terpisah.

Jika key/domain Production tidak tersedia melalui kanal resmi yang diotorisasi, jangan membuat nilai palsu atau meminta secret di chat. Selesaikan pekerjaan source/config/test yang aman lalu jelaskan tindakan eksternal yang benar-benar dibutuhkan.

### 3. Konfigurasi fail-closed
- Pisahkan development, preview, dan production.
- Hapus HIO_ALLOW_DEV_CLERK_IN_PROD hanya setelah Production config terbukti dan rollback siap.
- Production harus gagal tertutup saat konfigurasi Production hilang/tidak valid; jangan merusak login founder atau landing page.
- Pertahankan kebijakan invite-only yang sudah diputuskan.
- Jangan deploy login pelanggan yang setengah terkonfigurasi.

### 4. Rotasi credential
Credential yang pernah tampil di chat/screenshot/log dianggap berpotensi terpapar. Audit provider dan binding name tanpa menampilkan nilainya. Kandidat yang dilaporkan: Clerk, GitHub, Daytona, Groq, Tavily, Firecrawl, Apify, Sentry.

- Verifikasi penggunaan, scope, dampak, dan jalur pemulihan setiap credential.
- Rotasi satu integrasi pada satu waktu: siapkan replacement melalui provider resmi, update binding HIO yang tepat, jalankan smoke test minimal, baru revoke credential lama jika aman.
- Jangan rotasi secara membabi buta; jangan menyentuh credential Commerce/Bozq/organisasi lain.
- Jangan melakukan pengujian yang mengakibatkan biaya tak disetujui.
- Catat provider, nama binding, waktu, status, dan verifikasi—tidak pernah nilai secret atau fragmennya.
- Jika otorisasi/akses tidak cukup, tandai BLOCKED. Jangan mengaku rotasi selesai.

### 5. Tes wajib
Jalankan jika tersedia dan aman, catat hasil persis:
- npm run check
- npm run security:check
- npm run test:founder
- npm run test:e2e
- test landing page dan Clerk khusus, termasuk test:clerk-live jika script tersedia.

Pastikan:
- sign-in/sign-out customer dan penolakan token invalid/expired/tampered;
- customer token ditolak oleh API founder;
- private routes tanpa sesi ditolak;
- founder login/logout/CSRF/origin protection tetap berfungsi;
- customer tidak dapat membaca data workspace pengguna lain jika tenant model tersedia;
- tidak ada secret di response, log, source map, browser bundle, atau test output.

Gunakan mock/local D1 untuk tes otomatis. Sign-in live dengan Development instance tidak memenuhi gate Production. Jangan membuat production test user atau memanggil API production tanpa otorisasi yang jelas.

### 6. Cutover dan release
Sebelum perubahan production, pastikan account/project/domain/D1 yang tepat, deployment terbaru, dan referensi rollback. Gunakan release process yang dijaga oleh repository; jangan memakai bypass untuk menyamarkan konfigurasi yang hilang.

Hanya jika Production config terverifikasi, tes relevan lolos, rilis diotorisasi, dan rollback layak:
1. Terapkan konfigurasi yang disetujui.
2. Deploy melalui proses resmi repo.
3. Uji landing page, sign-in customer Production, akses workspace/customer API, dan login/logout founder secara terpisah.
4. Pastikan endpoint privat menolak request anonim.
5. Pastikan Development fallback tidak diterima di production.
6. Catat deployment ID, commit, waktu, status route, dan hasil tes tanpa credential.

Jika ada gate gagal, hentikan cutover dan pertahankan deployment yang bekerja. Jangan gunakan locked-deploy fallback sebagai pengganti konfigurasi autentikasi yang hilang.

## Format laporan akhir

1. **Audit** — branch/commit/resource yang diperiksa.
2. **Perubahan** — file dan branch/commit/PR yang benar-benar dibuat.
3. **Clerk Production** — VERIFIED / BLOCKED / NOT CHECKED beserta bukti non-rahasia.
4. **Pemisahan founder/customer** — hasil tes.
5. **Rotasi credential** — status per provider tanpa nilai secret.
6. **Tes** — command, jumlah pass/fail, dan label LOCAL atau LIVE.
7. **Deployment** — hanya jika benar-benar deploy; deployment ID dan route yang diuji.
8. **Tindakan owner** — hanya tindakan eksternal yang memang memerlukan akses UI/otorisasi owner.
9. **Rollback** — referensi rollback dan caveat database/schema.

Label status:
- VERIFIED LIVE = diuji langsung terhadap domain/resource production.
- VERIFIED LOCAL = command/test benar-benar dijalankan lokal.
- CONFIGURED, NOT TESTED = metadata config ada tetapi runtime belum diuji.
- BLOCKED = key, DNS, otorisasi, atau kapabilitas provider belum tersedia.
- NOT CHECKED = belum ada bukti langsung.

Jangan klaim readiness production, security certification, tenant isolation, credential rotation, atau release sukses tanpa bukti yang sesuai.

## Kriteria selesai

Selesai hanya ketika Clerk Production berhasil diuji langsung di domain custom, founder auth tetap terpisah dan berfungsi, Development fallback tidak lagi diterima di production, tes wajib lolos, dan hasil rotasi dicatat jujur. Jika prasyarat eksternal hilang, selesaikan semua pekerjaan repository yang aman dan berikan blocker yang spesifik—jangan berpura-pura selesai.
