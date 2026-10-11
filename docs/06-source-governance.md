# 06 — Source Governance and Connector Policy

## Source tiers
- **Tier A — Official APIs / authorized exports:** preferred; comply with scopes, quotas, terms, and retention limits.
- **Tier B — Licensed providers / approved actors:** use only when provider terms and target-source permissions support the intended collection. Record provider, actor/version, cost, and policy review.
- **Tier C — Accessible public pages:** only when collection is lawful and consistent with site terms, robots/access restrictions, privacy obligations, and reasonable rate limits. Manual/public visibility does not automatically grant unrestricted reuse.
- **Tier D — Restricted/private areas:** no scraping, access circumvention, session impersonation, or collection beyond explicitly authorized access. Require a documented, approved integration and platform-compliant method if ever considered.

## Registry requirements
Every source must record:
- Purpose and business question.
- Owner/provider and source URL.
- Access method and permission basis.
- Terms/policy URL and date reviewed.
- Data categories collected and minimization rationale.
- Rate limits, quotas, expected costs, retention, and deletion route.
- Enabled/disabled status and next review date.

## Connector contract
Each adapter should implement equivalents of:
- `validateConfig()`
- `checkAccess()`
- `collect(checkpoint, limits)`
- `normalize(record)`
- `health()`
- `estimateCost()`
- `deleteOrExpire(recordRef)` where supported.

Return structured run results, not only logs. Connectors must support limits, checkpointing, idempotency, cancellation, and disablement.

## Research behavior
- Start with two or three source types, selected after the repository/environment audit.
- Prefer source diversity and direct commercial signals over volume.
- Keep a source-specific query plan and explain why each query exists.
- Avoid broad indiscriminate crawling.
- Do not scrape private groups, use account sessions to bypass access rules, evade rate limits, or automate deceptive engagement.
- No mass posting or unsolicited DMs. Distribution actions must be explicitly approved and platform-compliant.

## Data minimization
Collect public business/problem signals, not dossiers on private individuals. Avoid sensitive personal data. Keep only the minimum content needed to support a claim; use links and concise excerpts when possible. Respect takedown, deletion, and provider retention requirements.

## Kill switch
Any source can be disabled globally. Disable it when access becomes unclear, terms change, repeated errors indicate restriction, unexpected sensitive data is returned, or cost exceeds its limit. Preserve audit history without retaining data that must be deleted.

## Connector acceptance checklist
- [ ] Access and terms reviewed.
- [ ] Quota/rate limits configured.
- [ ] Cost cap configured.
- [ ] Data fields minimized.
- [ ] Provenance and timestamps preserved.
- [ ] Dedupe and retry behavior tested.
- [ ] Error and disable behavior tested.
- [ ] Retention/deletion documented.
- [ ] No credentials committed.


## Canonical productization baseline — 2026-10-12

HIO's intended direction is an AI Business Command Workspace: evidence → opportunity → approved execution → measurable outcomes. This is a target product direction, not proof that every capability is shipped or commercially ready. Keep fixture/demo evidence distinct from live data, and use [the canonical productization and production-parity contract](50-ai-workspace-productization-and-production-parity.md) for current capability labels, security boundaries, release verification, and SaaS launch gates. Current production login remains blocked until the Owner configures distinct `OPERATOR_SECRET` and `SESSION_SECRET` values securely and the deployed authenticated workflow is verified. Benchmark current Genspark AI Workspace and G2 product evidence before turning assumptions into requirements.
