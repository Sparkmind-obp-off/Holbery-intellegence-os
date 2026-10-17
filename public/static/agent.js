const $ = (s) => document.querySelector(s);
let conversationId = null;
let busy = false;
const messages = $("#messages");
const input = $("#input");
function safeText(tag, text, cls) {
  const el = document.createElement(tag);
  el.className = cls || "";
  el.textContent = text;
  return el;
}
function showMessage(role, content) {
  $("#welcome")?.remove();
  const box = document.createElement("article");
  box.className = "msg " + (role === "user" ? "user" : "assistant");
  box.append(
    safeText("div", role === "user" ? "KAMU" : "HOLBERY AI", "role"),
    safeText("div", content),
  );
  messages.append(box);
  messages.scrollTop = messages.scrollHeight;
  return box;
}
function headers() {
  return { "Content-Type": "application/json", "X-HIO-Request": "operator" };
}
async function loadHistory() {
  try {
    const r = await fetch("/api/v1/agent/conversations");
    if (!r.ok) return;
    const d = await r.json();
    $("#history").replaceChildren();
    for (const item of d.items) {
      const b = safeText("button", item.title);
      b.onclick = () => openConversation(item.id);
      $("#history").append(b);
    }
  } catch {}
}
async function openConversation(id) {
  const r = await fetch(
    "/api/v1/agent/conversations/" + encodeURIComponent(id) + "/messages",
  );
  if (!r.ok) return;
  const d = await r.json();
  conversationId = id;
  messages.replaceChildren();
  for (const m of d.items) showMessage(m.role, m.content);
  await loadHistory();
}
async function sendMessage(text) {
  if (busy || !text.trim()) return;
  busy = true;
  $("#send").disabled = true;
  input.disabled = true;
  showMessage("user", text);
  const pending = showMessage("assistant", "Sedang berpikir…");
  try {
    const r = await fetch("/api/v1/agent/chat", {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ conversationId, message: text }),
    });
    const d = await r.json();
    pending.remove();
    if (!r.ok) {
      showMessage("assistant", d.message || "Chat gagal. Coba lagi.");
      $("#status").textContent =
        d.error === "provider_missing"
          ? "Provider belum dikonfigurasi"
          : "Provider tidak tersedia";
      return;
    }
    conversationId = d.conversationId;
    showMessage("assistant", d.message.content);
    $("#status").textContent = "Terhubung · Groq";
    await loadHistory();
  } catch {
    pending.remove();
    showMessage("assistant", "Koneksi gagal. Coba lagi.");
  } finally {
    busy = false;
    $("#send").disabled = false;
    input.disabled = false;
    input.focus();
  }
}
$("#form").addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  input.value = "";
  input.style.height = "auto";
  sendMessage(text);
});
$("#new").onclick = $("#new-mobile").onclick = () => {
  conversationId = null;
  messages.replaceChildren();
  const w = document.createElement("div");
  w.className = "welcome";
  w.append(
    safeText("h1", "What are we building today?"),
    safeText(
      "p",
      "Chat, riset, susun strategi, tulis konten, dan rencanakan agent berikutnya.",
    ),
  );
  messages.append(w);
  input.focus();
};
document.querySelectorAll(".chips button").forEach(
  (b) =>
    (b.onclick = () => {
      input.value = b.textContent;
      input.focus();
    }),
);
input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = Math.min(input.scrollHeight, 180) + "px";
});
fetch("/api/v1/me")
  .then((r) =>
    r.ok
      ? ($("#status").textContent = "Workspace siap · memeriksa provider")
      : ($("#status").textContent = "Sesi tidak aktif"),
  )
  .catch(() => ($("#status").textContent = "Status koneksi tidak diketahui"));
loadHistory();

async function createAgentPlan(objective) {
  if (busy || !objective.trim()) return;
  busy = true;
  $("#plan").disabled = true;
  $("#send").disabled = true;
  input.disabled = true;
  const pending = showMessage("assistant", "Menyusun rencana terstruktur…");
  try {
    const r = await fetch("/api/v1/agent/runs", {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ objective }),
    });
    const d = await r.json();
    pending.remove();
    if (!r.ok) {
      showMessage("assistant", d.message || "Rencana gagal dibuat.");
      $("#status").textContent = "Perencanaan gagal";
      return;
    }
    const lines = [
      d.plan.title,
      d.plan.summary,
      "",
      ...d.plan.steps.map(
        (s, i) =>
          String(i + 1) +
          ". " +
          s.title +
          " [" +
          s.tool +
          "]\n" +
          s.description +
          "\nBatas: " +
          (s.risk === "read_only" ? "read-only" : "draft only"),
      ),
      "",
      "Run ID: " + d.run.id,
      "Status: planned — belum dieksekusi.",
    ];
    const card = showMessage("assistant", lines.join("\n"));
    const researchIndex = d.plan.steps.findIndex(
      (s) => s.tool === "research.search" && s.risk === "read_only",
    );
    if (researchIndex >= 0) {
      const runButton = document.createElement("button");
      runButton.className = "plan-button";
      runButton.type = "button";
      runButton.textContent = "Setujui & jalankan riset web";
      runButton.title =
        "Panggilan provider riset dan analisis AI dapat memakai kuota atau biaya akun.";
      runButton.onclick = () =>
        executeResearch(d.run.id, researchIndex + 1, runButton);
      card.append(document.createElement("br"), runButton);
    }
    $("#status").textContent = "Rencana tersimpan · belum dieksekusi";
    input.value = "";
    await loadHistory();
    await loadRuns();
  } catch {
    pending.remove();
    showMessage(
      "assistant",
      "Koneksi gagal. Tidak ada rencana simulasi yang disimpan.",
    );
  } finally {
    busy = false;
    $("#plan").disabled = false;
    $("#send").disabled = false;
    input.disabled = false;
    input.focus();
  }
}
$("#plan").addEventListener("click", () => {
  const objective = input.value.trim();
  if (!objective) {
    input.focus();
    input.placeholder =
      "Tulis tujuan tugas dahulu, lalu tekan Rencanakan tugas";
    return;
  }
  input.value = "";
  input.style.height = "auto";
  createAgentPlan(objective);
});

async function loadRuns() {
  try {
    const r = await fetch("/api/v1/agent/runs");
    if (!r.ok) return;
    const d = await r.json();
    const nav = $("#run-history");
    nav.replaceChildren();
    for (const run of d.items) {
      const b = safeText("button", run.title + " · " + run.status);
      b.onclick = () => openRun(run.id);
      nav.append(b);
    }
  } catch {}
}
async function openRun(id) {
  try {
    const r = await fetch("/api/v1/agent/runs/" + encodeURIComponent(id));
    if (!r.ok) return;
    const d = await r.json();
    messages.replaceChildren();
    const run = d.run;
    showMessage(
      "assistant",
      run.title +
        "\n" +
        run.objective +
        "\n\n" +
        run.summary +
        "\n\nRun ID: " +
        run.id +
        " · " +
        run.status,
    );
    for (const step of d.steps) {
      const box = showMessage(
        "assistant",
        step.sequence +
          ". " +
          step.title +
          " [" +
          step.status +
          "]\n" +
          step.description +
          (step.result
            ? "\n\nHasil: " + JSON.stringify(step.result, null, 2)
            : ""),
      );
      if (
        step.status === "planned" &&
        step.tool === "research.search" &&
        step.risk === "read_only"
      ) {
        const b = document.createElement("button");
        b.className = "plan-button";
        b.textContent = "Setujui & jalankan riset web";
        b.title = "Kuota atau biaya provider yang terhubung mungkin berlaku.";
        b.onclick = () => executeResearch(run.id, step.sequence, b);
        box.append(document.createElement("br"), b);
      }
    }
    $("#status").textContent = "Agent run · " + run.status;
  } catch {
    $("#status").textContent = "Run tidak bisa dimuat";
  }
}
async function executeResearch(runId, sequence, button) {
  if (
    !window.confirm(
      "Jalankan riset web dan analisis AI? Kuota atau biaya provider yang terhubung mungkin berlaku. Tindakan hanya dimulai setelah persetujuan ini.",
    )
  )
    return;
  button.disabled = true;
  button.textContent = "Menjalankan riset…";
  try {
    const r = await fetch(
      "/api/v1/agent/runs/" +
        encodeURIComponent(runId) +
        "/steps/" +
        sequence +
        "/execute",
      {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ approve: true, provider: "tavily" }),
      },
    );
    const d = await r.json();
    if (!r.ok) {
      showMessage("assistant", d.message || "Riset belum berhasil dijalankan.");
      if (r.status === 503 || r.status === 429) {
        button.disabled = false;
        button.textContent = "Coba lagi setelah cek provider/kuota";
      } else {
        button.disabled = true;
        button.textContent = "Percobaan gagal — cek log run";
      }
      return;
    }
    const result = d.step.result;
    const summary = [
      d.step.title + " — " + d.step.status,
      "Status riset: " + result.status,
      "Jumlah bukti: " + result.evidenceCount,
      ...result.sources.map(
        (s, i) =>
          i + 1 + ". " + s.judul + "\n" + s.tautanSumber + "\n" + s.kutipan,
      ),
    ];
    showMessage("assistant", summary.join("\n\n"));
    button.textContent = "Riset selesai";
    $("#status").textContent =
      "Tool selesai · " + result.evidenceCount + " bukti";
    await loadRuns();
  } catch {
    showMessage(
      "assistant",
      "Koneksi gagal saat menjalankan riset. Periksa status run sebelum mencoba ulang.",
    );
    button.disabled = true;
  }
}
loadRuns();

async function createCodeTask(objective) {
  if (busy || !objective.trim()) return;
  const paths = $("#target-files")
    .value.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (paths.length < 1 || paths.length > 3) {
    showMessage("assistant", "Pilih 1–3 path file yang diizinkan.");
    return;
  }
  busy = true;
  $("#code").disabled = true;
  $("#plan").disabled = true;
  $("#send").disabled = true;
  input.disabled = true;
  const pending = showMessage(
    "assistant",
    "Membaca file sumber dari repository HIO dan menyusun patch…",
  );
  try {
    const r = await fetch("/api/v1/agent/code-tasks", {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ objective, targetFiles: paths }),
    });
    const d = await r.json();
    pending.remove();
    if (!r.ok) {
      showMessage("assistant", d.message || "Proposal coding gagal dibuat.");
      $("#status").textContent = "Coding agent belum siap";
      return;
    }
    const box = showMessage(
      "assistant",
      d.task.title +
        "\n" +
        d.task.summary +
        "\n\nStatus: DRAFT — belum mengubah repository.\nTask ID: " +
        d.task.id +
        "\n\n" +
        d.files
          .map(
            (f) => "FILE: " + f.path + "\n" + f.rationale + "\n\n" + f.content,
          )
          .join("\n\n--- FILE BERIKUTNYA ---\n\n") +
        "\n\nCHECKS YANG HARUS DILAKUKAN:\n" +
        d.checks.map((s) => "• " + s).join("\n"),
    );
    if (d.applyAvailable) {
      const b = document.createElement("button");
      b.className = "plan-button";
      b.textContent = "Setujui & buat draft Pull Request";
      b.title =
        "Mengirim kode ke GitHub setelah konfirmasi. Tidak melakukan merge atau deploy.";
      b.onclick = async () => {
        if (
          !window.confirm(
            "Kirim patch ini ke GitHub sebagai DRAFT pull request? Perubahan akan berada di branch terpisah, tidak di-merge dan tidak di-deploy.",
          )
        )
          return;
        b.disabled = true;
        b.textContent = "Mengirim ke GitHub…";
        try {
          const rr = await fetch(
            "/api/v1/agent/code-tasks/" +
              encodeURIComponent(d.task.id) +
              "/submit",
            {
              method: "POST",
              headers: headers(),
              body: JSON.stringify({ approve: true }),
            },
          );
          const dd = await rr.json();
          if (!rr.ok) {
            showMessage(
              "assistant",
              dd.message || "Submission belum berhasil.",
            );
            b.disabled = false;
            b.textContent = "Coba submit lagi setelah pemeriksaan";
            return;
          }
          showMessage(
            "assistant",
            "Draft Pull Request dibuat.\n" +
              dd.pullRequest +
              "\nBranch: " +
              dd.branch +
              "\nStatus: draft; tidak di-merge dan tidak di-deploy.",
          );
          b.textContent = "Draft PR dibuat";
          $("#status").textContent = "Coding agent · draft PR dibuat";
        } catch {
          showMessage(
            "assistant",
            "Koneksi terputus saat submit. Periksa GitHub sebelum mencoba ulang.",
          );
          b.disabled = true;
        }
      };
      box.append(document.createElement("br"), b);
    } else {
      const note = safeText(
        "p",
        "GITHUB_TOKEN belum tersedia di runtime. Proposal hanya tersimpan di HIO; repository tidak diubah.",
      );
      box.append(note);
    }
    $("#status").textContent = "Proposal coding tersimpan · review diperlukan";
    input.value = "";
    await loadCodeTasks();
  } catch {
    pending.remove();
    showMessage(
      "assistant",
      "Koneksi gagal. Tidak ada perubahan repository yang dilakukan.",
    );
  } finally {
    busy = false;
    $("#code").disabled = false;
    $("#plan").disabled = false;
    $("#send").disabled = false;
    input.disabled = false;
    input.focus();
  }
}
$("#code").addEventListener("click", () => {
  const objective = input.value.trim();
  if (!objective) {
    input.focus();
    input.placeholder = "Jelaskan perubahan kode yang kamu inginkan…";
    return;
  }
  input.value = "";
  input.style.height = "auto";
  createCodeTask(objective);
});
async function loadCodeTasks() {
  try {
    const r = await fetch("/api/v1/agent/code-tasks");
    if (!r.ok) return;
    const d = await r.json();
    let nav = $("#code-history");
    if (!nav) {
      nav = document.createElement("nav");
      nav.id = "code-history";
      nav.className = "history";
      const hint = safeText("div", "CODING TASKS");
      hint.className = "hint";
      $(".side").insertBefore(hint, $(".side").lastElementChild);
      hint.after(nav);
    }
    nav.replaceChildren();
    for (const t of d.items) {
      const b = safeText("button", t.title + " · " + t.status);
      b.onclick = () => openCodeTask(t.id);
      nav.append(b);
    }
  } catch {}
}
async function submitRepairProposal(task, host) {
  const b = document.createElement("button");
  b.className = "plan-button";
  b.textContent = "Setujui & buat draft PR perbaikan";
  b.onclick = async () => {
    if (
      !window.confirm(
        "Kirim proposal perbaikan ini sebagai draft PR yang menargetkan branch PR asal? Tidak ada merge atau deployment otomatis.",
      )
    )
      return;
    b.disabled = true;
    b.textContent = "Mengirim draft PR…";
    try {
      const r = await fetch(
        "/api/v1/agent/code-tasks/" + encodeURIComponent(task.id) + "/submit",
        {
          method: "POST",
          headers: headers(),
          body: JSON.stringify({ approve: true }),
        },
      );
      const d = await r.json();
      if (!r.ok) {
        showMessage(
          "assistant",
          d.message || "Draft PR perbaikan belum berhasil dibuat.",
        );
        b.disabled = false;
        b.textContent = "Coba submit lagi setelah pemeriksaan";
        return;
      }
      showMessage(
        "assistant",
        "Draft PR perbaikan dibuat.\n" +
          d.pullRequest +
          "\nBranch: " +
          d.branch +
          "\nTarget: branch PR asal. Tidak di-merge atau di-deploy.",
      );
      b.textContent = "Draft PR perbaikan dibuat";
      $("#status").textContent = "Repair · draft PR dibuat";
      await loadCodeTasks();
    } catch {
      showMessage(
        "assistant",
        "Koneksi terputus saat mengirim repair. Periksa GitHub sebelum mencoba ulang.",
      );
      b.disabled = true;
    }
  };
  host.append(document.createElement("br"), b);
}
async function requestCodeRepair(parentId, failureSummary, host) {
  const b = document.createElement("button");
  b.className = "plan-button";
  b.textContent = "Buat proposal perbaikan dari kegagalan CI";
  b.onclick = async () => {
    b.disabled = true;
    b.textContent = "Menganalisis kegagalan dan menyusun repair…";
    try {
      const r = await fetch(
        "/api/v1/agent/code-tasks/" + encodeURIComponent(parentId) + "/repair",
        {
          method: "POST",
          headers: headers(),
          body: JSON.stringify({ failureSummary }),
        },
      );
      const d = await r.json();
      if (!r.ok) {
        showMessage(
          "assistant",
          d.message || "Proposal repair belum bisa dibuat.",
        );
        b.disabled = false;
        b.textContent = "Coba buat proposal repair lagi";
        return;
      }
      const proposalHost = showMessage(
        "assistant",
        d.task.title +
          "\n" +
          d.task.summary +
          "\n\nStatus: DRAFT — belum mengubah repository.\nParent task: " +
          d.task.parentTaskId +
          "\nTarget branch: " +
          d.task.baseBranch +
          "\nTask ID: " +
          d.task.id +
          "\n\n" +
          d.files
            .map(
              (f) =>
                "FILE: " + f.path + "\n" + f.rationale + "\n\n" + f.content,
            )
            .join("\n\n--- FILE BERIKUTNYA ---\n\n") +
          "\n\nCHECKS YANG HARUS DILAKUKAN:\n" +
          d.checks.map((s) => "• " + s).join("\n") +
          "\n\n" +
          d.note,
      );
      submitRepairProposal(d.task, proposalHost);
      b.textContent = "Proposal repair tersimpan";
      $("#status").textContent = "Repair proposal · review diperlukan";
      await loadCodeTasks();
    } catch {
      showMessage(
        "assistant",
        "Koneksi gagal saat membuat repair. Repository belum diubah.",
      );
      b.disabled = false;
      b.textContent = "Coba buat proposal repair lagi";
    }
  };
  host.append(document.createElement("br"), b);
}
async function validateCodeTask(id, host) {
  const b = document.createElement("button");
  b.className = "plan-button";
  b.textContent = "Periksa hasil CI GitHub";
  b.onclick = async () => {
    b.disabled = true;
    b.textContent = "Memeriksa status…";
    try {
      const r = await fetch(
        "/api/v1/agent/code-tasks/" + encodeURIComponent(id) + "/validate",
        {
          method: "POST",
          headers: headers(),
        },
      );
      const d = await r.json();
      if (!r.ok) {
        showMessage("assistant", d.message || "Status CI belum tersedia.");
        b.disabled = false;
        b.textContent = "Coba periksa lagi";
        return;
      }
      const failed = [
        ...d.checkRuns
          .filter(
            (x) =>
              x.status === "completed" &&
              ["failure", "cancelled", "timed_out", "action_required"].includes(
                x.conclusion,
              ),
          )
          .map(
            (x) =>
              x.name + ": " + x.conclusion + (x.url ? " (" + x.url + ")" : ""),
          ),
        ...d.commitStatuses
          .filter((x) => ["failure", "error"].includes(x.status))
          .map(
            (x) => x.name + ": " + x.status + (x.url ? " (" + x.url + ")" : ""),
          ),
      ];
      const lines = [
        "Validasi CI GitHub: " + d.state.toUpperCase(),
        "PR: " + d.pullRequest,
        "Head commit: " + d.headSha,
        "Waktu cek: " + d.checkedAt,
        "",
        ...d.checkRuns.map(
          (x) =>
            x.name +
            ": " +
            x.status +
            (x.conclusion ? " / " + x.conclusion : "") +
            (x.url ? " — " + x.url : ""),
        ),
        ...d.commitStatuses.map(
          (x) => x.name + ": " + x.status + (x.url ? " — " + x.url : ""),
        ),
        "",
        "Langkah berikutnya: " + d.nextAction,
      ];
      const resultHost = showMessage("assistant", lines.join("\n"));
      b.textContent = "Status CI: " + d.state.toUpperCase();
      $("#status").textContent = "Validasi coding · " + d.state;
      if (d.state === "failure") {
        const summary = failed.length
          ? failed.join("\n")
          : "GitHub CI melaporkan failure; periksa seluruh check runs pada " +
            d.pullRequest;
        requestCodeRepair(id, summary, resultHost);
      }
    } catch {
      showMessage(
        "assistant",
        "Gagal membaca status CI. Tidak ada perubahan repository dilakukan.",
      );
      b.disabled = false;
      b.textContent = "Coba periksa lagi";
    }
  };
  host.append(document.createElement("br"), b);
}
async function openCodeTask(id) {
  try {
    const r = await fetch("/api/v1/agent/code-tasks/" + encodeURIComponent(id));
    if (!r.ok) return;
    const d = await r.json();
    messages.replaceChildren();
    const host = showMessage(
      "assistant",
      d.task.title +
        "\n" +
        d.task.summary +
        "\nStatus: " +
        d.task.status +
        "\n" +
        d.files
          .map(
            (f) => "FILE: " + f.path + "\n" + f.rationale + "\n\n" + f.content,
          )
          .join("\n\n--- FILE BERIKUTNYA ---\n\n") +
        "\n\n" +
        d.checks.join("\n"),
    );
    $("#status").textContent = "Coding task · " + d.task.status;
    if (d.task.status === "submitted") validateCodeTask(d.task.id, host);
  } catch {
    $("#status").textContent = "Coding task tidak bisa dimuat";
  }
}
loadCodeTasks();
