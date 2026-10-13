import Link from "next/link";

import { CryptoBandArt } from "./CryptoBandArt";
import { PauseOffscreen } from "./PauseOffscreen";
import styles from "./CryptoBand.module.css";

const CHIPS = ["dApps", "Wallets", "Smart contracts"];

/**
 * Banda de la home que lleva a /crypto. Superficie con degradado (lenguaje
 * glass de la home) + objetos 3D clay en bucle (lenguaje de /crypto): hace
 * de puente visual entre ambas páginas.
 */
export function CryptoBand() {
  return (
    <section className={styles.band} aria-labelledby="home-crypto-title">
      <PauseOffscreen />
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>
            <span className={styles.dot} aria-hidden="true" />
            Web3 · Blockchain
          </p>
          <h2 id="home-crypto-title" className={styles.h2}>
            Web3 y blockchain <span className={styles.highlight}>sin fricción</span>
          </h2>
          <p className={styles.sub}>Interfaces claras para un mundo complejo.</p>
          <ul className={styles.chips} aria-label="Especialidades Web3">
            {CHIPS.map((chip) => (
              <li key={chip} className={styles.chip}>
                {chip}
              </li>
            ))}
          </ul>
          <Link href="/crypto" className={styles.btn} data-track="home-crypto">
            Explorar el universo crypto
            <svg className={styles.arrow} viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>

        <div className={styles.art} aria-hidden="true">
          <CryptoBandArt />
        </div>
      </div>
    </section>
  );
}
