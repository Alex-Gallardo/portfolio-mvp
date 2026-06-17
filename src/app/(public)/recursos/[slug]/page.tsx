import { notFound } from "next/navigation";
import { type Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import {
  ResourceCard,
  type ResourceCardData,
} from "@/features/resources/ResourceCard/ResourceCard";
import { DownloadButton } from "@/features/resources/DownloadButton";
import { CATEGORY_LABELS } from "@/features/resources/categories";
import { JsonLd } from "@/components/seo/JsonLd";
import { type ResourceCategory } from "@prisma/client";
import styles from "./detalle.module.css";
import { buildMetadata } from "@/lib/seo";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const resource = await prisma.resource.findUnique({
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
  });
  if (!resource || resource.status !== "PUBLISHED") {
    return buildMetadata({ title: "Recurso no encontrado", noIndex: true });
  }
  return buildMetadata({
    title: resource.seoTitle ?? resource.title,
    description: resource.seoDescription ?? resource.summary,
    path: `/recursos/${slug}`,
    image: resource.ogImage ?? resource.coverUrl,
  });
}

type RelatedSource = {
  slug: string;
  title: string;
  summary: string;
  category: ResourceCategory;
  coverUrl: string | null;
  downloadCount: number;
  _count: { files: number };
};

export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resource = await prisma.resource.findUnique({
    where: { slug },
    include: { files: { orderBy: { order: "asc" } } },
  });
  if (!resource || resource.status !== "PUBLISHED") notFound();

  const related = await prisma.resource.findMany({
    where: { status: "PUBLISHED", category: resource.category, slug: { not: resource.slug } },
    orderBy: { order: "asc" },
    take: 3,
    include: { _count: { select: { files: true } } },
  });

  const relatedCards: ResourceCardData[] = (related as RelatedSource[]).map((r) => ({
    slug: r.slug,
    title: r.title,
    summary: r.summary,
    category: r.category,
    coverUrl: r.coverUrl,
    downloadCount: r.downloadCount,
    fileCount: r._count.files,
  }));

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
    <article className={styles.wrap}>
      <JsonLd data={breadcrumbLd} />
      <JsonLd data={resourceLd} />

      <nav className={styles.breadcrumb} aria-label="Migas de pan">
        <Link href="/">Inicio</Link> / <Link href="/recursos">Recursos</Link> /{" "}
        <span aria-current="page">{resource.title}</span>
      </nav>

      <header className={styles.hero}>
        <span className={styles.badge}>{CATEGORY_LABELS[resource.category]}</span>
        <h1 className={styles.title}>{resource.title}</h1>
        <p className={styles.summary}>{resource.summary}</p>
      </header>

      {resource.coverUrl ? (
        <div className={styles.coverWrap}>
          <Image
            src={resource.coverUrl}
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 720px"
            className={styles.cover}
            priority
          />
        </div>
      ) : null}

      <div className={styles.content}>
        {resource.content
          .split("\n")
          .map((line, i) => (line.trim() ? <p key={i}>{line}</p> : null))}
      </div>

      <section className={styles.downloadBlock}>
        <h2 className={styles.blockTitle}>Qué incluye</h2>
        <ul className={styles.fileList}>
          {resource.files.map((f) => (
            <li key={f.id} className={styles.fileItem}>
              <span className={styles.fileLabel}>{f.label}</span>
              <DownloadButton
                resourceSlug={resource.slug}
                resourceTitle={resource.title}
                fileId={f.id}
                label="Descargar gratis"
                className={styles.fileBtn}
              />
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.upsell}>
        <h2 className={styles.blockTitle}>¿Quieres que lo implemente por ti?</h2>
        <Link href="/servicios" className={styles.upsellBtn}>
          Ver servicios
        </Link>
      </section>

      {relatedCards.length > 0 ? (
        <section className={styles.related}>
          <h2 className={styles.blockTitle}>Recursos relacionados</h2>
          <div className={styles.relatedGrid}>
            {relatedCards.map((r) => (
              <ResourceCard key={r.slug} resource={r} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
