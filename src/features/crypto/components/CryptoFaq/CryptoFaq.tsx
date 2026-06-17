import { CRYPTO_FAQ } from "../../faq";
import styles from "./CryptoFaq.module.css";

export function CryptoFaq() {
  return (
    <section className={styles.section} aria-label="Preguntas frecuentes">
      <h2 className={styles.h2}>Preguntas frecuentes</h2>
      <div className={styles.list}>
        {CRYPTO_FAQ.map((item) => (
          <details key={item.question} className={styles.item}>
            <summary className={styles.summary}>
              <span>{item.question}</span>
              <span className={styles.marker} aria-hidden="true" />
            </summary>
            <p className={styles.answer}>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
