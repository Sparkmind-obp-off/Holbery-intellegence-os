export type SandboxCommandResult = { exitCode: number; output: string };
export type SandboxRunConfig = { apiKey: string; apiUrl?: string; toolboxUrl?: string; fetcher?: typeof fetch };
type DaytonaSandbox = { id?: string; sandboxId?: string; name?: string };
type DaytonaExecuteResponse = { exitCode?: number; result?: string; artifacts?: { stdout?: string }; error?: string };
const DEFAULT_API_URL = "https://app.daytona.io/api";
const DEFAULT_TOOLBOX_URL = "https://proxy.app.daytona.io/toolbox";
const MAX_OUTPUT = 12_000;
function shellQuote(value: string): string { return "'" + value.replace(/'/g, "'\\''") + "'"; }
export function validateSandboxPath(path: string): boolean {
  return path.length > 0 && path.length <= 160 &&
    /^(src|tests|public\/static|docs)\/[a-zA-Z0-9._/-]+\.(ts|tsx|js|css|md)$/.test(path) &&
    !path.split("/").some((part) => part === "." || part === "..") &&
    !/(^|\/)(auth|secrets|security|wrangler|package-lock|\.github)(\.|\/|$)/i.test(path);
}
export class DaytonaSandboxAdapter {
  private readonly apiKey: string; private readonly apiUrl: string; private readonly toolboxUrl: string; private readonly fetcher: typeof fetch;
  constructor(config: SandboxRunConfig) {
    if (config.apiKey.trim().length < 16) throw new Error("daytona_api_key_missing");
    this.apiKey = config.apiKey; this.apiUrl = (config.apiUrl || DEFAULT_API_URL).replace(/\/+$/, "");
    this.toolboxUrl = (config.toolboxUrl || DEFAULT_TOOLBOX_URL).replace(/\/+$/, ""); this.fetcher = config.fetcher || fetch;
  }
  private async request<T>(url: string, init: RequestInit, timeoutMs = 20_000): Promise<T> {
    const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await this.fetcher(url, { ...init, signal: controller.signal, headers: { Accept: "application/json", "Content-Type": "application/json", ...(init.headers || {}) } });
      const text = await response.text(); let body: Record<string, unknown> = {};
      try { body = text ? JSON.parse(text) as Record<string, unknown> : {}; } catch { body = { message: text.slice(0, 500) }; }
      if (!response.ok) { const message = typeof body.message === "string" ? body.message : "provider_error"; throw new Error("daytona_http_" + response.status + ":" + message); }
      return body as T;
    } finally { clearTimeout(timer); }
  }
  async create(): Promise<string> {
    const sandbox = await this.request<DaytonaSandbox>(this.apiUrl + "/sandbox", {
      method: "POST", headers: { Authorization: "Bearer " + this.apiKey },
      body: JSON.stringify({ labels: { "code-toolbox-language": "typescript", "hio-managed": "true" }, autoDeleteInterval: 30 }),
    });
    const id = sandbox.id || sandbox.sandboxId || sandbox.name;
    if (!id || !/^[a-zA-Z0-9._-]{1,200}$/.test(id)) throw new Error("daytona_sandbox_id_missing");
    return id;
  }
  async execute(sandboxId: string, command: string, timeoutSeconds = 120, cwd = "workspace"): Promise<SandboxCommandResult> {
    if (!/^[a-zA-Z0-9._-]{1,200}$/.test(sandboxId)) throw new Error("daytona_sandbox_id_invalid");
    const timeout = Math.max(1, Math.min(timeoutSeconds, 300));
    const body = await this.request<DaytonaExecuteResponse>(this.toolboxUrl + "/" + encodeURIComponent(sandboxId) + "/process/execute", {
      method: "POST", body: JSON.stringify({ command, cwd, timeout }),
    }, (timeout + 15) * 1000);
    const exitCode = Number.isInteger(body.exitCode) ? body.exitCode! : 0;
    const output = typeof body.result === "string" ? body.result : typeof body.artifacts?.stdout === "string" ? body.artifacts.stdout : typeof body.error === "string" ? body.error : "";
    return { exitCode, output: output.slice(0, MAX_OUTPUT) };
  }
  async writeTextFile(sandboxId: string, path: string, content: string): Promise<SandboxCommandResult> {
    if (!validateSandboxPath(path)) throw new Error("sandbox_path_not_allowed");
    if (content.length > 30_000) throw new Error("sandbox_file_too_large");
    const encoded = btoa(Array.from(new TextEncoder().encode(content), (byte) => String.fromCharCode(byte)).join(""));
    const dir = path.slice(0, path.lastIndexOf("/"));
    const command = "mkdir -p -- " + shellQuote(dir) + " && printf %s " + shellQuote(encoded) + " | base64 -d > " + shellQuote(path);
    return this.execute(sandboxId, command, 30);
  }
  async dispose(sandboxId: string): Promise<void> {
    await this.request(this.apiUrl + "/sandbox/" + encodeURIComponent(sandboxId), { method: "DELETE", headers: { Authorization: "Bearer " + this.apiKey } });
  }
}
