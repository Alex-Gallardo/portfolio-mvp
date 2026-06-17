import Link from "next/link";
import styles from "./ServiceCta.module.css";

export function ServiceCta({ slug, title }: { slug: string; title: string }) {
  return (
    <aside className={styles.cta}>
      <h2 className={styles.title}>¿Te interesa {title}?</h2>
      <p className={styles.sub}>Cuéntame tu proyecto y te respondo con una propuesta.</p>
      <Link href="/#contacto" className={styles.btn} data-track={`service-request:${slug}`}>
        Solicitar este servicio
      </Link>
    </aside>
  );
}
