PRAGMA foreign_keys = ON;
CREATE TABLE sources (
 id TEXT PRIMARY KEY, name TEXT NOT NULL, connector TEXT NOT NULL CHECK(connector='fixture'),
 enabled INTEGER NOT NULL DEFAULT 0 CHECK(enabled IN (0,1)), permission_basis TEXT NOT NULL,
 retention_days INTEGER NOT NULL CHECK(retention_days BETWEEN 1 AND 30), created_at TEXT NOT NULL,
 reviewed_at TEXT NOT NULL, last_run_at TEXT
);
CREATE TABLE plugins (
 id TEXT PRIMARY KEY, manifest_json TEXT NOT NULL, enabled INTEGER NOT NULL DEFAULT 0 CHECK(enabled IN (0,1)),
 grants_json TEXT NOT NULL DEFAULT '[]', updated_at TEXT NOT NULL
);
CREATE TABLE runs (
 id TEXT PRIMARY KEY, source_id TEXT NOT NULL REFERENCES sources(id), request_key TEXT NOT NULL UNIQUE,
 request_hash TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('succeeded','failed')),
 attempted INTEGER NOT NULL, accepted INTEGER NOT NULL, duplicates INTEGER NOT NULL,
 error_code TEXT, cost_minor INTEGER NOT NULL DEFAULT 0, started_at TEXT NOT NULL, finished_at TEXT NOT NULL,
 plugin_version TEXT NOT NULL, plugin_digest TEXT NOT NULL
);
CREATE INDEX runs_source_time ON runs(source_id, started_at DESC);
CREATE TABLE evidence (
 id TEXT PRIMARY KEY, source_id TEXT NOT NULL REFERENCES sources(id), run_id TEXT NOT NULL REFERENCES runs(id),
 external_id TEXT NOT NULL, reference TEXT NOT NULL, provider TEXT NOT NULL, method TEXT NOT NULL,
 observation TEXT NOT NULL, normalized_text TEXT NOT NULL, fingerprint TEXT NOT NULL UNIQUE,
 relationship TEXT NOT NULL CHECK(relationship IN ('support','counter')), quality_json TEXT NOT NULL,
 synthetic INTEGER NOT NULL DEFAULT 1 CHECK(synthetic=1), captured_at TEXT NOT NULL,
 expires_at TEXT NOT NULL, purged_at TEXT, UNIQUE(source_id,external_id)
);
CREATE INDEX evidence_expiry ON evidence(expires_at);
CREATE TABLE provenance (
 run_id TEXT NOT NULL REFERENCES runs(id), external_id TEXT NOT NULL, evidence_id TEXT NOT NULL REFERENCES evidence(id),
 reference TEXT NOT NULL, captured_at TEXT NOT NULL, duplicate INTEGER NOT NULL, PRIMARY KEY(run_id,external_id)
);
CREATE TABLE clusters (
 id TEXT PRIMARY KEY, title TEXT NOT NULL, problem TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE TABLE memberships (
 cluster_id TEXT NOT NULL REFERENCES clusters(id), evidence_id TEXT NOT NULL REFERENCES evidence(id),
 relationship TEXT NOT NULL CHECK(relationship IN ('support','counter')), PRIMARY KEY(cluster_id,evidence_id)
);
CREATE TABLE opportunities (
 id TEXT PRIMARY KEY, cluster_id TEXT NOT NULL REFERENCES clusters(id) UNIQUE, title TEXT NOT NULL,
 hypothesis TEXT NOT NULL, uncertainty TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE TABLE decisions (
 id TEXT PRIMARY KEY, opportunity_id TEXT NOT NULL REFERENCES opportunities(id),
 choice TEXT NOT NULL CHECK(choice IN ('research','hold','reject','approve_fixture')),
 rationale TEXT NOT NULL, reviewer_notes TEXT NOT NULL, owner TEXT NOT NULL, review_at TEXT NOT NULL,
 snapshot_json TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE INDEX decisions_opportunity_time ON decisions(opportunity_id,created_at DESC);
CREATE TABLE experiments (
 id TEXT PRIMARY KEY, opportunity_id TEXT NOT NULL REFERENCES opportunities(id), decision_id TEXT NOT NULL REFERENCES decisions(id),
 owner TEXT NOT NULL, hypothesis TEXT NOT NULL, success_criteria TEXT NOT NULL, stop_criteria TEXT NOT NULL,
 budget_minor INTEGER NOT NULL CHECK(budget_minor=0), currency TEXT NOT NULL CHECK(currency='IDR'),
 status TEXT NOT NULL DEFAULT 'approved_fixture' CHECK(status IN ('approved_fixture','completed')),
 review_at TEXT NOT NULL, outcome TEXT, learning TEXT, actual_cost_minor INTEGER NOT NULL DEFAULT 0 CHECK(actual_cost_minor=0),
 created_at TEXT NOT NULL, completed_at TEXT
);
CREATE TABLE audit_events (
 id TEXT PRIMARY KEY, actor TEXT NOT NULL, action TEXT NOT NULL, entity_id TEXT NOT NULL,
 request_id TEXT NOT NULL, outcome TEXT NOT NULL, occurred_at TEXT NOT NULL, metadata_json TEXT NOT NULL
);
CREATE INDEX audit_time ON audit_events(occurred_at DESC);
CREATE TABLE rate_limits (
 key TEXT PRIMARY KEY, window_start INTEGER NOT NULL, count INTEGER NOT NULL
);
INSERT INTO sources VALUES ('fixture','Permitted synthetic research fixture','fixture',0,'First-party synthetic test data; no real customers or external access',30,strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now'),NULL);
INSERT INTO clusters VALUES ('workflow-friction','Manual research handoff','Hypothesis: research teams may lose provenance during manual handoff.',strftime('%Y-%m-%dT%H:%M:%fZ','now'));
INSERT INTO opportunities VALUES ('research-workbench','workflow-friction','An evidence-linked research workbench','Unverified: a small team might value traceable research handoffs.','Synthetic fixture only. No independent real-world evidence, payer, pricing, demand or distribution verified.',strftime('%Y-%m-%dT%H:%M:%fZ','now'));
