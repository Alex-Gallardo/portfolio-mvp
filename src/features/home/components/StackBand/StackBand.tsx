import type { CSSProperties } from "react";
import styles from "./StackBand.module.css";

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
];

// Acento por card (solo visual: color del icono y del borde en hover)
const ACCENTS = ["var(--brand-500)", "var(--accent)", "var(--brand-600)", "var(--resource-1)"];

export function StackBand() {
  return (
    <section className={styles.band} aria-label="Tecnologías con las que trabajo">
      <p className={styles.label}>Trabajo con</p>
      <div className={styles.list}>
        {TECHS.map((t, i) => (
          <span
            key={t}
            className={styles.chip}
            style={{ "--chip-accent": ACCENTS[i % ACCENTS.length] } as CSSProperties}
          >
            <span className={styles.icon} aria-hidden="true">
              {t.charAt(0)}
            </span>
            {t}
          </span>
        ))}
      </div>
    </section>
  );
}
