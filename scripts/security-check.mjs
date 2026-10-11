import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
const files = spawnSync(
  "git",
  ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
  { encoding: "utf8" },
);
if (files.status !== 0) process.exit(1);
const local = existsSync(".dev.vars")
  ? readFileSync(".dev.vars", "utf8")
      .split("\n")
      .map((l) => l.slice(l.indexOf("=") + 1))
      .filter((v) => v.length >= 32)
  : [];
const secrets = [
  ...local,
  process.env.CLOUDFLARE_API_TOKEN,
  process.env.GSK_TOKEN,
  process.env.GH_TOKEN,
  process.env.GITHUB_TOKEN,
].filter((v) => v && v.length >= 24);
const tokenPattern =
  /(?:ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{50,}|sk-proj-[A-Za-z0-9_-]{30,}|cfut_[A-Za-z0-9_-]{30,}|cfat_[A-Za-z0-9_-]{30,})/;
let unsafe = false;
for (const file of files.stdout.split("\0").filter(Boolean)) {
  if (!existsSync(file)) continue;
  const content = readFileSync(file, "utf8");
  if (secrets.some((s) => content.includes(s)) || tokenPattern.test(content)) {
    console.error(
      "Credential candidate detected in " + file + " (value redacted).",
    );
    unsafe = true;
  }
}
if (unsafe) process.exit(1);
console.log(
  "PASS: tracked/new nonignored files contain no configured secret values or recognized token patterns. Heuristic scan, not a guarantee.",
);
