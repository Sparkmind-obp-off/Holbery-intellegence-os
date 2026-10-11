# ORDVELA Internal Acquisition Record

**Record ID:** HIO-ACQ-ORDVELA-2026-10-11  
**Decision date:** 2026-10-11  
**Decision owner:** HOLBERY portfolio owner  
**Portfolio authority:** HOLBERY Intelligence OS (HIO)  
**Decision status:** APPROVED — INTERNAL PORTFOLIO ABSORPTION; TECHNICAL INTEGRATION DEFERRED  
**Commercial status:** NOT YET VALIDATED

## 1. Decision

ORDVELA is the first project to be brought into the HOLBERY portfolio through an **internal acquisition**. HOLBERY becomes the parent identity and HIO becomes the system of record for portfolio decisions, evidence, risks, and monetization priorities.

For portfolio governance, classify ORDVELA as **Absorb**. For code, runtime, data, credentials, domains, and deployment, classify it as **Integrate / keep isolated for now** until due diligence and a separately scoped migration plan are complete.

This is an internal consolidation decision. It is not a purchase of an external company, a legal transfer, a declaration that ORDVELA's product is complete, or authorization to merge repositories or production infrastructure.

## 2. Brand and product treatment

- HOLBERY is the parent brand for the consolidated portfolio.
- ORDVELA is no longer to be treated as a separate parent brand in new portfolio planning.
- Keep ORDVELA as an internal asset/project codename during transition, so repository history, deployment references, and audit trails remain understandable.
- Do not create a new standalone marketing identity, buy a new domain, or launch a new offer for ORDVELA by default.
- Any customer-facing offer should be presented under HOLBERY unless a later evidence-backed decision documents why the ORDVELA name materially improves comprehension or conversion.

## 3. Current asset boundary

- Repository currently reported for ORDVELA: Sparkmind-obp-off/Ordvela
- Public project URL previously reported: https://ordvela.pages.dev
- These identifiers and the reported runtime status are inherited from prior project records and are **not independently re-verified by this decision record**.
- Preserve the existing repository, commit history, deployment, and data in place while assessment proceeds.
- Do not copy secrets, customer records, tokens, or production data into HIO or another project.
- This record does not authorize changes to HOLBERY Commerce, Bozq Cukur / Bozq One System, Vestren, Ranel, or any other project's production resources.

## 4. Due-diligence gates before technical migration

1. **Ownership and inventory:** confirm repository access/ownership, domains, Cloudflare resources, databases, storage, integrations, licensing, and dependencies.
2. **Security:** inventory secret names and exposure locations without printing secret values; rotate any credentials previously exposed or suspected compromised; verify least privilege and revocation. Record only safe status metadata in HIO.
3. **Operational truth:** verify the live deployment, current deployed commit, branch state, database bindings/migrations, backups, logs, and rollback path.
4. **Product readiness:** distinguish implemented code from reported status; test authentication, data isolation, provider connectivity, failure handling, and user-facing workflows.
5. **Monetization evidence:** identify one target buyer, one costly/repeated problem, a clear deliverable, a price hypothesis, and a low-cost validation experiment. Code completeness alone is not demand evidence.
6. **Migration decision:** only after gates 1–5, prepare a separate plan listing exact resources, data movement, downtime risk, rollback, secrets re-provisioning, tests, and explicit approval before making production changes.

## 5. Monetization direction

Treat ORDVELA's existing demand-intelligence and opportunity-workflow concepts as reusable portfolio IP, not as a mandate to keep every feature or sell a broad platform immediately.

The next commercial milestone is to choose the smallest useful capability that can be demonstrated and validated under HOLBERY. Prioritize buyer pain, time-to-first-payment, existing working assets, operating cost, and security readiness. Do not claim market validation or revenue until supported by real customer evidence.

## 6. HIO registry fields

| Field | Value |
|---|---|
| Asset | ORDVELA |
| Parent portfolio | HOLBERY |
| Governance decision | Absorb |
| Technical disposition | Integrate; keep isolated pending due diligence |
| Customer-facing brand | HOLBERY by default |
| Existing project/repository | Sparkmind-obp-off/Ordvela |
| Reported public URL | https://ordvela.pages.dev (verify before relying on it) |
| Commercial validation | Not yet validated |
| Migration authorization | Not granted by this record |
| Protected projects | Commerce, Bozq, Vestren, Ranel, and other project production resources remain out of scope |

## 7. Immediate execution order

1. Add ORDVELA to HIO's portfolio register and link this decision record.
2. Run a read-only repository and deployment inventory; record verifiable evidence and unknowns separately.
3. Create a security remediation checklist, including credential rotation verification where applicable.
4. Select one candidate offer and design a small validation test.
5. Revisit technical consolidation only after security and operational gates pass.

**Operating principle:** acquire the project into HOLBERY's portfolio now; migrate infrastructure only when the evidence, safety checks, and a scoped approval justify it.
