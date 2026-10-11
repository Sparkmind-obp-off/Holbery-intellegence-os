# Plugin Trust, Permissions & Lifecycle Security

## Threat model
A plugin may be buggy, compromised, malicious, abandoned or simply misconfigured. It may exfiltrate data, exceed costs, return misleading records, abuse credentials, invoke dangerous tools or break compatibility. Treat third-party and custom plugins as untrusted until reviewed—and keep runtime controls even after review.

## Least-privilege permissions
Model permissions by capability and resource, not one broad “connected” flag. Examples: read approved source records, start bounded collection, write normalized evidence, read a specific workspace, export a reviewed dossier, or execute an explicitly approved action. Separate read from write and plan from execute.

## Secrets
Store credentials in the platform secret manager or deployment secret store. Plugins receive short-lived scoped access where feasible, not a dump of all environment variables. Redact secrets from errors, logs, traces, output and manifests. Rotate and revoke on uninstall or incident.

## Runtime containment
Prefer declarative adapters and isolated execution. Enforce time, memory, concurrency, output size, request count, egress allowlists, cost caps and cancellation. Do not load arbitrary third-party code directly into the core process. If sandboxing is not available, restrict first release to reviewed first-party adapters.

## Supply chain
Pin package version and digest; record publisher and source; scan dependencies; generate a software bill of materials when practical; sign release artifacts when the distribution system supports it; review dependency changes; preserve reproducible builds where feasible.

## Lifecycle
Draft → validated → reviewed → installed-disabled → configured → test-approved → enabled → suspended/degraded → disabled → removed. Approval can be revoked at any stage. Updating a plugin rechecks manifest, permissions, digest, tests and compatibility.

## Emergency controls
Per-plugin kill switch, per-source kill switch, global external-action kill switch, credential revocation, run cancellation and ability to quarantine outputs produced by a suspect version. Keep prior evidence provenance so affected results can be re-evaluated.

## Acceptance
A plugin cannot access an ungranted workspace, exceed limits silently, enable itself, call undeclared capabilities or bypass human approval. Uninstall and revocation prevent future access; incident handling identifies runs and records affected by the plugin.

## Product direction synchronization (2026-10-12)

HIO's target is an evidence-to-execution business workspace, not a generic chatbot. This target does not imply shipped parity. Use docs/50 for capability states and release truth, docs/51 for Genspark/G2 benchmark, docs/52 for target architecture, docs/53 for production/commercial gates, and docs/54 for market validation. Keep fixtures distinct from live data. Production login remains blocked pending secure Owner configuration of distinct OPERATOR_SECRET and SESSION_SECRET values and verified authenticated production tests.
