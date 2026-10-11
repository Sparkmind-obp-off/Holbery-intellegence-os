import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
// Never creates resources, migrates a remote DB, alters DNS or prints credentials.
const branch = process.env.HIO_TARGET_BRANCH;
if (
  process.env.HIO_RELEASE_APPROVED !== "yes" ||
  !["hio-preview", "main"].includes(branch)
) {
  console.error(
    "BLOCKED — NOT DEPLOYED: owner-approved HIO resources, HIO_RELEASE_APPROVED=yes and HIO_TARGET_BRANCH=hio-preview (or explicitly approved main) required.",
  );
  process.exit(2);
}
if (branch === "main" && process.env.HIO_PRODUCTION_APPROVED !== "yes") {
  console.error(
    "Production deployment requires separate HIO_PRODUCTION_APPROVED=yes after isolated preview verification.",
  );
  process.exit(2);
}
const config = JSON.parse(readFileSync("wrangler.jsonc", "utf8"));
const db = config.d1_databases?.find((d) => d.binding === "DB");
const token = process.env.CLOUDFLARE_API_TOKEN;
if (
  !config.account_id ||
  !config.name ||
  !db?.database_id ||
  db.database_id === "00000000-0000-0000-0000-000000000000" ||
  !token
) {
  console.error(
    "BLOCKED — NOT DEPLOYED: replace local-only config with reviewed account/project/dedicated D1 binding. BYOK token required.",
  );
  process.exit(2);
}
if (
  !/^(hio-|holbery-intelligence-)/.test(config.name) ||
  !/^(hio-|holbery-intelligence-)/.test(db.database_name)
) {
  console.error("Refusing resources outside the dedicated HIO namespace.");
  process.exit(2);
}
if (process.env.HIO_REMOTE_MIGRATIONS_VERIFIED !== "yes") {
  console.error(
    "Apply additive migrations only with owner approval and verify remote schema first. Then HIO_REMOTE_MIGRATIONS_VERIFIED=yes.",
  );
  process.exit(2);
}
async function cloud(path) {
  const response = await fetch("https://api.cloudflare.com/client/v4" + path, {
    headers: { Authorization: "Bearer " + token },
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    console.error(
      "Cloudflare preflight failed; check BYOK permissions. No response body or credentials printed.",
    );
    process.exit(2);
  }
  return data.result;
}
const project = await cloud(
  `/accounts/${encodeURIComponent(config.account_id)}/pages/projects/${encodeURIComponent(config.name)}`,
);
const target = branch === "main" ? "production" : "preview";
const settings = project.deployment_configs?.[target];
if (
  project.production_branch !== "main" ||
  settings?.d1_databases?.DB?.id !== db.database_id ||
  !["OPERATOR_SECRET", "SESSION_SECRET"].every(
    (name) => settings.env_vars?.[name]?.type === "secret_text",
  )
) {
  console.error(
    "Existing project branch, isolated D1 binding or platform-secret names do not match the approved environment.",
  );
  process.exit(2);
}
if (
  branch === "hio-preview" &&
  project.deployment_configs?.production?.d1_databases?.DB?.id ===
    db.database_id
) {
  console.error("Preview must not share the production DB.");
  process.exit(2);
}
const dirty = spawnSync("git", ["status", "--porcelain"], { encoding: "utf8" });
if (dirty.status !== 0 || dirty.stdout.trim()) {
  console.error("Commit and verify a clean release tree first.");
  process.exit(2);
}
const check = spawnSync("npm", ["run", "check"], { stdio: "inherit" });
if (check.status !== 0) process.exit(check.status || 1);
const sha = spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" });
if (sha.status !== 0) process.exit(2);
const deploy = spawnSync(
  "npx",
  [
    "wrangler",
    "pages",
    "deploy",
    "dist",
    "--project-name",
    config.name,
    "--branch",
    branch,
    "--commit-hash",
    sha.stdout.trim(),
  ],
  { stdio: "inherit" },
);
process.exit(deploy.status ?? 1);
