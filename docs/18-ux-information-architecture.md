# UX / UI & Information Architecture

**Design principle:** evidence first, action second, decoration last.

## Primary navigation
1. Overview — pipeline health, recent runs, review queue, spend and failures.
2. Discover — approved sources, searches, runs and coverage.
3. Evidence — provenance, duplicates, quality labels, counter-evidence and annotations.
4. Clusters — problem patterns, members, source diversity, recency and competing interpretations.
5. Opportunities — transparent ranking, factor breakdown, confidence, coverage, risks and payer hypothesis.
6. Dossier — narrative, evidence, alternatives, assumptions, counter-evidence, economics and recommendation.
7. Experiments — approved tests, budget caps, event tracking, stop conditions and results.
8. Decisions — append-only history, owner, rationale, evidence snapshot and revisit date.
9. Sources & Costs — permissions, quotas, connector status, retention and kill switches.
10. Settings — roles, workspace, export, retention and integrations.

## Dossier page order
Executive summary and decision state; separate evidence coverage and confidence; problem and affected segment; evidence timeline with source links; counter-evidence and alternative explanations; payer, urgency, workaround and alternatives; score breakdown; proposed test with budget and thresholds; decision history and audit trail.

## Interaction rules
- Every AI-generated factual claim links to records or is labeled as an unverified hypothesis.
- Distinguish observed fact, source-authored claim, model inference, operator assumption and verified outcome.
- Show stale, unavailable, deleted or restricted source status.
- Destructive actions require confirmation; external side effects require explicit approval.
- Allow reviewers to reject, edit, split, merge or mark a cluster as duplicate/noise.
- Keep score explanations accessible; never show an unexplained AI score.
- Design explicit loading, empty, partial-failure, rate-limit and permission-denied states.
- A queued job is not a success state.

## Visual direction
Calm, analytical, readable; neutral surfaces, restrained status colors, accessible typography, useful tables and charts only when they clarify change. Avoid AI novelty gradients and unsupported predictive charts.

## Accessibility
Keyboard-operable controls, visible focus, semantic labels, readable contrast, reduced-motion support and usable narrow-screen review. Dense analysis may be desktop-first but not desktop-exclusive.

## UX acceptance
A reviewer who did not create a dossier can find its evidence, challenge its conclusion, inspect its score and understand the next action without reading raw model logs.

## Product direction synchronization (2026-10-12)

HIO's target is an evidence-to-execution business workspace, not a generic chatbot. This target does not imply shipped parity. Use docs/50 for capability states and release truth, docs/51 for the Genspark/G2 benchmark, docs/52 for target architecture, docs/53 for production/commercial gates, and docs/54 for market validation. Keep fixtures distinct from live data. Production login remains blocked pending secure Owner configuration of distinct OPERATOR_SECRET and SESSION_SECRET values and verified authenticated production tests.
