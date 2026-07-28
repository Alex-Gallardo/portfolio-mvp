import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { withPublicDatabaseFallback } from "@/lib/prisma-fallback";
import {
  ResourceCard,
  type ResourceCardData,
} from "@/features/resources/ResourceCard/ResourceCard";
import { RESOURCE_CATEGORIES, isResourceCategory } from "@/features/resources/categories";
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

  const [resources, featured, totals] = await Promise.all([
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
  ]);

  const totalDownloads = totals._sum.downloadCount ?? 0;
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
    <section className={styles.wrap}>
      <JsonLd data={collectionLd} />
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Recursos gratis para acelerar tu proyecto</h1>
        <p className={styles.heroSub}>
          Plantillas, checklists y guías que uso a diario. Descárgalas gratis.
        </p>

        <nav className={styles.chips} aria-label="Filtrar por categoría">
          <Link
            href="/recursos"
            className={styles.chip}
            aria-current={!activeCategory ? "page" : undefined}
          >
            Todos
          </Link>
          {RESOURCE_CATEGORIES.map((c) => (
            <Link
              key={c.value}
              href={`/recursos?categoria=${c.value}`}
              className={styles.chip}
              aria-current={activeCategory === c.value ? "page" : undefined}
            >
              {c.label}
            </Link>
          ))}
        </nav>
      </header>

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

      {totalDownloads > 0 ? (
        <p className={styles.social}>+{totalDownloads} descargas y contando 🚀</p>
      ) : null}

      <div className={styles.cta}>
        <h2 className={styles.ctaTitle}>¿Necesitas ayuda implementándolos?</h2>
        <Link href="/servicios" className={styles.ctaBtn}>
          Ver servicios
        </Link>
      </div>
    </section>
  );
}
