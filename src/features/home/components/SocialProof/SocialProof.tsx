import styles from "./SocialProof.module.css";

const REVIEWS = [
  { quote: "Entregó rapidísimo y la web vuela.", author: "Cliente 1", role: "Startup SaaS" },
  { quote: "SEO impecable, subimos en buscadores.", author: "Cliente 2", role: "E-commerce" },
  { quote: "Comunicación clara y diseño premium.", author: "Cliente 3", role: "Agencia" },
  { quote: "El portafolio capta leads solo.", author: "Cliente 4", role: "Consultor" },
];

export function SocialProof() {
  // Duplicamos la lista una vez para el loop continuo (translateX -50%).
  const items = [...REVIEWS, ...REVIEWS];
  return (
    <section className={styles.section} aria-label="Lo que dicen mis clientes">
      <h2 className={styles.h2}>Lo que dicen</h2>
      <div className={styles.viewport}>
        <ul className={styles.track} role="list">
          {items.map((r, i) => (
            <li key={i} className={styles.card} aria-hidden={i >= REVIEWS.length || undefined}>
              <p className={styles.quote}>“{r.quote}”</p>
              <p className={styles.author}>
                {r.author}
                <span className={styles.role}> · {r.role}</span>
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
