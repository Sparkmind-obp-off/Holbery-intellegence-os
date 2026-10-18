// Clerk Production cutover for the HIO Pages project. Refuses to run unless
// `clerk:preflight` passes. Reads live keys from files (never printed):
//   HIO_CLERK_LIVE_PK_FILE, HIO_CLERK_LIVE_SK_FILE
// Requires HIO_CLERK_CUTOVER_APPROVED=yes and CLOUDFLARE_API_TOKEN.
// Rollback: re-put the development keys + HIO_ALLOW_DEV_CLERK_IN_PROD=yes
// (see docs/79) — or promote the previous Pages deployment.
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
const PROJECT = "holbery-intelligence-os";
const ACCOUNT = "a167a50f1272635d3c1145aab3cd8f98";
if (process.env.HIO_CLERK_CUTOVER_APPROVED !== "yes") {
  console.error(
    "BLOCKED: set HIO_CLERK_CUTOVER_APPROVED=yes after owner approval.",
  );
  process.exit(2);
}
const pk = readFileSync(process.env.HIO_CLERK_LIVE_PK_FILE, "utf8").trim();
const sk = readFileSync(process.env.HIO_CLERK_LIVE_SK_FILE, "utf8").trim();
const env = {
  ...process.env,
  CLERK_PUBLISHABLE_KEY: pk,
  CLERK_SECRET_KEY: sk,
  CLOUDFLARE_ACCOUNT_ID: ACCOUNT,
};
const pre = spawnSync("node", ["scripts/clerk-preflight.mjs"], {
  env,
  stdio: "inherit",
});
if (pre.status !== 0) {
  console.error("BLOCKED: preflight failed; production left unchanged.");
  process.exit(2);
}
const wr = (args, input) => {
  const r = spawnSync(
    "npx",
    ["wrangler", "pages", ...args, "--project-name", PROJECT],
    { env, input, encoding: "utf8" },
  );
  if (r.status !== 0)
    throw new Error("wrangler " + args.slice(0, 2).join(" ") + " failed");
};
wr(["secret", "put", "CLERK_PUBLISHABLE_KEY"], pk);
wr(["secret", "put", "CLERK_SECRET_KEY"], sk);
// The override is ignored for live keys, but remove it so it cannot linger.
const del = spawnSync(
  "npx",
  [
    "wrangler",
    "pages",
    "secret",
    "delete",
    "HIO_ALLOW_DEV_CLERK_IN_PROD",
    "--project-name",
    PROJECT,
  ],
  { env, input: "y\n", encoding: "utf8" },
);
console.log("secrets updated; dev override removed:", del.status === 0);
console.log(
  "Next: redeploy (scripts/deploy.mjs) and run test:clerk-live against https://hio.holbery.biz.id",
);
