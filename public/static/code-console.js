// HIO Coding Agent Execution Console.
// Renders only what the backend returns. Never fabricates progress, output,
// sandbox IDs, timings or results. All untrusted text is set via textContent.
(() => {
  const $ = (s) => document.querySelector(s);
  const body = $("#cc-body");
  const statusLine = $("#cc-status");

  // Validation commands the backend runs, in order (src/coding-agent.ts).
  const CHECKS = [
    ["install", "Instal dependensi", "npm ci"],
    ["typecheck", "TypeScript", "npm run typecheck"],
    ["lint", "Lint", "npm run lint"],
    ["format", "Format", "npm run format:check"],
    ["tests", "Tes", "npm test"],
    ["security", "Keamanan", "npm run security:check"],
    ["build", "Build", "npm run build"],
  ];
  const CHECK_NAMES = CHECKS.map((c) => c[0]);
  const STEP_LABELS = {
    preparing_sandbox: "Menyiapkan eksekusi",
    creating_sandbox: "Membuat sandbox",
    cloning_repository: "Mengkloning repository",
    writing_files: "Menulis file proposal",
    repair_applied: "Perbaikan AI diterapkan, mengulang pemeriksaan",
    completed: "Selesai",
    failed: "Berhenti karena gagal",
  };
  for (const [id, label] of CHECKS) STEP_LABELS[id] = label;
  const TASK_STATUS = {
    draft: "Draft",
    approved: "Disetujui",
    submitted: "Dikirim sebagai draft PR",
    blocked: "Diblokir",
    failed: "Gagal",
  };
  const RUN_STATUS = {
    running: "Sedang berjalan",
    passed: "Lulus",
    failed: "Gagal",
  };
  const ERRORS = {
    daytona_not_configured:
      "Sandbox belum dikonfigurasi di server (kunci Daytona belum dipasang). Tidak ada sandbox yang dibuat.",
    daytona_configuration_invalid:
      "Konfigurasi sandbox di server tidak valid. Tidak ada sandbox yang dibuat.",
    task_not_executable:
      "Hanya proposal berstatus draft yang boleh diuji di sandbox.",
    owner_execution_limit:
      "Sudah ada eksekusi sandbox lain yang sedang berjalan. Tunggu sampai selesai, lalu coba lagi.",
    execution_already_running:
      "Task ini sedang dieksekusi. Konsol akan memantau status; jangan kirim ulang.",
    stored_proposal_invalid:
      "Proposal yang tersimpan tidak lolos validasi, jadi tidak dijalankan.",
    path_not_allowed: "Proposal berisi path file yang tidak diizinkan.",
    invalid_task_id: "ID task tidak valid.",
    not_found: "Task tidak ditemukan atau bukan milik sesi ini.",
    execution_not_found: "Belum ada catatan eksekusi untuk task ini.",
    repository_clone_failed: "Repository gagal dikloning di sandbox.",
    sandbox_file_write_failed: "File proposal gagal ditulis di sandbox.",
    repair_proposal_invalid:
      "Usulan perbaikan AI tidak valid, sehingga perbaikan dihentikan.",
    repair_file_write_failed: "File perbaikan gagal ditulis di sandbox.",
    sandbox_cleanup_failed:
      "Sandbox gagal dihapus setelah eksekusi. Periksa dasbor Daytona.",
    sandbox_execution_failed: "Eksekusi sandbox gagal.",
    install_failed: "Instal dependensi gagal (tidak diperbaiki otomatis).",
  };
  const explainError = (code) => {
    if (!code) return "";
    const c = String(code);
    if (ERRORS[c]) return ERRORS[c];
    const m = /^([a-z]+)_failed$/.exec(c);
    if (m && STEP_LABELS[m[1]])
      return (
        "Pemeriksaan " + STEP_LABELS[m[1]] + " gagal setelah batas perbaikan."
      );
    if (/^daytona_http_401|^daytona_http_403/.test(c))
      return "Penyedia sandbox menolak kredensial.";
    if (/^daytona_http_429/.test(c))
      return "Kuota atau batas laju penyedia sandbox tercapai.";
    if (/^daytona_http_/.test(c))
      return "Penyedia sandbox mengembalikan galat.";
    return "Kode galat: " + c.slice(0, 120);
  };

  // ---------- safe DOM helpers ----------
  function el(tag, attrs = {}, ...children) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v === undefined || v === null || v === false) continue;
      if (k === "class") e.className = v;
      else if (k === "text") e.textContent = v;
      else if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? "" : String(v));
    }
    for (const c of children.flat()) {
      if (c === null || c === undefined || c === false) continue;
      e.append(c instanceof Node ? c : document.createTextNode(String(c)));
    }
    return e;
  }
  // CSP forbids inline style attributes; set width through CSSOM instead.
  function progressFill(ratio) {
    const span = document.createElement("span");
    span.style.width = Math.round(Math.max(0, Math.min(1, ratio)) * 100) + "%";
    return span;
  }
  const badge = (text, tone) =>
    el("span", { class: "cc-badge " + (tone || ""), text });
  const toneFor = (s) =>
    s === "passed" || s === "submitted"
      ? "ok"
      : s === "failed" || s === "blocked"
        ? "bad"
        : s === "running"
          ? "run"
          : "muted";
  const time = (s) => {
    if (!s) return "—";
    const d = new Date(s);
    return Number.isNaN(d.getTime())
      ? "—"
      : d.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "medium" });
  };
  const duration = (a, b) => {
    const x = Date.parse(a),
      y = Date.parse(b);
    if (!Number.isFinite(x) || !Number.isFinite(y) || y < x) return null;
    const s = Math.round((y - x) / 1000);
    return s < 60
      ? s + " detik"
      : Math.floor(s / 60) + " menit " + (s % 60) + " detik";
  };
  const setStatus = (t) => (statusLine.textContent = t);

  // ---------- API ----------
  class ApiError extends Error {
    constructor(status, data) {
      super((data && (data.message || data.error)) || "request_failed");
      this.status = status;
      this.code = data && data.error;
      this.data = data || {};
    }
  }
  async function api(path, opts = {}) {
    const ctrl = new AbortController();
    const timer = opts.timeoutMs
      ? setTimeout(() => ctrl.abort(), opts.timeoutMs)
      : null;
    let r;
    try {
      r = await fetch("/api" + path, {
        method: opts.method || "GET",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-HIO-Request": "operator",
        },
        signal: opts.signal || ctrl.signal,
      });
    } catch (e) {
      throw new ApiError(0, {
        error: e && e.name === "AbortError" ? "timeout" : "network",
      });
    } finally {
      if (timer) clearTimeout(timer);
    }
    let data = null;
    try {
      data = await r.json();
    } catch {
      data = null;
    }
    if (!r.ok) throw new ApiError(r.status, data);
    return data;
  }
  function describeApiError(e) {
    if (!(e instanceof ApiError)) return "Terjadi galat tak terduga.";
    if (e.status === 0)
      return e.code === "timeout"
        ? "Permintaan melewati batas waktu."
        : "Koneksi terputus. Periksa jaringan.";
    if (e.status === 401) return "Sesi berakhir. Masuk lagi di halaman HIO.";
    if (e.status === 403) return "Akses ditolak untuk sesi ini.";
    if (e.status === 429)
      return "Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi.";
    if (e.code && (ERRORS[e.code] || /_failed$|^daytona_/.test(e.code)))
      return explainError(e.code);
    if (e.data && typeof e.data.message === "string")
      return e.data.message.slice(0, 300);
    if (e.status >= 500) return "Server mengalami gangguan (" + e.status + ").";
    return "Permintaan gagal (" + e.status + ").";
  }
  function sessionExpired() {
    body.replaceChildren(
      el(
        "section",
        { class: "cc-panel cc-alert bad", role: "alert" },
        el("h2", { text: "Sesi berakhir" }),
        el("p", {
          text: "Masuk lagi di halaman utama HIO, lalu buka konsol ini kembali.",
        }),
        el(
          "a",
          { class: "plan-button", href: "/founder/login" },
          "Ke halaman masuk founder",
        ),
      ),
    );
    setStatus("Sesi tidak aktif");
  }

  // ---------- state ----------
  const state = {
    taskId: null,
    task: null,
    execution: null,
    executionKnown: false,
    executePending: false,
    pollTimer: null,
    pollInFlight: false,
    pollFailures: 0,
    view: 0,
  };
  function stopPolling() {
    if (state.pollTimer) clearTimeout(state.pollTimer);
    state.pollTimer = null;
  }

  // ---------- list ----------
  async function loadList() {
    const nav = $("#cc-list");
    nav.replaceChildren(el("p", { class: "cc-muted", text: "Memuat task…" }));
    try {
      const d = await api("/v1/agent/code-tasks");
      const items = Array.isArray(d && d.items) ? d.items : [];
      nav.replaceChildren();
      if (!items.length) {
        nav.append(
          el(
            "div",
            { class: "cc-muted" },
            el("p", { text: "Belum ada coding task." }),
            el(
              "p",
              {},
              "Buat proposal dari ",
              el("a", { href: "/agent" }, "AI Workspace"),
              " dengan tombol “Buat patch coding”.",
            ),
          ),
        );
        if (!state.taskId) setStatus("Belum ada coding task");
        return;
      }
      for (const t of items) {
        const run = t.execution_status;
        const item = el(
          "button",
          {
            type: "button",
            class: "cc-item" + (t.id === state.taskId ? " active" : ""),
            "aria-current": t.id === state.taskId ? "true" : null,
            onclick: () => openTask(t.id, true),
          },
          el("span", {
            class: "cc-item-title",
            text: t.title || "(tanpa judul)",
          }),
          el(
            "span",
            { class: "cc-item-meta" },
            badge(TASK_STATUS[t.status] || String(t.status), toneFor(t.status)),
            run
              ? badge("Sandbox: " + (RUN_STATUS[run] || run), toneFor(run))
              : badge("Belum dieksekusi", "muted"),
          ),
          el("span", {
            class: "cc-item-sub",
            text:
              (Number.isFinite(t.file_count) ? t.file_count + " file · " : "") +
              "diperbarui " +
              time(t.updated_at),
          }),
        );
        nav.append(item);
      }
      if (!state.taskId) setStatus(items.length + " coding task");
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) return sessionExpired();
      nav.replaceChildren(
        el(
          "div",
          { class: "cc-alert bad", role: "alert" },
          el("p", { text: "Daftar gagal dimuat. " + describeApiError(e) }),
          el(
            "button",
            { type: "button", class: "plan-button", onclick: loadList },
            "Coba lagi",
          ),
        ),
      );
    }
  }

  // ---------- task detail ----------
  async function openTask(id, push) {
    if (!/^[0-9a-f-]{36}$/i.test(id)) {
      body.replaceChildren(
        el(
          "section",
          { class: "cc-panel cc-alert bad", role: "alert" },
          el("p", { text: ERRORS.invalid_task_id }),
        ),
      );
      return;
    }
    stopPolling();
    const view = ++state.view;
    Object.assign(state, {
      taskId: id,
      task: null,
      execution: null,
      executionKnown: false,
      pollFailures: 0,
    });
    if (push)
      history.pushState(
        { id },
        "",
        "/agent/code?task=" + encodeURIComponent(id),
      );
    document
      .querySelectorAll(".cc-item")
      .forEach((b) => b.classList.remove("active"));
    document.body.classList.add("cc-detail-open");
    $("#cc-back").hidden = false;
    body.replaceChildren(
      el("p", {
        class: "cc-muted cc-pad",
        role: "status",
        text: "Memuat task…",
      }),
    );
    try {
      const d = await api("/v1/agent/code-tasks/" + encodeURIComponent(id));
      if (view !== state.view) return;
      state.task = d;
      renderTask();
      await refreshExecution(view, false);
      if (
        view === state.view &&
        state.execution &&
        state.execution.status === "running"
      )
        schedulePoll(view);
    } catch (e) {
      if (view !== state.view) return;
      if (e instanceof ApiError && e.status === 401) return sessionExpired();
      body.replaceChildren(
        el(
          "section",
          { class: "cc-panel cc-alert bad", role: "alert" },
          el("h2", { text: "Task tidak bisa dimuat" }),
          el("p", { text: describeApiError(e) }),
          el(
            "button",
            {
              type: "button",
              class: "plan-button",
              onclick: () => openTask(id, false),
            },
            "Coba lagi",
          ),
        ),
      );
      setStatus("Task gagal dimuat");
    }
    loadList();
  }

  function renderTask() {
    const { task, files, checks } = state.task;
    const fileList = Array.isArray(files) ? files : [];
    const checkList = Array.isArray(checks) ? checks : [];
    $("#cc-heading").textContent = task.title || "Coding task";
    const meta = el(
      "dl",
      { class: "cc-meta" },
      el(
        "div",
        {},
        el("dt", { text: "ID task" }),
        el("dd", {}, el("code", { text: task.id })),
      ),
      el(
        "div",
        {},
        el("dt", { text: "Status task" }),
        el(
          "dd",
          {},
          badge(
            TASK_STATUS[task.status] || String(task.status),
            toneFor(task.status),
          ),
        ),
      ),
      el(
        "div",
        {},
        el("dt", { text: "Dibuat" }),
        el("dd", { text: time(task.created_at) }),
      ),
      el(
        "div",
        {},
        el("dt", { text: "Diperbarui" }),
        el("dd", { text: time(task.updated_at) }),
      ),
      el(
        "div",
        {},
        el("dt", { text: "File diusulkan" }),
        el("dd", { text: String(fileList.length) }),
      ),
      task.pr_url
        ? el(
            "div",
            {},
            el("dt", { text: "Draft PR" }),
            el(
              "dd",
              {},
              el("a", {
                href: task.pr_url,
                target: "_blank",
                rel: "noopener noreferrer",
                text: "Buka di GitHub",
              }),
            ),
          )
        : null,
    );
    const overview = el(
      "section",
      { class: "cc-panel", "aria-labelledby": "cc-overview-h" },
      el("h2", { id: "cc-overview-h", text: "Ringkasan" }),
      el("p", { class: "cc-objective", text: task.objective || "" }),
      task.summary ? el("p", { class: "cc-muted", text: task.summary }) : null,
      meta,
    );
    const filesPanel = el(
      "section",
      { class: "cc-panel", "aria-labelledby": "cc-files-h" },
      el("h2", {
        id: "cc-files-h",
        text: "Perubahan yang diusulkan (" + fileList.length + " file)",
      }),
      fileList.length
        ? fileList.map((f, i) =>
            el(
              "details",
              { class: "cc-file", open: i === 0 },
              el(
                "summary",
                {},
                el("code", { text: f.path || "(path kosong)" }),
                el("span", {
                  class: "cc-muted",
                  text:
                    " · " +
                    String(f.content || "")
                      .replace(/\n$/, "")
                      .split("\n").length +
                    " baris",
                }),
              ),
              f.rationale
                ? el("p", {
                    class: "cc-rationale",
                    text: "Alasan: " + f.rationale,
                  })
                : null,
              codeBlock(String(f.content || "")),
            ),
          )
        : el("p", {
            class: "cc-muted",
            text: "Proposal ini tidak berisi file.",
          }),
    );
    const checksPanel = el(
      "section",
      { class: "cc-panel", "aria-labelledby": "cc-checks-h" },
      el("h2", { id: "cc-checks-h", text: "Pemeriksaan" }),
      el("p", {
        class: "cc-muted",
        text: "Pemeriksaan tetap yang dijalankan backend di sandbox, berurutan:",
      }),
      el(
        "ol",
        { class: "cc-fixed-checks" },
        CHECKS.map(([, label, cmd]) =>
          el("li", {}, label + " — ", el("code", { text: cmd })),
        ),
      ),
      checkList.length
        ? [
            el("p", {
              class: "cc-muted",
              text: "Pemeriksaan yang disarankan AI dalam proposal (informasi, tidak dijalankan otomatis):",
            }),
            el(
              "ul",
              {},
              checkList.map((c) => el("li", { text: String(c) })),
            ),
          ]
        : null,
    );
    body.replaceChildren(
      overview,
      filesPanel,
      checksPanel,
      el(
        "section",
        { class: "cc-panel", id: "cc-exec", "aria-labelledby": "cc-exec-h" },
        el("h2", { id: "cc-exec-h", text: "Eksekusi sandbox" }),
        el("p", { class: "cc-muted", text: "Memeriksa catatan eksekusi…" }),
      ),
    );
    setStatus("Task · " + (TASK_STATUS[task.status] || task.status));
    $("#console-main").focus();
  }

  function codeBlock(text) {
    const lines = text.replace(/\n$/, "").split("\n");
    const pre = el("pre", { class: "cc-code", tabindex: "0" });
    const code = el("code");
    lines.forEach((line, i) => {
      code.append(
        el("span", { class: "ln", "aria-hidden": "true", text: String(i + 1) }),
        document.createTextNode(line + (i < lines.length - 1 ? "\n" : "")),
      );
    });
    pre.append(code);
    return pre;
  }

  // ---------- execution ----------
  async function refreshExecution(view, fromPoll) {
    if (state.pollInFlight) return;
    state.pollInFlight = true;
    try {
      const d = await api(
        "/v1/agent/code-tasks/" +
          encodeURIComponent(state.taskId) +
          "/execution",
        { timeoutMs: 15000 },
      );
      if (view !== state.view) return;
      state.execution = d && d.execution ? d.execution : null;
      state.executionKnown = true;
      state.pollFailures = 0;
    } catch (e) {
      if (view !== state.view) return;
      if (
        e instanceof ApiError &&
        e.status === 404 &&
        e.code === "execution_not_found"
      ) {
        state.execution = null;
        state.executionKnown = true;
      } else if (e instanceof ApiError && e.status === 401) {
        stopPolling();
        return sessionExpired();
      } else {
        state.pollFailures += 1;
        state.executionKnown = state.executionKnown && fromPoll;
        renderExecution(describeApiError(e));
        return;
      }
    } finally {
      state.pollInFlight = false;
    }
    renderExecution();
  }

  function schedulePoll(view) {
    stopPolling();
    const delay = Math.min(
      2000 * Math.pow(2, Math.max(0, state.pollFailures - 1)),
      15000,
    );
    state.pollTimer = setTimeout(async () => {
      if (view !== state.view || document.hidden) {
        if (view === state.view) schedulePoll(view);
        return;
      }
      await refreshExecution(view, true);
      const running = state.execution && state.execution.status === "running";
      if (
        view === state.view &&
        (running || state.executePending || state.pollFailures)
      )
        schedulePoll(view);
    }, delay);
  }

  function renderExecution(transientError) {
    const host = $("#cc-exec");
    if (!host || !state.task) return;
    const ex = state.execution;
    const task = state.task.task;
    const children = [el("h2", { id: "cc-exec-h", text: "Eksekusi sandbox" })];
    if (transientError)
      children.push(
        el(
          "div",
          { class: "cc-alert warn", role: "alert" },
          el("p", {
            text:
              "Status eksekusi belum bisa dibaca: " +
              transientError +
              (state.pollFailures ? " Mencoba lagi otomatis…" : ""),
          }),
        ),
      );

    if (!ex) {
      children.push(
        el("p", {
          text: state.executionKnown
            ? "Belum ada catatan eksekusi untuk task ini. Belum ada pemeriksaan yang lulus."
            : "Status eksekusi belum diketahui.",
        }),
      );
    } else {
      children.push(executionSummary(ex), stepList(ex), outputList(ex));
      if (ex.status !== "running") children.push(finalReport(ex));
    }
    children.push(actionArea(task, ex));
    host.replaceChildren(...children);
    const s = ex ? RUN_STATUS[ex.status] || ex.status : "belum dieksekusi";
    setStatus(
      "Sandbox · " +
        s +
        (ex && ex.status === "running"
          ? " · " + (STEP_LABELS[ex.currentStep] || ex.currentStep || "")
          : ""),
    );
  }

  function evidenceSteps(ex) {
    const steps =
      ex && ex.evidence && Array.isArray(ex.evidence.steps)
        ? ex.evidence.steps
        : [];
    return steps.filter((s) => s && typeof s.name === "string");
  }
  function checkState(ex) {
    // Ordered attempts per check; final state uses the latest attempt.
    const attempts = {};
    for (const s of evidenceSteps(ex)) {
      if (CHECK_NAMES.includes(s.name))
        (attempts[s.name] = attempts[s.name] || []).push(s);
    }
    return attempts;
  }

  function executionSummary(ex) {
    const ev = ex.evidence || {};
    const attempts = checkState(ex);
    const done = CHECK_NAMES.filter(
      (n) => attempts[n] && attempts[n][attempts[n].length - 1].exitCode === 0,
    ).length;
    const dur = duration(
      ex.startedAt,
      ex.finishedAt || (ex.status === "running" ? ex.updatedAt : null),
    );
    return el(
      "div",
      { class: "cc-summary" },
      el(
        "div",
        { class: "cc-summary-head" },
        badge(RUN_STATUS[ex.status] || String(ex.status), toneFor(ex.status)),
        el("span", {
          class: "cc-current",
          text:
            ex.status === "running"
              ? "Langkah saat ini: " +
                (STEP_LABELS[ex.currentStep] || ex.currentStep || "—")
              : "",
        }),
      ),
      el(
        "div",
        {
          class: "cc-progress",
          role: "progressbar",
          "aria-label": "Pemeriksaan lulus",
          "aria-valuemin": "0",
          "aria-valuemax": String(CHECK_NAMES.length),
          "aria-valuenow": String(done),
          "aria-valuetext":
            done + " dari " + CHECK_NAMES.length + " pemeriksaan lulus",
        },
        progressFill(done / CHECK_NAMES.length),
      ),
      el("p", {
        class: "cc-muted",
        text:
          done +
          " dari " +
          CHECK_NAMES.length +
          " pemeriksaan wajib lulus (berdasarkan exit code yang dilaporkan backend).",
      }),
      el(
        "dl",
        { class: "cc-meta" },
        el(
          "div",
          {},
          el("dt", { text: "Run ID" }),
          el("dd", {}, el("code", { text: ex.runId || "—" })),
        ),
        el(
          "div",
          {},
          el("dt", { text: "Mulai" }),
          el("dd", { text: time(ex.startedAt) }),
        ),
        el(
          "div",
          {},
          el("dt", { text: ex.finishedAt ? "Selesai" : "Pembaruan terakhir" }),
          el("dd", { text: time(ex.finishedAt || ex.updatedAt) }),
        ),
        dur
          ? el(
              "div",
              {},
              el("dt", {
                text: ex.finishedAt ? "Durasi" : "Berjalan sejak mulai",
              }),
              el("dd", { text: dur }),
            )
          : null,
        el(
          "div",
          {},
          el("dt", { text: "Penyedia" }),
          el("dd", {
            text:
              ev.provider === "daytona"
                ? "Daytona"
                : ev.provider
                  ? String(ev.provider)
                  : "—",
          }),
        ),
        el(
          "div",
          {},
          el("dt", { text: "Sandbox dibuat" }),
          el("dd", {
            text:
              typeof ev.sandboxCreated === "boolean"
                ? ev.sandboxCreated
                  ? "Ya"
                  : "Tidak"
                : "Belum dilaporkan",
          }),
        ),
        el(
          "div",
          {},
          el("dt", { text: "Percobaan perbaikan AI" }),
          el("dd", {
            text: Number.isFinite(ev.repairAttempts)
              ? ev.repairAttempts + " dari maks. 2"
              : "0",
          }),
        ),
      ),
    );
  }

  function stepList(ex) {
    const attempts = checkState(ex);
    const runningStep = ex.status === "running" ? ex.currentStep : null;
    return el(
      "ol",
      { class: "cc-steps", "aria-label": "Pemeriksaan wajib" },
      CHECKS.map(([id, label, cmd]) => {
        const list = attempts[id] || [];
        const last = list[list.length - 1];
        let st, tone;
        if (
          runningStep === id &&
          (!last || (list.length && last.exitCode !== 0 && runningStep === id))
        ) {
          st = "Sedang berjalan";
          tone = "run";
        } else if (!last) {
          st = ex.status === "running" ? "Menunggu" : "Tidak dijalankan";
          tone = "muted";
        } else if (last.exitCode === 0) {
          st = list.length > 1 ? "Lulus setelah perbaikan" : "Lulus";
          tone = "ok";
        } else {
          st = "Gagal";
          tone = "bad";
        }
        return el(
          "li",
          { class: "cc-step " + tone },
          el("span", { class: "cc-step-dot", "aria-hidden": "true" }),
          el(
            "span",
            { class: "cc-step-name" },
            el("strong", { text: label }),
            " ",
            el("code", { text: cmd }),
          ),
          el(
            "span",
            { class: "cc-step-state" },
            badge(st, tone),
            list.length
              ? el("span", {
                  class: "cc-muted",
                  text: " exit " + list.map((a) => a.exitCode).join(" → "),
                })
              : null,
          ),
        );
      }),
    );
  }

  function outputList(ex) {
    const steps = evidenceSteps(ex);
    if (!steps.length)
      return el("p", {
        class: "cc-muted",
        text:
          ex.status === "running"
            ? "Belum ada output yang dilaporkan backend."
            : "Backend tidak melaporkan output langkah.",
      });
    const counts = {};
    return el(
      "details",
      { class: "cc-log", open: ex.status !== "passed" },
      el("summary", {
        text:
          "Bukti langkah demi langkah (" +
          steps.length +
          " entri, sesuai urutan backend)",
      }),
      el(
        "ol",
        { class: "cc-log-list" },
        steps.map((s) => {
          counts[s.name] = (counts[s.name] || 0) + 1;
          const isCheck = CHECK_NAMES.includes(s.name);
          const label =
            s.name === "clone"
              ? "Kloning repository"
              : s.name === "repair_attempt"
                ? "Perbaikan AI diterapkan"
                : s.name.startsWith("write:")
                  ? "Tulis " + s.name.slice(6)
                  : s.name.startsWith("repair:")
                    ? "Tulis perbaikan " + s.name.slice(7)
                    : STEP_LABELS[s.name] || s.name;
          const out = typeof s.output === "string" ? s.output : "";
          return el(
            "li",
            { class: s.exitCode === 0 ? "ok" : "bad" },
            el(
              "div",
              { class: "cc-log-head" },
              el("strong", {
                text:
                  label +
                  (isCheck && counts[s.name] > 1
                    ? " (percobaan " + counts[s.name] + ")"
                    : ""),
              }),
              badge("exit " + s.exitCode, s.exitCode === 0 ? "ok" : "bad"),
            ),
            out
              ? el("pre", { class: "cc-out", tabindex: "0", text: out })
              : el("p", { class: "cc-muted", text: "Tanpa output." }),
          );
        }),
      ),
      el("p", {
        class: "cc-muted",
        text: "Output dipotong oleh backend (maks. 1.000 karakter per langkah saat berjalan, 4.000 setelah selesai).",
      }),
    );
  }

  function finalReport(ex) {
    const ev = ex.evidence || {};
    const attempts = checkState(ex);
    const passed = CHECK_NAMES.filter(
      (n) => attempts[n] && attempts[n][attempts[n].length - 1].exitCode === 0,
    );
    const failed = CHECK_NAMES.filter(
      (n) => attempts[n] && attempts[n][attempts[n].length - 1].exitCode !== 0,
    );
    const skipped = CHECK_NAMES.filter((n) => !attempts[n]);
    const ok = ex.status === "passed";
    const cleanup =
      ev.sandboxDisposed === false || ex.errorCode === "sandbox_cleanup_failed"
        ? "Sandbox dibuat tetapi gagal dihapus — periksa dasbor Daytona."
        : ev.sandboxCreated && ev.sandboxDisposed === true
          ? "Sandbox dibuat dan sudah dihapus (dikonfirmasi backend)."
          : ev.sandboxCreated
            ? "Sandbox dibuat; status penghapusan tidak dilaporkan backend."
            : ev.sandboxCreated === false
              ? "Sandbox tidak dibuat."
              : "Status sandbox tidak dilaporkan.";
    return el(
      "div",
      {
        class: "cc-report " + (ok ? "ok" : "bad"),
        role: "region",
        "aria-label": "Laporan akhir eksekusi",
      },
      el("h3", {
        text: ok
          ? "Semua pemeriksaan wajib lulus di sandbox"
          : "Eksekusi gagal",
      }),
      !ok && ex.errorCode
        ? el("p", { text: explainError(ex.errorCode) })
        : null,
      el(
        "ul",
        {},
        el("li", {
          text:
            "Lulus: " +
            (passed.length
              ? passed.map((n) => STEP_LABELS[n]).join(", ")
              : "tidak ada"),
        }),
        failed.length
          ? el("li", {
              text: "Gagal: " + failed.map((n) => STEP_LABELS[n]).join(", "),
            })
          : null,
        skipped.length
          ? el("li", {
              text:
                "Tidak dijalankan: " +
                skipped.map((n) => STEP_LABELS[n]).join(", "),
            })
          : null,
        el("li", {
          text:
            "Percobaan perbaikan AI: " +
            (Number.isFinite(ev.repairAttempts) ? ev.repairAttempts : 0),
        }),
        el("li", { text: cleanup }),
      ),
      el(
        "p",
        { class: "cc-notice" },
        el("strong", { text: "Penting: " }),
        "validasi sandbox bukan pull request, bukan merge, dan bukan deploy produksi. Kode belum masuk ke repository.",
      ),
      el("p", {
        class: "cc-muted",
        text: ok
          ? "Langkah aman berikutnya: tinjau kode di atas, lalu kirim sebagai draft PR dari AI Workspace bila sudah yakin."
          : "Langkah aman berikutnya: baca output langkah yang gagal, perbaiki tujuan atau file target, lalu buat proposal baru dari AI Workspace.",
      }),
    );
  }

  function actionArea(task, ex) {
    const wrap = el("div", { class: "cc-actions" });
    const refresh = el(
      "button",
      {
        type: "button",
        class: "plan-button",
        onclick: async () => {
          refresh.disabled = true;
          await refreshExecution(state.view, false);
          refresh.disabled = false;
        },
      },
      "Muat ulang status",
    );
    if (task.status !== "draft") {
      wrap.append(
        el("p", {
          class: "cc-muted",
          text: "Hanya proposal berstatus draft yang dapat dijalankan di sandbox.",
        }),
        refresh,
      );
      return wrap;
    }
    if (ex && ex.status === "running") {
      wrap.append(
        el("p", {
          class: "cc-muted",
          text: state.executePending
            ? "Permintaan eksekusi masih berjalan di server. Konsol memantau status tiap 2 detik."
            : "Eksekusi sedang berjalan. Konsol memantau status tiap 2 detik.",
        }),
        refresh,
      );
      return wrap;
    }
    if (state.executePending) {
      wrap.append(
        el("p", { class: "cc-muted", text: "Mengirim permintaan eksekusi…" }),
      );
      return wrap;
    }
    const confirmBox = el("input", { type: "checkbox", id: "cc-confirm" });
    const run = el(
      "button",
      { type: "button", class: "send", id: "cc-run", disabled: true },
      ex ? "Jalankan ulang di sandbox" : "Jalankan di sandbox",
    );
    confirmBox.addEventListener(
      "change",
      () => (run.disabled = !confirmBox.checked),
    );
    run.addEventListener("click", () => startExecution(run));
    wrap.append(
      el(
        "p",
        { class: "cc-notice" },
        "Eksekusi membuat sandbox Daytona sekali pakai, mengkloning repository HIO, menulis file proposal, lalu menjalankan 7 pemeriksaan wajib (maks. 2 perbaikan AI). Ini dapat memakai kuota penyedia sandbox dan AI. Tidak ada PR, merge, atau deploy.",
      ),
      el(
        "label",
        { class: "cc-confirm", for: "cc-confirm" },
        confirmBox,
        " Saya sudah meninjau proposal dan setuju menjalankannya di sandbox.",
      ),
      el("div", { class: "cc-actions-row" }, run, refresh),
    );
    return wrap;
  }

  async function startExecution(button) {
    if (state.executePending) return;
    const view = state.view;
    const id = state.taskId;
    state.executePending = true;
    button.disabled = true;
    renderExecution();
    setStatus("Sandbox · mengirim permintaan eksekusi");
    // Start polling immediately: the POST is synchronous and may take minutes.
    setTimeout(() => {
      if (view === state.view)
        refreshExecution(view, true).then(
          () => view === state.view && schedulePoll(view),
        );
    }, 1500);
    try {
      await api("/v1/agent/code-tasks/" + encodeURIComponent(id) + "/execute", {
        method: "POST",
        timeoutMs: 15 * 60 * 1000,
      });
    } catch (e) {
      if (view !== state.view) return;
      if (e instanceof ApiError && e.status === 401) {
        state.executePending = false;
        stopPolling();
        return sessionExpired();
      }
      // 502 = run finished with failure (evidence recorded); other errors are shown as-is.
      if (
        !(e instanceof ApiError && e.status === 502 && e.data && e.data.runId)
      ) {
        const msg = describeApiError(e);
        state.executePending = false;
        await refreshExecution(view, false);
        const host = $("#cc-exec");
        if (host)
          host.insertBefore(
            el(
              "div",
              {
                class: "cc-alert " + (e.status === 409 ? "warn" : "bad"),
                role: "alert",
              },
              el("p", {
                text:
                  (e.status === 0
                    ? "Hubungan ke server terputus sebelum hasil diterima; status di bawah dibaca ulang dari server. "
                    : "") + msg,
              }),
            ),
            host.children[1] || null,
          );
        if (state.execution && state.execution.status === "running")
          schedulePoll(view);
        return;
      }
    }
    if (view !== state.view) return;
    state.executePending = false;
    stopPolling();
    await refreshExecution(view, false);
    loadList();
  }

  // ---------- navigation ----------
  $("#cc-refresh-list").addEventListener("click", loadList);
  $("#cc-back").addEventListener("click", () => {
    stopPolling();
    state.view++;
    state.taskId = null;
    document.body.classList.remove("cc-detail-open");
    $("#cc-back").hidden = true;
    history.pushState({}, "", "/agent/code");
    $("#cc-heading").textContent = "Konsol eksekusi";
    body.replaceChildren(
      el(
        "section",
        { class: "cc-empty" },
        el("h1", { text: "Pilih coding task" }),
        el("p", {
          text: "Pilih task di daftar untuk meninjau proposal dan menjalankan validasi sandbox.",
        }),
      ),
    );
    loadList();
  });
  window.addEventListener("popstate", () => {
    const id = new URLSearchParams(location.search).get("task");
    if (id) openTask(id, false);
    else $("#cc-back").click();
  });
  document.addEventListener("visibilitychange", () => {
    if (
      !document.hidden &&
      state.taskId &&
      state.execution &&
      state.execution.status === "running"
    )
      refreshExecution(state.view, true);
  });
  window.addEventListener("pagehide", stopPolling);

  loadList();
  const initial = new URLSearchParams(location.search).get("task");
  if (initial) openTask(initial, false);
})();
