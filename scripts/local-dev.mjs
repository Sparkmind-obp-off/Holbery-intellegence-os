import { existsSync, copyFileSync, chmodSync, cpSync } from "node:fs";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
const root = process.cwd();
if (!existsSync(".dev.vars")) {
  console.error("Run node scripts/init-local.mjs first.");
  process.exit(1);
}
cpSync("dist", "local/dist", { recursive: true });
copyFileSync(".dev.vars", "local/.dev.vars");
chmodSync("local/.dev.vars", 0o600);
// Actual child cwd matters: Pages rereads configuration after global argument handling.
const child = spawn(
  process.execPath,
  [
    resolve(root, "node_modules/wrangler/bin/wrangler.js"),
    "pages",
    "dev",
    "dist",
    "--d1",
    "DB=00000000-0000-0000-0000-000000000000",
    "--binding",
    "HIO_ENVIRONMENT=local",
    "--ip",
    "0.0.0.0",
    "--port",
    "3000",
    "--persist-to",
    resolve(root, ".wrangler/state"),
  ],
  { cwd: resolve(root, "local"), stdio: "inherit" },
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => child.kill(signal));
child.on("exit", (code) => process.exit(code ?? 1));
