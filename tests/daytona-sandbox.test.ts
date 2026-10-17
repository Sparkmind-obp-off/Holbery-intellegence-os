import { describe, expect, it } from "vitest";
import { DaytonaSandboxAdapter, validateSandboxPath } from "../src/daytona-sandbox";
describe("Daytona sandbox adapter guards", () => {
  it("allows ordinary source and test files", () => { expect(validateSandboxPath("src/agent.ts")).toBe(true); expect(validateSandboxPath("tests/agent.test.ts")).toBe(true); });
  it("rejects traversal, secrets, and dependency configuration paths", () => {
    expect(validateSandboxPath("src/../../wrangler.toml")).toBe(false); expect(validateSandboxPath("src/auth.ts")).toBe(false);
    expect(validateSandboxPath("package-lock.json")).toBe(false); expect(validateSandboxPath("src/secrets.ts")).toBe(false);
  });
  it("requires a plausible API key at construction", () => { expect(() => new DaytonaSandboxAdapter({ apiKey: "short" })).toThrow("daytona_api_key_missing"); });
});
