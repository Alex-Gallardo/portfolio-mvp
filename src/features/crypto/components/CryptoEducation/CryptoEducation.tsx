import { EDUCATION_CARDS } from "@/features/crypto/education";

import { EducationScroll } from "./EducationScroll";
import { EducationArt, EducationDecor } from "./illustrations";
import styles from "./CryptoEducation.module.css";

/**
 * "Web3, explicado simple": tarjetas claymorphism con ilustraciones 3D en
 * bucle (CSS) y scroll sticky en desktop. Las ilustraciones se renderizan
 * aquí (servidor) y EducationScroll (cliente) solo decide cuál está activa.
 */
export function CryptoEducation() {
  return (
    <section className={styles.section} aria-labelledby="crypto-education-title">
      <div className={styles.container}>
        <header className={styles.head}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDot} aria-hidden="true" />
            Web3 101
          </p>
          <h2 id="crypto-education-title" className={styles.h2}>
            Web3, explicado <span className={styles.highlight}>simple</span>
          </h2>
          <p className={styles.sub}>
            Cinco ideas clave para entender la web descentralizada, sin tecnicismos.
          </p>
        </header>

        <div className={styles.stageWrap}>
          <EducationDecor />
          <EducationScroll
            cards={EDUCATION_CARDS}
            arts={EDUCATION_CARDS.map((card) => (
              <EducationArt key={card.key} kind={card.key} />
            ))}
          />
        </div>
      </div>
    </section>
  );
}
