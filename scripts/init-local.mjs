import { existsSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
if (existsSync(".dev.vars")) {
  console.log("Local secret file already exists; left unchanged.");
} else {
  writeFileSync(
    ".dev.vars",
    `OPERATOR_SECRET=${randomBytes(32).toString("hex")}\nSESSION_SECRET=${randomBytes(32).toString("hex")}\nOPERATOR_NAME=local-operator\n`,
    { mode: 0o600 },
  );
  console.log(
    "Generated local-only secrets in ignored .dev.vars (values not printed). Never use these for production.",
  );
}
