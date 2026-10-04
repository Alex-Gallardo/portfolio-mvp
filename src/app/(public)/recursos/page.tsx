import { prisma } from "@/lib/prisma";
import { withPublicDatabaseFallback } from "@/lib/prisma-fallback";
import {
  ResourceCard,
  type ResourceCardData,
} from "@/features/resources/ResourceCard/ResourceCard";
import { isResourceCategory } from "@/features/resources/categories";
import { RecursosHero } from "@/features/resources/RecursosHero/RecursosHero";
import { CATALOG_ID, RecursosIntro } from "@/features/resources/RecursosIntro/RecursosIntro";
import { WorkshopCta } from "@/features/resources/WorkshopCta/WorkshopCta";
import { pixelFont } from "@/features/resources/pixelFont";
import { type ResourceCategory } from "@prisma/client";
import styles from "./recursos.module.css";
import { JsonLd } from "@/components/seo/JsonLd";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export const revalidate = 60;

type CardSource = {
  slug: string;
  title: string;
  summary: string;
  category: ResourceCategory;
  coverUrl: string | null;
  downloadCount: number;
  _count: { files: number };
};

function toCard(r: CardSource): ResourceCardData {
  return {
    slug: r.slug,
    title: r.title,
    summary: r.summary,
    category: r.category,
    coverUrl: r.coverUrl,
    downloadCount: r.downloadCount,
    fileCount: r._count.files,
  };
}

export default async function RecursosPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;
  const activeCategory = isResourceCategory(categoria) ? categoria : undefined;

  const [resources, featured, totals, byCategory] = await Promise.all([
    withPublicDatabaseFallback(
      () =>
        prisma.resource.findMany({
          where: { status: "PUBLISHED", ...(activeCategory ? { category: activeCategory } : {}) },
          orderBy: { order: "asc" },
          include: { _count: { select: { files: true } } },
        }),
      [],
    ),
    activeCategory
      ? Promise.resolve(null)
      : withPublicDatabaseFallback(
          () =>
            prisma.resource.findFirst({
              where: { status: "PUBLISHED", featured: true },
              include: { _count: { select: { files: true } } },
            }),
          null,
        ),
    withPublicDatabaseFallback(
      () =>
        prisma.resource.aggregate({
          _sum: { downloadCount: true },
          where: { status: "PUBLISHED" },
        }),
      { _sum: { downloadCount: null } },
    ),
    // Conteo por categoría para los filtros ("Diseño ×3")
    withPublicDatabaseFallback(
      () =>
        prisma.resource.groupBy({
          by: ["category"],
          where: { status: "PUBLISHED" },
          _count: { _all: true },
        }),
      [],
    ),
  ]);

  const totalDownloads = totals._sum.downloadCount ?? 0;
  const counts: Partial<Record<ResourceCategory, number>> = Object.fromEntries(
    byCategory.map((g) => [g.category, g._count._all]),
  );
  const totalResources = byCategory.reduce((sum, g) => sum + g._count._all, 0);
  const featuredId = featured?.id;
  const gridResources = (resources as (CardSource & { id: string })[]).filter(
    (r) => !featuredId || r.id !== featuredId,
  );

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Recursos gratis",
    url: `${SITE_URL}/recursos`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: resources.map((r, i) => ({
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
      <RecursosIntro
        activeCategory={activeCategory}
        counts={counts}
        totalResources={totalResources}
        totalDownloads={totalDownloads}
      />

      <section id={CATALOG_ID} className={styles.wrap} aria-label="Catálogo de recursos">
        {featured ? (
          <div className={styles.featured}>
            <span className={styles.featuredTag}>Destacado</span>
            <ResourceCard resource={toCard(featured as CardSource)} />
          </div>
        ) : null}

        {gridResources.length === 0 ? (
          <p className={styles.empty}>
            {activeCategory
              ? "No hay recursos en esta categoría todavía."
              : "Pronto subiré nuevos recursos. ¡Vuelve pronto!"}
          </p>
        ) : (
          <div className={styles.grid}>
            {gridResources.map((r) => (
              <ResourceCard key={r.slug} resource={toCard(r)} />
            ))}
          </div>
        )}

        <WorkshopCta />
      </section>
    </div>
  );
}
