"use client";

import { useMemo, useState } from "react";
import { ProjectCard } from "@/features/projects/components/ProjectCard/ProjectCard";
import { type ProjectListItem } from "@/features/projects/types";
import styles from "./Web3Projects.module.css";

export function Web3Projects({ projects }: { projects: ProjectListItem[] }) {
  const [filter, setFilter] = useState<string | null>(null);

  const tags = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => p.stack.forEach((s) => set.add(s)));
    return Array.from(set).sort();
  }, [projects]);

  const visible = filter ? projects.filter((p) => p.stack.includes(filter)) : projects;

  if (projects.length === 0) return null;

  return (
    <section className={styles.section} aria-label="Proyectos Web3">
      <h2 className={styles.h2}>Proyectos Web3</h2>

      <div className={styles.chips} role="group" aria-label="Filtrar por tecnología">
        <button
          type="button"
          className={`${styles.chip} ${filter === null ? styles.chipActive : ""}`}
          aria-pressed={filter === null}
          onClick={() => setFilter(null)}
        >
          Todos
        </button>
        {tags.map((t) => (
          <button
            key={t}
            type="button"
            className={`${styles.chip} ${filter === t ? styles.chipActive : ""}`}
            aria-pressed={filter === t}
            onClick={() => setFilter(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className={styles.empty}>No hay proyectos con esa tecnología todavía.</p>
      ) : (
        <div className={styles.grid}>
          {visible.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </section>
  );
}
