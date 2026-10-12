import Link from "next/link";
import { siEthereum, siSolidity, siWagmi, siWalletconnect } from "simple-icons";

import { CryptoScene } from "./CryptoScene";
import { splitTitle } from "./title";
import styles from "./CryptoHero.module.css";

interface CryptoHeroProps {
  /** Admite `*marca*` para elegir la palabra resaltada (si no, la última). */
  title?: string;
  subtitle?: string;
}

const DEFAULT_TITLE = "Web3 y blockchain sin *fricción*";
const DEFAULT_SUBTITLE = "Interfaces claras para un mundo complejo.";

const STACK = [
  { label: "Ethereum", path: siEthereum.path },
  { label: "Solidity", path: siSolidity.path },
  { label: "wagmi", path: siWagmi.path },
  { label: "WalletConnect", path: siWalletconnect.path },
];

export function CryptoHero({ title, subtitle }: CryptoHeroProps) {
  const { before, highlight, after } = splitTitle(title ?? DEFAULT_TITLE);

  return (
    <section className={styles.hero} aria-labelledby="crypto-hero-title">
      {/* Capas decorativas CSS: retícula hexagonal "ledger", haz de escaneo y focos */}
      <div className={styles.backdrop} aria-hidden="true">
        <div className={styles.grid} />
        <div className={styles.beam} />
      </div>

      {/* Objetos 3D flotantes (three.js, carga diferida) */}
      <CryptoScene />

      <div className={styles.inner} data-hero-text>
        <p className={styles.eyebrow}>
          <span className={styles.live} aria-hidden="true" />
          Web3 · Blockchain · Smart contracts
        </p>

        <h1 id="crypto-hero-title" className={styles.title}>
          {before}
          {highlight && <span className={styles.highlight}>{highlight}</span>}
          {after}
        </h1>

        <p className={styles.sub}>{subtitle ?? DEFAULT_SUBTITLE}</p>

        <div className={styles.actions}>
          <Link href="/#contacto" className={styles.primary} data-track="crypto-hero-primary">
            <span>Hablemos de tu dApp</span>
            <svg className={styles.arrow} viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
          <Link
            href="/recursos?categoria=BLOCKCHAIN"
            className={styles.secondary}
            data-track="crypto-hero-resources"
          >
            <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
            </svg>
            <span>Recursos crypto gratis</span>
          </Link>
        </div>

        <div className={styles.stackRow}>
          <span className={styles.stackLabel}>Stack on-chain</span>
          <ul className={styles.stack}>
            {STACK.map((tech) => (
              <li key={tech.label} className={styles.chip}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d={tech.path} />
                </svg>
                {tech.label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.scrollCue} aria-hidden="true">
        <span />
      </div>
    </section>
  );
}
