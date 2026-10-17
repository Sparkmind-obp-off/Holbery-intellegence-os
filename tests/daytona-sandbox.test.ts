import { describe, expect, it, vi } from "vitest";
import {
  DaytonaSandboxAdapter,
  validateSandboxPath,
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
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
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
  });
});
