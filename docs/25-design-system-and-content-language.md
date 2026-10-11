# Design System & Content Language

## Product character
Calm, exact, skeptical and useful. Premium because the work is organized and trustworthy, not ornamental. The UI should feel like an analyst's instrument.

## Information hierarchy
1. Decision/state.
2. Evidence strength and coverage.
3. Risk, contradiction and uncertainty.
4. Recommended next action.
5. Supporting detail and technical metadata.

## Status vocabulary
- Draft: incomplete.
- Needs review: human decision required.
- Evidence-gated: defined evidence checklist passed.
- Approved: named human approved a bounded action.
- Running: work actually started.
- Partial: some work completed with known gaps.
- Succeeded: terminal success durably confirmed.
- Failed: terminal failure recorded.
- Blocked: policy, permission, budget or dependency prevents progress.
- Stale: evidence/status exceeded freshness window.
- Verified outcome: observed result with attributable measurement.

Never use verified for a model assertion, live for an unproven integration, or success for a queued job.

## Evidence labels
Source observation; extracted claim; inference; operator assumption; counter-evidence; experiment observation; verified commercial outcome.

## Components and language
Standardize buttons, forms, status chips, evidence rows, provenance panels, score breakdowns, timelines, audit tables, confirmation dialogs and empty/error states. Explain what is known, inferred and unknown. Show source and observed date near claims. Explain score changes in plain language. Prefer “evidence is insufficient” over false precision. Do not claim that correlation proves demand or that a model predicts revenue without validation.

Use localized Indonesian date/number display when relevant while preserving canonical timestamps and raw numeric values. Status must not rely on color alone. Motion must not imply real-time collection if data is stale.

## Acceptance
A new operator can explain a status, locate a claim's source, understand why a score changed and identify what action is actually authorized.

## Product direction synchronization (2026-10-12)

HIO's target is an evidence-to-execution business workspace, not a generic chatbot. This target does not imply shipped parity. Use docs/50 for capability states and release truth, docs/51 for Genspark/G2 benchmark, docs/52 for target architecture, docs/53 for production/commercial gates, and docs/54 for market validation. Keep fixtures distinct from live data. Production login remains blocked pending secure Owner configuration of distinct OPERATOR_SECRET and SESSION_SECRET values and verified authenticated production tests.
