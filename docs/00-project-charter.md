# 00 — Project Charter

## 1. Mission
Build a private intelligence operating system that helps HOLBERY identify high-value problems, understand existing alternatives, select a focused offer, and learn from measurable market outcomes.

## 2. The problem
Idea generation is cheap; reliable evidence and execution discipline are scarce. Research becomes fragmented across tabs, notes, platforms, spreadsheets, and separate projects. AI summaries can amplify weak signals, duplicate observations, and present assumptions as facts. HIO is intended to create a traceable path from source evidence to decision and from decision to measured outcome.

## 3. Intended users
- **Owner / final approver:** reviews high-impact decisions, budget, channel activation, and launch gates.
- **Research operator:** manages sources, collection runs, evidence quality, and clusters.
- **Opportunity analyst / agent:** proposes classifications, clusters, scores, and next research actions.
- **Builder:** implements connectors, data services, dashboard, and controlled experiments.

One person may perform all roles in the initial version.

## 4. Goals
- Centralize attributable evidence in a private system.
- Reduce duplicate research and preserve source lineage.
- Prioritize problems using recurrence, urgency, payer clarity, existing spending, reachable distribution, feasibility, and counter-evidence.
- Distinguish hypotheses, observed signals, commercial intent, market-test behavior, transactions, and repeatability.
- Keep collection and inference costs observable and bounded.
- Make every consequential decision auditable.
- Build reusable infrastructure that compounds across HOLBERY's SYSTEMS / PRODUCTS / VENTURES / COMMERCE pillars.

## 5. Non-goals for the initial version
- A public-facing SaaS product.
- A general-purpose crawler for the entire internet.
- Circumvention of platform access controls or private-group boundaries.
- Automated posting, mass DMs, or reputation manipulation.
- Autonomous purchases, ad spend, or legally consequential decisions.
- Premature microservices, multiple databases, or multiple repositories for each module.
- Treating engagement counts or LLM confidence as revenue proof.

## 6. Definition of success
Early success is operational: source records are traceable, duplicates are controlled, evidence can be reviewed, and decisions can be reproduced. Commercial success requires separate real-world outcomes: qualified intent, paid transactions, successful delivery, acceptable unit economics, and repeatability. Code completion alone is not business validation.

## 7. Authority and governance
HIO may recommend and prepare. Human approval is required for enabling a source with material policy/privacy implications, spending money, public posting, outreach, launching an offer, changing legal claims, or accessing sensitive data.

## 8. Initial delivery
Deliver documentation first; audit the repository and available environment; then build the smallest complete vertical slice from one or two approved sources through evidence storage, review, opportunity evaluation, and a decision record.


## Canonical productization baseline — 2026-10-12

HIO's intended direction is an AI Business Command Workspace: evidence → opportunity → approved execution → measurable outcomes. This is a target product direction, not proof that every capability is shipped or commercially ready. Keep fixture/demo evidence distinct from live data, and use [the canonical productization and production-parity contract](50-ai-workspace-productization-and-production-parity.md) for current capability labels, security boundaries, release verification, and SaaS launch gates. Current production login remains blocked until the Owner configures distinct `OPERATOR_SECRET` and `SESSION_SECRET` values securely and the deployed authenticated workflow is verified. Benchmark current Genspark AI Workspace and G2 product evidence before turning assumptions into requirements.

## Commercial SaaS direction update — 2026-10-16

HIO's current product target is customer-facing commercial SaaS: FIND → BUILD → VALIDATE → LAUNCH. This supersedes founder-only positioning as the product destination, but does not supersede runtime evidence. Canonical product scope: [docs/64-public-saas-product-direction.md](64-public-saas-product-direction.md).
