import Link from "next/link";
import type { Metadata } from "next";

import { getPublishedPosts } from "@/features/blog/queries";
import { getPublishedProjects } from "@/features/projects/queries";
import { getLatestResources } from "@/features/resources/queries";

import { PostCard } from "@/features/blog/components/PostCard/PostCard";
import { ProjectCard } from "@/features/projects/components/ProjectCard/ProjectCard";
import {
  ResourceCard,
  type ResourceCardData,
} from "@/features/resources/ResourceCard/ResourceCard";
import { Carousel } from "@/components/ui/Carousel/Carousel";

import { type PostListItem } from "@/features/blog/types";
import { type ProjectListItem } from "@/features/projects/types";

import { AboutHero } from "@/features/about/components/AboutHero/AboutHero";
import { Timeline } from "@/features/about/components/Timeline/Timeline";
import { Skills } from "@/features/about/components/Skills/Skills";
import { TechMarquee } from "@/features/about/components/TechMarquee/TechMarquee";
import { Values } from "@/features/about/components/Values/Values";
import { WorkMethod } from "@/features/about/components/WorkMethod/WorkMethod";
import { Achievements } from "@/features/about/components/Achievements/Achievements";

import styles from "./about.module.css";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Sobre mí",
  description: "Dev full-stack enfocado en performance, experiencia y conversión.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const [resourcesRaw, posts, projects] = await Promise.all([
    getLatestResources(6),
    getPublishedPosts(),
    getPublishedProjects(),
  ]);

  const resourceItems: ResourceCardData[] = resourcesRaw.map((r) => ({
    slug: r.slug,
    title: r.title,
    summary: r.summary,
    category: r.category,
    coverUrl: r.coverUrl,
    downloadCount: r.downloadCount,
    fileCount: r._count.files,
  }));

  const postItems: PostListItem[] = posts.slice(0, 3).map((p) => ({
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

  const projectItems: ProjectListItem[] = projects.slice(0, 3);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tudominio.com";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "[Tu Nombre]",
    jobTitle: "Desarrollador full-stack",
    description: "Dev full-stack enfocado en performance, experiencia y conversión.",
    url: `${siteUrl}/about`,
    sameAs: [
      "https://github.com/tuusuario",
      "https://www.linkedin.com/in/tuusuario",
      "https://x.com/tuusuario",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <AboutHero />
      <Timeline />
      <Skills />
      <TechMarquee />
      <Values />
      <WorkMethod />
      <Achievements />

      {resourceItems.length > 0 ? (
        <section className={styles.section}>
          <header className={styles.head}>
            <h2 className={styles.h2}>Recursos gratis recién lanzados</h2>
            <Link href="/recursos" className={styles.seeAll} data-track="about-resources-all">
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

      {postItems.length > 0 ? (
        <section className={styles.section}>
          <header className={styles.head}>
            <h2 className={styles.h2}>Últimos artículos</h2>
            <Link href="/blog" className={styles.seeAll}>
              Ver todo →
            </Link>
          </header>
          <div className={styles.grid}>
            {postItems.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      ) : null}

      {projectItems.length > 0 ? (
        <section className={styles.section}>
          <header className={styles.head}>
            <h2 className={styles.h2}>Últimos proyectos</h2>
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
    </>
  );
}
