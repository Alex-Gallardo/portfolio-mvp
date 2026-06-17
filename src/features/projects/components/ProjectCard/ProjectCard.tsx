import Link from "next/link";
import { Card } from "@/components/ui/Card/Card";
import { Badge } from "@/components/ui/Badge/Badge";
import { type ProjectListItem } from "../../types";
import styles from "./ProjectCard.module.css";

export function ProjectCard({ project }: { project: ProjectListItem }) {
  return (
    <Link
      href={`/proyectos/${project.slug}`}
      className={styles.link}
      data-track={`project-card:${project.slug}`}
    >
      <Card interactive className={styles.card}>
        {project.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={project.coverUrl} alt="" className={styles.cover} loading="lazy" />
        ) : (
          <div className={styles.coverPlaceholder} aria-hidden="true" />
        )}
        <div className={styles.body}>
          {project.featured ? <Badge variant="brand">Destacado</Badge> : null}
          <h3 className={styles.title}>{project.title}</h3>
          <p className={styles.summary}>{project.summary}</p>
          {project.stack.length > 0 ? (
            <div className={styles.tags}>
              {project.stack.slice(0, 4).map((s) => (
                <Badge key={s} variant="default">
                  {s}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
      </Card>
    </Link>
  );
}
