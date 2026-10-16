# 52 — Evidence-to-Execution Business OS Architecture

Status: target architecture, not a claim that all modules are implemented. Canonical contract: [Productization and Production Parity](50-ai-workspace-productization-and-production-parity.md).

## Product category

Position HIO as an **Evidence-to-Execution Business OS** with an AI workspace interface. “AI workspace” describes the interaction model; “business OS” describes the connected system of context, decisions, execution, controls, and outcomes.

Core loop: **Observe → Understand → Decide → Approve → Execute → Measure → Learn**.

## Logical layers

1. Experience: Executive Home, conversational command surface, projects, artifacts, workflow timeline, approvals, settings.
2. Business context: workspaces, goals, projects, approved memories, decisions, source references, artifacts, audit history.
3. Intelligence: request classification, retrieval, bounded research plans, evidence synthesis, opportunity scoring, planning, evaluation.
4. Execution orchestration: durable job/run records, dependencies, retries, cancellation, budgets, idempotency, approval checkpoints.
5. Connectors: provider manifests, OAuth lifecycle, least-privilege scopes, secret references, rate limits, provider health, contract tests.
6. Data/governance: D1 records, approved object storage where needed, retention, access control, audit, export/deletion, tenant isolation.
7. Operations: release metadata, cost telemetry, alerts, backup/restore, incident process, feature flags, rollback.

## Core entities to map to existing schema

Do not duplicate tables before auditing migrations. Map the existing schema to Workspace/Membership, Project/Goal, ResearchRun/Source, Evidence/Provenance, Opportunity/ScoreVersion, Decision/Approval, Workflow/Run/Step/Event/Artifact, ProviderConnectionMetadata, CredentialRequirement/Status, UsageCostLedger, Outcome/Experiment, and AuditEvent/ReleaseRecord.

Workspace ownership must be enforced server-side. External actions need actor, scope, approval reference where required, idempotency, and audit records.

## Agent execution contract

Persist user intent, context references, plan/tools, risk and approval requirements, budget, run state, step results, retries, sources/artifacts, limitations, costs, and recovery instructions. Use scoped tools and read-only defaults. Require approval for external messages/posts, spending, payments, destructive actions, permission grants, and risky production migrations.

## Memory and context safety

Memory is scoped, inspectable, editable, and deletable. Separate approved preferences, sourced workspace facts, short-lived task context, inferences with confidence, and sensitive data that should not be retained. Treat retrieved/provider content as untrusted data, never as instructions that override system policy. Defend against prompt injection and outbound data leakage through tool scoping and review.

## Runtime mapping

Prefer the existing Cloudflare Pages/Workers + D1 stack initially. Verify real bindings and handlers before assuming capability. Any future queue, vector store, or durable execution service requires a measured-limit architecture decision.

## Build order

1. Configure Owner authentication and verify production session.
2. Audit UI/API/D1 parity.
3. Complete one narrow end-to-end workflow with persisted evidence.
4. Add durable runs, approvals, retries, budgets, and audit.
5. Add one permitted provider with OAuth lifecycle and real health checks.
6. Verify workspace isolation before external users.
7. Add metering, billing, privacy lifecycle, support, recovery.
8. Validate one paying workflow before expanding suites.

A layer is not complete because its documentation exists. Verify code, database effects, authorization, tests, deployed version, and failure behavior.


## Commercial product direction — 2026-10-16

The canonical customer journey is now **FIND → BUILD → VALIDATE → LAUNCH**. HIO is the customer-facing product/control plane; the product is intended to be commercial SaaS rather than founder-only internal tooling. Layer 1 FIND uses Apify as the required primary acquisition layer and Tavily as the standard public-web complement, with Grok Console / xAI API optional for targeted X/search and model API. Layer 2 BUILD uses Daytona as the required standard isolated build/test environment. Cloudflare Workers, Pages, existing D1, and optional R2 provide control-plane, persistence, and publication.

This direction does not assert these integrations or SaaS features are implemented. Existing implementation/readiness evidence remains authoritative. Public pages, authenticated customer workspaces, and owner/admin controls must be separate surfaces with server-enforced tenant isolation. See [docs/64-public-saas-product-direction.md](64-public-saas-product-direction.md), [docs/63-final-stack-find-build-validation.md](63-final-stack-find-build-validation.md), and [docs/62-founder-first-release-readiness.md](62-founder-first-release-readiness.md).
