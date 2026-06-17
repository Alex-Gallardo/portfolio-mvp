import { prisma } from "@/lib/prisma";

export async function getPublishedServices() {
  return prisma.service.findMany({
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
  });
}

export async function getPublishedServiceSlugs() {
  const services = await prisma.service.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
  });
  return services.map((s) => s.slug);
}

export async function getServiceBySlug(slug: string) {
  return prisma.service.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { attachments: { orderBy: { order: "asc" } } },
  });
}

/** Otros servicios publicados (mismo tipo), excluyendo el actual. */
export async function getRelatedServices(serviceId: string, limit = 3) {
  return prisma.service.findMany({
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
  });
}
