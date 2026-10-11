# HIO Business Lineage & Portfolio Governance

**Status:** Strategic operating model / proposed policy  
**Date:** 2026-10-12  
**Applies to:** HOLBERY Intelligence OS (HIO) only; portfolio metadata may describe related ventures without granting permission to access or change them.

## 1. Why lineage exists

Business lineage is the traceable chain from an observed signal to a business decision and, if approved, to an outcome:

**Source → Observation → Evidence → Problem hypothesis → Customer segment → Value proposition → Offer → Experiment → Decision → Product/version → Delivery → Revenue/cost → Outcome → Learning.**

Every link must preserve provenance, timestamps, ownership, confidence, and the distinction between fact and inference. A downstream decision must be able to answer: what evidence caused this decision, who approved it, what changed, what did it cost, and what happened afterward?

This is not just a data-lineage graph. It combines:
- **Evidence lineage:** origin, capture method, permissions, time, transformation, deduplication, counter-evidence.
- **Decision lineage:** hypothesis version, scoring model version, decision owner, rationale, rejected alternatives.
- **Product lineage:** requirements, source commit, tests, release, migration, configuration, rollback, runtime proof.
- **Commercial lineage:** segment, offer/version, price, acquisition source, payment state, fulfillment, refund, retention and costs.
- **Portfolio lineage:** asset owner, relationship, lifecycle, dependency, isolation class, due-diligence status, approved actions.

## 2. HIO's role

HIO is the portfolio-level **Evidence-to-Execution Business OS**: it should help an owner see what is happening across approved business lines, understand the evidence, choose the next best validated action, approve material risk, and learn from measurable results.

HIO is not the owner of every underlying business system. It is an orchestration and governance layer. Source-of-truth records remain in their authoritative systems until an explicit integration contract says otherwise.

### Operating loop
1. **Observe:** capture permitted public or connected signals with source metadata.
2. **Understand:** normalize and group observations; preserve contradictory evidence.
3. **Decide:** score opportunities using a versioned rubric and expose unknowns.
4. **Approve:** require explicit approval for spend, external communication, production writes, data migration, and irreversible actions.
5. **Execute:** run a bounded, authorized workflow with budgets, idempotency, retries and receipts.
6. **Measure:** capture delivery, cost, customer response, payment, usage and failure evidence.
7. **Learn:** update hypotheses and product decisions; retain a change history.

## 3. Portfolio lifecycle and state model

Use explicit states rather than a vague “active” label:

- **Inbox:** asset or idea has been recorded; not assessed.
- **Discovering:** problem, user, market, permissions or ownership are still being researched.
- **Evidence-building:** collecting validated evidence; no scale claim.
- **Validation-ready:** experiment and pass/fail criteria are defined.
- **Pilot:** a bounded real-user test with owner, time limit, support plan and rollback.
- **Commercially-validated:** real target customers have paid or made an equivalent high-commitment action, and delivery has been proven.
- **Scaling:** repeatable acquisition, delivery, retention and positive unit economics are evidenced.
- **Paused:** no new spend or scope expansion without a restart decision.
- **Archived:** retained for history; not scheduled for execution.
- **Acquired / integrated / isolated:** portfolio relationship states, not permission grants.

A lifecycle change requires a dated decision record with evidence and an owner. No automated score may silently promote an asset to production or scaling.

## 4. Portfolio relationship and isolation rules

Represent each venture or system with:
- stable asset ID and display name;
- legal/operating owner and data owner;
- repository, deployment, database and provider references (never secret values);
- business purpose, customer segment, offer and maturity;
- dependencies and integration contract;
- data classification and allowed read/write actions;
- lifecycle state and latest verified release;
- due-diligence status, risk register, and next decision.

**Known boundary:** HOLBERY Commerce and Bosku Cukur / Bozq One System are protected, separate resources. Vestren, Ranel and other ventures are also separate products unless an owner explicitly authorizes a scoped integration. Portfolio visibility is not authorization. Never copy production data, secrets, credentials, customer records, or repositories merely because an asset appears in the portfolio.

For ORDVELA, the prior portfolio decision is **absorb for governance; keep technically isolated pending due diligence**. This is not approval to migrate production data or merge code.

## 5. Source-of-truth and provenance rules

- Each observation has a source URL or connector reference, captured-at timestamp, source-published timestamp if known, collection method, access basis, content hash when appropriate, and transformation version.
- Never erase source identity when deduplicating; keep canonical record plus links to duplicates/reposts.
- Separate **observed fact**, **user-provided assertion**, **vendor claim**, **model inference**, **estimate**, and **unknown**.
- Evidence scores must be explainable and versioned. A score without raw evidence and uncertainty is not a business fact.
- Expired, deleted, inaccessible, or permission-restricted sources must be marked as such; do not imply continuous access.
- Store only data needed for the declared purpose and retention period.

## 6. Minimum data objects

Recommended logical entities: PortfolioAsset, BusinessLine, CustomerSegment, ProblemHypothesis, EvidenceItem, Source, Opportunity, ValueProposition, OfferVersion, Experiment, DecisionRecord, WorkflowRun, Approval, IntegrationConnection, CredentialMetadata, Release, Incident, OutcomeMetric, PaymentEvent, CostEntry, LearningRecord.

Every mutable entity should have stable IDs, created/updated timestamps, actor, tenant/workspace, version, and audit events. Use immutable event records for approvals, external execution receipts, payment-provider webhooks, releases, and incident decisions.

## 7. Governance questions HIO must answer

- What is this asset, who owns it, and what is its current lifecycle state?
- Which evidence supports the current customer/problem/value hypothesis?
- What assumptions remain untested?
- Which integration permissions and scopes are active, missing, expired or unverified?
- What can the system do automatically, and what requires approval?
- What is the spend limit, actual spend, and remaining budget?
- What was executed, with which actor/credential reference, and what was the result?
- What proof supports the current production and commercial status?
- Which assets are intentionally isolated and what change would require owner approval?

## 8. Definition of done for lineage

Lineage is operationally credible only when a reviewer can follow a representative item from source to evidence to decision to approved execution to measured outcome without guessing, and can distinguish a planned step from a completed one. Until the runtime persists and exposes these records, this document describes the target contract, not an existing capability.

## References

- Strategyzer, Business Model Canvas: https://www.strategyzer.com/library/the-business-model-canvas
- Strategyzer, What is a business model?: https://www.strategyzer.com/library/what-is-a-business-model
- Strategyzer, Value Proposition Canvas: https://www.strategyzer.com/library/the-value-proposition-canvas
- HIO portfolio decision on ORDVELA: ../portfolio/acquisitions/ordvela-internal-acquisition-2026-10-11.md
- HIO–ORDVELA integration plan: ../architecture/hio-master-command-center-ordvela-integration-plan.md
