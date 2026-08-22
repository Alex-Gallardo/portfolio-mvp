import Link from "next/link";
import { Card } from "@/components/ui/Card/Card";
import { Badge } from "@/components/ui/Badge/Badge";
import { type ProjectListItem } from "../../types";
import { isWeb3Project } from "../../web3";
import { techIconPath } from "./stack-icons";
import styles from "./ProjectCard.module.css";

export function ProjectCard({ project }: { project: ProjectListItem }) {
  // "Aplicación Web3 · Proyecto personal". Si no hay category en BD la
  // inferimos del stack, para que la tarjeta nunca se quede sin clasificación.
  const category = project.category ?? (isWeb3Project(project) ? "Aplicación Web3" : null);
  const kicker = [category, project.kind].filter(Boolean).join(" · ");

  const tags = project.stack.slice(0, 3);

  return (
    <Card interactive className={styles.card}>
      <div className={styles.frame}>
        {project.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={project.coverUrl} alt="" className={styles.cover} loading="lazy" />
        ) : (
          <div className={styles.coverPlaceholder} aria-hidden="true" />
        )}
        {project.featured ? (
          <span className={styles.featured}>
            <Badge variant="brand">Destacado</Badge>
          </span>
        ) : null}
      </div>

      <div className={styles.body}>
        {kicker ? <p className={styles.kicker}>{kicker}</p> : null}

        <h3 className={styles.title}>
          <Link
            href={`/proyectos/${project.slug}`}
            className={styles.titleLink}
            data-track={`project-card:${project.slug}`}
          >
            {project.title}
          </Link>
        </h3>

        <p className={styles.summary}>{project.summary}</p>

        {tags.length > 0 ? (
          <ul className={styles.tags}>
            {tags.map((tag) => {
              const path = techIconPath(tag);
              return (
                <li key={tag} className={styles.tag}>
                  {path ? (
                    <svg className={styles.tagIcon} viewBox="0 0 24 24" aria-hidden="true">
                      <path d={path} fill="currentColor" />
                    </svg>
                  ) : null}
                  {tag}
                </li>
              );
            })}
          </ul>
        ) : null}

        <div className={styles.actions}>
          {/* Duplica visualmente el enlace del título. <span> + aria-hidden para
              no crear una segunda parada de tabulación por tarjeta. */}
          <span className={styles.cta} aria-hidden="true">
            Ver proyecto
            <svg className={styles.arrow} viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="M2.5 8h11m0 0-4-4m4 4-4 4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>

          {project.repoUrl ? (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noreferrer"
              className={styles.ghost}
              aria-label={`Ver el código de ${project.title} en GitHub`}
              data-track={`project-card-repo:${project.slug}`}
            >
              <svg className={styles.ghostIcon} viewBox="0 0 16 16" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.4 7.4 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
                />
              </svg>
              GitHub
            </a>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
