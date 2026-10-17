import { describe, expect, it, vi } from "vitest";
import {
  DaytonaSandboxAdapter,
  validateSandboxPath,
  didSandboxRunPass,
} from "../src/daytona-sandbox";

describe("Daytona sandbox adapter", () => {
  it("allows ordinary source and test files", () => {
    expect(validateSandboxPath("src/agent.ts")).toBe(true);
    expect(validateSandboxPath("tests/agent.test.ts")).toBe(true);
  });

  it("rejects traversal, secrets, and dependency configuration paths", () => {
    expect(validateSandboxPath("src/../../wrangler.toml")).toBe(false);
    expect(validateSandboxPath("src/auth.ts")).toBe(false);
    expect(validateSandboxPath("package-lock.json")).toBe(false);
    expect(validateSandboxPath("src/secrets.ts")).toBe(false);
    expect(validateSandboxPath("src//agent.ts")).toBe(false);
  });

  it("requires a plausible API key at construction", () => {
    expect(() => new DaytonaSandboxAdapter({ apiKey: "short" })).toThrow(
      "daytona_api_key_missing",
    );
  });

  it("creates a sandbox with the official Daytona API and bearer key", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        new Response(JSON.stringify({ id: "sandbox-123" }), { status: 201 }),
      );
    const adapter = new DaytonaSandboxAdapter({
      apiKey: "daytona-test-api-key-123",
      fetcher,
    });

    await expect(adapter.create()).resolves.toBe("sandbox-123");
    expect(fetcher).toHaveBeenCalledWith(
      "https://app.daytona.io/api/sandbox",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer daytona-test-api-key-123",
        }),
      }),
    );
  });

  it("passes when a failed check is repaired and the final rerun passes", () => {
    const results = [
      { name: "install", exitCode: 0 },
      { name: "typecheck", exitCode: 2 },
      { name: "repair_attempt", exitCode: 0 },
      { name: "typecheck", exitCode: 0 },
      { name: "lint", exitCode: 0 },
      { name: "format", exitCode: 0 },
      { name: "tests", exitCode: 0 },
      { name: "security", exitCode: 0 },
      { name: "build", exitCode: 0 },
    ];
    expect(didSandboxRunPass(results, null)).toBe(true);
  });

  it("does not pass if the latest check attempt failed or a step is missing", () => {
    expect(
      didSandboxRunPass(
        [
          { name: "install", exitCode: 0 },
          { name: "typecheck", exitCode: 0 },
          { name: "lint", exitCode: 0 },
          { name: "format", exitCode: 0 },
          { name: "tests", exitCode: 0 },
          { name: "security", exitCode: 0 },
          { name: "build", exitCode: 1 },
        ],
        null,
      ),
    ).toBe(false);
    expect(didSandboxRunPass([], "sandbox_failed")).toBe(false);
  });

  it("returns the provider exit code and output", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ exitCode: 7, result: "test failed" }), {
        status: 200,
      }),
    );
    const adapter = new DaytonaSandboxAdapter({
      apiKey: "daytona-test-api-key-123",
      fetcher,
    });

    await expect(adapter.execute("sandbox-123", "npm test")).resolves.toEqual({
      exitCode: 7,
      output: "test failed",
    });
    // Toolbox calls must carry the API key (toolbox OpenAPI: Bearer).
    expect(fetcher).toHaveBeenCalledWith(
      "https://proxy.app.daytona.io/toolbox/sandbox-123/process/execute",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer daytona-test-api-key-123",
        }),
      }),
    );
  });
});
