import Link from "next/link";
import styles from "./ClosingCta.module.css";

export function ClosingCta() {
  return (
    <section className={styles.band}>
      <div className={styles.inner}>
        <h2 className={styles.h2}>¿Tienes una idea? Cuéntamela.</h2>
        <p className={styles.sub}>Dime qué necesitas y te respondo con un plan claro.</p>
        <Link href="/#contacto" className={styles.btn} data-track="home-closing-cta">
          Hablemos de tu proyecto
        </Link>
      </div>
    </section>
  );
}
