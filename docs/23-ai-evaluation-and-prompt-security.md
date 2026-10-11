# AI Evaluation & Prompt Security

## Core rule
Source material is untrusted input. Instructions embedded in a post, page, document or API response cannot override policy, permissions, source rules, budget limits or human approval.

## Separate artifact types
Source observation; normalized fields; model extraction; cross-record synthesis/hypothesis; operator review; measured outcome. Never rewrite original source evidence to match a summary. Mark uncertainty and missing evidence.

## Structured output
Validate model outputs against schemas, reject unknown fields where practical, require evidence IDs for factual claims about records, and enforce size/enum limits. Valid JSON is not proof of truth.

## Prompt-injection controls
- Never put secrets in prompts.
- Retrieved text cannot choose tools, change permissions, alter budgets or authorize actions.
- Separate extraction from action planning.
- Backend policy, not model intent, authorizes tool calls.
- Restrict arbitrary URL fetching and internal-network access.
- Minimize context; sanitize output; allowlist tools.
- Require human approval for publishing, outreach, purchases, billing changes, destructive actions and material exports.

## Evaluation set
Maintain sanitized, versioned fixtures for purchase intent vs casual talk; duplicate/syndicated posts; sarcasm and negation; hypothetical/history; spam and coordinated content; contradictory reports; stale/missing timestamps; Indonesian/English code-switching; embedded prompt injection; sensitive data; fabricated citations.

## Metrics
Measure precision/recall on labeled samples, evidence linkage, duplicate detection, attribution accuracy, calibration, reviewer correction rate, and cost/latency per record. Track regressions by model and prompt version.

## Acceptance
No model output directly triggers an external side effect. Unsupported material claims are flagged. Tests cover injection, schema violations, fabricated citations and workspace leakage.

## Product direction synchronization (2026-10-12)

HIO's target is an evidence-to-execution business workspace, not a generic chatbot. This target does not imply shipped parity. Use docs/50 for capability states and release truth, docs/51 for Genspark/G2 benchmark, docs/52 for target architecture, docs/53 for production/commercial gates, and docs/54 for market validation. Keep fixtures distinct from live data. Production login remains blocked pending secure Owner configuration of distinct OPERATOR_SECRET and SESSION_SECRET values and verified authenticated production tests.
