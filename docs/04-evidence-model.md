# 04 — Evidence Model and Provenance

## Evidence ladder
| Level | Meaning | Example | Does not prove |
|---|---|---|---|
| D0 | Hypothesis | “Small sellers may lose margin through manual pricing” | That the problem exists |
| D1 | Observed signal | One accessible public post describes a problem | Recurrence or market size |
| D2 | Repeated pattern | Independent records show a similar problem | Willingness to pay |
| D3 | Commercial signal | User asks for paid help, reports existing spend, or evaluates paid alternatives | Purchase of our offer |
| D4 | Market-test behavior | Qualified signup, demo request, or checkout initiation for a specific offer | Completed payment |
| D5 | Verified transaction | Payment reconciled and offer delivered/accepted | Retention or scale |
| D6 | Outcome/repeatability | Measured benefit, repeat purchase/use, or repeatable acquisition | Guaranteed future growth |

## Evidence record minimum fields
- Stable evidence ID and schema version.
- Source ID and source-record ID.
- Canonical URL or permitted artifact reference.
- Published/observed time when known; collected time always.
- Collection-run ID and collection method.
- Content hash and duplicate/near-duplicate relationship.
- Language, topic/problem labels, affected role/segment where supported.
- Short excerpt or summary within legal and platform constraints.
- Source reliability and content completeness indicators.
- Raw observation separated from extracted facts and model inference.
- Retention/deletion status and access classification.

## Provenance chain
Source registry entry → collection run → source record → evidence item → cluster membership → opportunity dossier → decision → experiment → outcome event.

A reviewer must be able to navigate backward from a recommendation to the records that support it.

## Quality dimensions
- Authenticity: is the source/record plausibly genuine?
- Directness: first-hand description or hearsay?
- Specificity: concrete circumstance versus vague opinion?
- Recency: is the issue current?
- Independence: separate origin or copied/reposted content?
- Completeness: enough context to interpret correctly?
- Commercial relevance: evidence of budget, spend, urgency, or buying action?
- Contradiction: evidence that the problem is rare, solved, low priority, or not worth paying for?

## Handling AI outputs
AI can propose labels, summaries, translations, and clusters. It must not silently modify source evidence. Preserve model/provider, prompt/version, run ID, and review state where practical. Never cite a generated summary as if it were the original source.

## Confidence and missing data
Keep source reliability, evidence strength, and model confidence separate. Unknown values should be null/unknown, not zero and not positive by default. A score should show coverage and missing critical dimensions.

## Privacy and quotation
Collect the minimum data necessary. Prefer public business/problem evidence over personal profiles. Store short excerpts and source links when sufficient. Do not collect sensitive personal data unless a clearly justified, lawful, approved requirement exists; the default is not to collect it.
