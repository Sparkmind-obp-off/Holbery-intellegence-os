CREATE TABLE IF NOT EXISTS agent_code_execution_runs (
  task_id TEXT PRIMARY KEY REFERENCES agent_code_tasks(id) ON DELETE CASCADE,
  run_id TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('running','passed','failed')),
  current_step TEXT NOT NULL,
  started_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  finished_at TEXT,
  error_code TEXT,
  evidence_json TEXT
);
CREATE INDEX IF NOT EXISTS idx_agent_code_execution_runs_owner_updated
  ON agent_code_execution_runs(owner_id, updated_at DESC);
