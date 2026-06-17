import Link from "next/link";
import styles from "./ProjectCta.module.css";

export function ProjectCta({ slug, title }: { slug: string; title: string }) {
  return (
    <aside className={styles.cta}>
      <h2 className={styles.title}>¿Te gustó {title}?</h2>
      <p className={styles.sub}>Puedo construir algo así (o mejor) para ti.</p>
      <Link href="/#contacto" className={styles.btn} data-track={`project-similar:${slug}`}>
        Hacer algo similar
      </Link>
    </aside>
  );
}
