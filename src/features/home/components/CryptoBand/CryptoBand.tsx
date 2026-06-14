import Link from "next/link";
import styles from "./CryptoBand.module.css";

export function CryptoBand() {
  return (
    <section className={styles.band}>
      <div className={styles.inner}>
        <h2 className={styles.h2}>Web3 y blockchain sin fricción</h2>
        <p className={styles.sub}>Interfaces claras para un mundo complejo.</p>
        <Link href="/crypto" className={styles.btn} data-track="home-crypto">
          Explorar el universo crypto →
        </Link>
      </div>
    </section>
  );
}
