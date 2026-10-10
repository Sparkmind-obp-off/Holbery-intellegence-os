# MCP Integration Architecture

## Role of MCP
Model Context Protocol can provide a standard interface to tools and resources exposed by an MCP server. In HOLBERY, MCP is one integration mechanism—not the entire plugin architecture and not a reason to bypass the core policy layer.

## Proposed boundary
HOLBERY Core → MCP Client Adapter → approved MCP server → external service or local tool.

The platform registry records server identity, transport, publisher/owner, version where available, available tools/resources, requested scopes, secret references, allowed destinations, risk classification and review status. Tool schemas are inspected and validated before activation.

## Installation and approval
1. Add a server configuration from a known, reviewed source.
2. Inspect publisher, transport, package provenance and requested tools.
3. Review each tool's purpose, inputs, data access and possible side effects.
4. Configure credentials in secret storage, never in a manifest or source file.
5. Test using fixtures or isolated non-production data.
6. Approve only required tools/scopes.
7. Enable with rate, timeout, output-size and cost limits.
8. Audit calls and periodically re-review server changes.

## Trust and prompt-injection controls
- Tool descriptions and returned content are untrusted data.
- A tool response cannot authorize another tool, raise a budget or override policy.
- Use explicit allowlists rather than exposing every tool automatically.
- Read-only capabilities are preferred for early releases.
- External side effects require separate authorization at the platform boundary.
- Block or tightly control arbitrary filesystem, shell, browser-session and network access.
- Prevent server-side request forgery and access to internal metadata services.
- Redact credentials and sensitive arguments from logs.
- Handle timeouts, disconnects, malformed output, pagination and cancellation explicitly.

## Local vs remote servers
Local stdio servers may require process execution and filesystem access; do not run untrusted packages inside the core service. Remote servers may introduce identity, transport and data-transfer risks. Choose transport based on the reviewed deployment and supported client/server implementation, not convenience alone.

## MCP is not a trust guarantee
A server being MCP-compatible does not prove it is safe, authorized, maintained, or appropriate for commercial use. Review its code/source, permissions, terms, data handling and publisher before enabling.

## Initial scope
Start with an adapter that can register a reviewed MCP server, enumerate tools, map selected read-only tools into typed calls and log invocation metadata. Defer automatic discovery, unrestricted dynamic tool execution and marketplace installation.