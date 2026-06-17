import { getPublishedProjects } from "@/features/projects/queries";
import { ProjectCard } from "@/features/projects/components/ProjectCard/ProjectCard";
import { type ProjectListItem } from "@/features/projects/types";
import styles from "./proyectos.module.css";

export const revalidate = 3600;

export default async function ProjectsPage() {
  const projects = await getPublishedProjects();
  const items: ProjectListItem[] = projects.map((p) => ({
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
      <header className={styles.hero}>
        <h1 className={styles.h1}>Proyectos</h1>
        <p className={styles.sub}>Una selección de trabajos recientes.</p>
      </header>

      {items.length === 0 ? (
        <p className={styles.empty}>Pronto subiré nuevos proyectos.</p>
      ) : (
        <div className={styles.grid}>
          {items.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </main>
  );
}
