import { ContactForm } from "../ContactForm/ContactForm";
import styles from "./ContactSection.module.css";

export function ContactSection() {
  return (
    <section id="contacto" className={styles.section} aria-labelledby="contacto-title">
      <div className={styles.inner}>
        <div className={styles.intro}>
          <h2 id="contacto-title" className={styles.h2}>
            ¿Tienes una idea? Cuéntamela.
          </h2>
          <p className={styles.sub}>Dime qué necesitas y te respondo con un plan claro.</p>
        </div>
        <ContactForm />
      </div>
    </section>
  );
}
