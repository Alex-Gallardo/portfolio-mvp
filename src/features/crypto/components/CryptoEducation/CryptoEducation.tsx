import { EDUCATION_CARDS, cardNumber } from "@/features/crypto/education";

import { EducationGrid } from "./EducationGrid";
import { EducationArt, EducationDecor } from "./illustrations";
import styles from "./CryptoEducation.module.css";

/**
 * "Web3, explicado simple": Bento Grid claymorphism con ilustraciones 3D
 * en bucle (CSS). Se renderiza en el servidor; solo la inclinación con el
 * puntero y la pausa fuera de pantalla viven en EducationGrid (cliente).
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
          <EducationGrid className={styles.grid}>
            {EDUCATION_CARDS.map((card, i) => (
              <li
                key={card.key}
                className={`${styles.tile} ${styles[card.size] ?? ""} ${styles[card.key] ?? ""}`}
                data-tilt
              >
                <div className={styles.art} aria-hidden="true">
                  <EducationArt kind={card.key} />
                </div>
                <div className={styles.body}>
                  <span className={styles.num}>
                    <span className={styles.numValue}>{cardNumber(i)}</span>
                    {card.tag}
                  </span>
                  <h3 className={styles.title}>{card.title}</h3>
                  <p className={styles.text}>{card.text}</p>
                  {card.points && (
                    <ul className={styles.points}>
                      {card.points.map((point) => (
                        <li key={point} className={styles.point}>
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M5 12.5l4.2 4.2L19 7" />
                          </svg>
                          {point}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <span className={styles.glare} aria-hidden="true" />
              </li>
            ))}
          </EducationGrid>
        </div>
      </div>
    </section>
  );
}
