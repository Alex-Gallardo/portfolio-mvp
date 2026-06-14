import Link from "next/link";
import type { Metadata } from "next";

import { getPublishedServices } from "@/features/services/queries";
import { getPublishedProjects } from "@/features/projects/queries";
import { getPublishedPosts } from "@/features/blog/queries";
import { getLatestResources } from "@/features/resources/queries";

import { ServiceCard } from "@/features/services/components/ServiceCard/ServiceCard";
import { ProjectCard } from "@/features/projects/components/ProjectCard/ProjectCard";
import { PostCard } from "@/features/blog/components/PostCard/PostCard";
import {
  ResourceCard,
  type ResourceCardData,
} from "@/features/resources/ResourceCard/ResourceCard";

import { type ServiceListItem } from "@/features/services/types";
import { type ProjectListItem } from "@/features/projects/types";
import { type PostListItem } from "@/features/blog/types";

import { Carousel } from "@/components/ui/Carousel/Carousel";
import { HeroHome } from "@/features/home/components/HeroHome/HeroHome";
import { AboutBrief } from "@/features/home/components/AboutBrief/AboutBrief";
import { StackBand } from "@/features/home/components/StackBand/StackBand";
import { Metrics } from "@/features/home/components/Metrics/Metrics";
import { SocialProof } from "@/features/home/components/SocialProof/SocialProof";
import { CryptoBand } from "@/features/home/components/CryptoBand/CryptoBand";
import { ClosingCta } from "@/features/home/components/ClosingCta/ClosingCta";

import styles from "./page.module.css";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Inicio",
  description:
    "Desarrollo, diseño y SEO técnico para que tu marca destaque en buscadores y en la era de la IA.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [services, projects, resourcesRaw, posts] = await Promise.all([
    getPublishedServices(),
    getPublishedProjects(),
    getLatestResources(6),
    getPublishedPosts(),
  ]);

  const serviceItems: ServiceListItem[] = services.slice(0, 4).map((s) => ({
    id: s.id,
    slug: s.slug,
    title: s.title,
    summary: s.summary,
    icon: s.icon,
    priceLabel: s.priceFrom ? `$${s.priceFrom.toString()}` : null,
    features: s.features,
  }));

  const onlyFeatured = projects.filter((p) => p.featured);
  const projectItems: ProjectListItem[] = (onlyFeatured.length ? onlyFeatured : projects).slice(
    0,
    6,
  );

  const resourceItems: ResourceCardData[] = resourcesRaw.map((r) => ({
    slug: r.slug,
    title: r.title,
    summary: r.summary,
    category: r.category,
    coverUrl: r.coverUrl,
    downloadCount: r.downloadCount,
    fileCount: r._count.files,
  }));

  const postItems: PostListItem[] = posts.slice(0, 5).map((p) => ({
    id: p.id,
    slug: p.slug,
    coverUrl: p.coverUrl,
    tags: p.tags,
    title: p.title,
    excerpt: p.excerpt,
    dateLabel: p.publishedAt
      ? new Date(p.publishedAt).toLocaleDateString("es", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "",
    readMinutes: p.readMinutes ?? 3,
  }));

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tudominio.com";
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        name: "[Tu Nombre]",
        jobTitle: "Desarrollador full-stack",
        url: siteUrl,
        sameAs: ["https://github.com/tuusuario", "https://www.linkedin.com/in/tuusuario"],
      },
      {
        "@type": "WebSite",
        name: "[Tu Marca]",
        url: siteUrl,
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/blog?buscar={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <HeroHome />
      <AboutBrief />
      <StackBand />

      {resourceItems.length > 0 ? (
        <section className={styles.section}>
          <header className={styles.head}>
            <h2 className={styles.h2}>Recursos gratis recién lanzados</h2>
            <Link href="/recursos" className={styles.seeAll} data-track="home-resources-all">
              Ver todos →
            </Link>
          </header>
          <Carousel
            ariaLabel="Recursos gratis recién lanzados"
            items={resourceItems}
            getKey={(r) => r.slug}
            renderItem={(r) => <ResourceCard resource={r} />}
          />
        </section>
      ) : null}

      {projectItems.length > 0 ? (
        <section className={styles.section}>
          <header className={styles.head}>
            <h2 className={styles.h2}>Proyectos destacados</h2>
            <Link href="/proyectos" className={styles.seeAll}>
              Ver todos →
            </Link>
          </header>
          <div className={styles.grid}>
            {projectItems.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </section>
      ) : null}

      {serviceItems.length > 0 ? (
        <section className={styles.section}>
          <header className={styles.head}>
            <h2 className={styles.h2}>Servicios</h2>
            <Link href="/servicios" className={styles.seeAll}>
              Ver todos →
            </Link>
          </header>
          <div className={styles.grid}>
            {serviceItems.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        </section>
      ) : null}

      {postItems.length > 0 ? (
        <section className={styles.section}>
          <header className={styles.head}>
            <h2 className={styles.h2}>Del blog</h2>
            <Link href="/blog" className={styles.seeAll}>
              Ver todo →
            </Link>
          </header>
          <Carousel
            ariaLabel="Artículos recientes"
            items={postItems}
            getKey={(p) => p.slug}
            renderItem={(p) => <PostCard post={p} />}
          />
        </section>
      ) : null}

      <Metrics />
      <SocialProof />
      <CryptoBand />
      <ClosingCta />
    </>
  );
}
