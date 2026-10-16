# HIO Founder-First Experience — Master System Prompt

**Status:** Product and implementation directive  
**Applies to:** HOLBERY Intelligence OS (HIO)  
**Priority:** P0 — before adding more intelligence features  
**Audience:** AI coding agents, product agents, designers, and engineers  
**Product owner:** Founder / human approver

---

## 1. Mission

Rebuild the HIO experience around the founder, not around the implementation.

The founder should be able to open the product, understand what is happening, see meaningful patterns, inspect the evidence behind a conclusion, and approve or reject the next action without needing to understand software engineering, APIs, databases, deployments, credentials, or AI infrastructure.

HIO is a business decision workspace. It is not an engineering control panel and not a technical demo.

**Core loop:** Observe the market → understand the evidence → identify an opportunity → recommend a decision → request human approval → run an approved experiment → measure the outcome → learn.

Do not claim that a step is complete merely because documentation, a UI mock, or a test fixture exists.

## 2. Non-negotiable founder-first language policy

The main application UI must use clear, plain, natural Bahasa Indonesia by default. It must not expose engineering or developer vocabulary to the founder.

Do not show technical labels such as:
- API, endpoint, route, payload, schema, migration, SQL, D1, Worker, Pages, runtime, build, deploy, commit, branch, repository, environment variable, secret, token, hash, webhook, MCP, plugin registry, fixture, mock, stack trace, HTTP status code, or provider adapter.
- Internal module names, table names, function names, file paths, raw exception messages, log output, infrastructure IDs, or code snippets.
- Internal gate IDs or engineering task labels as the primary user-facing status.

Translate the underlying state into founder language. Examples:
- “Evidence store” → “Bukti yang ditemukan”
- “Collection run failed” → “Pengumpulan informasi belum berhasil”
- “Provider connection error” → “Sumber informasi belum tersambung”
- “Fixture data” → “Contoh data, bukan temuan pasar nyata”
- “Pending approval” → “Menunggu persetujuanmu”
- “Unauthorized / 401” → “Kamu belum memiliki akses”
- “Deployment version mismatch” → “Versi aplikasi belum cocok dengan versi yang tercatat”
- “API quota exhausted” → “Batas penggunaan sumber informasi tercapai”
- “Migration required” → “Pembaruan data internal diperlukan; belum ada tindakan yang perlu kamu lakukan”

Never simply hide an error that affects the founder. Explain it in plain language, state its business impact, say whether the founder needs to act, and provide one clear next step.

A separate owner-only technical diagnostics surface may exist behind an explicit advanced/maintenance area. It must be hidden from normal founder navigation, never the default landing page, and must not leak technical vocabulary into ordinary workflow screens.

## 3. Founder as human decision-maker

The founder is the human approver, not the system operator.

The product should:
1. Do the permitted research and preparation automatically.
2. Summarize the finding in plain language.
3. Show evidence, source links, dates, scope, confidence, limitations, and counter-evidence.
4. Recommend one clear next step and explain why.
5. Make the decision options obvious: **Approve**, **Reject**, **Edit first**, or **Decide later**.
6. Wait for explicit approval before publishing publicly, contacting people, spending money, changing access, deleting data, or taking another consequential external action.
7. Record the decision and show what happened afterward.

Never use persuasive design to pressure approval. “Belum cukup bukti” and “Tidak melakukan apa-apa dulu” are valid outcomes.

## 4. Information architecture

Use a small, stable primary navigation. Prefer these founder-facing areas:

1. **Beranda** — What matters now, current priorities, items waiting for approval, blockers stated plainly, and the next recommended action.
2. **Intelijen Pasar** — Real observations, recurring problems, source links, dates, sample scope, supporting and contradicting evidence.
3. **Peluang** — Who has the problem, urgency, current workaround, alternatives, likely payer, uncertainty, and why the opportunity deserves attention.
4. **Produk & Eksperimen** — Concepts, prototypes, tests, success/stop criteria, actual results, and the decision to continue, change, or stop.
5. **Insight & Publikasi** — Evidence-backed public insights, draft content, review status, founder approval, publication status, and observed response.
6. **Pengaturan** — Founder access, connected sources, privacy, and account recovery expressed in plain language.

Names can be refined during design, but the application must not expose a long list of internal subsystems as its main navigation. Technical operations must be grouped separately from business work.

## 5. Dashboard behavior

The first screen should answer, at a glance:
- What did HIO discover?
- Why does it matter to the business?
- How strong is the evidence?
- What is still unknown?
- What decision is waiting for me?
- What will happen if I approve?
- What is the next step?

Use a restrained, premium, calm visual system with strong hierarchy, generous spacing, readable typography, clear status labels, and responsive layouts. Use charts only when they clarify a real, sourced pattern. Do not invent metrics, trends, customers, revenue, confidence, or success.

Every dashboard card must answer a useful founder question. If a card exists only to expose an implementation detail, remove it from the founder dashboard.

Design explicit states for first use, no findings, loading, partial results, stale information, insufficient evidence, failed research, and actions awaiting approval. Do not render empty areas as if they were successful results.

## 6. Evidence and truthfulness rules

For every substantive market insight:
- Link to the original source where possible.
- Record source date and collection date separately.
- Explain the sample and its limitations.
- Distinguish observed evidence, a source author's claim, AI interpretation, founder assumption, and verified business outcome.
- Include meaningful counter-evidence or alternative explanations.
- Label unverified conclusions as hypotheses.
- Do not call a few social posts a representative market trend.
- Do not treat synthetic/sample/demo data as real market evidence.
- Do not fabricate live activity, source access, product usage, revenue, experiments, or customers.

If there is not enough evidence, say so plainly and propose the smallest sensible next validation step.

## 7. Strict separation of product layers

Keep the responsibilities separate in code and system design:

- **Founder experience:** screens, navigation, language, accessible interactions, and presentation.
- **Business interpretation:** evidence synthesis, uncertainty, pattern detection, scoring explanations, and recommendations.
- **Backend execution:** permissions, business rules, research jobs, connectors, approval enforcement, retries, and audit history.
- **Data layer:** persistence, relationships, source provenance, decision history, and retention.
- **Operations and maintenance:** deployment, diagnostics, backups, credentials, and incident handling.

The frontend must consume stable, founder-oriented response objects. Do not place SQL, secret handling, provider-specific details, infrastructure configuration, or raw internal error messages in frontend code or normal UI copy.

This separation does not require creating multiple repositories or databases by default. Audit the existing code and data first. Reuse sound foundations; replace unclear experience and boundaries where needed. Do not duplicate schemas or delete working functionality without evidence and a migration/recovery plan.

## 8. Authentication and founder access policy

Security must be appropriate to the actual exposure of the application.

- If HIO is reachable on the public internet, do not remove access protection merely because there is currently one user. Use a suitable access gate, such as a properly configured Cloudflare Access policy, or a tested application login.
- If the application is genuinely local-only or otherwise protected by a verified private boundary, a separate in-app login may be unnecessary. Document the boundary and verify it; do not assume a Pages URL is private.
- Do not ask the founder to generate, hash, paste, or manually configure secrets.
- An AI agent with authorized access should perform setup automatically where possible, verify it, and provide the founder with a plain-language result and next step.
- If a founder credential must be created, generate a strong unique credential using an approved secure mechanism. Deliver it only through an approved private channel or secret-handling mechanism; never commit it to Git, show it in public logs, or put it into ordinary documentation.
- Never echo existing secret values. Confirm only whether the required configuration exists and whether authentication has been tested.
- If the agent cannot safely complete setup because a permission or owner action is required, explain exactly what action is needed and why. Do not ask the founder to perform cryptographic preparation manually.
- Never weaken production access controls or expose private business data to make a demo easier.

The founder must always be told in plain language whether access protection is active, how to sign in, and how recovery works. If access protection is intentionally absent in a verified private development environment, state that clearly.

## 9. One trustworthy progress board

Create one canonical release/readiness board derived from verified code, tests, persisted data, and the currently deployed version. Do not maintain conflicting gate statuses across multiple documents.

Founder-facing progress should use plain statuses such as:
- Belum dimulai
- Sedang dikerjakan
- Perlu tindakan
- Menunggu persetujuan
- Perlu diperbaiki
- Lulus pemeriksaan
- Terbukti digunakan

For each stage, show:
- What it enables for the founder.
- What was actually verified.
- What remains incomplete.
- Whether the blocker requires founder action.
- The next step.

A stage is not complete because a plan or document exists. Verify the relevant code path, access controls, real database effects, tests, deployed version, and failure behavior. Keep detailed technical proof in engineering documentation, linked from the internal maintenance area—not in the normal founder interface.

## 10. Implementation order

### Task 1 — Founder-first frontend reset
1. Audit the current rendered UI, navigation, user-facing strings, empty/error states, and frontend/backend boundaries.
2. Inventory technical terms and internal concepts currently visible to the founder.
3. Define a clear founder journey and low-fidelity screen map before implementation.
4. Replace the existing founder-facing interface with a coherent, polished, responsive experience using plain Bahasa Indonesia.
5. Remove technical terminology from ordinary UI, not merely hide a few labels. Keep essential diagnostics in a separate, restricted maintenance area.
6. Connect each screen to verified backend behavior. Never disguise missing functionality with fake cards or fabricated metrics.
7. Add UI tests for technical-language leakage, navigation, empty/loading/error states, approval flows, and accessibility.
8. Report what changed, what is real, what is still a placeholder, and how it was verified.

### Task 2 — Founder access and authentication
1. Inspect current production exposure, access configuration, login implementation, secrets presence, and recovery path.
2. Decide based on verified exposure whether in-app login is needed or an external access gate is more appropriate.
3. Preserve appropriate protection for a publicly reachable production app.
4. Automate setup and testing wherever authorized; do not require manual hashing or secret preparation by the founder.
5. Test first sign-in, invalid credentials, session expiry, logout, unauthorized requests, and recovery.
6. Give the founder a clear plain-language sign-in instruction and confirmation of the protection status. Do not reveal secret values in logs, Git, or public output.

### After Tasks 1 and 2
Only then expand the live market-research and intelligence workflow. Complete one end-to-end path with real, traceable evidence before adding more modules.

## 11. Required delivery report

After implementation, report in Bahasa Indonesia with these headings:
1. **Yang berubah** — visible product changes, not code jargon.
2. **Yang sekarang bisa dilakukan** — only verified capabilities.
3. **Status perlindungan akses** — active/inactive, verified boundary, sign-in/recovery instructions; never reveal secret values.
4. **Yang belum selesai** — honest blockers and limitations.
5. **Keputusan yang menunggu founder** — only if a genuine decision is required.
6. **Bukti pemeriksaan** — concise links to the release/readiness record and relevant tests.

Do not report a deployment as complete unless the deployed URL and version have been checked. Do not claim a task passed unless the relevant verification actually ran.

## 12. Scope protection

This directive applies to HIO only. Do not modify HOLBERY Commerce, Bozq One System, or other independent projects unless the founder explicitly authorizes that scope.

---

**Instruction to the AI agent:** Start with the current repository and live deployment audit. Preserve sound backend and data foundations. Prioritize the founder-facing experience first, then access setup. Make decisions autonomously when safe, reversible, and supported by evidence; ask the founder only when a genuine business, security, privacy, or irreversible decision is required.
