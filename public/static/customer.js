// HIO customer area (Clerk Phase 1). All text is inserted with textContent.
// The Clerk browser SDK is loaded from this instance's own Frontend API; the
// session token is sent as a Bearer token and verified by the HIO server.
(() => {
  const $ = (s) => document.querySelector(s);
  const content = $("#customer-content");
  const notice = $("#customer-notice");
  const signInHost = $("#clerk-sign-in");
  let clerk = null;
  let signedInMounted = false;

  function el(tag, attrs = {}, ...children) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v === undefined || v === null || v === false) continue;
      if (k === "class") e.className = v;
      else if (k === "text") e.textContent = v;
      else if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? "" : String(v));
    }
    for (const c of children.flat())
      if (c !== null && c !== undefined && c !== false)
        e.append(c instanceof Node ? c : document.createTextNode(String(c)));
    return e;
  }
  const show = (...nodes) => content.replaceChildren(...nodes);
  const say = (text, tone = "info") =>
    notice.replaceChildren(
      text ? el("p", { class: "customer-alert " + tone, text }) : "",
    );

  async function api(path, opts = {}) {
    const token =
      clerk && clerk.session ? await clerk.session.getToken() : null;
    if (!token) throw Object.assign(new Error("no_session"), { status: 401 });
    const headers = { Authorization: "Bearer " + token };
    if (opts.body !== undefined) headers["Content-Type"] = "application/json";
    if (opts.method && opts.method !== "GET")
      headers["X-HIO-Request"] = "customer";
    const r = await fetch("/api/customer" + path, {
      method: opts.method || "GET",
      headers,
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
      credentials: "same-origin",
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      const f = data && data.error && data.error.founder;
      throw Object.assign(
        new Error(f ? f.judul + ". " + f.langkah : "Terjadi gangguan."),
        { status: r.status, code: data && data.error && data.error.code },
      );
    }
    return data;
  }

  function loadScript(src, pk) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.crossOrigin = "anonymous";
      s.setAttribute("data-clerk-publishable-key", pk);
      s.onload = resolve;
      s.onerror = () => reject(new Error("clerk_script_failed"));
      document.head.append(s);
    });
  }

  function showSignIn() {
    $("#customer-nav").hidden = true;
    $("#customer-email").textContent = "";
    show(
      el("h1", { text: "Masuk ke ruang pelanggan HIO" }),
      el("p", {
        class: "lead",
        text: "Akses masih terbatas untuk email yang diundang.",
      }),
    );
    signedInMounted = true;
    clerk.mountSignIn(signInHost, {
      fallbackRedirectUrl: "/ruang",
      signUpFallbackRedirectUrl: "/ruang",
    });
  }

  async function renderWorkspace(me) {
    show(
      el("h1", { text: me.ruangKerja.nama }),
      el("p", {
        class: "lead",
        text:
          "Peranmu: " +
          me.peran +
          ". Data di sini hanya terlihat oleh anggota ruang kerja ini.",
      }),
      el(
        "p",
        {},
        el("a", {
          class: "button",
          href: "/ruang/brief",
          text: "Lihat brief riset",
        }),
      ),
    );
  }

  function briefForm(onSaved) {
    const field = (id, label, max, area) =>
      el(
        "p",
        { class: "customer-field" },
        el("label", { for: id, text: label }),
        el(area ? "textarea" : "input", {
          id,
          name: id,
          maxlength: String(max),
          required: id !== "constraints",
        }),
      );
    const err = el("p", { class: "customer-error", role: "alert" });
    const form = el(
      "form",
      { class: "card customer-form", "aria-labelledby": "brief-form-title" },
      el("h2", { id: "brief-form-title", text: "Brief baru" }),
      field("question", "Pertanyaan riset", 500, true),
      field("segment", "Segmen pelanggan", 120),
      field("geography", "Wilayah", 120),
      field("problem", "Masalah yang ingin dipahami", 500, true),
      field("constraints", "Batasan (opsional)", 500, true),
      err,
      el("button", { class: "button", type: "submit", text: "Simpan brief" }),
    );
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = form.querySelector("button");
      btn.disabled = true;
      err.textContent = "";
      const v = (n) => form.elements[n].value.trim();
      const body = {
        question: v("question"),
        segment: v("segment"),
        geography: v("geography"),
        problem: v("problem"),
      };
      if (v("constraints")) body.constraints = v("constraints");
      try {
        await api("/briefs", { method: "POST", body });
        form.reset();
        say("Brief tersimpan.", "ok");
        onSaved();
      } catch (x) {
        err.textContent = x.message;
      } finally {
        btn.disabled = false;
      }
    });
    return form;
  }

  async function renderBriefs() {
    const list = el("section", { "aria-labelledby": "brief-list-title" });
    const load = async () => {
      list.replaceChildren(
        el("h2", { id: "brief-list-title", text: "Brief tersimpan" }),
        el("p", { text: "Memuat…" }),
      );
      try {
        const d = await api("/briefs");
        const items = d.brief || [];
        list.replaceChildren(
          el("h2", { id: "brief-list-title", text: "Brief tersimpan" }),
          items.length
            ? el(
                "ul",
                { class: "customer-list" },
                items.map((b) =>
                  el(
                    "li",
                    { class: "card" },
                    el("strong", { text: b.pertanyaan }),
                    el("p", {
                      class: "muted",
                      text: b.segmen + " · " + b.wilayah,
                    }),
                    el("p", { text: b.masalah }),
                  ),
                ),
              )
            : el("p", {
                class: "muted",
                text: "Belum ada brief. Buat yang pertama di formulir.",
              }),
        );
      } catch (x) {
        list.replaceChildren(
          el("p", { class: "customer-error", role: "alert", text: x.message }),
        );
      }
    };
    show(el("h1", { text: "Brief riset" }), briefForm(load), list);
    await load();
  }

  async function route() {
    // Let Clerk tear down its own component; never remove its DOM directly.
    if (signedInMounted) {
      clerk.unmountSignIn(signInHost);
      signedInMounted = false;
    }
    if (!clerk.user) return showSignIn();
    let me;
    try {
      me = await api("/me");
    } catch (x) {
      say(x.message, x.status === 403 ? "warn" : "bad");
      show(
        el("h1", { text: "Akses belum tersedia" }),
        el("p", { class: "lead", text: x.message }),
      );
      return;
    }
    say("");
    $("#customer-nav").hidden = false;
    $("#customer-email").textContent = me.email;
    const page = location.pathname === "/ruang/brief" ? "brief" : "ruang";
    document
      .querySelectorAll("#customer-nav a")
      .forEach((a) =>
        a.setAttribute(
          "aria-current",
          a.dataset.page === page ? "page" : "false",
        ),
      );
    if (location.pathname === "/masuk")
      return (history.replaceState(null, "", "/ruang"), renderWorkspace(me));
    return page === "brief" ? renderBriefs() : renderWorkspace(me);
  }

  async function boot() {
    let cfg;
    try {
      cfg = await (await fetch("/api/customer/config")).json();
    } catch {
      cfg = null;
    }
    if (
      !cfg ||
      !cfg.tersedia ||
      !/^https:\/\/[a-z0-9.-]+$/i.test(cfg.frontendApi || "")
    ) {
      show(
        el("h1", { text: "Ruang pelanggan belum dibuka" }),
        el("p", {
          class: "lead",
          text: "Fitur masuk untuk pelanggan masih disiapkan. Coba lagi nanti.",
        }),
      );
      return;
    }
    try {
      await loadScript(
        cfg.frontendApi + "/npm/@clerk/clerk-js@5/dist/clerk.browser.js",
        cfg.publishableKey,
      );
      clerk = window.Clerk;
      await clerk.load({
        localization: window.HIO_CLERK_LOCALE,
        publishableKey: cfg.publishableKey,
      });
    } catch {
      show(
        el("h1", { text: "Layanan masuk sedang terganggu" }),
        el("p", {
          class: "lead",
          text: "Coba muat ulang halaman beberapa saat lagi.",
        }),
      );
      return;
    }
    clerk.mountUserButton($("#clerk-user-button"), {
      afterSignOutUrl: "/masuk",
    });
    // Re-route only when the signed-in user actually changes (sign-in/out),
    // not on every token refresh.
    let current = clerk.user ? clerk.user.id : null;
    clerk.addListener(({ user }) => {
      const next = user ? user.id : null;
      if (next !== current) {
        current = next;
        route();
      }
    });
    await route();
  }
  boot();
})();
