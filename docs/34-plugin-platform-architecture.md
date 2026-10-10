# Plugin Platform Architecture

**Status:** target architecture; not a claim that a plugin runtime already exists.

## Vision
HOLBERY Intelligence OS is an evidence and decision core extended through independently managed capabilities. Plugins can discover permitted sources, normalize records, enrich evidence, invoke analysis, export approved results, or expose external tools through adapters. The core owns identity, permissions, policy, durable state, audit, cost limits and decision gates.

## Architectural boundary
- **Core:** identity/access, policy engine, plugin registry, execution orchestration, job lifecycle, canonical data contracts, evidence store, audit, quotas, review and decisions.
- **Plugin adapter:** provider-specific API/tool interaction, field mapping, pagination, retry behavior and provider-specific errors.
- **Runtime:** controlled execution environment, timeouts, resource limits, secret references, network egress policy and cancellation.
- **Admin UX:** install/configure/authorize/enable/disable/test/update/uninstall, review requested permissions, inspect health and usage.
- **SDK/CLI:** scaffolding, schema validation, local fixtures, test harness, package metadata and compatibility checks.

## Plugin capability classes
1. Source connector — searches or imports permitted external records.
2. Transform/enrichment — normalizes, deduplicates or enriches records.
3. Intelligence — proposes classifications, clusters or summaries with provenance.
4. Action — performs an explicitly authorized operation, such as export or notification.
5. MCP adapter — maps selected MCP tools/resources/prompts into platform capabilities under policy.
6. Storage/transport adapter — supports an approved backend or event destination.

Capabilities are declared in a manifest; installation does not automatically grant them.

## Execution flow
Discover package → inspect publisher/version/permissions → install disabled → validate manifest and compatibility → configure secret references → approve source policy and scopes → test against fixtures or sandbox → enable → create bounded run → enforce policy/budget → execute → validate output → persist normalized records and audit → review results → disable/revoke when needed.

## Trust tiers
- **Built-in/first-party:** reviewed and versioned with the platform.
- **Verified third-party:** publisher identity and package provenance checked; permissions and behavior reviewed.
- **Custom/private:** authored for one workspace; still subject to the same contract, runtime restrictions and review.
- **Unreviewed:** may be inspected in a quarantined environment but cannot access secrets, production data or external-action capabilities.

A label is not a substitute for technical enforcement.

## Non-goals for first release
No unrestricted arbitrary code execution in the core process, no automatic installation from a URL, no implicit access to every connected account, and no public plugin marketplace until package signing, review, abuse response, compatibility and support are ready.

## First milestone
Support built-in adapters behind one common interface, a manifest schema, a registry, a fixture-based developer harness and an admin list of enabled/disabled capabilities. Defer third-party arbitrary code execution.