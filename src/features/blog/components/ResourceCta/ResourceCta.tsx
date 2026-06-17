import Link from "next/link";
import styles from "./ResourceCta.module.css";

export function ResourceCta({
  slug,
  title,
  summary,
}: {
  slug: string;
  title: string;
  summary: string;
}) {
  return (
    <aside className={styles.cta} data-track={`blog-cta-resource:${slug}`}>
      <span className={styles.kicker}>🎁 Recurso gratis</span>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.summary}>{summary}</p>
      <Link href={`/recursos/${slug}`} className={styles.btn}>
        Descargar gratis
      </Link>
    </aside>
  );
}
