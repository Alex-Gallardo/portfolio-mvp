import Link from "next/link";
import styles from "./CryptoHero.module.css";

interface CryptoHeroProps {
  title?: string;
  subtitle?: string;
}

export function CryptoHero({ title, subtitle }: CryptoHeroProps) {
  return (
    <section className={styles.hero}>
      <div className={`${styles.inner} u-fade-up`}>
        <span className={styles.eyebrow}>Web3 · Blockchain</span>
        <h1 className={styles.title}>{title ?? "Web3 y blockchain sin fricción"}</h1>
        <p className={styles.sub}>{subtitle ?? "Interfaces claras para un mundo complejo."}</p>
        <div className={styles.actions}>
          <Link href="/#contacto" className={styles.primary} data-track="crypto-hero-primary">
            Hablemos de tu dApp
          </Link>
          <Link
            href="/recursos?categoria=BLOCKCHAIN"
            className={styles.secondary}
            data-track="crypto-hero-resources"
          >
            Recursos crypto gratis
          </Link>
        </div>
      </div>
    </section>
  );
}
