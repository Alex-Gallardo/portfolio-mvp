import { Prisma } from "@prisma/client";

const TRANSIENT_DATABASE_CODES = new Set(["P1000", "P1001", "P1002", "P1008", "P1017", "P2024"]);

function isDatabaseUnavailable(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientInitializationError) return true;

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return TRANSIENT_DATABASE_CODES.has(error.code);
  }

  // Conserva el comportamiento al atravesar límites de bundles donde
  // `instanceof` puede perder la identidad del constructor.
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    error.name === "PrismaClientInitializationError"
  );
}

/**
 * Mantiene disponibles las lecturas públicas cuando el CMS no responde.
 * Los errores de esquema o programación se relanzan para no ocultar defectos.
 */
export async function withPublicDatabaseFallback<T>(
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
