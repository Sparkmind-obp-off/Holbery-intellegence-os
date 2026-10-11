// Missing platform secret metadata may publish only an explicitly approved
// production setup shell. Preview and ordinary releases still require secrets.
export function releaseMode(target, missingSecrets, lockedOptIn) {
  if (!missingSecrets.length) return "operator-configured";
  if (target === "production" && lockedOptIn === "yes")
    return "setup-required-locked";
  return "blocked";
}
