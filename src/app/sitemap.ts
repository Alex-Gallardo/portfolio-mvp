// src/app/sitemap.ts
import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { withPublicDatabaseFallback } from "@/lib/prisma-fallback";
import { SITE_URL } from "@/lib/seo";

// El sitemap incluye contenido del CMS y debe generarse con datos actuales.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, services, projects, resources] = await Promise.all([
    withPublicDatabaseFallback(
      () =>
        prisma.post.findMany({
          where: { status: "PUBLISHED" },
          select: { slug: true, updatedAt: true },
        }),
      [],
    ),
    withPublicDatabaseFallback(
      () =>
        prisma.service.findMany({
          where: { status: "PUBLISHED" },
          select: { slug: true, updatedAt: true },
        }),
      [],
    ),
    withPublicDatabaseFallback(
      () =>
        prisma.project.findMany({
          where: { status: "PUBLISHED" },
          select: { slug: true, updatedAt: true },
        }),
      [],
    ),
    withPublicDatabaseFallback(
      () =>
        prisma.resource.findMany({
          where: { status: "PUBLISHED" },
          select: { slug: true, updatedAt: true },
        }),
      [],
    ),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/about",
    "/crypto",
    "/blog",
    "/servicios",
    "/proyectos",
    "/recursos",
  ].map((p) => ({
    url: `${SITE_URL}${p}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.7,
  }));

  const dyn = (base: string, rows: { slug: string; updatedAt: Date }[]): MetadataRoute.Sitemap =>
    rows.map((r) => ({
      url: `${SITE_URL}${base}/${r.slug}`,
      lastModified: r.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

  return [
    ...staticRoutes,
    ...dyn("/blog", posts),
    ...dyn("/servicios", services),
    ...dyn("/proyectos", projects),
    ...dyn("/recursos", resources),
  ];
}
