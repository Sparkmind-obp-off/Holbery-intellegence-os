# Integrations & Connector Contract

## Connector contract
Each adapter must expose equivalent behaviors for configuration validation, health check, cost estimate, bounded collection, normalization, policy classification and cancellation where supported. Exact function names may evolve; these boundaries must remain explicit.

## Connector manifest
Record provider/source family; access mode; authentication type referencing secret storage only; terms/permission review; allowed fields; pagination/cursor strategy; quotas, timeout and retry rules; expected cost and hard caps; retention/deletion obligations; attribution requirements; known limitations; health checks and fixture tests.

## Provider priority
1. Official API or supported export.
2. Licensed/approved third-party API or actor after reviewing terms, fields, costs and commercial use.
3. Public web access where permitted and technically stable.
4. No private-group scraping, unauthorized session use, access-control circumvention or collection violating source rules.

An actor being available in a marketplace does not prove its use is permitted.

## Adapter behavior
Respect rate limits and Retry-After; bound pagination and run budgets; checkpoint cursors only after persistence; treat deleted/private/restricted content as unavailable; avoid endless retries on policy blocks; distinguish empty results, permission failures, quota exhaustion, partial results and outages; redact tokens and sensitive query parameters; emit latency, duplicate, error and cost metrics.

## Integration classes
Source connectors; model providers; storage/search providers; experiment channels; analytics/export. Model APIs sit behind a provider-neutral interface. Record provider/model version where available, prompt/template version, schema version, usage estimate and result status for consequential inference.

## Acceptance
Connectors can be disabled independently, fixtures reproduce contract tests, partial failures cannot erase prior data, and no integration bypasses policy, cost or audit controls.