import { z } from "zod";

const text = (max: number) => z.string().trim().min(3).max(max);
export const briefInput = z
  .object({
    question: text(500),
    segment: text(120),
    geography: text(120),
    problem: text(500),
    payerHypothesis: text(300),
    connector: z.enum(["manual", "apify", "custom-api"]),
  })
  .strict();
export type Brief = z.infer<typeof briefInput>;

// Only drafts are generated. No inference, fetch, source permission or action grant.
export function researchPlan(brief: Brief) {
  const terms = [brief.segment, brief.geography, brief.problem].map((v) =>
    v
      .replace(/["\r\n]/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
  const base = terms.map((v) => `"${v}"`).join(" ");
  return {
    version: "1.0",
    classification: "unvalidated-research-plan",
    generator: "deterministic-template-not-ai",
    evidenceCount: 0,
    demandLevel: "D0-hypothesis",
    recommendation: "research-only",
    score: null,
    budgetMinor: 0,
    executionEnabled: false,
    discovery: {
      queries: [
        `${base} pain workaround`,
        `${base} pricing budget purchase`,
        `${base} alternatives satisfied no need`,
      ],
      sourceReview: [
        "Review source terms and collection permission",
        "Record original URL, capture time, method and independent origin",
        "Minimize personal data; specify retention and deletion",
      ],
    },
    demand: {
      questions: [
        "Does this pain recur across independent buyers, not reposts?",
        "What is the current workaround and measurable cost?",
        "Is urgency evidenced by behavior or only discussion?",
        "Who controls budget and has expressed commercial intent?",
      ],
      counterEvidence: [
        "Existing alternatives solve the pain cheaply",
        "Interest does not translate into budget or purchase",
        "Samples reflect one community, geography or duplicated source",
      ],
      unknowns: [
        "frequency",
        "urgency",
        "independent origins",
        "willingness to pay",
        "sample coverage",
      ],
    },
    opportunity: {
      payerHypothesis: brief.payerHypothesis,
      questions: [
        "Can the proposed payer be reached lawfully?",
        "What alternatives, switching costs and distribution constraints exist?",
        "Can delivery, unit economics and regulatory constraints support a small test?",
      ],
      unknowns: [
        "verified payer",
        "price",
        "acquisition cost",
        "delivery cost",
        "competition",
        "compliance",
      ],
    },
    decision: {
      allowedNow: ["research", "hold", "reject hypothesis"],
      blockedNow: [
        "market-entry",
        "automatic outreach",
        "spending",
        "claim validated demand",
      ],
      testGate: [
        "Independent real evidence with counter-evidence and coverage limits",
        "Named human reviewer, rationale, expiry and stop criteria",
        "Separately approved lawful channel and bounded budget",
      ],
    },
    connector: connectorBlueprint(brief.connector),
  };
}
export function connectorBlueprint(kind: Brief["connector"]) {
  const common = {
    status: "review-required-not-connected",
    enabled: false,
    grants: [],
    execution: "none",
    requiredReview: [
      "Source authorization",
      "Exact tools and output schema",
      "Timeout, bytes, records and cost caps",
      "Server-only secrets; no token passthrough",
      "Audit, revocation and retention",
    ],
  };
  if (kind === "apify")
    return {
      ...common,
      kind,
      transport: "remote HTTPS Streamable HTTP (planned)",
      documentation: "https://docs.apify.com/integrations/mcp",
      candidateTools: [
        "search-actors",
        "fetch-actor-details",
        "search-apify-docs",
        "fetch-apify-docs",
      ],
      warning:
        "Discovery/docs tools are not market evidence. Actor execution/storage require authorization and may cost money; never enable default tool bundles or agentic payments.",
    };
  if (kind === "custom-api")
    return {
      ...common,
      kind,
      transport: "reviewed HTTPS adapter (planned)",
      candidateTools: [],
      warning:
        "An API/OpenAPI file is a contract, not executable permission. Review operation IDs, HTTPS origins, GET-only reads, input/output schemas, credential mapping and license before coding. Never execute uploaded code or fetch arbitrary endpoints.",
    };
  return {
    ...common,
    kind,
    transport: "human authorized observation (planned)",
    candidateTools: [],
    warning:
      "Manual planning does not ingest evidence. No live source connector is active.",
  };
}
