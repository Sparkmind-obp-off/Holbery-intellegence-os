CREATE TABLE IF NOT EXISTS agent_conversations (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  title TEXT NOT NULL CHECK(length(title) BETWEEN 1 AND 72),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_owner_updated ON agent_conversations(owner_id, updated_at DESC);
CREATE TABLE IF NOT EXISTS agent_messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES agent_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK(role IN ('user','assistant')),
  content TEXT NOT NULL CHECK(length(content) BETWEEN 1 AND 12000),
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_agent_messages_conversation_created ON agent_messages(conversation_id, created_at);