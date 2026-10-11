# One-Shot Delivery Contract

The full execution prompt is in [docs/42-holbery-intelligence-os-master-system-prompt.md](42-holbery-intelligence-os-master-system-prompt.md).

## Mandatory deliverables
1. Real implementation in the existing repository, not more planning documents alone.
2. Tests executed; failures fixed or documented with exact blockers.
3. Dedicated in-app Manual/Help page reflecting shipped behavior.
4. Coherent commits pushed to the canonical GitHub repository; verify branch and commit SHA.
5. Deployment attempted through the existing authorized Cloudflare BYOK workflow.
6. Verified deployment URL/ID and smoke tests, or explicit **BLOCKED — NOT DEPLOYED** status and precise missing authorization/configuration.
7. Final report distinguishing implemented, tested, pushed, deployed, and operationally validated.

## One coordinated run
Audit first, then implement the highest-value end-to-end vertical slice, test and repair it, commit/push, deploy/verify through Cloudflare BYOK, update status documentation, and push final status. Do not stop at a plan unless a genuine blocker prevents safe progress.

## Safety
Never fabricate credentials or success, expose secrets, force-push over unrelated work, or make destructive production changes without approval. A successful build alone is not a deployment.


## Canonical product and release requirements

Follow [the AI workspace productization and production parity contract](50-ai-workspace-productization-and-production-parity.md). Report implemented, tested, pushed, deployed, production-verified, and commercially validated as separate states. Do not treat phases, documentation, a build, or a static deployment as proof that a sellable SaaS is ready.
