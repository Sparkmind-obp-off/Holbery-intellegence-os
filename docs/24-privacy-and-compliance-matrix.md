# Privacy, Source Policy & Compliance Matrix

This is an operational checklist, not legal advice. Obligations depend on source, jurisdiction, content, use and future customer model.

## Before enabling a source
Record source/operator; access basis; terms, rate limits and attribution rules; fields required; personal/sensitive data risks; need for stored excerpts versus pointers; retention/deletion/correction duties; commercial-use rights; downstream deletion behavior; approver and review date.

## Default handling
- Public business/product information: relevant permitted fields only; preserve provenance.
- Public user-generated content: minimize content and profiling; review terms and purpose.
- Private/member-only content: do not collect without clear authorization and appropriate permission.
- Credentials/cookies: never commit to Git; use secret management; never bypass access rules.
- Sensitive personal data: avoid unless separately reviewed lawful necessity exists.
- Third-party actor output: untrusted until source, permissions and behavior are reviewed.
- Future customer data: tenant isolation, access controls, retention and deletion.

## Public repository rule
Keep the repo public for collaboration/Genspark, but only put shareable material in it. Never commit .env files, tokens, session cookies, customer exports, unredacted logs, private access links or production database dumps. Use placeholder-only example configuration. If a credential is committed, revoke/rotate it and remediate history where feasible; deleting the current file is insufficient.

Publicly viewable does not automatically mean unrestricted to scrape, store, republish or commercialize. Automated collection, redistribution and model processing may have separate rules. Keep source approvals and a kill switch.

## Productization gate
Before external commercialization, review terms, privacy notice, data-processing roles, deletion/export, IP/licensing, incident response, cross-border processing and applicable Indonesian requirements. Do not claim legal clearance without qualified review.

## Incident response
Disable affected source/integration, restrict access, preserve minimal incident metadata, revoke exposed credentials, trace downstream copies and derived outputs, remediate and document. Escalate according to actual obligations.

## Product direction synchronization (2026-10-12)

HIO's target is an evidence-to-execution business workspace, not a generic chatbot. This target does not imply shipped parity. Use docs/50 for capability states and release truth, docs/51 for Genspark/G2 benchmark, docs/52 for target architecture, docs/53 for production/commercial gates, and docs/54 for market validation. Keep fixtures distinct from live data. Production login remains blocked pending secure Owner configuration of distinct OPERATOR_SECRET and SESSION_SECRET values and verified authenticated production tests.
