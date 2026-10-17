// Live Daytona smoke test (Layer B). Uses the production adapter, a harmless
// deterministic command, a strict timeout, and always deletes the sandbox.
// Requires DAYTONA_API_KEY in the environment; never prints it.
import { DaytonaSandboxAdapter } from "../src/daytona-sandbox.ts";

const key = process.env.DAYTONA_API_KEY;
if (!key || key.length < 16) {
  console.log(
    "BLOCKED: DAYTONA_API_KEY not set in this environment. No sandbox created.",
  );
  process.exit(2);
}
const adapter = new DaytonaSandboxAdapter({
  apiKey: key,
  startTimeoutSeconds: 120,
});
const t0 = Date.now();
const ms = () => Date.now() - t0 + "ms";
let id = null;
let ok = false;
try {
  id = await adapter.create();
  console.log("sandbox created + started", { id, at: ms() });
  const r = await adapter.execute(
    id,
    "echo HIO_DAYTONA_OK && node --version",
    30,
    ".",
  );
  console.log("command", {
    exitCode: r.exitCode,
    output: r.output.trim(),
    at: ms(),
  });
  ok = r.exitCode === 0 && r.output.includes("HIO_DAYTONA_OK");
} catch (e) {
  console.log(
    "FAILED",
    String(e instanceof Error ? e.message : e)
      .split(key)
      .join("[redacted]"),
  );
} finally {
  if (id) {
    try {
      await adapter.dispose(id);
      console.log("sandbox deleted", { id, at: ms() });
    } catch (e) {
      ok = false;
      console.log(
        "CLEANUP FAILED — delete sandbox manually in Daytona dashboard",
        { id, error: String(e.message).split(key).join("[redacted]") },
      );
    }
  }
}
console.log(ok ? "PASS live Daytona smoke" : "FAIL live Daytona smoke");
process.exit(ok ? 0 : 1);
