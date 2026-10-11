# ADR 0001 — Fixture-first edge monolith

Date: 2026-10-11. Status: accepted for local implementation; production provisioning gated.

The audited repository is documentation-only, so there is no existing framework to preserve. Choose Hono + strict TypeScript + Zod, Cloudflare Pages and one dedicated D1 database. Plain self-hosted JavaScript/CSS avoids React's unnecessary initial dependency cost; server contracts and policy remain typed. Use bounded synchronous fixture runs (four records maximum), not simulated background jobs. Use D1 batch transactions and unique keys for retries; never claim automatic provider backoff where no remote connector exists.

Single internal workspace and a single named operator role are intentional limitations. A platform-secret operator passphrase establishes an HMAC-signed, expiring, HttpOnly/SameSite cookie; fail closed without configured secret. No secret or permission is stored in browser storage. Add multi-user SSO/RBAC before team use. BYOK application authentication is separate from Genspark Hosted route-admission rules, which are not used here.

Only reviewed first-party fixture and local read-only JSON-RPC MCP-style tool dispatch are implemented. No remote MCP transport, third-party code, arbitrary URLs or model execution. Source text cannot select tools or grant permissions. All observations are visibly synthetic. Manual decisions and recorded outcomes do not launch or spend money.

No existing HIO cloud project or DB was identified. Do not reuse commerce or Bozq databases. `wrangler.jsonc` is LOCAL ONLY, using the all-zero ID. `npm run deploy` refuses local configuration and requires reviewed explicit target config and a release approval environment flag. Creating dedicated preview/production resources, applying production migration, and setting a private operator secret require owner authorization. No CI added; scripts run locally.

Retention: fixture source expires after 30 days. Evidence queries exclude expired records; operator-triggered purge minimizes payload while preserving ID/provenance/hash for decisions and audit. No production data is ingested. Real providers need policy/deletion review before implementation.

Rollback: do not reverse by dropping populated production tables. Roll back application to a compatible deployment, preserve additive schema, or forward-fix; local migration restore is tested separately. No paid integrations or live actions.


## Product direction synchronization (2026-10-12)

HIO's target is an evidence-to-execution business workspace, not a claim of shipped parity. Use docs/50 for canonical product/release rules, docs/51 for Genspark/G2 research, docs/52 for target architecture, docs/53 for production/commercial gates, and docs/54 for validation. Maintain protected project boundaries and do not migrate code/data/secrets without explicit authorization. Production login remains blocked pending secure Owner configuration and verification.
