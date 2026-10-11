CREATE TABLE secret_rotations (
 secret_name TEXT NOT NULL CHECK(secret_name IN ('OPERATOR_SECRET','SESSION_SECRET')),
 environment TEXT NOT NULL CHECK(environment IN ('local','preview','production')),
 rotated_at TEXT NOT NULL,
 recorded_at TEXT NOT NULL,
 recorded_by TEXT NOT NULL,
 PRIMARY KEY(secret_name,environment)
);
