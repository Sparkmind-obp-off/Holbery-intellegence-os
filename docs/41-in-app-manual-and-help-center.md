# 41 — In-App Manual and Help Center Specification

**Status:** Product specification. This is not yet an implemented UI page.
**Route proposal:** `/manual` (confirm against the application router during Phase 0).
**Navigation label:** Manual & Help

## Purpose

Give an operator one reliable place to learn how to use HOLBERY Intelligence OS, understand what the system is doing, and recover from common problems. The manual must describe actual shipped behavior, not planned features as if they already exist.

## Information architecture

1. **Start here**
   - What the system does and does not do
   - First-time setup checklist
   - Main workflow overview
   - Terms: source, collection run, observation, evidence, cluster, opportunity, decision, experiment

2. **Daily workflows**
   - Register and configure a source
   - Test a connection and inspect permissions
   - Run a bounded collection
   - Review evidence and provenance
   - Compare supporting and contradicting evidence
   - Create/review an opportunity dossier
   - Record a decision
   - Create, approve, stop, and evaluate an experiment

3. **Integrations and plugins**
   - Connector status and supported capabilities
   - Manifest and permission review
   - Configure secret references without displaying secret values
   - Run fixture/test mode
   - Inspect failures and rate limits
   - Disable, disconnect, revoke, and uninstall
   - MCP connection review and tool-level permissions

4. **AI and evidence quality**
   - Facts versus interpretations versus hypotheses
   - Confidence and scoring limitations
   - Prompt injection and untrusted source content
   - How to report incorrect or unsupported output
   - Why an AI score does not prove demand

5. **Privacy, safety, and governance**
   - Permitted source access
   - Data minimization, retention, export, and deletion
   - Human approval requirements
   - Audit history
   - Prohibited actions and escalation process

6. **Troubleshooting**
   - Connection failed / permission missing
   - Rate limit or provider outage
   - Empty results or low-quality evidence
   - Duplicate or stale records
   - AI output unsupported by evidence
   - Deployment/configuration error
   - How to collect a safe diagnostic report without exposing credentials

7. **Release notes and known limitations**
   - Current application version
   - Shipped features versus planned features
   - Known issues and workarounds
   - Last reviewed date and documentation owner

## UX requirements

- The Manual is a dedicated page reachable from global navigation and the user menu.
- Include search/filter by topic, clear section navigation, readable headings, and mobile-friendly layout.
- Show version and last-reviewed date.
- Include contextual help links on source setup, collection runs, plugin permissions, evidence review, and experiment approval screens.
- Use short task-oriented instructions with prerequisites, steps, expected result, and troubleshooting.
- Provide warning text before irreversible actions.
- Never place secrets, session cookies, private source content, or personal data in examples.
- If a feature is not implemented or unavailable to the current user, label it clearly rather than showing a misleading walkthrough.

## Content model

Each help article should have:
- Stable article ID and title
- Category and tags
- Short purpose
- Prerequisites/required permission
- Numbered procedure
- Expected result
- Failure modes and recovery
- Related pages
- Applicable minimum app version
- Owner and last-reviewed date

Store content in version control so changes can be reviewed alongside product changes. Choose Markdown or a typed content format during implementation audit based on the existing stack; do not introduce a separate CMS without a demonstrated need.

## Acceptance criteria

- Operator can open Manual from the primary navigation on desktop and mobile.
- Search or topic navigation finds core workflow articles.
- Every implemented critical workflow has a corresponding tested article.
- Articles clearly distinguish current behavior from planned capability.
- No secrets or live credentials appear in content, URLs, screenshots, logs, or examples.
- Broken links and missing article metadata are checked in CI where practical.
- The manual is reviewed whenever the related workflow changes.
