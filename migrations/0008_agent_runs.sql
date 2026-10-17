CREATE TABLE IF NOT EXISTS agent_runs (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  objective TEXT NOT NULL CHECK(length(objective) BETWEEN 3 AND 1000),
  title TEXT NOT NULL CHECK(length(title) BETWEEN 1 AND 120),
  summary TEXT NOT NULL CHECK(length(summary) BETWEEN 1 AND 2000),
  status TEXT NOT NULL CHECK(status IN ('planned','cancelled')),
  plan_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_agent_runs_owner_updated ON agent_runs(owner_id, updated_at DESC);
CREATE TABLE IF NOT EXISTS agent_steps (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL REFERENCES agent_runs(id) ON DELETE CASCADE,
  sequence INTEGER NOT NULL CHECK(sequence BETWEEN 1 AND 8),
  title TEXT NOT NULL CHECK(length(title) BETWEEN 1 AND 120),
  description TEXT NOT NULL CHECK(length(description) BETWEEN 1 AND 1000),
  tool TEXT NOT NULL CHECK(tool IN ('research.search','workspace.analyze','artifact.draft','quality.check')),
  risk TEXT NOT NULL CHECK(risk IN ('read_only','draft_only')),
  status TEXT NOT NULL CHECK(status IN ('planned','running','blocked','completed','failed','skipped')),
  result_json TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL,
  UNIQUE(run_id, sequence)
);
CREATE INDEX IF NOT EXISTS idx_agent_steps_run_sequence ON agent_steps(run_id, sequence);
CREATE TABLE IF NOT EXISTS agent_run_events (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL REFERENCES agent_runs(id) ON DELETE CASCADE,
  actor_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  details_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_agent_run_events_run_created ON agent_run_events(run_id, created_at);
