export type SandboxCommandResult = {
  exitCode: number;
  output: string;
};

export type SandboxRunConfig = {
  apiKey: string;
  apiUrl?: string;
  toolboxUrl?: string;
  /** Daytona region/target (SDK `target`), e.g. "us" or "eu". Optional. */
  target?: string;
  fetcher?: typeof fetch;
} & SandboxTimings;

type DaytonaSandbox = {
  id?: string;
  sandboxId?: string;
  name?: string;
  state?: string;
  errorReason?: string;
  toolboxProxyUrl?: string;
};

export type SandboxTimings = {
  /** Max seconds to wait for the sandbox to reach the `started` state. */
  startTimeoutSeconds?: number;
  /** Poll interval while waiting for `started` (ms). */
  pollIntervalMs?: number;
  /** Retries for idempotent requests (GET/DELETE) on 429/5xx/network errors. */
  transientRetries?: number;
  sleep?: (ms: number) => Promise<void>;
};

/** Sandbox states (Daytona api-client SandboxState) that will never become `started`. */
const TERMINAL_FAILURE_STATES = new Set([
  "error",
  "build_failed",
  "destroyed",
  "destroying",
]);

type DaytonaExecuteResponse = {
  exitCode?: number;
  result?: string;
  artifacts?: { stdout?: string };
  error?: string;
};

const DEFAULT_API_URL = "https://app.daytona.io/api";
const DEFAULT_TOOLBOX_URL = "https://proxy.app.daytona.io/toolbox";
const MAX_OUTPUT = 12_000;

const REQUIRED_CHECKS = [
  "install",
  "typecheck",
  "lint",
  "format",
  "tests",
  "security",
  "build",
] as const;

export function didSandboxRunPass(
  results: { name: string; exitCode: number }[],
  failure: string | null,
): boolean {
  if (failure) return false;
  const latest = new Map<string, number>();
  for (const result of results) {
    if ((REQUIRED_CHECKS as readonly string[]).includes(result.name)) {
      latest.set(result.name, result.exitCode);
    }
  }
  return REQUIRED_CHECKS.every((name) => latest.get(name) === 0);
}

function shellQuote(value: string): string {
  return "'" + value.replace(/'/g, "'\\''") + "'";
}

export function validateSandboxPath(path: string): boolean {
  const parts = path.split("/");
  return (
    path.length > 0 &&
    path.length <= 160 &&
    /^(src|tests|public\/static|docs)\/[a-zA-Z0-9._/-]+\.(ts|tsx|js|css|md)$/.test(
      path,
    ) &&
    !parts.some((part) => !part || part === "." || part === "..") &&
    !/(^|\/)(auth|secrets|security|wrangler|package-lock|\.github)(\.|\/|$)/i.test(
      path,
    )
  );
}

export class DaytonaSandboxAdapter {
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly toolboxUrl: string;
  private readonly fetcher: typeof fetch;
  private readonly startTimeoutMs: number;
  private readonly pollIntervalMs: number;
  private readonly transientRetries: number;
  private readonly sleep: (ms: number) => Promise<void>;
  /** Per-sandbox toolbox base URL as reported by Daytona (SDK: toolboxProxyUrl). */
  private readonly toolboxBases = new Map<string, string>();
  private readonly target: string | undefined;

  constructor(config: SandboxRunConfig) {
    if (config.apiKey.trim().length < 16) {
      throw new Error("daytona_api_key_missing");
    }
    this.apiKey = config.apiKey;
    this.apiUrl = (config.apiUrl || DEFAULT_API_URL).replace(/\/+$/, "");
    this.toolboxUrl = (config.toolboxUrl || DEFAULT_TOOLBOX_URL).replace(
      /\/+$/,
      "",
    );
    // Never store the global `fetch` and call it as a method: in workerd
    // (Cloudflare Workers) that throws "Illegal invocation". Wrap it instead.
    this.fetcher =
      config.fetcher || ((input, init) => globalThis.fetch(input, init));
    const target = config.target?.trim();
    if (target && !/^[a-z0-9-]{1,40}$/.test(target))
      throw new Error("daytona_target_invalid");
    this.target = target || undefined;
    this.startTimeoutMs =
      Math.max(1, Math.min(config.startTimeoutSeconds ?? 90, 300)) * 1000;
    this.pollIntervalMs = Math.max(0, config.pollIntervalMs ?? 1500);
    this.transientRetries = Math.max(
      0,
      Math.min(config.transientRetries ?? 2, 3),
    );
    this.sleep =
      config.sleep || ((ms) => new Promise((r) => setTimeout(r, ms)));
  }

  /** Never let the credential appear in an error message or stored evidence. */
  private redact(text: string): string {
    return text.split(this.apiKey).join("[redacted]").slice(0, 300);
  }

  private auth() {
    return { Authorization: "Bearer " + this.apiKey };
  }

  private async request<T>(
    url: string,
    init: RequestInit,
    timeoutMs = 20_000,
  ): Promise<T> {
    const method = (init.method || "GET").toUpperCase();
    // Only idempotent requests are retried; POST create/execute never are.
    const retries =
      method === "GET" || method === "DELETE" ? this.transientRetries : 0;
    for (let attempt = 0; ; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      let response: Response;
      try {
        response = await this.fetcher(url, {
          ...init,
          signal: controller.signal,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(init.headers || {}),
          },
        });
      } catch (error) {
        clearTimeout(timer);
        const aborted =
          controller.signal.aborted ||
          (error instanceof Error && error.name === "AbortError");
        if (!aborted && attempt < retries) {
          await this.sleep(500 * 2 ** attempt);
          continue;
        }
        if (aborted) throw new Error("daytona_timeout");
        const detail =
          error instanceof Error
            ? this.redact(error.name + ": " + error.message)
            : "";
        throw new Error(
          "daytona_network_error" + (detail ? ":" + detail.slice(0, 120) : ""),
        );
      }
      try {
        const text = await response.text();
        let body: Record<string, unknown> = {};
        try {
          body = text ? (JSON.parse(text) as Record<string, unknown>) : {};
        } catch {
          body = { message: text.slice(0, 500) };
        }
        if (response.ok) return body as T;
        const transient = response.status === 429 || response.status >= 500;
        if (transient && attempt < retries) {
          await this.sleep(500 * 2 ** attempt);
          continue;
        }
        const message = this.redact(
          typeof body.message === "string" ? body.message : "provider_error",
        );
        if (response.status === 401 || response.status === 403)
          throw new Error("daytona_auth_failed:" + response.status);
        throw new Error("daytona_http_" + response.status + ":" + message);
      } finally {
        clearTimeout(timer);
      }
    }
  }

  private sandboxUrl(id: string) {
    return this.apiUrl + "/sandbox/" + encodeURIComponent(id);
  }

  /**
   * Accept a toolbox URL from Daytona only if it is HTTPS on the same host
   * family as the configured endpoints, so the API key is never sent elsewhere.
   */
  private trustedToolbox(url: unknown): string | null {
    if (typeof url !== "string") return null;
    try {
      const u = new URL(url);
      const allowed = [
        new URL(this.toolboxUrl).hostname,
        new URL(this.apiUrl).hostname,
      ];
      const ok =
        u.protocol === "https:" &&
        (allowed.includes(u.hostname) || u.hostname.endsWith(".daytona.io"));
      return ok ? url.replace(/\/+$/, "") : null;
    } catch {
      return null;
    }
  }

  private async resolveToolbox(id: string, sandbox: DaytonaSandbox) {
    let base = this.trustedToolbox(sandbox.toolboxProxyUrl);
    if (!base) {
      try {
        const r = await this.request<{ url?: string }>(
          this.sandboxUrl(id) + "/toolbox-proxy-url",
          { method: "GET", headers: this.auth() },
        );
        base = this.trustedToolbox(r.url);
      } catch {
        base = null;
      }
    }
    this.toolboxBases.set(id, base || this.toolboxUrl);
  }

  /** Poll until Daytona reports `started` (SDK: waitUntilStarted). */
  private async waitUntilStarted(id: string, initial: DaytonaSandbox) {
    const deadline = Date.now() + this.startTimeoutMs;
    let sandbox = initial;
    for (;;) {
      const state = String(sandbox.state || "").toLowerCase();
      if (state === "started") return sandbox;
      if (TERMINAL_FAILURE_STATES.has(state))
        throw new Error(
          "daytona_sandbox_" +
            state +
            (sandbox.errorReason ? ":" + this.redact(sandbox.errorReason) : ""),
        );
      if (Date.now() >= deadline) throw new Error("daytona_start_timeout");
      await this.sleep(this.pollIntervalMs);
      sandbox = await this.request<DaytonaSandbox>(this.sandboxUrl(id), {
        method: "GET",
        headers: this.auth(),
      });
    }
  }

  /**
   * Create a disposable sandbox and return its id once it is `started`.
   * If it never becomes ready, it is deleted before the error is thrown.
   */
  async create(): Promise<string> {
    const sandbox = await this.request<DaytonaSandbox>(
      this.apiUrl + "/sandbox",
      {
        method: "POST",
        headers: this.auth(),
        body: JSON.stringify({
          labels: {
            "code-toolbox-language": "typescript",
            "hio-managed": "true",
          },
          // Backstops if the explicit delete in `dispose` is ever missed.
          autoStopInterval: 15,
          autoDeleteInterval: 30,
          ...(this.target ? { target: this.target } : {}),
        }),
      },
      60_000,
    );
    const id = sandbox.id || sandbox.sandboxId || sandbox.name;
    if (!id || !/^[a-zA-Z0-9._-]{1,200}$/.test(id)) {
      throw new Error("daytona_sandbox_id_missing");
    }
    try {
      const ready = await this.waitUntilStarted(id, sandbox);
      await this.resolveToolbox(id, ready);
    } catch (error) {
      await this.dispose(id).catch(() => undefined);
      throw error;
    }
    return id;
  }

  async execute(
    sandboxId: string,
    command: string,
    timeoutSeconds = 120,
    cwd = "workspace",
  ): Promise<SandboxCommandResult> {
    if (!/^[a-zA-Z0-9._-]{1,200}$/.test(sandboxId)) {
      throw new Error("daytona_sandbox_id_invalid");
    }
    const timeout = Math.max(1, Math.min(timeoutSeconds, 300));
    const body = await this.request<DaytonaExecuteResponse>(
      (this.toolboxBases.get(sandboxId) || this.toolboxUrl) +
        "/" +
        encodeURIComponent(sandboxId) +
        "/process/execute",
      {
        method: "POST",
        // The toolbox API requires the same bearer key as the platform API
        // (toolbox OpenAPI securitySchemes.Bearer); without it every command is rejected.
        headers: this.auth(),
        body: JSON.stringify({ command, cwd, timeout }),
      },
      (timeout + 15) * 1000,
    );
    const exitCode = Number.isInteger(body.exitCode)
      ? body.exitCode!
      : body.error || typeof body.result !== "string"
        ? 1
        : 0;
    const output =
      typeof body.result === "string"
        ? body.result
        : typeof body.artifacts?.stdout === "string"
          ? body.artifacts.stdout
          : typeof body.error === "string"
            ? body.error
            : "";
    return { exitCode, output: this.redactOutput(output) };
  }

  async writeTextFile(
    sandboxId: string,
    path: string,
    content: string,
  ): Promise<SandboxCommandResult> {
    if (!validateSandboxPath(path)) {
      throw new Error("sandbox_path_not_allowed");
    }
    if (content.length > 30_000) {
      throw new Error("sandbox_file_too_large");
    }
    const encoded = btoa(
      Array.from(new TextEncoder().encode(content), (byte) =>
        String.fromCharCode(byte),
      ).join(""),
    );
    const directory = path.slice(0, path.lastIndexOf("/"));
    const command =
      "mkdir -p -- " +
      shellQuote(directory) +
      " && printf %s " +
      shellQuote(encoded) +
      " | base64 -d > " +
      shellQuote(path);
    return this.execute(sandboxId, command, 30);
  }

  private redactOutput(output: string): string {
    return output.split(this.apiKey).join("[redacted]").slice(0, MAX_OUTPUT);
  }

  /** Delete the sandbox. A 404 means it is already gone and counts as disposed. */
  async dispose(sandboxId: string): Promise<void> {
    try {
      await this.request(this.sandboxUrl(sandboxId), {
        method: "DELETE",
        headers: this.auth(),
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.startsWith("daytona_http_404")
      )
        return;
      throw error;
    } finally {
      this.toolboxBases.delete(sandboxId);
    }
  }
}
