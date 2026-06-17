import Link from "next/link";
import styles from "./CryptoCta.module.css";

export function CryptoCta() {
  return (
    <section className={styles.band}>
      <div className={styles.inner}>
        <h2 className={styles.h2}>¿Tienes una idea Web3?</h2>
        <p className={styles.sub}>Convirtámosla en un producto claro y usable.</p>
        <div className={styles.actions}>
          <Link href="/#contacto" className={styles.primary} data-track="crypto-cta-contact">
            Hablemos
          </Link>
          <Link
            href="/recursos?categoria=BLOCKCHAIN"
            className={styles.ghost}
            data-track="crypto-cta-resources"
          >
            Ver recursos crypto
          </Link>
        </div>
      </div>
    </section>
  );
}
