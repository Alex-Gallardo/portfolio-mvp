import { prisma } from "@/lib/prisma";
import { withPublicDatabaseFallback } from "@/lib/prisma-fallback";

export async function getPublishedServices() {
  return withPublicDatabaseFallback(
    () =>
      prisma.service.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { order: "asc" },
        select: {
          id: true,
          slug: true,
          title: true,
          summary: true,
          icon: true,
          priceFrom: true,
          features: true,
        },
      }),
    [],
  );
}

export async function getPublishedServiceSlugs() {
  const services = await withPublicDatabaseFallback(
    () =>
      prisma.service.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true },
      }),
    [],
  );
  return services.map((s) => s.slug);
}

export async function getServiceBySlug(slug: string) {
  return withPublicDatabaseFallback(
    () =>
      prisma.service.findFirst({
        where: { slug, status: "PUBLISHED" },
        include: { attachments: { orderBy: { order: "asc" } } },
      }),
    null,
  );
}

/** Otros servicios publicados (mismo tipo), excluyendo el actual. */
export async function getRelatedServices(serviceId: string, limit = 3) {
  return withPublicDatabaseFallback(
    () =>
      prisma.service.findMany({
        where: { status: "PUBLISHED", id: { not: serviceId } },
        orderBy: { order: "asc" },
        take: limit,
        select: {
          id: true,
          slug: true,
          title: true,
          summary: true,
          icon: true,
          priceFrom: true,
          features: true,
        },
      }),
    [],
  );
}
