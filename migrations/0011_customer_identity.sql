-- Phase 1: customer identity and tenant isolation (additive only).
-- Clerk authenticates; these tables are HIO's authorization source of truth.
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  clerk_user_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL CHECK(length(email) BETWEEN 3 AND 320),
  state TEXT NOT NULL DEFAULT 'active' CHECK(state IN ('active','disabled')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE workspaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL CHECK(length(name) BETWEEN 1 AND 80),
  created_by_user_id TEXT NOT NULL REFERENCES users(id),
  -- One personal workspace per user, enforced by the database (idempotent provisioning).
  personal_owner_user_id TEXT UNIQUE REFERENCES users(id),
  state TEXT NOT NULL DEFAULT 'active' CHECK(state IN ('active','archived')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE workspace_memberships (
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  role TEXT NOT NULL CHECK(role IN ('owner','member','viewer')),
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','inactive')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY(workspace_id, user_id)
);
CREATE INDEX workspace_memberships_user ON workspace_memberships(user_id, status);
-- Invite-only beta: operator-controlled, checked before any provisioning.
CREATE TABLE customer_invites (
  email TEXT PRIMARY KEY CHECK(length(email) BETWEEN 3 AND 320),
  invited_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  accepted_user_id TEXT REFERENCES users(id),
  accepted_at TEXT,
  revoked_at TEXT
);
-- First customer-owned resource: a saved research brief (no research runs in Phase 1).
CREATE TABLE customer_briefs (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  created_by_user_id TEXT NOT NULL REFERENCES users(id),
  question TEXT NOT NULL CHECK(length(question) BETWEEN 3 AND 500),
  segment TEXT NOT NULL CHECK(length(segment) BETWEEN 3 AND 120),
  geography TEXT NOT NULL CHECK(length(geography) BETWEEN 2 AND 120),
  problem TEXT NOT NULL CHECK(length(problem) BETWEEN 3 AND 500),
  constraints TEXT CHECK(constraints IS NULL OR length(constraints) <= 500),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX customer_briefs_workspace ON customer_briefs(workspace_id, created_at);
