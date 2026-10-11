# HIO Production & Commercial Acceptance Matrix

**Status:** Release gate; evidence must be attached for every pass  
**Date:** 2026-10-12  
**Rule:** Documentation and local tests do not prove production readiness. A production claim requires dated evidence from the deployed release.

## Gate 0 — Identity, scope and release integrity

- [ ] Correct HIO Pages project verified: `holbery-intelligence-os`.
- [ ] Correct isolated D1 verified: `hio-production`, binding `DB`.
- [ ] No use of HOLBERY Commerce or Bozq resources.
- [ ] Repository commit, built artifact, deployed commit and deployment ID are correlated.
- [ ] Branch/PR reviewed; changes are intentional and scoped.
- [ ] Rollback target and operator are known.
- [ ] No secret values in source, logs, PRs, browser bundles or screenshots.

## Gate 1 — Authentication and session safety

Known blocker at document date: production `OPERATOR_SECRET` and `SESSION_SECRET` were reported missing. Recheck current Cloudflare state before acting; never assume they were added.

- [ ] `OPERATOR_SECRET` configured as encrypted production secret, independently generated.
- [ ] `SESSION_SECRET` configured as encrypted production secret, independently generated and not reused.
- [ ] Minimum entropy/length policy enforced; values never posted to chat or committed.
- [ ] Missing-secret state fails closed and provides a safe setup-required response.
- [ ] Correct owner login succeeds; wrong password/secret fails.
- [ ] Session cookie flags, expiration, rotation and CSRF protections are verified.
- [ ] Logout invalidates session; expired/revoked sessions cannot access private routes.
- [ ] Rate limiting / brute-force protections are evaluated.
- [ ] Authenticated browser workflow tested on the live deployed release.

## Gate 2 — Data integrity and tenant boundaries

- [ ] Migrations reviewed, versioned and applied to the intended production D1.
- [ ] Backup/export and restore procedure tested.
- [ ] Authorization enforced server-side on every private read/write.
- [ ] Tenant/workspace isolation tested with at least two distinct test tenants if multi-tenant is claimed.
- [ ] Cross-tenant IDOR and direct-object-reference tests pass.
- [ ] Input validation, output encoding and safe error handling verified.
- [ ] Audit events cover login, approvals, configuration changes, external actions and admin operations.
- [ ] Data retention, export and deletion are implemented and tested.
- [ ] Idempotency and concurrency behavior are verified for state-changing actions.

## Gate 3 — AI and integration trust

- [ ] Every enabled model/provider is named, permissioned and costed.
- [ ] Every external action has an explicit tool contract and bounded input/output.
- [ ] Untrusted source content cannot override system policy or trigger privileged actions.
- [ ] Human approval required for spend, external messaging, production writes, migration and irreversible actions.
- [ ] OAuth scopes are least-privilege; token storage, refresh, revocation and expiry are tested.
- [ ] Provider outage, timeout, rate-limit and malformed response behavior are tested.
- [ ] Every workflow run has actor, tenant, input reference, approval, budget, status, retries and receipt.
- [ ] Cost/usage caps are enforced server-side; no “unlimited” claim without cost controls.
- [ ] No integration is described as connected unless live credentials and a real health check verify it.

## Gate 4 — Payments and commercial access (only if monetization is enabled)

- [ ] Pricing, included usage, overage, cancellation, refund and support terms published.
- [ ] Provider signature verification and webhook idempotency tested.
- [ ] Success/failure/expiry/refund/dispute flows tested.
- [ ] Entitlements are granted only after verified server-side payment state.
- [ ] Reconciliation and refund access are defined.
- [ ] Test mode and production mode are explicitly distinguished.
- [ ] Taxes, currency and relevant Indonesian consumer/business requirements are reviewed.
- [ ] Payment secrets remain encrypted and are never exposed to clients or logs.

## Gate 5 — Reliability, security and operations

- [ ] Unit, integration and browser tests pass against the release candidate.
- [ ] Security review covers authentication, authorization, injection, XSS/CSRF, SSRF where relevant, secret handling and dependency risk.
- [ ] Production smoke test covers public page, login, private read/write, persistence, logout and failure paths.
- [ ] Logs are structured and redact secrets/personal data.
- [ ] Health/availability, errors, provider failures and cost anomalies are monitored.
- [ ] Incident owner, severity levels, contact route and response procedure exist.
- [ ] Rollback and recovery drill completed.
- [ ] Dependency/license inventory and vulnerability response procedure exist.
- [ ] Accessibility and mobile workflows tested for critical paths.

## Gate 6 — Customer and business proof

- [ ] One specific beachhead segment and core workflow selected.
- [ ] Real customer workflow completed with a defined success metric.
- [ ] Customer acceptance and support burden documented.
- [ ] Price/willingness-to-pay tested with actual commercial behavior.
- [ ] Cost-to-serve and contribution margin measured.
- [ ] Retention/repeat use observed before claims of product-market fit.
- [ ] Public claims are supported by current, reviewable evidence.
- [ ] Terms, privacy notice, data deletion/export and support contact are available.

## Status vocabulary

- **PASS:** evidence exists, dated, linked, and reviewed.
- **FAIL:** test was run and failed.
- **BLOCKED:** required credential, access, dependency or decision is unavailable.
- **NOT TESTED:** no evidence that the test ran.
- **NOT APPLICABLE:** justified and approved; not used to hide missing work.

Never use “PASS” because a document exists or code looks correct. A gate is closed only when its required evidence is attached to the release record. Commercially ready is not equivalent to deployed; deployed is not equivalent to authenticated; authenticated is not equivalent to secure or saleable.

## Current known release caveat

Prior verified status reported a live Pages deployment and cloud smoke checks, but production credentials were absent and authenticated operation was not verified. Recheck current deployment and secret state before making any release claim. This document adds acceptance criteria only; it does not deploy code or configure Cloudflare.

## References

- NIST SP 800-218 SSDF: https://csrc.nist.gov/pubs/sp/800/218/final
- NIST SSDF project and publications: https://csrc.nist.gov/projects/ssdf
- Cloudflare Pages bindings/secrets: https://developers.cloudflare.com/pages/functions/bindings/
- Cloudflare D1 migrations: https://developers.cloudflare.com/d1/reference/migrations/
