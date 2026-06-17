import styles from "./TechMarquee.module.css";

const TECHS = [
  "Next.js",
  "TypeScript",
  "React",
  "Prisma",
  "PostgreSQL",
  "Supabase",
  "Node.js",
  "CSS",
  "Vercel",
  "Solidity",
  "Figma",
  "Vitest",
];

export function TechMarquee() {
  const items = [...TECHS, ...TECHS];
  return (
    <section className={styles.section} aria-label="Tecnologías del día a día">
      <h2 className={styles.h2}>Tecnologías del día a día</h2>
      <div className={styles.viewport}>
        <ul className={styles.track} role="list">
          {items.map((t, i) => (
            <li key={i} className={styles.chip} aria-hidden={i >= TECHS.length || undefined}>
              {t}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
