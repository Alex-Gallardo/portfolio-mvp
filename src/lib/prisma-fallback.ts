import { Prisma } from "@prisma/client";

const TRANSIENT_DATABASE_CODES = new Set(["P1001", "P1002", "P1008", "P1017", "P2024"]);
const TRANSIENT_DATABASE_MESSAGES = [
  "Can't reach database server",
  "Timed out fetching a new connection",
  "Server has closed the connection",
];

function hasTransientDatabaseMessage(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("message" in error)) return false;
  const errorMessage = error.message;
  return (
    typeof errorMessage === "string" &&
    TRANSIENT_DATABASE_MESSAGES.some((message) => errorMessage.includes(message))
  );
}

export function isDatabaseUnavailable(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return error.errorCode
      ? TRANSIENT_DATABASE_CODES.has(error.errorCode)
      : error.retryable === true || hasTransientDatabaseMessage(error);
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return TRANSIENT_DATABASE_CODES.has(error.code);
  }

  if (typeof error !== "object" || error === null) return false;

  // Al atravesar límites de bundles, `instanceof` puede perder la identidad
  // del constructor. El código de Prisma sigue siendo estable.
  if ("code" in error && typeof error.code === "string") {
    return TRANSIENT_DATABASE_CODES.has(error.code);
  }

  return (
    "name" in error &&
    error.name === "PrismaClientInitializationError" &&
    (("errorCode" in error &&
      typeof error.errorCode === "string" &&
      TRANSIENT_DATABASE_CODES.has(error.errorCode)) ||
      ("retryable" in error && error.retryable === true) ||
      hasTransientDatabaseMessage(error))
  );
}

/**
 * Ejecuta una operación con degradación controlada cuando la base de datos no
 * responde. Los errores de esquema o programación se relanzan para no ocultar
 * defectos reales.
 */
export async function withDatabaseFallback<T>(
  operation: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (!isDatabaseUnavailable(error)) throw error;
    return fallback;
  }
}

/** Mantiene disponibles las lecturas públicas cuando el CMS no responde. */
export const withPublicDatabaseFallback = withDatabaseFallback;
