import styles from "./SocialProof.module.css";

type Review = {
  quote: string;
  author: string;
  role: string;
  /** 1–5. Si se omite, se asume 5. */
  rating?: number;
};

const REVIEWS: Review[] = [
  {
    quote: "Entregó rapidísimo y la web vuela.",
    author: "Cliente 1",
    role: "Startup SaaS",
    rating: 5,
  },
  {
    quote: "SEO impecable, subimos en buscadores.",
    author: "Cliente 2",
    role: "E-commerce",
    rating: 5,
  },
  {
    quote: "Comunicación clara y diseño premium.",
    author: "Cliente 3",
    role: "Agencia",
    rating: 5,
  },
  { quote: "El portafolio capta leads solo.", author: "Cliente 4", role: "Consultor", rating: 5 },
];

/** Repeticiones del set para el loop continuo. El keyframe asume exactamente 2. */
const REPEATS = 2;

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0] ?? "")
    .join("")
    .toUpperCase();
}

function Stars({ value }: { value: number }) {
  const safe = Math.max(0, Math.min(5, Math.round(value)));
  return (
    <div className={styles.stars} role="img" aria-label={`${safe} de 5 estrellas`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={i < safe ? styles.star : styles.starMuted}
          viewBox="0 0 20 20"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M10 1.6l2.6 5.28 5.83.85-4.22 4.11 1 5.81L10 14.9l-5.21 2.75 1-5.81-4.22-4.11 5.83-.85z" />
        </svg>
      ))}
    </div>
  );
}

export function SocialProof() {
  const items = Array.from({ length: REPEATS }).flatMap(() => REVIEWS);

  return (
    <section className={styles.section} aria-labelledby="social-proof-title">
      <header className={styles.header}>
        <p className={styles.eyebrow}>
          <span className={styles.dot} aria-hidden="true" />
          Prueba social
        </p>
        <h2 id="social-proof-title" className={styles.h2}>
          Lo que dicen
        </h2>
        <p className={styles.sub}>
          Proyectos entregados, resultados medibles y una forma de trabajar clara de principio a
          fin.
        </p>
      </header>

      <div className={styles.viewport}>
        <ul className={styles.track} role="list">
          {items.map((r, i) => (
            <li key={i} className={styles.item} aria-hidden={i >= REVIEWS.length || undefined}>
              <figure className={styles.card}>
                <Stars value={r.rating ?? 5} />
                <blockquote className={styles.quote}>
                  <p>“{r.quote}”</p>
                </blockquote>
                <figcaption className={styles.author}>
                  <span className={styles.avatar} aria-hidden="true">
                    {getInitials(r.author)}
                  </span>
                  <span className={styles.meta}>
                    <span className={styles.name}>{r.author}</span>
                    <span className={styles.role}>{r.role}</span>
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
