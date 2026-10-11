import { readFileSync, existsSync, readdirSync, lstatSync } from "node:fs";
import { spawnSync } from "node:child_process";
const tracked = spawnSync(
  "git",
  ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
  { encoding: "utf8" },
);
if (tracked.status !== 0) process.exit(1);
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
  process.env.HIO_SCAN_TEST_SECRET,
].filter((v) => v && v.length >= 24);
const tokenPattern =
  /(?:ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{50,}|sk-proj-[A-Za-z0-9_-]{30,}|cfut_[A-Za-z0-9_-]{30,}|cfat_[A-Za-z0-9_-]{30,})/;
function filesAt(path) {
  if (!existsSync(path)) return [];
  const s = lstatSync(path);
  if (s.isSymbolicLink()) return [];
  return s.isDirectory()
    ? readdirSync(path).flatMap((f) => filesAt(path + "/" + f))
    : [path];
}
const files = new Set([
  ...tracked.stdout.split("\0").filter(Boolean),
  ...filesAt("dist"),
  ...process.argv.slice(2).flatMap(filesAt),
]);
let unsafe = false;
for (const file of files) {
  if (!existsSync(file) || lstatSync(file).isDirectory()) continue;
  const content = readFileSync(file).toString("utf8");
  if (secrets.some((s) => content.includes(s)) || tokenPattern.test(content)) {
    console.error(
      "Credential candidate detected in " + file + " (value redacted).",
    );
    unsafe = true;
  }
}
if (unsafe) process.exit(1);
console.log(
  "PASS: nonignored source and build output" +
    (process.argv.length > 2 ? " plus supplied log/artifact paths" : "") +
    " contain no configured secret values or recognized token patterns. Heuristic scan only.",
);
