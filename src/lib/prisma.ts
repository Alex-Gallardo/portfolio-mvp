import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Query failures still reject and are handled at their call site. Logging every
    // rejected query here duplicates the same outage dozens of times in Next.js.
    log: process.env.PRISMA_DEBUG === "true" ? ["query", "error", "warn"] : ["warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
