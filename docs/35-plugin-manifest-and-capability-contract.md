# Plugin Manifest & Capability Contract

**Status:** conceptual schema. Exact field names should be implemented as a versioned JSON Schema and TypeScript types after the repository audit.

## Manifest purpose
A manifest is a declarative contract that lets the platform identify a plugin, inspect what it can do, check compatibility and request only the permissions it needs. It does not itself authorize access.

## Required concepts
- Unique plugin ID and display name.
- Publisher/owner and package provenance.
- Semantic version and manifest schema version.
- Description, license and source repository/package digest.
- Supported platform/API versions.
- Capability declarations and input/output schema versions.
- Requested permissions/scopes, each with a reason.
- Secret references required (never literal credentials).
- Network destinations/domains where feasible.
- Timeout, concurrency, pagination, per-run and per-period limits.
- Data categories, retention expectations and deletion behavior.
- Idempotency/cancellation support.
- Health-check and test-fixture declarations.
- Configuration schema and operator-facing labels.
- Compatibility, deprecation and migration notes.

## Example (illustrative only)
```json
{
  "manifestVersion": "0.1",
  "id": "com.holbery.example-source",
  "name": "Example Source Connector",
  "version": "0.1.0",
  "publisher": { "type": "workspace", "id": "holbery-internal" },
  "platform": { "api": "v1" },
  "capabilities": [
    {
      "type": "source.search",
      "inputSchema": "search-input/v1",
      "outputSchema": "source-record/v1"
    }
  ],
  "permissions": [
    {
      "scope": "source.records.read",
      "reason": "Read permitted records returned by this connector"
    }
  ],
  "secrets": [
    { "key": "PROVIDER_TOKEN", "storage": "secret-reference" }
  ],
  "limits": {
    "timeoutSeconds": 30,
    "maxRecordsPerRun": 100
  },
  "network": { "allowlist": ["api.example.invalid"] }
}
```

This example is documentation, not a real provider integration. The reserved `.invalid` domain must never be contacted.

## Contract rules
- Reject unknown or unsupported manifest versions unless a compatibility rule explicitly allows them.
- Validate all input and output against schemas.
- Use stable plugin IDs; never key identity only by display name.
- Separate requested permissions from approved grants.
- Store immutable version and package digest for each installation.
- Treat plugin outputs as untrusted; validate provenance and size.
- Never let a plugin increase its own quotas, scopes or trust tier.
- Breaking changes require a new major version or explicit migration.
- Record install, enable, disable, update and uninstall in the audit log.

## Acceptance
A malformed manifest is rejected; excessive permissions are visible; disabled plugins cannot execute; incompatible versions are blocked; plugin output is schema-validated; every run identifies exact plugin version and digest.

## Product direction synchronization (2026-10-12)

HIO's target is an evidence-to-execution business workspace, not a generic chatbot. This target does not imply shipped parity. Use docs/50 for capability states and release truth, docs/51 for Genspark/G2 benchmark, docs/52 for target architecture, docs/53 for production/commercial gates, and docs/54 for market validation. Keep fixtures distinct from live data. Production login remains blocked pending secure Owner configuration of distinct OPERATOR_SECRET and SESSION_SECRET values and verified authenticated production tests.
