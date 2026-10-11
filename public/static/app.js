const $ = (s) => document.querySelector(s);
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const labels = {
  overview: "Overview",
  intelligence: "Intelligence Desk",
  sources: "Source registry",
  runs: "Collection runs",
  evidence: "Evidence store",
  clusters: "Problem clusters",
  opportunities: "Opportunities",
  decisions: "Decision ledger",
  experiments: "Experiments & learning",
  plugins: "Plugins & MCP",
  settings: "Operator settings",
  secrets: "Secrets Owner",
  manual: "Manual & help",
};
let currentPage = "overview";
let renderToken = 0;
let bootstrapping = true;
const loginLocked = $("#operator-secret").dataset.locked === "true";
const timestamp = (s) =>
  s
    ? new Date(s).toLocaleString("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Belum dijalankan";
const future = () =>
  new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16);
const pill = (s, tone = "") => `<span class="pill ${tone}">${esc(s)}</span>`;
const heading = (name, desc, action = "") =>
  `<header class="page-heading"><div><p class="eyebrow">INTELLIGENCE WORKSPACE / ${esc(name.toUpperCase())}</p><h1>${esc(name)}</h1><p>${esc(desc)}</p></div>${action}</header>`;
const banner = () =>
  '<aside class="banner"><span>◇</span><div><strong>Fixture-only, bukan bukti pasar.</strong> Semua observasi adalah data sintetis. Score tidak membuktikan demand; tidak ada scraping, pengiriman publik, atau spending otomatis.</div></aside>';
const panel = (title, body, action = "") =>
  `<section class="panel"><header class="panel-header"><h2>${esc(title)}</h2>${action}</header>${body}</section>`;
const empty = (title, desc) =>
  `<div class="empty"><strong>${esc(title)}</strong>${esc(desc)}</div>`;
const table = (headers, rows) =>
  rows.length
    ? `<div class="table-wrap"><table><thead><tr>${headers.map((h) => `<th scope="col">${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((v) => `<td>${v}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`
    : empty(
        "Belum ada record",
        "Mulai dari source registry dan fixture connector.",
      );
const input = (name, label, type = "text", value = "") =>
  `<label for="field-${name}">${esc(label)}</label><input id="field-${name}" name="${name}" type="${type}" value="${esc(value)}" required ${type === "text" ? 'maxlength="2000"' : ""}>`;
const textarea = (name, label) =>
  `<label for="field-${name}">${esc(label)}</label><textarea id="field-${name}" name="${name}" required maxlength="2000"></textarea>`;
const formPanel = (title, formId, body, submit) =>
  panel(
    title,
    `<form id="${formId}" class="panel-body"><div class="form-grid">${body}</div><div class="form-actions"><button type="submit">${esc(submit)}</button><small>Disimpan setelah konfirmasi server.</small></div></form>`,
  );
function notice(message, error = false) {
  $("#notice").classList.toggle("error", error);
  $("#notice").textContent = message;
}
async function api(path, method = "GET", body) {
  const response = await fetch("/api" + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-HIO-Request": "operator",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: "same-origin",
  });
  const data = await response.json();
  if (!response.ok) {
    if (response.status === 401 && path !== "/session") showLogin();
    throw new Error(
      `${data.error?.message || "Request gagal"} [${data.error?.code || response.status}] · ${data.error?.requestId || "no-id"}`,
    );
  }
  return data;
}
function showLogin() {
  $("#workspace").hidden = true;
  $("#login-panel").hidden = false;
  $("#operator-secret").value = "";
}
function detail(title, data) {
  $("#dialog-title").textContent = title;
  $("#dialog-content").replaceChildren();
  const pre = document.createElement("pre");
  pre.textContent = JSON.stringify(data, null, 2);
  $("#dialog-content").append(pre);
  $("#detail-dialog").showModal();
}
function evidenceCard(e) {
  return `<article class="evidence-card"><div class="card-title"><span class="fact-label">SYNTHETIC SOURCE OBSERVATION</span>${pill(e.relationship, e.relationship === "counter" ? "warm" : "green")}</div><p>${esc(e.observation)}</p><small>${esc(e.provider)} · ${esc(e.method)} · ${timestamp(e.captured_at)}</small><div class="form-actions"><button class="quiet" data-action="evidence-detail" data-id="${esc(e.id)}">Lihat provenance →</button><code>${esc(e.reference)}</code></div></article>`;
}
async function intelligence() {
  const d = await api("/v1/intelligence");
  return (
    heading(
      "Intelligence Desk",
      "Discovery → Demand → Opportunity → Decision. Rencana tersimpan; belum ada evidence pasar atau AI inference.",
      pill("PLANNING ONLY", "warm"),
    ) +
    panel(
      "Operating model",
      '<div class="panel-body"><p>Mulai dari pertanyaan pasar yang falsifiable. Pisahkan sinyal berulang dari repost, pain dari niat bayar, dan hipotesis payer dari pembelian terverifikasi.</p><p>Output planner tidak masuk ke evidence store atau score fixture. Recommendation tetap research-only. Market entry/outreach membutuhkan bukti nyata dan persetujuan terpisah.</p></div>',
    ) +
    formPanel(
      "Create research brief",
      "intelligence-form",
      `<div>${textarea("question", "Pertanyaan riset (maks. 500)")}</div><div>${input("segment", "Segmen buyer (maks. 120)")}</div><div>${input("geography", "Geografi / market (maks. 120)")}</div><div>${textarea("problem", "Hipotesis problem (maks. 500)")}</div><div>${textarea("payerHypothesis", "Hipotesis payer (maks. 300)")}</div><div><label for="field-connector">Candidate connector — belum terhubung</label><select id="field-connector" name="connector"><option value="manual">Manual authorized observation</option><option value="apify">Apify MCP — review required</option><option value="custom-api">Custom API / OpenAPI — review required</option></select></div>`,
      "Simpan brief & draft plan",
    ) +
    panel(
      "Research briefs — latest 50",
      d.items.length
        ? table(
            ["QUESTION", "SEGMENT / MARKET", "CONNECTOR", "CREATED / PLAN"],
            d.items.map((b) => [
              esc(b.question),
              `${esc(b.segment)}<small>${esc(b.geography)}</small>`,
              `${esc(b.connector)}<small>Not connected · D0 hypothesis</small>`,
              `${timestamp(b.created_at)}<button class="quiet" data-action="intelligence-detail" data-id="${esc(b.id)}">Baca query, unknowns & gates →</button>`,
            ]),
          )
        : empty(
            "Belum ada research brief",
            "Buat pertanyaan spesifik; jangan masukkan kredensial atau data pribadi.",
          ),
    )
  );
}
async function overview() {
  const [sources, runs, summary, plugins] = await Promise.all(
    ["/v1/sources", "/v1/runs", "/v1/summary", "/v1/plugins"].map((v) =>
      api(v),
    ),
  );
  const metrics = [
    [
      "EVIDENCE RECORDS",
      summary.evidence_count,
      "Unique, active synthetic records",
    ],
    ["COLLECTION RUNS", summary.run_count, "Durable terminal states"],
    [
      "HUMAN DECISIONS",
      summary.decision_count,
      "Rationale & evidence snapshots",
    ],
    [
      "COMPLETED TESTS",
      summary.completed_count,
      "Fixture outcomes, not customers",
    ],
  ];
  return (
    heading(
      "Evidence before exposure.",
      "Dari sinyal yang dapat ditelusuri menuju keputusan yang dapat dipertanggungjawabkan.",
      pill("FIXTURE MVP", "warm"),
    ) +
    banner() +
    `<section class="metrics" aria-label="Workspace metrics">${metrics.map(([label, value, sub]) => `<article class="metric"><div class="metric-label">${label}<span>↗</span></div><div class="metric-value">${value}</div><small>${sub}</small></article>`).join("")}</section><div class="grid-two">` +
    panel(
      "The intelligence loop",
      `<div class="panel-body"><p class="muted">Satu alur kerja, dengan bukti dan persetujuan manusia pada setiap keputusan penting.</p><div class="workflow">${["Source", "Collect", "Evidence", "Cluster", "Dossier", "Decide", "Test", "Learn"].map((v, i) => `<span class="${i === 2 ? "current" : ""}">${String(i + 1).padStart(2, "0")} / ${v}</span>`).join("")}</div><ol class="checklist"><li><span class="step-number">01</span><div><a class="text-link" href="/plugins">Install & authorize the fixture →</a><p>Installed: ${plugins.items.length} · Default tanpa grants dan disabled.</p></div></li><li><span class="step-number">02</span><div><a class="text-link" href="/sources">Enable the permitted source →</a><p>${sources.items.filter((s) => s.enabled).length} source enabled · zero external requests.</p></div></li><li><span class="step-number">03</span><div><a class="text-link" href="/opportunities">Review evidence, then decide →</a><p>Counter-evidence dan uncertainty tidak disembunyikan.</p></div></li></ol></div>`,
    ) +
    panel(
      "Research discipline",
      `<div class="panel-body"><span class="warning-label">HUMAN APPROVAL REQUIRED</span><h2>Decision authority</h2><p>HIO menyiapkan bukti. Operator memutuskan apakah hipotesis layak diteliti.</p><ul class="checklist"><li>Data fixture ≠ demand nyata</li><li>Duplicates tidak dihitung dua kali</li><li>Test hanya sintetis dan budget Rp0</li><li>Tidak ada public launch atau outreach</li></ul><div class="form-actions"><a class="text-link" href="/manual">Baca Manual & batasan →</a></div></div>`,
    ) +
    `</div>` +
    panel(
      "Recent collection runs",
      table(
        ["SOURCE / RUN", "STATE", "ACCEPTED / DUPLICATES", "TIME"],
        runs.items
          .slice(0, 5)
          .map((r) => [
            esc(r.source_id) + `<small>${esc(r.id)}</small>`,
            pill(r.status, r.status === "failed" ? "red" : "green"),
            `${r.accepted} / ${r.duplicates}`,
            timestamp(r.finished_at),
          ]),
      ),
      `<a class="text-link" href="/runs">Semua runs →</a>`,
    )
  );
}
async function sources() {
  const d = await api("/v1/sources");
  return (
    heading(
      "Source registry",
      "Sumber yang eksplisit, bounded, dan memiliki permission basis.",
    ) +
    banner() +
    panel(
      "Approved fixture source",
      table(
        ["SOURCE", "POLICY / RETENTION", "STATUS", "CONTROL"],
        d.items.map((s) => [
          `<strong>${esc(s.name)}</strong><small>${esc(s.connector)} · ${esc(s.id)}</small>`,
          `${esc(s.permission_basis)}<small>${s.retention_days} hari · Reviewed ${timestamp(s.reviewed_at)}</small>`,
          pill(s.enabled ? "Enabled" : "Disabled", s.enabled ? "green" : ""),
          `<button class="secondary" data-action="source-toggle" data-id="${esc(s.id)}" data-enabled="${s.enabled ? "false" : "true"}">${s.enabled ? "Disable source" : "Enable fixture"}</button>`,
        ]),
      ),
    ) +
    panel(
      "Source safety",
      `<div class="panel-body"><p class="muted">Hanya connector fixture yang tersedia. Tidak ada input URL atau API key, sehingga tidak ada fetch ke sumber eksternal. Menonaktifkan source menghentikan run berikutnya tanpa menghapus provenance historis.</p></div>`,
    )
  );
}
async function runs() {
  const d = await api("/v1/runs");
  return (
    heading(
      "Collection runs",
      "Run sinkron dengan maksimum 4 record. Retry menggunakan idempotency key yang sama.",
    ) +
    formPanel(
      "Run the fixture connector",
      "run-form",
      `<div>${input("key", "Idempotency key", "text", "run-" + crypto.randomUUID())}</div><div><label for="field-mode">Fixture scenario</label><select id="field-mode" name="mode"><option value="normal">Normal / duplicate included</option><option value="failure">Provider failure fixture</option><option value="rate_limit">Provider rate-limit fixture</option></select></div><div><label for="field-limit">Record limit (1–4)</label><input id="field-limit" name="limit" type="number" min="1" max="4" value="4" required></div><div><p class="muted">Plugin dan source harus enabled. Failure adalah record durable, bukan sukses. Jeda run minimum 2 detik.</p></div>`,
      "Collect fixture",
    ) +
    panel(
      "Run history",
      table(
        ["RUN", "STATUS", "COUNTS", "ERROR / COST", "FINISHED"],
        d.items.map((r) => [
          `<code>${esc(r.id)}</code><small>Key: ${esc(r.request_key)}</small>`,
          pill(r.status, r.status === "failed" ? "red" : "green"),
          `Attempted ${r.attempted}<small>Accepted ${r.accepted} · Duplicate ${r.duplicates}</small>`,
          `${esc(r.error_code || "—")}<small>Rp${r.cost_minor} · ${esc(r.plugin_version)}</small>`,
          timestamp(r.finished_at),
        ]),
      ),
    )
  );
}
async function evidence() {
  const q = new URL(location.href).searchParams.get("q") || "";
  const d = await api("/v1/evidence?q=" + encodeURIComponent(q));
  return (
    heading(
      "Evidence store",
      "Observasi asli, timestamp, quality, fingerprint, dan provenance. Payload expiry tidak ditampilkan.",
    ) +
    `<form id="search-form" class="search-bar"><label class="sr-only" for="evidence-search">Cari evidence</label><input id="evidence-search" name="q" value="${esc(q)}" maxlength="120" placeholder="Cari di observasi fixture…"><button type="submit">Cari</button></form>` +
    banner() +
    panel(
      "Active observations",
      `<div class="panel-body">${d.items.length ? d.items.map(evidenceCard).join("") : empty("Belum ada evidence", "Jalankan fixture di Collection runs. Input adalah synthetic, bukan customer quotes.")}</div>`,
    )
  );
}
async function clusters() {
  const d = await api("/v1/clusters");
  return (
    heading(
      "Problem clusters",
      "Membership deterministik dari fixture yang ditinjau, bukan clustering AI.",
    ) +
    panel(
      "Reviewed fixture grouping",
      table(
        ["CLUSTER", "PROBLEM / CLASSIFICATION", "MEMBERS", "NEXT"],
        d.items.map((c) => [
          `<strong>${esc(c.title)}</strong>`,
          `<p>${esc(c.problem)}</p>${pill("UNVERIFIED HYPOTHESIS", "warm")}`,
          String(c.evidence_count),
          '<a class="text-link" href="/opportunities">Buka dossier →</a>',
        ]),
      ),
    ) +
    panel(
      "Grouping rule",
      `<div class="panel-body"><p class="muted">Tiga observasi unik fixture masuk ke satu cluster tetap: dua support dan satu counter. Repost menunjuk ke evidence asli. Merge/split dan semantic clustering belum diimplementasikan.</p></div>`,
    )
  );
}
async function opportunities() {
  const d = await api("/v1/opportunities/research-workbench");
  return (
    heading(
      "Opportunity dossier",
      "Pisahkan observasi, interpretasi deterministik, dan hipotesis. Tidak ada score yang memberi izin launch.",
    ) +
    banner() +
    `<div class="grid-two">` +
    panel(
      d.opportunity.title,
      `<div class="panel-body"><span class="warning-label">UNVERIFIED HYPOTHESIS</span><p>${esc(d.opportunity.hypothesis)}</p><h3>Uncertainty & gaps</h3><p class="muted">${esc(d.opportunity.uncertainty)}</p><h3>Supporting & counter-evidence</h3>${d.evidence.length ? d.evidence.map(evidenceCard).join("") : empty("Insufficient evidence", "Kumpulkan fixture untuk membuka review.")}</div>`,
    ) +
    panel(
      "Explainable fixture score",
      `<div class="panel-body"><span class="warning-label">NOT A COMMERCIAL SCORE</span><div class="score">${d.score.score ?? "—"}<span> / 100</span></div><p class="muted">${esc(d.score.rule)}</p><p>Support: ${d.score.factors.support} · Counter: ${d.score.factors.counter}</p><p class="muted">${esc(d.score.coverage)}</p><h3>Unknown dimensions</h3><ul>${d.score.unknowns.map((v) => `<li class="muted">${esc(v)}</li>`).join("")}</ul><code>${esc(d.score.version)}</code></div>`,
    ) +
    `</div>` +
    decisionForm()
  );
}
function decisionForm() {
  return formPanel(
    "Human review & decision",
    "decision-form",
    `<div><label for="field-choice">Decision</label><select id="field-choice" name="choice"><option value="research">Research further</option><option value="hold">Hold</option><option value="reject">Reject</option><option value="approve_fixture">Approve zero-cost fixture experiment</option></select></div><div>${input("reviewAt", "Review due (UTC)", "datetime-local", future())}</div><div>${textarea("rationale", "Concise rationale")}</div><div>${textarea("reviewerNotes", "Reviewer notes / counter-evidence")}</div>`,
    "Record decision",
  );
}
async function decisions() {
  const d = await api("/v1/decisions");
  return (
    heading(
      "Decision ledger",
      "Keputusan append-only dengan owner, rationale, review due, dan evidence snapshot.",
    ) +
    panel(
      "Recorded decisions",
      table(
        ["DECISION / OWNER", "RATIONALE", "REVIEW", "SNAPSHOT"],
        d.items.map((r) => [
          `${pill(r.choice, "warm")}<small>${esc(r.owner)} · ${timestamp(r.created_at)}</small>`,
          `${esc(r.rationale)}<small>Review: ${esc(r.reviewer_notes)}</small>`,
          timestamp(r.review_at),
          `<button class="quiet" data-action="decision-detail" data-id="${esc(r.id)}">Evidence snapshot →</button>`,
        ]),
      ),
    ) +
    decisionForm()
  );
}
async function experiments() {
  const [d, decisions] = await Promise.all([
    api("/v1/experiments"),
    api("/v1/decisions"),
  ]);
  const approvals = decisions.items.filter(
    (v) => v.choice === "approve_fixture",
  );
  return (
    heading(
      "Experiments & learning",
      "Prerecorded criteria, latest human approval, zero budget. Recording never starts an external action.",
    ) +
    banner() +
    formPanel(
      "Define a bounded fixture experiment",
      "experiment-form",
      `<div><label for="field-decisionId">Approval decision</label><select name="decisionId" id="field-decisionId" required><option value="">Pilih latest unexpired approval</option>${approvals.map((v) => `<option value="${esc(v.id)}">${esc(v.rationale.slice(0, 70))} · ${timestamp(v.created_at)}</option>`).join("")}</select></div><div>${input("reviewAt", "Review due (UTC)", "datetime-local", future())}</div><div class="full">${textarea("hypothesis", "Hypothesis to test (synthetic only)")}</div><div>${textarea("successCriteria", "Success criteria")}</div><div>${textarea("stopCriteria", "Stop criteria")}</div><div class="full"><p class="muted">Budget cap: Rp0. Owner dari sesi server. Tidak ada launch, spending atau outreach.</p></div>`,
      "Create approved fixture experiment",
    ) +
    panel(
      "Experiment records",
      `<div class="panel-body">${d.items.length ? d.items.map((e) => `<article class="evidence-card"><div class="card-title"><strong>${esc(e.hypothesis)}</strong>${pill(e.status, e.status === "completed" ? "green" : "warm")}</div><p>${esc(e.success_criteria)}</p><small>Stop: ${esc(e.stop_criteria)} · ${esc(e.owner)} · Rp${e.budget_minor} · Review ${timestamp(e.review_at)}</small>${e.status === "completed" ? `<p>Outcome: ${esc(e.outcome)}</p><p class="muted">Learning: ${esc(e.learning)} · actual cost Rp${e.actual_cost_minor}</p>` : `<form class="outcome-form" data-id="${esc(e.id)}">${textarea("outcome-" + e.id, "Observed fixture outcome")}${textarea("learning-" + e.id, "Learning / negative results")}<div class="form-actions"><button type="submit">Record immutable outcome</button></div></form>`}</article>`).join("") : empty("No experiments", "Review dossier dan record approve_fixture terlebih dahulu.")}</div>`,
    )
  );
}
async function plugins() {
  const d = await api("/v1/plugins");
  const installed = d.items.map((p) => ({
    ...p,
    manifest: JSON.parse(p.manifest_json),
    grants: JSON.parse(p.grants_json),
  }));
  return (
    heading(
      "Plugins & MCP",
      "Install tidak memberi permission. Hanya exact built-in reviewed manifests, tanpa code/network execution.",
    ) +
    panel(
      "Available reviewed adapters",
      table(
        ["ADAPTER", "REQUESTED SCOPE / LIMITS", "INSTALL"],
        d.available.map((m) => [
          `<strong>${esc(m.name)}</strong><small>${esc(m.id)} / ${esc(m.version)}</small>`,
          `${esc(m.permissions.join(", "))}<small>Max 4 records · network none · Rp0</small>`,
          installed.some((p) => p.id === m.id)
            ? pill("INSTALLED")
            : `<button class="secondary" data-action="plugin-install" data-id="${esc(m.id)}">Install disabled</button>`,
        ]),
      ),
    ) +
    panel(
      "Installed registry & kill switch",
      table(
        ["PLUGIN", "GRANTS", "STATE", "CONTROL"],
        installed.map((p) => [
          `<code>${esc(p.id)}</code>`,
          esc(p.grants.join(", ") || "None"),
          pill(p.enabled ? "Enabled" : "Disabled", p.enabled ? "green" : ""),
          `<button class="secondary" data-action="plugin-toggle" data-id="${esc(p.id)}" data-enabled="${p.enabled ? "false" : "true"}">${p.enabled ? "Disable & revoke" : "Approve scope & enable"}</button>`,
        ]),
      ),
    ) +
    panel(
      "MCP foundation — local fixture only",
      `<div class="panel-body"><p class="muted">Allowlisted tool: <code>evidence.list</code>. Autentikasi operator, explicit grant, schema output, maksimal 4 record, dan audit berlaku. Ini dispatch JSON-RPC fixture lokal; bukan koneksi ke remote MCP server atau MCP interoperability claim.</p><button class="secondary" data-action="mcp-test">Test allowlisted fixture tool</button></div>`,
    )
  );
}
async function secrets() {
  const d = await api("/v1/secrets");
  return (
    heading(
      "Secrets Owner",
      "Inventory privat dan prosedur owner. Tidak ada reveal/copy raw values.",
      pill("OWNER ONLY", "warm"),
    ) +
    '<aside class="banner"><div><strong>Configured ≠ recoverable.</strong> Nilai lama mungkin tidak dapat dibaca kembali dari Cloudflare. Simpan pengganti di password manager milik owner. Halaman ini tidak mengubah secret Cloudflare.</div></aside>' +
    panel(
      "Allowlisted runtime secret inventory",
      table(
        [
          "KEY / PURPOSE",
          "ENVIRONMENT / STATUS",
          "DEPENDENT FEATURE",
          "ROTATION / ACTION",
        ],
        d.items.map((s) => [
          `<code>${esc(s.name)}</code><small>${esc(s.purpose)} · Required</small>`,
          `${esc(s.environment)} · ${pill(s.status, s.status === "configured" ? "green" : s.status === "missing" ? "red" : "warm")}<small>${esc(s.statusBasis)}</small><small>${esc(s.storageVerification)}</small>`,
          `${esc(s.dependentFeature)}<small>${esc(s.ownerManagedLocation)}</small>`,
          `${s.lastRotationAt ? timestamp(s.lastRotationAt) : "Not recorded"}<small>${esc(s.rotationBasis)}</small><button class="quiet" data-action="secret-instructions" data-id="${esc(s.name)}" data-env="${esc(s.environment)}">Copy non-secret instructions →</button>`,
        ]),
      ),
    ) +
    panel(
      "Owner-controlled management",
      `<div class="panel-body"><p>Runtime environment: <code>${esc(d.runtimeEnvironment)}</code>. Preview/production lain tetap unknown dari runtime ini.</p><a class="text-link" href="${esc(d.managementUrl)}" target="_blank" rel="noopener noreferrer">Open correct Cloudflare Pages settings →</a><ul>${d.limitations.map((v) => `<li class="muted">${esc(v)}</li>`).join("")}</ul><p class="muted">${esc(d.providerCredentials)}</p></div>`,
    ) +
    formPanel(
      "Record completed rotation — metadata only",
      "secret-rotation-form",
      `<div><label for="field-secretName">Secret name</label><select id="field-secretName" name="name"><option>OPERATOR_SECRET</option><option>SESSION_SECRET</option></select></div><div><label for="field-secretEnvironment">Environment</label><select id="field-secretEnvironment" name="environment"><option value="local">Local</option><option value="preview">Preview</option><option value="production">Production</option></select></div><div>${input("rotatedAt", "Actual rotation date (UTC)", "datetime-local", new Date(Date.now() - 60000).toISOString().slice(0, 16))}</div><div><label for="rotation-confirmation"><input id="rotation-confirmation" type="checkbox" required> Saya telah melakukan rotation di lingkungan terpilih; ini hanya catatan metadata.</label></div>`,
      "Save rotation metadata",
    )
  );
}
async function settings() {
  const [s, a] = await Promise.all([api("/v1/settings"), api("/v1/audit")]);
  return (
    heading(
      "Operator settings",
      "Safe operational logs dan kebijakan yang benar-benar diberlakukan server.",
    ) +
    `<div class="grid-two">` +
    panel(
      "Operating envelope",
      `<div class="panel-body"><p>Mode: ${pill(s.mode, "warm")}</p><p>Retention: ${s.retentionDays} hari · max ${s.limits.recordsPerRun} records/run</p><p>Network: disabled · spending: disabled</p><p>Role: owner-operator · session 8 hours</p><button class="secondary" data-action="purge">Purge expired fixture payloads</button><p><a class="text-link" href="/secrets">Secrets Owner — inventory & recovery →</a></p></div>`,
    ) +
    panel(
      "Known limitations",
      `<div class="panel-body"><ul>${s.limitations.map((v) => `<li class="muted">${esc(v)}</li>`).join("")}</ul><p class="muted">Manual v${esc(s.manualVersion)} · review ${esc(s.reviewDate)}</p></div>`,
    ) +
    `</div>` +
    panel(
      "Audit trail — latest 50 events",
      table(
        ["EVENT", "ACTOR / RESULT", "ENTITY", "TIME / REQUEST"],
        a.items.map((e) => [
          `<code>${esc(e.action)}</code>`,
          `${esc(e.actor)}<small>${esc(e.outcome)}</small>`,
          esc(e.entity_id),
          `${timestamp(e.occurred_at)}<small>${esc(e.request_id)}</small>`,
        ]),
      ),
    )
  );
}
function manual() {
  return (
    heading(
      "Manual & help",
      "Petunjuk untuk perilaku yang tersedia pada rilis fixture MVP, bukan spesifikasi fitur masa depan.",
      pill("v0.2.0 · 11 OCT 2026"),
    ) +
    banner() +
    `<section class="manual-grid">
<article><h2>00 / Intelligence Desk</h2><p>Buat brief pertanyaan, segmen, geografi, problem dan payer hypothesis di /intelligence. Server menyimpan brief dan draft deterministik: query Discovery, pertanyaan Demand, counter-evidence, unknowns Opportunity serta gate Decision. Buka detail untuk melihat plan yang tersimpan.</p><p>Ini bukan AI inference, live search, demand score atau rekomendasi market entry. D0 hypothesis, evidence count 0, spending 0, research-only. Tidak ada grant atau connector yang aktif dari pilihan form. Retry POST yang terputus dapat membuat brief baru; periksa daftar sebelum mengulang.</p><p>Apify MCP: remote Streamable HTTP direncanakan, tool discovery/docs saja sebagai calon tahap pertama. Menjalankan Actor membutuhkan review izin sumber, autentikasi dan biaya. Custom API/OpenAPI harus direview per operation/schema/origin; file tidak boleh dieksekusi. Remote transport dan ingestion belum diimplementasikan.</p></article><article><h2>01 / Quick start</h2><ol><li>Masuk dengan secret operator dari environment. Tidak ada signup.</li><li>Plugins: install Synthetic source connector. Installed disabled dan grants kosong.</li><li>Approve scope fixture.read & enable secara eksplisit.</li><li>Source registry: enable sumber sintetis.</li><li>Collection runs: pilih Normal, limit 4, key baru. Hasil 3 unique evidence dan 1 repost.</li><li>Evidence: baca source observation dan provenance. Dossier memuat support, counter dan uncertainty.</li><li>Review dossier, catat rationale, notes, dan future review date. Approve hanya fixture Rp0.</li><li>Experiment: gunakan latest unexpired approval; tetapkan hypothesis, success dan stop criteria.</li><li>Record outcome/learning sintetis. Outcome immutable, bukan transaction/payment verified.</li></ol></article>
<article><h2>02 / Glossary & evidence ladder</h2><p>Observation: teks fixture asli. Interpretation: rumus deterministik. Hypothesis: dugaan belum terverifikasi. Counter-evidence: indikasi solusi tidak dibutuhkan. Provenance: source → run → evidence, termasuk repost.</p><p>D0 hypothesis; D1 observed; D2 repeated; D3 commercial intent; D4 market behavior; D5 verified transaction; D6 repeatability. Fixture tidak boleh dipromosikan sebagai evidence dunia nyata pada ladder ini.</p><p>Score = unique support / (support + counter) × 100. Coverage terbatas fixture, payer/pricing/economics/distribution unknown. Tidak ada model yang memprediksi revenue.</p></article>
<article><h2>03 / Plugins & integrations</h2><p>Hanya hio.fixture dan hio.mcp-fixture versi 0.1.0. Manifest strict, permissions terpisah dari grants, network allowlist kosong, max 4 record dan biaya Rp0. Tidak ada third-party installation atau arbitrary code.</p><p>Disable & revoke segera memblokir eksekusi berikutnya. History tidak dihapus. Setup provider API, queues, embeddings dan model AI belum tersedia. Source content diperlakukan sebagai data, bukan instruction.</p><p>MCP tool fixture evidence.list memakai JSON-RPC request local, output schema dan audit. Remote MCP transport/SDK interoperability, OAuth, discovery, custom server dan resource/prompts belum tersedia.</p></article>
<article><h2>04 / Access & safety</h2><p>Single workspace dan role owner-operator. Session server HMAC, HttpOnly, SameSite Strict, 8 jam. Secret tidak disimpan di browser storage. Mutasi memerlukan same-origin header dan quota.</p><p>Tidak ada public launch, outreach, autonomous spending, scraping, atau data Bozq. Keputusan manusia hanya mengizinkan fixture zero-cost. Real-world action membutuhkan gate terpisah yang belum dibuat.</p><p>Team SSO dan RBAC per-user belum tersedia. Jangan berbagi credential atau memakai MVP ini untuk data sensitif. Tidak ada private chain-of-thought yang disimpan.</p></article>
<article><h2>05 / Troubleshooting & retries</h2><ul><li>401: login ulang; 503: DB migration atau server secret belum siap.</li><li>403 plugin_disabled / permission_denied: install, review scope, enable. source_disabled: enable fixture source.</li><li>409 idempotency_conflict: input berbeda menggunakan key yang sama. Retry identik dengan key asli memberi run yang sama.</li><li>Failure scenario menyimpan failed run. Retry key sama tidak mengeksekusi ulang; gunakan key baru setelah jeda untuk percobaan manual.</li><li>429: tunggu Retry-After; rate limit 2 detik antar fixture runs, 60 mutations/menit, 10 login attempts/menit global.</li><li>Approval denied: support/counter belum ada, keputusan bukan latest approval atau review sudah kedaluwarsa.</li><li>Sertakan request ID pada laporan. Jangan kirim secret, cookie atau private data.</li></ul></article>
<article><h2>06 / Data lifecycle & limitations</h2><p>D1 menyimpan source, plugin/grants, run, evidence/hash, provenance, memberships, opportunity, decision snapshot, experiment dan audit. Retention fixture 30 hari. Expired evidence tidak muncul di query/dossier/tool; purge operator mengosongkan payload sambil mempertahankan ID/hash/provenance untuk audit.</p><p>30-day TTL adalah content visibility/purge, bukan automatic full deletion of governance history. Tidak ada scheduling otomatis, export atau provider takedown workflow. Source-specific real-data lifecycle memerlukan review baru.</p><p>Decision dan outcome append-only. Rollback rilis mempertahankan schema additive; jangan drop populated DB. Deployment produksi belum tervalidasi; README/status audit adalah sumber release evidence.</p><p>Secrets Owner tersedia di /secrets, owner-only. Hanya status runtime allowlisted dan metadata rotation; environment lain unknown, tidak ada raw readback. Kelola nilai pada Cloudflare Pages settings di environment yang benar, simpan pengganti di vault sendiri, lalu redeploy. Rotate SESSION_SECRET untuk invalidasi semua sesi pada rilis berikutnya. Rilis direct production memakai satu D1 HIO sesuai izin owner; preview tidak wajib. Tanpa kredensial produksi, halaman software diterbitkan locked/setup-required dan API privat tetap ditolak.</p><p>Manual version 0.2.0 · review 2026-10-11. Tidak ada real source validation, payment verification atau commercial validation.</p></article></section>`
  );
}
const pages = {
  overview,
  intelligence,
  sources,
  runs,
  evidence,
  clusters,
  opportunities,
  decisions,
  experiments,
  plugins,
  settings,
  secrets,
  manual,
};
async function render() {
  const token = ++renderToken;
  currentPage = location.pathname.slice(1) || "overview";
  if (!pages[currentPage]) currentPage = "overview";
  $("#breadcrumb").textContent = labels[currentPage];
  document.title = `${labels[currentPage]} · HOLBERY HIO`;
  document.querySelectorAll("nav a").forEach((a) => {
    a.classList.toggle("active", a.dataset.page === currentPage);
    if (a.dataset.page === currentPage) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  $("#page-content").innerHTML =
    '<p class="loading">Memuat status dari server…</p>';
  try {
    const html = await pages[currentPage]();
    if (token === renderToken) $("#page-content").innerHTML = html;
  } catch (e) {
    if (token === renderToken) {
      $("#page-content").innerHTML = empty(
        "Tidak dapat memuat halaman",
        "Periksa konfigurasi/session dan request ID.",
      );
      notice(e.message, true);
    }
  }
}
async function mutate(button, work) {
  button.disabled = true;
  try {
    await work();
    notice("Perubahan dikonfirmasi server.");
    await render();
  } catch (e) {
    notice(e.message, true);
  } finally {
    button.disabled = false;
  }
}
document.addEventListener("click", async (e) => {
  const link = e.target.closest('a[href^="/"]');
  if (link && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
    e.preventDefault();
    history.pushState({}, "", link.href);
    $("#sidebar").classList.remove("open");
    $("#menu-toggle").setAttribute("aria-expanded", "false");
    notice("");
    await render();
    return;
  }
  const button = e.target.closest("[data-action]");
  if (!button) return;
  if (button.dataset.action === "secret-instructions") {
    button.disabled = true;
    try {
      const d = await api("/v1/secrets");
      const s = d.items.find(
        (v) =>
          v.name === button.dataset.id && v.environment === button.dataset.env,
      );
      if (!s) throw new Error("Unknown inventory entry");
      const instructions = `${s.name} / ${s.environment}\n${s.ownerManagedLocation}\n${s.command || "Edit ignored local .dev.vars only; never reuse for cloud."}\n${s.commandScope}\n${s.recovery}\nUse Cloudflare secret storage, not plaintext variables. Select environment explicitly. Save replacement in your own vault; redeploy and verify login/logout/readiness. No old value can be recovered here.`;
      try {
        await navigator.clipboard.writeText(instructions);
        notice(
          "Instruksi non-secret disalin. Tidak ada nilai secret yang disalin.",
        );
      } catch {
        detail("Non-secret setup / recovery instructions", instructions);
        notice("Instruksi ditampilkan; clipboard tidak tersedia.");
      }
    } catch (error) {
      notice(error.message, true);
    } finally {
      button.disabled = false;
    }
    return;
  }
  await mutate(button, async () => {
    const a = button.dataset.action,
      id = button.dataset.id;
    if (a === "source-toggle")
      await api("/v1/sources/" + id, "PATCH", {
        enabled: button.dataset.enabled === "true",
      });
    if (a === "plugin-install") {
      const d = await api("/v1/plugins");
      await api(
        "/v1/plugins",
        "POST",
        d.available.find((v) => v.id === id),
      );
    }
    if (a === "plugin-toggle") {
      const enabled = button.dataset.enabled === "true";
      if (
        enabled &&
        !confirm("Approve requested scope for reviewed built-in fixture only?")
      )
        return;
      const d = await api("/v1/plugins");
      const m = d.available.find((v) => v.id === id);
      await api("/v1/plugins/" + id, "PATCH", {
        enabled,
        grants: enabled ? m.permissions : [],
      });
    }
    if (a === "intelligence-detail")
      detail("Unvalidated research plan", await api("/v1/intelligence/" + id));
    if (a === "evidence-detail")
      detail("Evidence & provenance", await api("/v1/evidence/" + id));
    if (a === "decision-detail") {
      const d = await api("/v1/decisions");
      const decision = d.items.find((v) => v.id === id);
      detail("Decision snapshot", {
        ...decision,
        snapshot: JSON.parse(decision.snapshot_json),
      });
    }
    if (a === "mcp-test")
      detail(
        "Read-only MCP fixture result",
        await api("/v1/mcp/call", "POST", {
          jsonrpc: "2.0",
          id: "tool-" + crypto.randomUUID(),
          method: "tools/call",
          params: { name: "evidence.list", arguments: { limit: 4 } },
        }),
      );
    if (a === "purge") {
      if (
        confirm("Purge expired fixture payloads only? IDs/provenance remain.")
      )
        detail(
          "Retention result",
          await api("/v1/settings/purge-expired", "POST", {}),
        );
    }
  });
});
document.addEventListener("submit", async (e) => {
  const form = e.target;
  if (form.id === "login-form") return;
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  if (form.id === "search-form") {
    history.pushState({}, "", "/evidence?q=" + encodeURIComponent(data.q));
    await render();
    return;
  }
  const button = form.querySelector('button[type="submit"]');
  if (!button) return;
  await mutate(button, async () => {
    const reviewAt = data.reviewAt
      ? new Date(data.reviewAt + "Z").toISOString()
      : undefined;
    if (form.id === "intelligence-form") {
      const result = await api("/v1/intelligence", "POST", {
        question: data.question,
        segment: data.segment,
        geography: data.geography,
        problem: data.problem,
        payerHypothesis: data.payerHypothesis,
        connector: data.connector,
      });
      detail("Research draft — not market evidence", result);
    }
    if (form.id === "secret-rotation-form") {
      const result = await api("/v1/secrets/rotation", "POST", {
        name: data.name,
        environment: data.environment,
        rotatedAt: new Date(data.rotatedAt + "Z").toISOString(),
      });
      detail("Rotation metadata — no secret changes", result);
    }
    if (form.id === "run-form") {
      const result = await api("/v1/runs", "POST", {
        sourceId: "fixture",
        key: data.key,
        mode: data.mode,
        limit: Number(data.limit),
      });
      detail(result.replayed ? "Replayed run" : "Collection result", result);
    }
    if (form.id === "decision-form")
      await api("/v1/decisions", "POST", {
        opportunityId: "research-workbench",
        choice: data.choice,
        rationale: data.rationale,
        reviewerNotes: data.reviewerNotes,
        reviewAt,
      });
    if (form.id === "experiment-form")
      await api("/v1/experiments", "POST", {
        opportunityId: "research-workbench",
        decisionId: data.decisionId,
        hypothesis: data.hypothesis,
        successCriteria: data.successCriteria,
        stopCriteria: data.stopCriteria,
        budgetMinor: 0,
        currency: "IDR",
        reviewAt,
      });
    if (form.classList.contains("outcome-form"))
      await api("/v1/experiments/" + form.dataset.id + "/outcome", "POST", {
        outcome: data["outcome-" + form.dataset.id],
        learning: data["learning-" + form.dataset.id],
        actualCostMinor: 0,
      });
  });
});
$("#login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (bootstrapping || loginLocked) return;
  const button = e.target.querySelector("button");
  button.disabled = true;
  $("#login-error").textContent = "";
  try {
    const d = await api("/session", "POST", {
      secret: $("#operator-secret").value,
    });
    $("#operator-name").textContent = d.actor;
    $("#operator-secret").value = "";
    $("#login-panel").hidden = true;
    $("#workspace").hidden = false;
    await render();
  } catch (error) {
    $("#login-error").textContent = error.message;
  } finally {
    button.disabled = false;
  }
});
$("#logout-button").addEventListener("click", async () => {
  try {
    await api("/session", "DELETE");
    showLogin();
  } catch (e) {
    notice(e.message, true);
  }
});
$("#menu-toggle").addEventListener("click", () => {
  const open = $("#sidebar").classList.toggle("open");
  $("#menu-toggle").setAttribute("aria-expanded", String(open));
});
$("#close-dialog").addEventListener("click", () => $("#detail-dialog").close());
window.addEventListener("popstate", render);
(async () => {
  try {
    const me = await api("/v1/me");
    $("#operator-name").textContent = me.actor;
    $("#login-panel").hidden = true;
    $("#workspace").hidden = false;
    await render();
  } catch {
    showLogin();
  } finally {
    bootstrapping = false;
    $("#operator-secret").disabled = loginLocked;
    $("#login-form button").disabled = loginLocked;
  }
})();
