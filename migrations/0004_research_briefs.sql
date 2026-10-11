-- Additive planning-only storage. No source ingestion, grants or market score.
CREATE TABLE research_briefs (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL CHECK(length(question) BETWEEN 3 AND 500),
  segment TEXT NOT NULL CHECK(length(segment) BETWEEN 3 AND 120),
  geography TEXT NOT NULL CHECK(length(geography) BETWEEN 3 AND 120),
  problem TEXT NOT NULL CHECK(length(problem) BETWEEN 3 AND 500),
  payer_hypothesis TEXT NOT NULL CHECK(length(payer_hypothesis) BETWEEN 3 AND 300),
  connector TEXT NOT NULL CHECK(connector IN ('manual','apify','custom-api')),
  plan_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  created_by TEXT NOT NULL
);
CREATE INDEX research_briefs_created ON research_briefs(created_at);
