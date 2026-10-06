import { type Prisma, type ResourceCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { withPublicDatabaseFallback } from "@/lib/prisma-fallback";
import {
  ResourceCard,
  type ResourceCardData,
} from "@/features/resources/ResourceCard/ResourceCard";
import { RESOURCE_CATEGORIES, isResourceCategory } from "@/features/resources/categories";
import { RecursosHero } from "@/features/resources/RecursosHero/RecursosHero";
import { RecursosIntro } from "@/features/resources/RecursosIntro/RecursosIntro";
import { WorkshopCta } from "@/features/resources/WorkshopCta/WorkshopCta";
import { CellarBackdrop } from "@/features/resources/CellarBackdrop/CellarBackdrop";
import { CatalogSidebar } from "@/features/resources/catalog/CatalogSidebar";
import { CatalogToolbar } from "@/features/resources/catalog/CatalogToolbar";
import { CatalogAside } from "@/features/resources/catalog/CatalogAside";
import { EmptyState } from "@/features/resources/catalog/EmptyState";
import {
  CATALOG_ID,
  DEFAULT_ORDER,
  fileTypesOf,
  formatBytes,
  isCatalogOrder,
  type CatalogOrder,
} from "@/features/resources/catalog/params";
import { pixelFont } from "@/features/resources/pixelFont";
import styles from "./recursos.module.css";
import { JsonLd } from "@/components/seo/JsonLd";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export const revalidate = 60;

/** Cómo se ordena el catálogo según la pestaña activa. */
const ORDER_BY: Record<CatalogOrder, Prisma.ResourceOrderByWithRelationInput[]> = {
  destacados: [{ order: "asc" }, { createdAt: "desc" }],
  nuevos: [{ createdAt: "desc" }],
  descargas: [{ downloadCount: "desc" }, { createdAt: "desc" }],
};

type CardSource = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: ResourceCategory;
  coverUrl: string | null;
  downloadCount: number;
  featured: boolean;
  createdAt: Date;
  files: { fileName: string; mimeType: string | null; sizeBytes: number | null }[];
};

/** La card ya sabe pintar formatos, peso y "Nuevo": aquí se le dan los datos. */
function toCard(r: CardSource): ResourceCardData {
  return {
    slug: r.slug,
    title: r.title,
    summary: r.summary,
    category: r.category,
    coverUrl: r.coverUrl,
    downloadCount: r.downloadCount,
    fileCount: r.files.length,
    fileTypes: fileTypesOf(r.files),
    fileSize: formatBytes(r.files.reduce((sum, f) => sum + (f.sizeBytes ?? 0), 0)),
    publishedAt: r.createdAt,
  };
}

export default async function RecursosPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; orden?: string }>;
}) {
  const { categoria, orden: ordenParam } = await searchParams;
  const activeCategory = isResourceCategory(categoria) ? categoria : undefined;
  const orden: CatalogOrder = isCatalogOrder(ordenParam) ? ordenParam : DEFAULT_ORDER;

  const [resources, totals, byCategory, top] = await Promise.all([
    withPublicDatabaseFallback(
      () =>
        prisma.resource.findMany({
          where: { status: "PUBLISHED", ...(activeCategory ? { category: activeCategory } : {}) },
          orderBy: ORDER_BY[orden],
          select: {
            id: true,
            slug: true,
            title: true,
            summary: true,
            category: true,
            coverUrl: true,
            downloadCount: true,
            featured: true,
            createdAt: true,
            files: { select: { fileName: true, mimeType: true, sizeBytes: true } },
          },
        }),
      [],
    ),
    withPublicDatabaseFallback(
      () =>
        prisma.resource.aggregate({
          _sum: { downloadCount: true },
          where: { status: "PUBLISHED" },
        }),
      { _sum: { downloadCount: null } },
    ),
    // Conteo por categoría para la columna de filtros ("Diseño ×3")
    withPublicDatabaseFallback(
      () =>
        prisma.resource.groupBy({
          by: ["category"],
          where: { status: "PUBLISHED" },
          _count: { _all: true },
        }),
      [],
    ),
    // Top 3 para la columna derecha
    withPublicDatabaseFallback(
      () =>
        prisma.resource.findMany({
          where: { status: "PUBLISHED" },
          orderBy: [{ downloadCount: "desc" }, { createdAt: "desc" }],
          take: 3,
          select: { slug: true, title: true, coverUrl: true, category: true, downloadCount: true },
        }),
      [],
    ),
  ]);

  const totalDownloads = totals._sum.downloadCount ?? 0;
  const counts: Partial<Record<ResourceCategory, number>> = Object.fromEntries(
    byCategory.map((g) => [g.category, g._count._all]),
  );
  const totalResources = byCategory.reduce((sum, g) => sum + g._count._all, 0);
  const liveCategories = RESOURCE_CATEGORIES.filter((c) => (counts[c.value] ?? 0) > 0).length;

  // El destacado sólo encabeza la vista por defecto (sin filtro, orden "Destacados")
  const list = resources as CardSource[];
  const featured =
    !activeCategory && orden === DEFAULT_ORDER ? list.find((r) => r.featured) : undefined;
  const gridResources = featured ? list.filter((r) => r.id !== featured.id) : list;

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Recursos gratis",
    url: `${SITE_URL}/recursos`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: list.map((r, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/recursos/${r.slug}`,
        name: r.title,
      })),
    },
  };

  return (
    <div className={`${styles.page} ${pixelFont.variable}`}>
      <JsonLd data={collectionLd} />
      <RecursosHero />
      <CellarBackdrop>
        <RecursosIntro />

        <div id={CATALOG_ID} className={styles.layout}>
          <div className={styles.side}>
            <CatalogSidebar
              activeCategory={activeCategory}
              orden={orden}
              counts={counts}
              total={totalResources}
            />
          </div>

          <section className={styles.main} aria-labelledby="catalog-title">
            <CatalogToolbar activeCategory={activeCategory} orden={orden} results={list.length} />

            {featured ? (
              <div className={styles.featured}>
                <span className={styles.featuredTag}>Destacado</span>
                <ResourceCard resource={toCard(featured)} priority />
              </div>
            ) : null}

            {list.length === 0 ? (
              <EmptyState activeCategory={activeCategory} orden={orden} />
            ) : gridResources.length > 0 ? (
              <div className={styles.grid}>
                {gridResources.map((r) => (
                  <ResourceCard key={r.slug} resource={toCard(r)} />
                ))}
              </div>
            ) : null}
          </section>

          <div className={styles.aside}>
            <CatalogAside
              totalResources={totalResources}
              totalDownloads={totalDownloads}
              liveCategories={liveCategories}
              top={top}
            />
          </div>
        </div>

        <div className={styles.closing}>
          <WorkshopCta />
        </div>
      </CellarBackdrop>
    </div>
  );
}
