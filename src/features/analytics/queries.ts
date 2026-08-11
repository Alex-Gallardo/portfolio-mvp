import { unstable_cache } from "next/cache";
import { EventType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { withDatabaseFallback } from "@/lib/prisma-fallback";

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
}

async function computeDashboard(rangeDays: number) {
  const since = new Date(Date.now() - rangeDays * 24 * 60 * 60 * 1000);

  const [
    pageviews,
    resourceViews,
    conversions,
    leads,
    downloads,
    contacts,
    visitors,
    topPaths,
    topClicks,
    devicesRaw,
    countriesRaw,
    scrolls,
    pvEvents,
    downloadsByResource,
  ] = await Promise.all([
    prisma.analyticsEvent.count({ where: { type: EventType.PAGEVIEW, createdAt: { gte: since } } }),
    prisma.analyticsEvent.count({
      where: {
        type: EventType.PAGEVIEW,
        createdAt: { gte: since },
        path: { startsWith: "/recursos" },
      },
    }),
    prisma.analyticsEvent.count({
      where: { type: EventType.CONVERSION, createdAt: { gte: since } },
    }),
    prisma.lead.count({ where: { createdAt: { gte: since } } }),
    prisma.resourceDownload.count({ where: { createdAt: { gte: since } } }),
    prisma.contactMessage.count({ where: { createdAt: { gte: since } } }),
    prisma.analyticsSession.count({ where: { lastSeen: { gte: since } } }),

    prisma.analyticsEvent.groupBy({
      by: ["path"],
      where: { type: EventType.PAGEVIEW, createdAt: { gte: since } },
      _count: { path: true },
      orderBy: { _count: { path: "desc" } },
      take: 8,
    }),
    prisma.analyticsEvent.groupBy({
      by: ["element"],
      where: { type: EventType.CLICK, createdAt: { gte: since }, element: { not: null } },
      _count: { element: true },
      orderBy: { _count: { element: "desc" } },
      take: 8,
    }),
    prisma.analyticsSession.groupBy({
      by: ["device"],
      where: { lastSeen: { gte: since } },
      _count: { device: true },
    }),
    prisma.analyticsSession.groupBy({
      by: ["country"],
      where: { lastSeen: { gte: since }, country: { not: null } },
      _count: { country: true },
      orderBy: { _count: { country: "desc" } },
      take: 8,
    }),
    prisma.analyticsEvent.findMany({
      where: { type: EventType.SCROLL_DEPTH, createdAt: { gte: since }, label: { not: null } },
      select: { label: true },
    }),
    prisma.analyticsEvent.findMany({
      where: { type: EventType.PAGEVIEW, createdAt: { gte: since } },
      select: { createdAt: true },
    }),
    prisma.resourceDownload.groupBy({
      by: ["resourceId"],
      where: { createdAt: { gte: since } },
      _count: { resourceId: true },
      orderBy: { _count: { resourceId: "desc" } },
      take: 6,
    }),
  ]);

  // --- promedio de scroll ---
  const avgScroll = scrolls.length
    ? Math.round(scrolls.reduce((a, s) => a + Number(s.label), 0) / scrolls.length)
    : 0;

  // --- tendencia diaria (rellena días con 0) ---
  const counts = new Map<string, number>();
  for (const e of pvEvents) {
    const k = dayKey(e.createdAt);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const trend: { day: string; count: number }[] = [];
  const start = new Date(since);
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
    const k = dayKey(d);
    trend.push({ day: k.slice(5), count: counts.get(k) ?? 0 }); // etiqueta MM-DD
  }

  // --- top recursos por descargas (resuelve títulos) ---
  const resourceTitles = await prisma.resource.findMany({
    where: { id: { in: downloadsByResource.map((g) => g.resourceId) } },
    select: { id: true, title: true },
  });
  const titleById = new Map(resourceTitles.map((r) => [r.id, r.title]));
  const topResources = downloadsByResource.map((g) => ({
    title: titleById.get(g.resourceId) ?? "(eliminado)",
    downloads: g._count.resourceId,
  }));

  // --- derivados ---
  const conversionRate = pageviews ? (conversions / pageviews) * 100 : 0;
  const captureRate = resourceViews ? (leads / resourceViews) * 100 : 0;

  return {
    available: true,
    kpis: {
      pageviews,
      visitors,
      leads,
      downloads,
      conversions,
      conversionRate,
      captureRate,
      avgScroll,
    },
    trend,
    devices: devicesRaw.map((d) => ({ name: d.device ?? "desconocido", value: d._count.device })),
    countries: countriesRaw.map((c) => ({ name: c.country ?? "—", value: c._count.country })),
    topPaths: topPaths.map((p) => ({ path: p.path, count: p._count.path })),
    topClicks: topClicks.map((c) => ({ element: c.element ?? "—", count: c._count.element })),
    topResources,
    funnel: {
      visitors,
      resourceViews,
      leads,
      downloads,
      contacts,
    },
  };
}

export type DashboardData = Awaited<ReturnType<typeof computeDashboard>>;

function emptyDashboard(rangeDays: number): DashboardData {
  const since = new Date(Date.now() - rangeDays * 24 * 60 * 60 * 1000);
  const trend: DashboardData["trend"] = [];
  const start = new Date(since);
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
    trend.push({ day: dayKey(d).slice(5), count: 0 });
  }

  return {
    available: false,
    kpis: {
      pageviews: 0,
      visitors: 0,
      leads: 0,
      downloads: 0,
      conversions: 0,
      conversionRate: 0,
      captureRate: 0,
      avgScroll: 0,
    },
    trend,
    devices: [],
    countries: [],
    topPaths: [],
    topClicks: [],
    topResources: [],
    funnel: {
      visitors: 0,
      resourceViews: 0,
      leads: 0,
      downloads: 0,
      contacts: 0,
    },
  };
}

// Cachea por rango; refresca cada 5 min. Invalida manualmente con revalidateTag("analytics").
const getCachedDashboard = unstable_cache(
  async (rangeDays: number) => computeDashboard(rangeDays),
  ["admin-analytics-dashboard"],
  { revalidate: 300, tags: ["analytics"] },
);

export function getDashboardData(rangeDays: number): Promise<DashboardData> {
  // El fallback queda fuera de la caché: una caída temporal nunca se conserva
  // durante cinco minutos y la siguiente carga puede recuperarse de inmediato.
  return withDatabaseFallback(() => getCachedDashboard(rangeDays), emptyDashboard(rangeDays));
}
