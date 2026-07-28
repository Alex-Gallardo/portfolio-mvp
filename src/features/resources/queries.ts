import { prisma } from "@/lib/prisma";
import { withPublicDatabaseFallback } from "@/lib/prisma-fallback";

/** Últimos recursos publicados (para el carousel de la Home). */
export async function getLatestResources(limit = 6) {
  return withPublicDatabaseFallback(
    () =>
      prisma.resource.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          slug: true,
          title: true,
          summary: true,
          category: true,
          coverUrl: true,
          downloadCount: true,
          _count: { select: { files: true } },
        },
      }),
    [],
  );
}
