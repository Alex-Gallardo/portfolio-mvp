import Link from "next/link";
import styles from "./HeroHome.module.css";

export function HeroHome() {
  return (
    <section className={styles.hero}>
      <div className={`${styles.inner} u-fade-up`}>
        <h1 className={styles.title}>
          Construyo experiencias web rápidas que posicionan y convierten.
        </h1>
        <p className={styles.sub}>
          Desarrollo, diseño y SEO técnico para que tu marca destaque en buscadores y en la era de
          la IA.
        </p>
        <div className={styles.actions}>
          <Link href="/#contacto" className={styles.primary} data-track="home-hero-primary">
            Hablemos de tu proyecto
          </Link>
          <Link href="/recursos" className={styles.secondary} data-track="home-hero-resources">
            Ver recursos gratis
          </Link>
        </div>
      </div>
    </section>
  );
}
