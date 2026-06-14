import styles from "./Timeline.module.css";

const MILESTONES = [
  {
    year: "2021",
    title: "Primeros pasos",
    text: "Empecé con HTML, CSS y JavaScript construyendo sitios pequeños.",
  },
  { year: "2022", title: "Full-stack", text: "Me especialicé en React, Next.js y bases de datos." },
  {
    year: "2023",
    title: "Performance & SEO",
    text: "Foco en Core Web Vitals, accesibilidad y posicionamiento.",
  },
  {
    year: "2024",
    title: "Web3 & producto",
    text: "Interfaces para blockchain y productos orientados a conversión.",
  },
];

export function Timeline() {
  return (
    <section className={styles.section} aria-label="Trayectoria">
      <h2 className={styles.h2}>Mi trayectoria</h2>
      <ol className={styles.list}>
        {MILESTONES.map((m) => (
          <li key={m.year} className={styles.item}>
            <span className={styles.year}>{m.year}</span>
            <div className={styles.content}>
              <h3 className={styles.title}>{m.title}</h3>
              <p className={styles.text}>{m.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
