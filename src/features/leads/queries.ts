import { prisma } from "@/lib/prisma";

export interface LeadFilters {
  resourceId?: string;
  since?: Date;
}

function buildWhere(filters: LeadFilters) {
  return {
    ...(filters.resourceId ? { sourceResourceId: filters.resourceId } : {}),
    ...(filters.since ? { createdAt: { gte: filters.since } } : {}),
  };
}

/** Leads que cumplen el filtro, con el recurso de origen. */
export async function getLeads(filters: LeadFilters) {
  return prisma.lead.findMany({
    where: buildWhere(filters),
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      consent: true,
      utmSource: true,
      utmMedium: true,
      utmCampaign: true,
      createdAt: true,
      sourceResource: { select: { title: true, slug: true } },
    },
  });
}

export type LeadRow = Awaited<ReturnType<typeof getLeads>>[number];

/** Recursos que han generado al menos un lead (para poblar el <select> del filtro). */
export async function getResourcesWithLeads() {
  const grouped = await prisma.lead.groupBy({
    by: ["sourceResourceId"],
    where: { sourceResourceId: { not: null } },
    _count: { sourceResourceId: true },
  });

  const ids = grouped.map((g) => g.sourceResourceId as string);
  if (ids.length === 0) return [];

  const resources = await prisma.resource.findMany({
    where: { id: { in: ids } },
    select: { id: true, title: true },
  });
  const countById = new Map(grouped.map((g) => [g.sourceResourceId, g._count.sourceResourceId]));

  return resources
    .map((r) => ({ id: r.id, title: r.title, count: countById.get(r.id) ?? 0 }))
    .sort((a, b) => b.count - a.count);
}
