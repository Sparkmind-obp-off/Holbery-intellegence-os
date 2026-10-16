# Product Readiness Checklist

## Internal alpha
- [ ] I0 audit completed with evidence.
- [ ] One vertical slice works end to end with fixtures.
- [ ] Evidence has stable provenance and timestamps.
- [ ] Duplicate replay is idempotent.
- [ ] AI inference is distinct from source observation.
- [ ] Costs and failure states are visible.
- [ ] Source and job kill switches work.
- [ ] Critical tests pass in a recorded environment.

## Internal beta
- [ ] One permitted connector passes contract tests.
- [ ] Collection is repeatable and auditable.
- [ ] Human review can correct evidence and clusters.
- [ ] Scoring is versioned and explainable.
- [ ] Counter-evidence is visible.
- [ ] Decision history preserves snapshots.
- [ ] Restore and rollback procedures are tested.
- [ ] No unresolved critical security issues.

## Product validation
- [ ] External user and job are supported by evidence.
- [ ] Users can complete workflow without continuous founder intervention.
- [ ] Value is measured against a baseline.
- [ ] Source rights permit intended use and outputs.
- [ ] Cost per useful dossier and support burden are measured.
- [ ] Paid pilot or real payment validates willingness to pay.
- [ ] Refunds, failed payments and delivery are reported truthfully.

## External product readiness
- [ ] Authentication, authorization and workspace isolation are tested.
- [ ] Privacy notice, terms, retention, export and deletion reviewed.
- [ ] Incident response and contact process documented.
- [ ] Billing/payment reconciliation tested through authorized provider flows.
- [ ] Usage limits, abuse prevention and cost controls work.
- [ ] Support ownership and service expectations defined.
- [ ] Accessibility and core browser coverage reviewed.
- [ ] Product claims match verified capability.
- [ ] Explicit founder launch approval recorded.

Never mark an item complete because a document exists, code compiles, preview opens, a test is mocked, a payment is simulated or a model claims success. Attach evidence appropriate to each item.

## Release truth rule (2026-10-12)

Do not mark readiness from documentation, build success, a mock, or a static deployment alone. Verify the complete UI → backend → authorization → D1/provider → persisted result path in the target environment. Owner login is currently blocked until OPERATOR_SECRET and SESSION_SECRET are configured as distinct production secrets and login is tested. See [canonical productization contract](50-ai-workspace-productization-and-production-parity.md).


## Product direction synchronization (2026-10-12)

HIO's target is an evidence-to-execution business workspace, not a generic chatbot. This target does not imply shipped parity. Use docs/50 for capability states and release truth, docs/51 for Genspark/G2 benchmark, docs/52 for target architecture, docs/53 for production/commercial gates, and docs/54 for market validation. Keep fixtures distinct from live data. Production login remains blocked pending secure Owner configuration of distinct OPERATOR_SECRET and SESSION_SECRET values and verified authenticated production tests.

## Commercial SaaS direction update — 2026-10-16

The internal-alpha checklist is not sufficient for commercial release. Commercial SaaS additionally requires tenant isolation, customer onboarding/access lifecycle, workspace-scoped quotas and usage accounting, provider/Daytona sandbox isolation, data retention/export/deletion, terms/privacy/support, billing/entitlements before charging, recovery/rollback evidence, and end-to-end FIND → BUILD → VALIDATE acceptance. Canonical requirements: [docs/64-public-saas-product-direction.md](64-public-saas-product-direction.md).
