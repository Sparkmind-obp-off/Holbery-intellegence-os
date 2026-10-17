import { describe, expect, it, vi } from "vitest";
import {
  DaytonaSandboxAdapter,
  validateSandboxPath,
  didSandboxRunPass,
} from "../src/daytona-sandbox";

const KEY = "daytona-test-api-key-123";
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });
const fast = (
  extra: Partial<ConstructorParameters<typeof DaytonaSandboxAdapter>[0]> = {},
) =>
  new DaytonaSandboxAdapter({
    apiKey: KEY,
    pollIntervalMs: 0,
    startTimeoutSeconds: 5,
    sleep: async () => {},
    ...extra,
  });

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

  it("creates a sandbox with the official Daytona API and bearer key, then waits for started", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        json({ id: "sandbox-123", state: "starting" }, 201),
      )
      .mockResolvedValueOnce(
        json({
          id: "sandbox-123",
          state: "started",
          toolboxProxyUrl: "https://proxy.app.daytona.io/toolbox",
        }),
      );
    const adapter = fast({ fetcher });

    await expect(adapter.create()).resolves.toBe("sandbox-123");
    expect(fetcher).toHaveBeenNthCalledWith(
      1,
      "https://app.daytona.io/api/sandbox",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer daytona-test-api-key-123",
        }),
      }),
    );
    expect(fetcher).toHaveBeenNthCalledWith(
      2,
      "https://app.daytona.io/api/sandbox/sandbox-123",
      expect.objectContaining({ method: "GET" }),
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

  // ---- Offline tests (mocked fetch). These never prove live connectivity. ----
  it("uses the per-sandbox toolbox URL reported by Daytona", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        json({
          id: "sb-1",
          state: "started",
          toolboxProxyUrl: "https://proxy.eu.daytona.io/toolbox/",
        }),
      )
      .mockResolvedValueOnce(json({ exitCode: 0, result: "ok" }));
    const adapter = fast({ fetcher });
    await adapter.create();
    await adapter.execute("sb-1", "true");
    expect(fetcher.mock.calls[1]![0]).toBe(
      "https://proxy.eu.daytona.io/toolbox/sb-1/process/execute",
    );
  });

  it("never sends the API key to an untrusted toolbox host", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        json({
          id: "sb-1",
          state: "started",
          toolboxProxyUrl: "https://evil.example/x",
        }),
      )
      .mockResolvedValueOnce(
        json({ url: "http://proxy.app.daytona.io/toolbox" }),
      )
      .mockResolvedValueOnce(json({ exitCode: 0, result: "ok" }));
    const adapter = fast({ fetcher });
    await adapter.create();
    await adapter.execute("sb-1", "true");
    const urls = fetcher.mock.calls.map((c) => String(c[0]));
    expect(urls.some((u) => u.includes("evil.example"))).toBe(false);
    expect(urls[2]).toBe(
      "https://proxy.app.daytona.io/toolbox/sb-1/process/execute",
    );
  });

  it("deletes the sandbox and fails when it enters an error state", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(json({ id: "sb-err", state: "creating" }, 201))
      .mockResolvedValueOnce(
        json({ id: "sb-err", state: "error", errorReason: "no capacity" }),
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    await expect(fast({ fetcher }).create()).rejects.toThrow(
      "daytona_sandbox_error:no capacity",
    );
    expect(fetcher.mock.calls[2]![1]).toMatchObject({ method: "DELETE" });
  });

  it("times out waiting for started and still cleans up", async () => {
    let now = 0;
    vi.spyOn(Date, "now").mockImplementation(() => now);
    const fetcher = vi.fn<typeof fetch>(async (_u, init) => {
      if (init?.method === "DELETE") return new Response(null, { status: 204 });
      now += 3000;
      return json({ id: "sb-slow", state: "starting" }, 201);
    });
    await expect(
      fast({ fetcher, startTimeoutSeconds: 5 }).create(),
    ).rejects.toThrow("daytona_start_timeout");
    expect(fetcher.mock.calls.at(-1)![1]).toMatchObject({ method: "DELETE" });
    vi.restoreAllMocks();
  });

  it("maps invalid credentials to a non-retried auth error", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(json({ message: "Invalid credentials " + KEY }, 401));
    await expect(fast({ fetcher }).create()).rejects.toThrow(
      "daytona_auth_failed:401",
    );
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("does not retry non-idempotent create on a 5xx", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(json({ message: "boom" }, 503));
    await expect(fast({ fetcher }).create()).rejects.toThrow(
      "daytona_http_503",
    );
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("retries idempotent status polling on transient 5xx, bounded", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(json({ id: "sb-r", state: "starting" }, 201))
      .mockResolvedValueOnce(json({ message: "busy" }, 502))
      .mockResolvedValueOnce(
        json({
          id: "sb-r",
          state: "started",
          toolboxProxyUrl: "https://proxy.app.daytona.io/toolbox",
        }),
      );
    await expect(fast({ fetcher }).create()).resolves.toBe("sb-r");
    expect(fetcher).toHaveBeenCalledTimes(3);
  });

  it("redacts the API key from provider error messages and command output", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        json({ exitCode: 0, result: "echo " + KEY + " done" }),
      )
      .mockResolvedValueOnce(json({ message: "bad key " + KEY }, 400));
    const adapter = fast({ fetcher });
    const r = await adapter.execute("sb-1", "env");
    expect(r.output).not.toContain(KEY);
    expect(r.output).toContain("[redacted]");
    const err = await adapter
      .execute("sb-1", "x")
      .catch((e: Error) => e.message);
    expect(String(err)).not.toContain(KEY);
  });

  it("truncates very large command output", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(json({ exitCode: 1, result: "x".repeat(50_000) }));
    const r = await fast({ fetcher }).execute("sb-1", "x");
    expect(r.exitCode).toBe(1);
    expect(r.output.length).toBe(12_000);
  });

  it("maps a request timeout to daytona_timeout", async () => {
    const fetcher = vi.fn<typeof fetch>(
      (_u, init) =>
        new Promise((_r, reject) =>
          init!.signal!.addEventListener("abort", () =>
            reject(Object.assign(new Error("aborted"), { name: "AbortError" })),
          ),
        ),
    );
    vi.useFakeTimers();
    const p = fast({ fetcher })
      .execute("sb-1", "sleep 1", 1)
      .catch((e: Error) => e.message);
    await vi.advanceTimersByTimeAsync(17_000);
    vi.useRealTimers();
    expect(await p).toBe("daytona_timeout");
  });

  it("treats 404 on delete as already disposed", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(json({ message: "not found" }, 404));
    await expect(fast({ fetcher }).dispose("sb-gone")).resolves.toBeUndefined();
  });

  it("surfaces a failed delete so the run can report sandbox_cleanup_failed", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockImplementation(async () => json({ message: "nope" }, 500));
    await expect(fast({ fetcher }).dispose("sb-1")).rejects.toThrow(
      "daytona_http_500",
    );
    expect(fetcher).toHaveBeenCalledTimes(3);
  });
});
