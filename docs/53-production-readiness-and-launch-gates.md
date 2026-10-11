# 53 — Production Readiness and Commercial Launch Gates

Mandatory acceptance checklist. A gate passes only with recorded evidence. Current reported blocker: production Owner login secrets are missing.

## Gate 0 — Safe release
- [ ] Owner configures OPERATOR_SECRET and SESSION_SECRET as distinct Cloudflare Production Secrets through a secure path.
- [ ] Secret values are never shared in chat, committed, logged, or placed in client storage.
- [ ] Deploy only after environment checks pass; record deployment and commit identifiers.
- [ ] Verify production login/logout, expiry, private endpoint denial without auth, and authorized access.
- [ ] Verify authenticated workflow persists to intended D1; inspect resulting records.
- [ ] Verify safe errors, origin/CSRF protections where applicable, and rate limiting.
- [ ] Record smoke evidence and rollback path.

## Gate 1 — Feature/runtime parity
- [ ] Inventory routes, UI actions, API handlers, D1 tables/migrations, providers, and user-facing claims.
- [ ] Label each capability Verified, Implemented—not verified, Fixture/demo, Stub, Planned, Blocked, or Unknown.
- [ ] Label decorative controls; every action must do what it advertises.
- [ ] Implement loading, empty, success, error, denied, and provider-unavailable states.
- [ ] Verify server-side authorization on private routes and object access.
- [ ] Test fresh setup, migration upgrades, persistence, retries, idempotency, audit, recovery.
- [ ] Keep fixtures separate from live evidence and revenue.

## Gate 2 — AI and integrations
- [ ] Model/provider selection, fallback, limits, and failure states are observable.
- [ ] Test prompt injection, untrusted content, tool boundaries, and outbound data risks.
- [ ] Preserve provenance and distinguish fact, inference, and recommendation.
- [ ] Inventory required credentials, scopes, setup location, expiry, quotas, costs, and recovery.
- [ ] Handle OAuth denial, missing scope, expiry, refresh failure, revocation, and outage.
- [ ] Test Owner notification; if no external channel exists, show persistent in-app notice.
- [ ] Test spend caps, retries, and kill switches.

## Gate 3 — Multi-user SaaS
- [ ] Workspace/tenant ownership is enforced server-side.
- [ ] Cross-tenant tests cover reads, writes, exports, background jobs, and stored objects.
- [ ] Roles, session lifecycle, rotation, account recovery, and admin boundaries are tested.
- [ ] Rate limits, abuse detection, audit retention, and incident escalation are ready.
- [ ] Privacy, terms, retention, export/deletion, backup/restore, and support ownership are documented.
- [ ] Logs exclude secret values and minimize personal data.

## Gate 4 — Paid product
- [ ] A target customer and recurring costly problem are supported by evidence.
- [ ] A target user completes the core workflow without constant founder intervention.
- [ ] Value is measured against baseline; limitations and failures are documented.
- [ ] Provider/model/storage costs and support burden are measured.
- [ ] Metering, quotas, spend caps, and abuse controls work.
- [ ] Payment/webhooks, idempotency, reconciliation, failed payment, refunds, cancellation, fulfillment are tested.
- [ ] Real paid pilot/payment supports willingness-to-pay claims.
- [ ] Owner approves offer, price, market, claims, channel, and budget.

## Gate 5 — Operations
- [ ] Health checks, meaningful alerts, backup/restore, rollback, and incident response are tested.
- [ ] Cost ceilings, provider outages, quota exhaustion, and disable behavior are documented.
- [ ] Release notes distinguish pushed code, deployment, and production verification.
- [ ] Help documentation matches actual behavior.
- [ ] No unresolved critical security, privacy, data-loss, or cross-tenant issue remains.

Mark Internal production-ready only after Gates 0–2 and relevant operations checks pass. Mark Commercially launch-ready only after Gates 3–5 and customer/payment validation pass. A successful build alone never passes these gates.
