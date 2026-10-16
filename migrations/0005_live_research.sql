-- Live research storage. Mirrors the schema already applied to hio-production
-- on 2026-10-12 (recovered from the remote database; original file was not in git).
CREATE TABLE research_jobs (
  id TEXT PRIMARY KEY,
  owner TEXT NOT NULL,
  idempotency_key TEXT NOT NULL UNIQUE,
  input_hash TEXT NOT NULL,
  input_json TEXT NOT NULL,
  source_provider TEXT NOT NULL CHECK(source_provider IN ('tavily','firecrawl','apify')),
  state TEXT NOT NULL CHECK(state IN ('queued','acquiring','acquired','synthesizing','complete','empty','blocked','failed','cancelled')),
  source_attempts INTEGER NOT NULL DEFAULT 0,
  model_attempts INTEGER NOT NULL DEFAULT 0,
  lease_until INTEGER NOT NULL DEFAULT 0,
  lease_token TEXT,
  error_code TEXT,
  dossier_json TEXT,
  score_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  approved_at TEXT NOT NULL
);
CREATE INDEX research_jobs_owner_created ON research_jobs(owner,created_at);
CREATE TABLE research_observations (
  id TEXT PRIMARY KEY,
  owner TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  source_url TEXT NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  classification TEXT NOT NULL CHECK(classification='public-secondary-observation'),
  UNIQUE(owner,content_hash)
);
CREATE TABLE research_provenance (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL REFERENCES research_jobs(id),
  observation_id TEXT NOT NULL REFERENCES research_observations(id),
  provider TEXT NOT NULL,
  source_identifier TEXT NOT NULL,
  retrieved_at TEXT NOT NULL,
  published_at TEXT,
  publication_basis TEXT NOT NULL,
  content_type TEXT NOT NULL,
  acquisition_method TEXT NOT NULL,
  UNIQUE(job_id,observation_id,source_identifier)
);
CREATE INDEX research_provenance_job ON research_provenance(job_id);
CREATE TABLE research_receipts (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL REFERENCES research_jobs(id),
  provider TEXT NOT NULL,
  operation TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('reserved','succeeded','failed','uncertain')),
  request_units INTEGER NOT NULL,
  measured_usage_json TEXT,
  cost_minor INTEGER,
  currency TEXT,
  error_code TEXT,
  created_at TEXT NOT NULL,
  completed_at TEXT
);
CREATE TABLE provider_daily_usage (
  day TEXT NOT NULL,
  provider TEXT NOT NULL,
  request_units INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY(day,provider)
);
