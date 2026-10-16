# UX / UI & Information Architecture

**Current product rule:** preserve the existing founder experience and refine only where the current interface creates confusion. The application is a business decision workspace, not an engineering dashboard.

## Primary founder navigation

Keep the six existing areas stable:

1. **Beranda** — What matters now, findings, decisions awaiting approval, blockers explained in plain Indonesian, and one recommended next step.
2. **Intelijen Pasar** — Research question, scope, real sourced observations, source links and dates, supporting and contradicting evidence, sample limitations, and clearly labelled AI interpretation.
3. **Peluang** — Problem owner, urgency, current workaround, alternatives, likely payer, unknowns, recommendation, and the founder's decision history.
4. **Produk & Eksperimen** — Product concepts, low-cost tests, success and stop criteria, observed results, and whether to continue, change, or stop.
5. **Insight & Publikasi** — Evidence-backed insight drafts, review status, founder approval, publication state, and observed response. If publishing is not implemented, show an honest placeholder rather than a fake workflow.
6. **Pengaturan** — Access and recovery, connected information sources, privacy, and plain-language help. Technical maintenance is a secondary, owner-only area and must not become primary navigation.

Do not restore the former ten-area engineering navigation to the founder workspace. Existing maintenance pages may remain available to the owner behind the explicit maintenance link.

## Decision detail order

1. Plain-language summary and current decision state.
2. Why the issue matters to the business.
3. Evidence strength, scope, dates, and limitations.
4. Original source links and supporting / contradicting observations.
5. Alternative explanations and unanswered commercial questions.
6. Recommendation and why it is the next sensible step.
7. Clear choices: approve, reject, edit first, or decide later.
8. What approval will do, any cost or external effect, and the recorded outcome.

## Language and state rules

- Main founder screens use natural Bahasa Indonesia and business concepts, not engineering vocabulary.
- Do not expose internal route names, API terminology, database details, credentials, provider errors, raw logs, internal IDs, or version numbers in normal founder workflows.
- Translate errors into: what happened, business impact, whether the founder needs to act, and one next step.
- Never hide a problem that affects the founder. Do not make the founder responsible for fixing technical configuration.
- Distinguish real market observations, source-authored claims, AI interpretation, founder assumptions, sample data, and verified outcomes.
- Every substantive market claim should link to its source where possible and state source date, collection date, scope, and limitations.
- Do not present sample data as market evidence or turn a small sample into a representative market trend.
- Require explicit founder approval before public publishing, contacting people, spending money, changing access, or deleting data.
- Provide meaningful loading, empty, stale, partial-result, failure, insufficient-evidence, and approval-pending states. A queued or started task is not a success state.

## Visual direction

Preserve the current calm, premium, restrained visual direction. Prefer clear hierarchy, generous spacing, readable typography, responsive layouts, and restrained status colours. Use charts only when they clarify a real, sourced pattern. Do not add novelty gradients, decorative metrics, or unsupported predictive charts.

## Accessibility

Keep controls keyboard-operable, focus visible, labels semantic, contrast readable, reduced-motion preferences respected, and the experience usable on narrow screens. Review the actual rendered interface, not only source markup.

## Separation of responsibilities

- **Founder experience:** screens, navigation, plain language, accessible interaction, and presentation.
- **Business interpretation:** evidence synthesis, uncertainty, pattern detection, explanation, and recommendations.
- **Execution:** permissions, research actions, connector calls, approval enforcement, retries, and audit history.
- **Data:** persistence, source provenance, decisions, outcomes, and retention.
- **Maintenance:** deployment, diagnostics, recovery, and credentials; restricted to the owner.

Reuse the current repository, backend, and data foundation where sound. Do not rebuild the UI from scratch, duplicate the database, or remove working research capabilities without evidence and an explicit recovery plan.

## Release truth

The founder interface must reflect actual capability and current state. The current canonical readiness record is [docs/62-founder-first-release-readiness.md](62-founder-first-release-readiness.md); the master implementation directive is [docs/55-founder-first-ui-master-system-prompt.md](55-founder-first-ui-master-system-prompt.md). If this document conflicts with either canonical record, investigate and reconcile the records rather than silently presenting a stale status.
