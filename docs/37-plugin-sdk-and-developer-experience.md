# Plugin SDK & Developer Experience

## Goal
Make a new integration predictable to build, test, review and maintain without requiring changes throughout the core system.

## Developer workflow
1. Generate a plugin skeleton from the official template.
2. Declare manifest, capability, configuration and permission scopes.
3. Implement the typed adapter interface.
4. Add fixture inputs and expected normalized outputs.
5. Run schema, contract, policy, failure and security tests locally.
6. Produce a versioned package with provenance/digest.
7. Submit for review and compatibility checks.
8. Install disabled, configure secret references and run a bounded test.
9. Enable only after approval.
10. Monitor health, cost, failures and compatibility; deprecate safely.

## SDK surfaces
- Manifest types and schema validation.
- Canonical source-record and evidence contracts.
- Structured logging and redaction helpers.
- HTTP client with timeout, retry and rate-limit handling.
- Cancellation and idempotency utilities.
- Secret-reference interface.
- Cost/usage reporting.
- Fixture runner and contract-test suite.
- Local development mode with fake credentials and no external calls by default.
- Compatibility checker and package builder.

## Developer CLI (future)
Potential commands: create, validate, test, package, inspect, install, enable, disable and doctor. Exact commands are not implemented or committed as executable code by this document.

## Testing tiers
Unit tests; manifest/schema tests; contract tests; fixture replay; provider integration tests behind explicit opt-in; security tests; compatibility tests; bounded end-to-end tests. Tests must not require real credentials by default.

## Versioning
Version SDK, manifest schema, platform API and plugin package independently. Maintain a compatibility matrix. Deprecation includes warning window, migration guide, usage visibility and a clear disable/removal date.

## Acceptance
A developer can build a fixture-backed example plugin without modifying core business logic; CI can reject invalid manifests and contracts; secrets are absent from package artifacts; the runtime can disable a faulty plugin independently.