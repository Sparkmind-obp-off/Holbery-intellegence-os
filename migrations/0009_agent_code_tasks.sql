CREATE TABLE IF NOT EXISTS agent_code_tasks (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  objective TEXT NOT NULL CHECK(length(objective) BETWEEN 3 AND 2000),
  status TEXT NOT NULL CHECK(status IN ('draft','approved','submitted','blocked','failed')),
  base_ref TEXT NOT NULL DEFAULT 'main',
  branch_name TEXT,
  title TEXT NOT NULL CHECK(length(title) BETWEEN 1 AND 120),
  summary TEXT NOT NULL CHECK(length(summary) BETWEEN 1 AND 2000),
  files_json TEXT NOT NULL,
  checks_json TEXT NOT NULL,
  pr_url TEXT,
  error_code TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  submitted_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_agent_code_tasks_owner_updated ON agent_code_tasks(owner_id, updated_at DESC);
CREATE TABLE IF NOT EXISTS agent_code_events (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES agent_code_tasks(id) ON DELETE CASCADE,
  actor_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  details_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_agent_code_events_task_created ON agent_code_events(task_id, created_at);
