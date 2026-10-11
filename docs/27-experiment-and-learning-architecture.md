# Experiment & Learning Architecture

## Purpose
Turn an opportunity hypothesis into a bounded test whose result can change a decision. Planning, approval, execution and measurement are separate states.

## Experiment contract
Record linked opportunity/dossier version; falsifiable hypothesis; target segment and payer; offer and price/value exchange; approved channel and source review; owner and approval time; window and budget cap; primary metric and success threshold; guardrails and stop rule; attribution method and event schema; result and caveats.

## State model
Draft → review → approved → scheduled → running → completed, stopped or failed. A run may be blocked/cancelled. Only authorized humans approve externally visible or cost-incurring tests.

## Events
Possible events: impression, qualified visit, CTA click, inquiry, reply, checkout started, trusted-provider payment confirmed, fulfillment, refund, repeat use and opt-out. Store timestamp, experiment ID, source, lawful attribution identifier and deduplication key.

A click is not a lead; a lead is not a sale; checkout initiation is not payment. Payment state must come from a trusted provider confirmation, never model inference or browser-only events.

## Learning loop
Capture result and data-quality caveats; compare against predeclared hypothesis; record supported/rejected/unknown; update opportunity beliefs with versioned rationale; choose continue/modify/pause/stop; preserve prior decision and evidence snapshot.

Declare thresholds before a test. If volume is too low, label results inconclusive. No unsolicited mass messaging, deceptive offers, hidden tracking or unapproved public actions.

## Acceptance
No experiment starts without approval, budget cap, success/stop criteria and an auditable event plan. Results can be reconstructed from recorded events and source references.

## Product direction synchronization (2026-10-12)

HIO's target is an evidence-to-execution business workspace, not a generic chatbot. This target does not imply shipped parity. Use docs/50 for capability states and release truth, docs/51 for Genspark/G2 benchmark, docs/52 for target architecture, docs/53 for production/commercial gates, and docs/54 for market validation. Keep fixtures distinct from live data. Production login remains blocked pending secure Owner configuration of distinct OPERATOR_SECRET and SESSION_SECRET values and verified authenticated production tests.
