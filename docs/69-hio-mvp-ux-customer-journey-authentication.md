# 69 — HIO MVP UX, Customer Journey, Onboarding & Authentication

**Decision date:** 2026-10-17  
**Scope:** HIO only. Do not modify HOLBERY Commerce, Bozq One System, or unrelated projects.  
**Status:** Product/implementation specification, not proof that features are implemented or production-verified.  
**Related:** [Audit](66-implementation-audit-before-commercial-mvp.md) · [Roadmap](67-mvp-implementation-roadmap.md) · [Master implementation prompt](68-master-system-prompt-hio-mvp.md)

## 1. Product decision

HIO should feel like a calm, premium business decision workspace—not a generic AI chat, a crowded admin dashboard, or a menu of unfinished modules.

The first release delivers one trustworthy customer outcome:

**Describe a business question → inspect evidence-backed opportunities → choose one → approve a bounded build → receive a private useful artifact → record a real validation signal → decide continue, revise, or stop.**

Design around the customer's next decision, not internal provider architecture. Keep advanced settings, provider details, quotas, and diagnostics secondary unless the customer needs them.

Initial cohort: a small, invite-only group of individual founders and small business operators.

Product promise: structured research and a guided, evidence-linked workflow. Do not promise guaranteed revenue, proven demand, comprehensive social listening, or autonomous business success.

## 2. Minimum viable customer journey

| Stage | Customer question | Minimum UI and behavior | Completion signal |
|---|---|---|---|
| Discover | Is this for me? | Clear landing page, concrete workflow, honest limitations, one primary CTA: Start a workspace or Request access according to beta mode | Sign-up/access request started |
| Sign in | Can I get in quickly and safely? | Google sign-in and verified email option; understandable errors; return to intended destination | Verified identity and valid session |
| First-run setup | What should I work on? | Three short inputs: customer/niche, market/geography, problem/question; optional constraints; progress indicator; save draft | Research brief saved |
| FIND | What is worth investigating? | Bounded research run; visible progress, source coverage, cancel/retry controls | Results or honest partial/failure state |
| Evidence review | Why should I believe this? | Opportunity thesis, source-backed evidence, source URL/date, counter-evidence, unknowns, coverage caveat | Customer understands evidence and uncertainty |
| DECIDE | Which should I pursue? | Compare shortlist; approve, reject, revise, or save for later; show exact next action and usage limit | Explicit decision and audit event |
| BUILD | What will I get? | Select useful artifact, preview scope, show limits, require confirmation, run in isolated Daytona environment | Build success or actionable safe failure |
| Delivery | Where is my output? | Private artifact page, version, timestamp, test status, download, revise/regenerate path | Customer opens artifact |
| VALIDATE | Did the real world respond? | Hypothesis, target signal, method, deadline, observed result, evidence/notes | Validation outcome recorded |
| Next decision | What now? | Continue, revise, or stop with rationale; preserve history and recommend next step | Decision saved |

**Critical rule:** deliver first useful value before team invitations, lengthy profile setup, provider configuration, billing, or a product tour. If live research is unavailable, use a clearly labelled sample—not fabricated live evidence.

## 3. Onboarding: short, progressive, resumable

### A. Account
- Ask only for what authentication requires. Do not ask for company size, job title, revenue, or a long profile upfront.
- Offer Continue with Google and Continue with email.
- Email should use a verified email link or one-time code, depending on the chosen Clerk configuration. Make resend, expired-link, and wrong-account states clear.
- Do not require passwords unless user evidence justifies the extra friction.
- Preserve the intended destination through sign-in.

### B. One-minute workspace brief
Ask:
1. What are you exploring? (customer/niche or business area)
2. Where? (market/geography; allow online/global)
3. What problem or question do you want answered?
4. Optional constraints: budget, time, skills, channels.

Use examples and helper text rather than an intimidating blank form. Allow save-and-resume. Show progress. Do not force integrations or team setup.

### C. First FIND run
- Show the exact brief for review before running.
- Explain that the run is bounded and may return weak or no evidence.
- Show source coverage, real job state, cancellation/retry, and useful explanations for provider failures or quota limits.
- Preserve source URLs and timestamps where available; visually distinguish source facts from AI synthesis.
- If the run fails, preserve the brief and offer retry/edit. Never strand the user on an empty dashboard.

### D. Guided decision, not a tour
- Use contextual hints at the moment of need.
- Keep a persistent, reopenable “Getting started” checklist: complete brief; review evidence; choose opportunity; approve build; open artifact; record validation.
- Let users skip optional guidance and return later. Avoid a forced multi-screen tour.

## 4. Information architecture

### Public site
- Home/value proposition
- How it works: FIND → DECIDE → BUILD → VALIDATE
- Trust and limitations: source provenance, data boundaries, AI uncertainty, no guaranteed outcomes
- Request access / Sign in
- Privacy, terms, support

### Authenticated customer workspace
- **Home:** current project, next recommended action, recent activity, usage summary
- **Find:** briefs, jobs, evidence, opportunities
- **Decide:** shortlist, rationale, approval history
- **Build:** approved requests, status, artifacts
- **Validate:** experiments, observed signals, continue/revise/stop
- **Library:** saved briefs, decisions, artifacts and history
- **Settings:** profile, workspace, members only when enabled, notifications, privacy/export/delete, usage and connected providers if customer-configurable

### Owner/operator console
Keep separate from customer navigation and routes. It may show provider health, quotas, failed jobs, audit records, and operational controls to authorized operators only. Never expose raw provider credentials, internal stack traces, or another customer's data.

### Navigation behavior
- One obvious primary action per screen.
- Show current workspace/project and journey stage.
- Hide future or unavailable features instead of presenting dead navigation.
- Preserve drafts and progress when users leave.
- Every empty state says what to do next and why.
- Confirm destructive actions and scope all downloads to the authenticated workspace.

## 5. Premium visual and interaction direction

Aim for **quiet, editorial, precise, trustworthy**. Premium means hierarchy, rhythm, and responsive polish—not gradients and decoration everywhere.

- Restrained neutral base, strong typography, one controlled accent, semantic status colors, consistent spacing.
- Compact top bar and calm desktop sidebar; mobile navigation must remain clear and usable.
- Evidence, decisions, and artifacts are the visual focus. Provider telemetry is secondary metadata.
- Use cards for meaningful objects, not every line. Prefer structured evidence lists, compact comparisons, readable source links, and clear statuses.
- Design explicit states: initial, loading, success, partial results, no evidence, provider unavailable, quota reached, permission denied, retry/offline, expired session, and destructive confirmation.
- Use plain language. Do not expose internal jargon such as Actor, tenant, provenance adapter, or sandbox in customer-facing copy.
- Respect reduced motion, visible keyboard focus, semantic labels, logical focus order, adequate contrast, keyboard operation, and accessible status announcements.
- Target WCAG 2.2 AA as the design/test baseline. Combine automated checks with manual keyboard and screen-reader spot checks; automated tests alone do not prove conformance.

## 6. Authentication decision: Clerk for identity, HIO for authorization

**Recommendation:** use Clerk for customer sign-up/sign-in and identity lifecycle, subject to a successful compatibility spike and verified account/production configuration. Do not replace HIO's authorization or workspace model with Clerk alone.

Why: the inspected HIO auth is a founder/operator signed-cookie flow and has no customer identity/workspace membership layer. HIO needs polished email/social sign-in, verification, recovery, and a path to team membership. Clerk offers configurable sign-up/sign-in methods and Organizations, but HIO must still map external identity to its own workspace permissions.

### First-release methods
1. **Google OAuth** as the fast path, after production origins and redirect URLs are verified.
2. **Verified email link or one-time code** as the fallback.
3. Defer passwords unless a concrete need emerges.
4. Defer enterprise SSO.

Use a dedicated HIO Clerk application with separate development and production configuration. Keep server secrets server-side. Never commit or log keys, and never substitute HIO's app-owned SESSION_SECRET/AUTH_SECRET for a Clerk secret. Verify domains, callback URLs, email delivery, account linking, and recovery before inviting customers.

HIO currently uses Hono on Cloudflare Pages/Workers, so validate the actual runtime integration before selecting SDK glue. If the supported backend SDK is unsuitable, verify Clerk session JWTs server-side using trusted JWKS/public-key validation and strict signature, issuer, audience, expiry, and not-before checks. Never merely decode a JWT and trust its claims.

### Preserve internal authorization
- Clerk answers “who authenticated?” HIO answers “which workspace can they access, and what can they do?”
- Map Clerk user ID to an internal HIO user and automatically create one personal workspace at first verified sign-in.
- Keep HIO workspaces, memberships, and explicit roles as the authorization source of truth for HIO-owned data/jobs.
- Clerk Organizations may help with team identity later; they do not replace HIO database authorization.
- Verify membership on every customer API request, research job, build, artifact read/download, validation write, export, and deletion.
- Never trust a browser-supplied workspace ID, role, owner ID, or organization ID without server-side membership validation.
- Keep founder/operator sessions and routes separate. Customer sign-in must never grant owner-operator access.
- Enforce secure session handling, mutation origin/CSRF protection, and rate limits for sign-up, verification, research, and builds.

### Clerk compatibility spike: mandatory exit gate
1. Prove sign-up, Google OAuth, email verification, sign-out, and expiry in non-production.
2. Verify tokens in the actual Hono/Workers runtime with supported or cryptographically correct verification.
3. Map a customer to an internal user and personal workspace.
4. Prove a second user cannot read or mutate the first user's brief, evidence, job, artifact, usage, or validation record.
5. Prove founder login and existing research records still work.
6. Document secret names/configuration status only—never values.
7. Keep production cutover behind a reversible rollout until tests and recovery are accepted.

If Clerk fails this spike without weakening token verification or forcing a major framework rewrite, pause and compare a Cloudflare-native identity alternative. Do not build a fragile custom OAuth implementation just to avoid an identity provider.

## 7. Workspace and team onboarding

MVP default: create a **personal workspace automatically** after first verified sign-in. Do not make solo users name an organization before seeing value.

- Workspace name is optional and editable later.
- Offer team invitations only after the first meaningful decision or when the customer requests collaboration.
- During invite-only beta, invitations can remain operator-controlled if self-serve membership is not ready.
- Before enabling team invites, implement role permissions, invite acceptance, member removal, audit events, and cross-workspace tests. Do not show a nonfunctional Invite team button.

## 8. Trust, privacy and customer control

Before accepting real customer data, publish clear privacy/terms information and explain which providers process research inputs. Avoid sending sensitive personal data or customer secrets to research providers by default.

Minimum controls:
- Show the workspace/data context for every record.
- Provide export or a defined deletion-request path, with tested workspace scoping and documented retention/backups.
- Retain source attribution and collection timestamps when available.
- Label AI analysis and show missing, stale, sampled, or conflicting evidence.
- Keep artifacts private by default; authorize every access.
- Show usage limits before expensive research/build actions. Approval applies only to the named action and displayed limit—not blanket permission to publish or spend.
- Keep payment collection disabled until the separate billing acceptance phase passes.

## 9. Design and release gates

### Gate A — UX prototype
- Responsive wireframes for landing, sign-in, onboarding brief, research progress, evidence/opportunity review, decision confirmation, build status, artifact detail, validation, and empty/error states.
- Plain-language copy; truthful capability claims; clear distinction between source facts and AI synthesis.
- No dead links/buttons or keyboard traps.

### Gate B — Functional slice
One customer can sign in, resume a brief, run bounded FIND, inspect source-linked results, record a decision, approve one capped build, access a private artifact, and record validation. Progress, failure states, and usage boundaries are visible.

### Gate C — Security/accessibility
- Unit/E2E tests and manual keyboard/mobile review.
- Cross-workspace authorization tests for every customer-owned resource and background job.
- OAuth redirects, recovery, revocation, expiry, origin/CSRF controls verified.
- Backup/restore and rollback demonstrated before production migration/cutover.

### Gate D — Controlled beta
- Invite-only users, feedback channel, no billing by default, conservative per-workspace limits, operator-visible errors and usage monitoring.
- Track funnel events: sign-up completed, brief saved, FIND completed, evidence opened, decision saved, build approved/completed, artifact opened, validation recorded, return visit.
- Do not capture private research content in analytics. Measure counts and stage drop-off.
- Expand only after real failures and customer feedback have been reviewed.

**Primary activation metric:** a new workspace completes FIND, makes an evidence-informed decision, opens a generated artifact, and records at least one validation outcome. Track time-to-first-evidence and time-to-first-artifact as supporting measures. Set numerical targets after observing the first beta cohort; do not invent them.

## 10. Implementation order

1. Inventory current UI routes, styles, content and tests before redesign.
2. Prototype the full journey and responsive design system before polishing isolated widgets.
3. Run Clerk compatibility spike in development while preserving founder auth.
4. Add internal customer user/workspace/membership schema and authorization helpers with additive migrations.
5. Build onboarding and the first FIND journey, including all empty/error/loading states.
6. Add private artifact delivery and validation UI only when backend/security paths pass gates.
7. Run unit, E2E, cross-workspace, keyboard/accessibility, and recovery tests.
8. Invite a small beta cohort and prioritize based on real usage/feedback.

No production auth cutover, destructive migration, billing enablement, or public-launch claim before its gate passes.

## Research references
- [Clerk setup and sign-up/sign-in options](https://clerk.com/docs/getting-started/quickstart/setup-clerk)
- [Clerk Organizations and multi-tenant identity](https://clerk.com/docs/guides/organizations/overview)
- [Clerk manual JWT verification](https://clerk.com/docs/guides/sessions/manual-jwt-verification)
- [W3C WCAG 2.2 Understanding](https://www.w3.org/WAI/WCAG22/Understanding/)
- [Apple Human Interface Guidelines: onboarding](https://developer.apple.com/design/human-interface-guidelines/onboarding)

These references support the design/identity recommendation; they do not establish that HIO's specific integration is implemented or tested.
