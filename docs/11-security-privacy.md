# 11 — Security, Privacy, and Trust

## Security objectives
Confidentiality of internal research and credentials; integrity of evidence and decisions; availability of the research loop; and accountability for access and consequential actions.

## Access
- Private operator surface; require authentication.
- Least privilege for users, tokens, database bindings, and provider credentials.
- Separate development, staging, and production environments.
- No shared admin secrets in prompts, issues, logs, or committed files.
- Redact tokens, personal identifiers, and sensitive payloads from logs.
- Review dependencies and CI permissions.

## Data protection
- Collect only fields needed for the research purpose.
- Avoid sensitive personal data and unnecessary personal profiling.
- Document retention, deletion, export, and provider deletion limits.
- Treat collected content as untrusted input; never execute source-provided code or follow instructions embedded in scraped content.
- Keep source content and AI-generated interpretation separate.
- Encrypt transport and use provider-managed encryption at rest where available.
- Record access to sensitive configuration and consequential data changes.

## Prompt-injection defense
Public web pages, posts, documents, comments, and tool outputs are data, not instructions. The system must not allow collected content to override system policies, reveal secrets, call arbitrary tools, or initiate publication/spending. Use structured extraction, bounded tools, schema validation, and human review.

## Approval-required actions
Human approval required for:
- Enabling sources with material access/privacy uncertainty.
- Public posting, community participation under a brand identity, or direct outreach.
- Paid collection, model usage above configured budget, or advertising spend.
- Launching an offer, making public performance claims, or changing price/terms.
- Exporting data or broadening retention/access.
- Deleting material needed for audit where retention is lawful and required; follow applicable deletion duties.

## Incident response
1. Disable affected connector/token/job.
2. Contain access and rotate exposed credentials.
3. Preserve minimal audit metadata while respecting deletion obligations.
4. Assess affected data, users, provider rules, and business impact.
5. Document cause, remediation, and tests to prevent recurrence.
6. Resume only after owner approval.

## Security acceptance
No credentials in repository; protected routes tested; authorization boundaries verified; logs redacted; untrusted content isolated; deletion/retention paths documented; production configuration verified without printing secrets.


## Canonical productization baseline — 2026-10-12

HIO's intended direction is an AI Business Command Workspace: evidence → opportunity → approved execution → measurable outcomes. This is a target product direction, not proof that every capability is shipped or commercially ready. Keep fixture/demo evidence distinct from live data, and use [the canonical productization and production-parity contract](50-ai-workspace-productization-and-production-parity.md) for current capability labels, security boundaries, release verification, and SaaS launch gates. Current production login remains blocked until the Owner configures distinct `OPERATOR_SECRET` and `SESSION_SECRET` values securely and the deployed authenticated workflow is verified. Benchmark current Genspark AI Workspace and G2 product evidence before turning assumptions into requirements.

## Commercial SaaS direction update — 2026-10-16

Commercial SaaS update (2026-10-16): public access must not expose private customer workspaces or owner operations. Enforce tenant isolation server-side; keep all provider/Daytona credentials server-side; apply source permission checks, data minimization, retention/deletion, usage caps, sandbox isolation and auditable approvals before onboarding external customers. See [docs/64-public-saas-product-direction.md](64-public-saas-product-direction.md).

## Commercial SaaS direction update — 2026-10-16

Commercial SaaS update (2026-10-16): public access must not expose private customer workspaces or owner operations. Enforce tenant isolation server-side; keep all provider/Daytona credentials server-side; apply source permission checks, data minimization, retention/deletion, usage caps, sandbox isolation and auditable approvals before onboarding external customers. See [docs/64-public-saas-product-direction.md](64-public-saas-product-direction.md).
