import { z } from "zod";

export const text = z.string().trim().min(1).max(2000);
export const id = z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/);
export const date = z
  .string()
  .datetime()
  .refine((v) => Date.parse(v) > Date.now(), "Review must be in the future");
export const sourcePatch = z.object({ enabled: z.boolean() }).strict();
export const runInput = z
  .object({
    sourceId: z.literal("fixture"),
    key: id,
    mode: z.enum(["normal", "failure", "rate_limit"]).default("normal"),
    limit: z.number().int().min(1).max(4).default(4),
  })
  .strict();
export const decisionInput = z
  .object({
    opportunityId: z.literal("research-workbench"),
    choice: z.enum(["research", "hold", "reject", "approve_fixture"]),
    rationale: text,
    reviewerNotes: text,
    reviewAt: date,
  })
  .strict();
export const experimentInput = z
  .object({
    opportunityId: z.literal("research-workbench"),
    decisionId: id,
    hypothesis: text,
    successCriteria: text,
    stopCriteria: text,
    budgetMinor: z.literal(0),
    currency: z.literal("IDR"),
    reviewAt: date,
  })
  .strict();
export const outcomeInput = z
  .object({ outcome: text, learning: text, actualCostMinor: z.literal(0) })
  .strict();
export const manifestSchema = z
  .object({
    manifestVersion: z.literal("1"),
    id: z.enum(["hio.fixture", "hio.mcp-fixture"]),
    name: z.string().min(1).max(80),
    version: z.literal("0.1.0"),
    publisher: z.literal("holbery-first-party"),
    license: z.literal("internal-fixture"),
    apiVersion: z.literal("v1"),
    capabilities: z
      .array(z.enum(["source.collect", "mcp.read"]))
      .min(1)
      .max(1),
    permissions: z
      .array(z.enum(["fixture.read", "evidence.read"]))
      .min(1)
      .max(1),
    network: z.array(z.string()).max(0),
    secrets: z.array(z.string()).max(0),
    limits: z
      .object({
        maxRecords: z.literal(4),
        timeoutMs: z.literal(1000),
        concurrency: z.literal(1),
        costMinor: z.literal(0),
      })
      .strict(),
    retentionDays: z.literal(30),
    idempotency: z.literal(true),
    synthetic: z.literal(true),
  })
  .strict();
export type Manifest = z.infer<typeof manifestSchema>;
export const manifests: Manifest[] = [
  {
    manifestVersion: "1",
    id: "hio.fixture",
    name: "Synthetic source connector",
    version: "0.1.0",
    publisher: "holbery-first-party",
    license: "internal-fixture",
    apiVersion: "v1",
    capabilities: ["source.collect"],
    permissions: ["fixture.read"],
    network: [],
    secrets: [],
    limits: { maxRecords: 4, timeoutMs: 1000, concurrency: 1, costMinor: 0 },
    retentionDays: 30,
    idempotency: true,
    synthetic: true,
  },
  {
    manifestVersion: "1",
    id: "hio.mcp-fixture",
    name: "Read-only MCP fixture adapter",
    version: "0.1.0",
    publisher: "holbery-first-party",
    license: "internal-fixture",
    apiVersion: "v1",
    capabilities: ["mcp.read"],
    permissions: ["evidence.read"],
    network: [],
    secrets: [],
    limits: { maxRecords: 4, timeoutMs: 1000, concurrency: 1, costMinor: 0 },
    retentionDays: 30,
    idempotency: true,
    synthetic: true,
  },
];
export const pluginPatch = z
  .object({
    enabled: z.boolean(),
    grants: z.array(z.enum(["fixture.read", "evidence.read"])).max(1),
  })
  .strict();
export const toolInput = z
  .object({
    jsonrpc: z.literal("2.0"),
    id,
    method: z.literal("tools/call"),
    params: z
      .object({
        name: z.literal("evidence.list"),
        arguments: z.object({ limit: z.number().int().min(1).max(4) }).strict(),
      })
      .strict(),
  })
  .strict();
export const toolOutput = z
  .object({
    items: z
      .array(
        z
          .object({
            id,
            observation: z.string().max(2000),
            synthetic: z.literal(true),
          })
          .strict(),
      )
      .max(4),
    classification: z.literal("untrusted-source-data"),
  })
  .strict();

export function normalize(s: string): string {
  return s.normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase();
}
export async function digest(s: string): Promise<string> {
  return [
    ...new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)),
    ),
  ]
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("");
}
export const fixtures = [
  {
    externalId: "fixture-1",
    observation:
      "SYNTHETIC: Our small research team loses source links during manual handoffs.",
    relationship: "support" as const,
  },
  {
    externalId: "fixture-2",
    observation:
      "SYNTHETIC: A weekly research review takes extra time to reconstruct provenance.",
    relationship: "support" as const,
  },
  {
    externalId: "fixture-3",
    observation:
      "SYNTHETIC: A shared spreadsheet already works well; we would not pay for another tool.",
    relationship: "counter" as const,
  },
  {
    externalId: "fixture-1-repost",
    observation:
      "SYNTHETIC: Our small research team loses source links during manual handoffs.",
    relationship: "support" as const,
  },
];
export function score(support: number, counter: number) {
  return {
    version: "fixture-v1",
    classification: "deterministic-interpretation",
    score:
      support + counter
        ? Math.round((support / (support + counter)) * 100)
        : null,
    coverage: "Only synthetic recurrence considered; not a commercial ranking",
    factors: { support, counter },
    unknowns: [
      "real source independence",
      "payer",
      "severity",
      "pricing",
      "economics",
      "distribution",
    ],
    confidence: "not commercially validated",
    rule: "support / (support + counter) × 100; duplicates excluded",
    launchAuthorized: false,
  };
}
