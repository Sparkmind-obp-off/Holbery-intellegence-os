# HIO Risk, Privacy, Security & AI Governance

**Status:** Required design controls; runtime verification pending  
**Date:** 2026-10-12

## 1. Governance principles

1. Least privilege: integrations receive only required scopes and actions.
2. Separation of duties: AI may recommend; the owner approves material or irreversible actions.
3. Explicit authority: a credential or connected account is not permission to use every accessible resource.
4. Data minimization: collect only what the task needs, for a declared purpose and retention period.
5. Provenance: record where evidence came from and how it was transformed.
6. Fail closed: missing configuration, ambiguous permissions, over-budget runs or unverified identity must block sensitive actions.
7. Reversibility: prefer read-only and reversible operations before write/migration/deletion.
8. Honest status: distinguish intended, implemented, tested, deployed, connected and verified.
9. Human accountability: name the owner for production changes, incidents, customer support and data requests.
10. No secret disclosure: users can inspect secret names, status, scope and rotation instructions—not raw secret values in UI, logs or chat.

## 2. Threat model

Assess at least:
- account takeover, credential stuffing and session theft;
- privilege escalation and cross-tenant data access;
- prompt injection in web pages, posts, documents, issue comments or connector output;
- malicious or compromised third-party integrations;
- secret leakage through logs, browser bundles, errors, source control or support exports;
- SSRF or unsafe URL fetching if the product fetches user-controlled URLs;
- injection/XSS/CSRF and unsafe file uploads;
- replay, duplicate jobs, webhook forgery and payment entitlement spoofing;
- provider outage, rate limiting and unbounded spend;
- accidental cross-project changes or migration to protected systems;
- data retention/deletion failure and over-collection of personal information;
- misleading market claims based on weak or synthetic evidence.

For each threat, track likelihood, impact, mitigation, owner, test and residual risk. A risk register is incomplete until the mitigation has test evidence.

## 3. AI agent execution policy

AI output is untrusted input until validated. The system must not allow a model to grant itself permissions, change its own approval policy, access a secret value, or bypass server-side authorization.

Actions should be classified:
- **A0 — Pure read / synthesis:** no external state change, within approved data scope.
- **A1 — Draft:** creates a draft or proposed change; no external effect.
- **A2 — Reversible internal write:** persists a note/task or internal record; authorization and audit event required.
- **A3 — External action / spend:** sends a message, triggers a provider job, incurs material cost or changes an external account; explicit approval and budget required.
- **A4 — High impact / irreversible:** production migration, destructive delete, credential rotation, money movement, public posting or cross-project data movement; explicit owner approval, preview, confirmation and recovery plan required.

The server—not the model—must enforce the class, user authorization, scope, spend cap, idempotency and approval record. Tool outputs should be schema-validated and treated as data, not instructions.

## 4. Secrets and OAuth lifecycle

Maintain metadata only:
- secret/connection name;
- provider and environment;
- purpose and allowed scopes;
- configured/missing/expired/revoked/unknown state;
- last successful verification and verification method;
- expiry/rotation date if known;
- owner and recovery steps.

Raw values must be write-only to the product and encrypted at the provider or secure secret store. Never display values after configuration. OAuth consent must show requested scopes and business purpose. Revocation, expiry, scope mismatch and failed refresh must disable dependent actions and notify the owner without exposing tokens.

## 5. Data protection and customer trust

- Classify data as public, internal, confidential, personal, credential/secret or regulated/high-risk.
- Keep production customer data out of synthetic tests and demo fixtures.
- Document purpose, legal basis/consent where applicable, retention, deletion, export and subprocessors.
- Redact or minimize logs and telemetry; never log secrets or full sensitive payloads by default.
- Provide a clear way to report security/privacy issues.
- Make claims about data processing, model training, location, encryption and deletion only when contract and runtime configuration substantiate them.
- Evaluate Indonesian legal obligations and customer contract needs before paid launch; obtain qualified legal review for applicable requirements rather than treating this document as legal advice.

## 6. Incident handling

Minimum incident record: incident ID, severity, detection time, affected release/tenant/provider, impact, owner, containment, evidence, communications, recovery, root cause, follow-up controls and closure approval.

For suspected secret exposure: stop affected actions, rotate/revoke at source, inspect logs and repository history, assess blast radius, notify affected parties as required, and record verification. Deleting a visible value alone does not invalidate a leaked credential.

For unsafe automation: disable the affected capability, preserve audit evidence, stop retries/spend, notify owner, and require re-approval before re-enabling.

## 7. Governance and legal boundary

This policy is operational guidance, not a certification or legal opinion. Before commercial launch, review applicable Indonesian privacy/data protection, electronic systems, consumer, tax, payment and contractual obligations for the actual product and customer segment. Keep an evidence trail of review and decisions.

## References

- NIST Secure Software Development Framework: https://csrc.nist.gov/pubs/sp/800/218/final
- NIST SSDF overview: https://csrc.nist.gov/projects/ssdf
- Cloudflare Pages secrets: https://developers.cloudflare.com/pages/functions/bindings/
- Genspark Workspace 6.0 (market benchmark, not a security standard): https://www.genspark.ai/blog/genspark-ai-workspace-6


## Commercial SaaS governance addendum — 2026-10-16

The public-SaaS direction adds explicit tenant-boundary requirements: every API, query, job, artifact, usage record, and connector credential must be scoped server-side to an authenticated workspace; never rely on hidden UI controls. Owner/admin controls must be separated from customer surfaces. Provider keys and Daytona credentials stay server-side; sandbox output is untrusted and must not gain production credentials. Apply per-tenant budgets, cancellation, idempotency, retention/deletion policy, abuse controls, audit, incident response, and human approval for publication or other consequential actions. Connector use must respect platform terms and authorized access; do not bypass private-group restrictions. See [docs/64-public-saas-product-direction.md](64-public-saas-product-direction.md).
