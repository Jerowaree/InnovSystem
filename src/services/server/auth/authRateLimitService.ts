import {
  countRecentAuthAttempts,
  createAuthAttempt,
  deleteOldAuthAttempts,
} from "@/services/server/repositories/authAttemptRepository";

function normalizeIdentifier(identifier: string) {
  return identifier.trim().toLowerCase();
}

function buildRateLimitGuardError() {
  return new Error(
    "Por seguridad, no pudimos validar tu intento en este momento. Intenta de nuevo en unos minutos."
  );
}

export async function assertRateLimit(input: {
  action:
    | "login"
    | "register"
    | "forgot-password"
    | "sunat-sire-config"
    | "sunat-sire-test"
    | "sunat-sire-preview";
  identifier: string;
  limit: number;
  windowMs: number;
}) {
  const normalizedIdentifier = normalizeIdentifier(input.identifier);
  const now = Date.now();
  const sinceIso = new Date(now - input.windowMs).toISOString();
  const cleanupBeforeIso = new Date(now - input.windowMs * 10).toISOString();

  const cleanupResult = await deleteOldAuthAttempts(cleanupBeforeIso);
  if (cleanupResult.error) {
    console.error("Failed to cleanup auth attempts", cleanupResult.error);
  }

  const countResult = await countRecentAuthAttempts({
    action: input.action,
    subject: normalizedIdentifier,
    sinceIso,
  });

  if (countResult.error) {
    console.error("Failed to count auth attempts", countResult.error);
    return { allowed: false, error: buildRateLimitGuardError() };
  }

  if (countResult.count >= input.limit) {
    return {
      allowed: false,
      error: new Error(
        "Demasiados intentos. Intenta de nuevo en unos minutos."
      ),
    };
  }

  const createResult = await createAuthAttempt({
    action: input.action,
    subject: normalizedIdentifier,
  });

  if (createResult.error) {
    console.error("Failed to register auth attempt", createResult.error);
    return { allowed: false, error: buildRateLimitGuardError() };
  }

  return { allowed: true, error: null };
}
