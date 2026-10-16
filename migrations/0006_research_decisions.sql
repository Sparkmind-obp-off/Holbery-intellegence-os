-- Founder decisions on real research results (additive; append-only).
CREATE TABLE research_decisions (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL REFERENCES research_jobs(id),
  choice TEXT NOT NULL CHECK(choice IN ('setujui','tolak','ubah','nanti')),
  rationale TEXT NOT NULL CHECK(length(rationale) BETWEEN 1 AND 2000),
  owner TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX research_decisions_job ON research_decisions(job_id, created_at);
