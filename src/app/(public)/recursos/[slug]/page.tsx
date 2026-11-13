import { notFound } from "next/navigation";
import { type Metadata } from "next";
import Link from "next/link";
import { type ResourceCategory } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { withPublicDatabaseFallback } from "@/lib/prisma-fallback";
import { renderMarkdown } from "@/lib/markdown";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  ResourceCard,
  type ResourceCardData,
} from "@/features/resources/ResourceCard/ResourceCard";
import { CATEGORY_LABELS } from "@/features/resources/categories";
import { CellarBackdrop } from "@/features/resources/CellarBackdrop/CellarBackdrop";
import { fileTypesOf, formatBytes } from "@/features/resources/catalog/params";
import { Glyph } from "@/features/resources/catalog/icons";
import { fileKind, fillRelated } from "@/features/resources/detail/files";
import { FileInventory } from "@/features/resources/detail/FileInventory";
import { ShareButton } from "@/features/resources/detail/ShareButton";
import { Showcase } from "@/features/resources/detail/Showcase";
import { PixelSprite, UI_SPRITES } from "@/features/resources/detail/sprites";
import { pixelFont } from "@/features/resources/pixelFont";
import styles from "./detalle.module.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const NEW_WINDOW_DAYS = 21;
const numberFmt = new Intl.NumberFormat("es-GT");

/** Server Component: la fecha se evalúa en el servidor, sin riesgo de hidratación. */
function isRecent(date: Date): boolean {
  return Date.now() - date.getTime() < NEW_WINDOW_DAYS * 86_400_000;
}

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const resource = await withPublicDatabaseFallback(
    () =>
      prisma.resource.findUnique({
        where: { slug },
        select: {
          title: true,
          summary: true,
          coverUrl: true,
          status: true,
          seoTitle: true,
          seoDescription: true,
          ogImage: true,
        },
      }),
    null,
  );
  if (!resource || resource.status !== "PUBLISHED") {
    return buildMetadata({ title: "Recurso no encontrado", noIndex: true });
  }
  return buildMetadata({
    title: resource.seoTitle ?? resource.title,
    description: resource.seoDescription ?? resource.summary,
    path: `/recursos/${slug}`,
    hasDynamicOgImage: true,
  });
}

type RelatedSource = {
  slug: string;
  title: string;
  summary: string;
  category: ResourceCategory;
  coverUrl: string | null;
  downloadCount: number;
  createdAt: Date;
  files: { fileName: string; mimeType: string | null; sizeBytes: number | null }[];
};

const RELATED_SELECT = {
  slug: true,
  title: true,
  summary: true,
  category: true,
  coverUrl: true,
  downloadCount: true,
  createdAt: true,
  files: { select: { fileName: true, mimeType: true, sizeBytes: true } },
} as const;

function toCard(r: RelatedSource): ResourceCardData {
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

export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resource = await withPublicDatabaseFallback(
    () =>
      prisma.resource.findUnique({
        where: { slug },
        include: { files: { orderBy: { order: "asc" } } },
      }),
    null,
  );
  if (!resource || resource.status !== "PUBLISHED") notFound();

  // Relacionados: misma categoría primero; si faltan, el resto de la tienda.
  const [sameCategory, others, rendered] = await Promise.all([
    withPublicDatabaseFallback(
      () =>
        prisma.resource.findMany({
          where: { status: "PUBLISHED", category: resource.category, slug: { not: slug } },
          orderBy: [{ order: "asc" }, { createdAt: "desc" }],
          take: 3,
          select: RELATED_SELECT,
        }),
      [],
    ),
    withPublicDatabaseFallback(
      () =>
        prisma.resource.findMany({
          where: { status: "PUBLISHED", slug: { not: slug } },
          orderBy: [{ downloadCount: "desc" }, { createdAt: "desc" }],
          take: 6,
          select: RELATED_SELECT,
        }),
      [],
    ),
    renderMarkdown(resource.content),
  ]);
  const related = fillRelated(sameCategory as RelatedSource[], others as RelatedSource[], slug);

  const categoryLabel = CATEGORY_LABELS[resource.category];
  const isNew = isRecent(resource.createdAt);
  const formats = fileTypesOf(resource.files);
  const totalSize = formatBytes(resource.files.reduce((sum, f) => sum + (f.sizeBytes ?? 0), 0));
  const firstFile = resource.files[0];
  const fallbackKind = firstFile ? fileKind(firstFile.fileName, firstFile.mimeType) : "file";

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Recursos", item: `${SITE_URL}/recursos` },
      {
        "@type": "ListItem",
        position: 3,
        name: resource.title,
        item: `${SITE_URL}/recursos/${resource.slug}`,
      },
    ],
  };

  const resourceLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: resource.title,
    description: resource.summary,
    url: `${SITE_URL}/recursos/${resource.slug}`,
    ...(resource.coverUrl ? { image: resource.coverUrl } : {}),
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: 0,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <div className={`${styles.page} ${pixelFont.variable}`}>
      <JsonLd data={breadcrumbLd} />
      <JsonLd data={resourceLd} />

      <CellarBackdrop>
        <article className={styles.wrap}>
          <nav className={styles.breadcrumb} aria-label="Migas de pan">
            <Link href="/">Inicio</Link>
            <span aria-hidden="true">›</span>
            <Link href="/recursos">Recursos</Link>
            <span aria-hidden="true">›</span>
            <span aria-current="page">{resource.title}</span>
          </nav>

          {/* ---- La pieza y su ficha ---- */}
          <div className={styles.top}>
            <div className={styles.showcase}>
              <Showcase
                title={resource.title}
                coverUrl={resource.coverUrl}
                fallbackKind={fallbackKind}
                categoryLabel={categoryLabel}
                isNew={isNew}
              />
            </div>

            <div className={styles.panel}>
              <span className={styles.panelBg} aria-hidden="true" />
              <header className={styles.header}>
                <p className={styles.eyebrow}>
                  <Glyph name={resource.category} size={12} />
                  {categoryLabel}
                  {isNew ? <span className={styles.newTag}>Nuevo</span> : null}
                </p>
                <h1 className={styles.title}>{resource.title}</h1>
                <p className={styles.summary}>{resource.summary}</p>
              </header>

              {/* Stats de la pieza */}
              <dl className={styles.stats}>
                {formats.length > 0 ? (
                  <div className={styles.stat}>
                    <dt>Formato</dt>
                    <dd className={styles.formats}>
                      {formats.slice(0, 3).map((f) => (
                        <span key={f} className={styles.format}>
                          {f}
                        </span>
                      ))}
                    </dd>
                  </div>
                ) : null}
                <div className={styles.stat}>
                  <dt>Archivos</dt>
                  <dd>×{resource.files.length}</dd>
                </div>
                {totalSize ? (
                  <div className={styles.stat}>
                    <dt>Peso</dt>
                    <dd>{totalSize}</dd>
                  </div>
                ) : null}
                <div className={styles.stat}>
                  <dt>Descargas</dt>
                  <dd className={styles.downloads}>
                    <PixelSprite sprite={UI_SPRITES.download} scale={1.5} />
                    {numberFmt.format(resource.downloadCount)}
                  </dd>
                </div>
              </dl>

              <FileInventory
                resourceSlug={resource.slug}
                resourceTitle={resource.title}
                files={resource.files}
              />

              <div className={styles.secondary}>
                <ShareButton title={resource.title} />
                <Link href="/recursos#catalogo" className={styles.back}>
                  <PixelSprite sprite={UI_SPRITES.back} />
                  Volver a la tienda
                </Link>
              </div>
            </div>
          </div>

          {/* ---- El pergamino: descripción larga ---- */}
          {rendered.html.trim() ? (
            <section className={styles.scroll} aria-labelledby="scroll-title">
              <span className={styles.scrollBg} aria-hidden="true" />
              <h2 id="scroll-title" className={styles.heading}>
                Sobre este recurso
              </h2>
              <div className={styles.prose} dangerouslySetInnerHTML={{ __html: rendered.html }} />
            </section>
          ) : null}

          {/* ---- Taller de encargos ---- */}
          <section className={styles.upsell} aria-labelledby="upsell-title">
            <span className={styles.upsellBg} aria-hidden="true" />
            <span className={styles.upsellIcon} aria-hidden="true">
              <PixelSprite sprite={UI_SPRITES.hammer} scale={4} />
            </span>
            <div className={styles.upsellText}>
              <p className={styles.eyebrow}>Taller de encargos</p>
              <h2 id="upsell-title" className={styles.upsellTitle}>
                ¿Quieres que lo implemente por ti?
              </h2>
              <p className={styles.upsellSub}>
                Si prefieres no hacerlo solo, lo forjamos juntos a tu medida.
              </p>
            </div>
            <Link href="/servicios" className={styles.upsellBtn} data-track="recurso-upsell">
              Pedir un encargo
            </Link>
          </section>

          {/* ---- Más de la tienda ---- */}
          {related.length > 0 ? (
            <section className={styles.related} aria-labelledby="related-title">
              <header className={styles.relatedHead}>
                <h2 id="related-title" className={styles.heading}>
                  {related.every((r) => r.category === resource.category)
                    ? `Más de ${categoryLabel}`
                    : "Más de la tienda"}
                </h2>
                <Link href="/recursos#catalogo" className={styles.seeAll}>
                  Ver todo
                  <PixelSprite sprite={UI_SPRITES.back} className={styles.seeAllIcon} />
                </Link>
              </header>
              <div className={styles.relatedGrid}>
                {related.map((r, i) => (
                  <div
                    key={r.slug}
                    className={styles.relatedItem}
                    style={{ "--i": i } as React.CSSProperties}
                  >
                    <ResourceCard resource={toCard(r)} />
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </article>
      </CellarBackdrop>
    </div>
  );
}
