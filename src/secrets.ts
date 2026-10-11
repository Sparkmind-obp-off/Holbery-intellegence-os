import { z } from "zod";
import type { Env } from "./auth";

export const secretName = z.enum(["OPERATOR_SECRET", "SESSION_SECRET"]);
export const secretEnvironment = z.enum(["local", "preview", "production"]);
export type SecretName = z.infer<typeof secretName>;
export type SecretEnvironment = z.infer<typeof secretEnvironment>;
export type Rotation = {
  secret_name: SecretName;
  environment: SecretEnvironment;
  rotated_at: string;
  recorded_at: string;
  recorded_by: string;
};
export const rotationInput = z
  .object({
    name: secretName,
    environment: secretEnvironment,
    rotatedAt: z
      .string()
      .datetime()
      .refine(
        (v) =>
          Date.parse(v) <= Date.now() &&
          Date.parse(v) >= Date.parse("2020-01-01T00:00:00Z"),
        "Use an actual past rotation date",
      ),
  })
  .strict();
export const canManageSecrets = (role: string | undefined) =>
  role === "owner-operator";
const project = "holbery-intelligence-os";
const account = "a167a50f1272635d3c1145aab3cd8f98";
export function secretInventory(
  bindings: Env["Bindings"],
  rotations: Rotation[],
) {
  const current = secretEnvironment.safeParse(bindings.HIO_ENVIRONMENT);
  const runtimeEnvironment = current.success ? current.data : "unknown";
  const definitions = [
    {
      name: "OPERATOR_SECRET" as const,
      purpose: "Owner/operator login",
      feature: "Operator authentication",
      recovery:
        "Save a new independent 32–256 character credential in your password manager; replace it in Cloudflare. Rotate SESSION_SECRET too if compromised access/session theft is possible.",
    },
    {
      name: "SESSION_SECRET" as const,
      purpose: "HMAC signing of private sessions",
      feature: "Session verification",
      recovery:
        "Create an independent random signing key (at least 32 characters) in your password manager; replace it in Cloudflare. New deployments reject existing signed sessions; users must sign in again.",
    },
  ];
  const items = secretEnvironment.options.flatMap((environment) =>
    definitions.map((def) => {
      const value = bindings[def.name];
      const valid =
        typeof value === "string" &&
        value.length >= 32 &&
        (def.name !== "OPERATOR_SECRET" || value.length <= 256);
      const rotation = rotations.find(
        (r) => r.secret_name === def.name && r.environment === environment,
      );
      return {
        name: def.name,
        purpose: def.purpose,
        dependentFeature: def.feature,
        environment,
        required: true,
        status:
          environment === runtimeEnvironment
            ? valid
              ? "configured"
              : "missing"
            : "unknown",
        statusBasis:
          environment === runtimeEnvironment
            ? "Runtime allowlisted presence/readiness check only"
            : "Different environment; verify in Cloudflare",
        storageVerification:
          "unknown — runtime cannot attest Cloudflare secret_text storage",
        lastRotationAt: rotation?.rotated_at ?? null,
        recordedAt: rotation?.recorded_at ?? null,
        rotationBasis: rotation
          ? "owner-reported metadata, not provider attestation"
          : "not recorded",
        ownerManagedLocation:
          environment === "local"
            ? "Ignored local .dev.vars; never reuse for cloud"
            : "Cloudflare Pages settings → Variables and Secrets → " +
              environment,
        command:
          environment === "local"
            ? null
            : `npx wrangler pages secret put ${def.name} --project-name ${project} --env ${environment}`,
        commandScope:
          "Pinned Wrangler 4.149.0 supports --env production or --env preview for Pages secrets (hidden from help); environment selection verified using secret list. Use the secure interactive prompt, never values in command arguments. Dashboard environment selector is also supported.",
        recovery: def.recovery,
        rawValueRecoverableHere: false,
      };
    }),
  );
  return {
    runtimeEnvironment,
    ownerRole: "owner-operator",
    items,
    managementUrl: `https://dash.cloudflare.com/${account}/pages/view/${project}/settings`,
    project,
    accountId: account,
    limitations: [
      "No raw secret readback. Configured does not mean owner can recover the old value.",
      "This screen records rotation metadata only; it cannot write Cloudflare secrets or bindings.",
      "Set/replace secret values through owner-controlled Cloudflare dashboard or secure Wrangler prompt, then redeploy the selected environment.",
      "Other environments are unknown from this runtime. Preview DB creation is currently blocked by account quota.",
    ],
    providerCredentials:
      "No approved connector requires provider credentials. Cloudflare BYOK token is deployment-only and never an application binding.",
  };
}
