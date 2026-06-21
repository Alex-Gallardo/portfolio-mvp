import Link from "next/link";
import { notFound } from "next/navigation";
import { renderMarkdown } from "@/lib/markdown";
import { mediaPublicUrl } from "@/lib/media";
import { PostContent } from "@/features/blog/components/PostContent/PostContent";
import {
  getProjectBySlug,
  getRelatedProjects,
  getPublishedProjectSlugs,
} from "@/features/projects/queries";
import { ProjectCta } from "@/features/projects/components/ProjectCta/ProjectCta";
import { ProjectCard } from "@/features/projects/components/ProjectCard/ProjectCard";
import { type ProjectListItem } from "@/features/projects/types";
import styles from "./project.module.css";
import { type Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { creativeWorkJsonLd, breadcrumbJsonLd } from "@/lib/seo";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await prisma.project.findUnique({
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
  if (!project || project.status !== "PUBLISHED") {
    return buildMetadata({ title: "Proyecto no encontrado", noIndex: true });
  }
  return buildMetadata({
    title: project.seoTitle ?? project.title,
    description: project.seoDescription ?? project.summary,
    path: `/proyectos/${slug}`,
    // image: project.ogImage ?? project.coverUrl,
    hasDynamicOgImage: true,
  });
}

export async function generateStaticParams() {
  const slugs = await getPublishedProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const breadcrumbLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Proyectos", path: "/proyectos" },
    { name: project.title, path: `/proyectos/${slug}` },
  ]);
  const projectLd = creativeWorkJsonLd({
    type: "CreativeWork",
    name: project.title,
    description: project.summary,
    path: `/proyectos/${slug}`,
    image: project.coverUrl,
  });

  const { html } = await renderMarkdown(project.content);
  const relatedRaw = await getRelatedProjects(project.id);
  const related: ProjectListItem[] = relatedRaw.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    summary: p.summary,
    coverUrl: p.coverUrl,
    stack: p.stack,
    featured: p.featured,
  }));

  return (
    <main className={styles.wrap}>
      <JsonLd data={breadcrumbLd} />
      <JsonLd data={projectLd} />
      <nav className={styles.breadcrumb} aria-label="Migas de pan">
        <Link href="/">Home</Link> / <Link href="/proyectos">Proyectos</Link> /{" "}
        <span aria-current="page">{project.title}</span>
      </nav>

      <header className={styles.header}>
        <h1 className={styles.h1}>{project.title}</h1>
        <p className={styles.summary}>{project.summary}</p>
        <div className={styles.actions}>
          {project.liveUrl ? (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.btnPrimary}
              data-track={`project-demo:${project.slug}`}
            >
              Ver demo
            </a>
          ) : null}
          {project.repoUrl ? (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.btnGhost}
              data-track={`project-repo:${project.slug}`}
            >
              Ver repo
            </a>
          ) : null}
        </div>
      </header>

      {/* Storytelling: portada sticky a la izquierda + contenido a la derecha (se apila en móvil) */}
      <section className={styles.story}>
        {project.coverUrl ? (
          <div className={styles.storyImage}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={project.coverUrl} alt={project.title} className={styles.cover} />
          </div>
        ) : null}
        <div className={styles.storyContent}>
          <PostContent html={html} />
        </div>
      </section>

      {project.stack.length > 0 ? (
        <section className={styles.tech}>
          <h2 className={styles.sectionTitle}>Tecnologías</h2>
          <ul className={styles.techList}>
            {project.stack.map((s) => (
              <li key={s} className={styles.techItem}>
                {s}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {project.images.length > 0 ? (
        <section className={styles.gallerySection}>
          <h2 className={styles.sectionTitle}>Galería</h2>
          <div className={styles.gallery}>
            {project.images.map((img) => (
              <figure key={img.id} className={styles.galleryItem}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={mediaPublicUrl(img.url)} alt={img.alt ?? ""} loading="lazy" />
                {img.caption ? (
                  <figcaption className={styles.caption}>{img.caption}</figcaption>
                ) : null}
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      <ProjectCta slug={project.slug} title={project.title} />

      {related.length > 0 ? (
        <section className={styles.related}>
          <h2 className={styles.sectionTitle}>Otros proyectos</h2>
          <div className={styles.relatedGrid}>
            {related.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
