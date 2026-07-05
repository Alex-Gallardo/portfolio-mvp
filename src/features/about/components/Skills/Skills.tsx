import type { CSSProperties } from "react";
import styles from "./Skills.module.css";

const SKILLS: Record<string, string[]> = {
  Frontend: ["React", "Next.js", "TypeScript", "CSS", "Accesibilidad"],
  Backend: ["Node.js", "Prisma", "PostgreSQL", "Supabase", "REST"],
  Web3: ["Solidity", "ethers.js", "Wallets", "Smart contracts"],
  Herramientas: ["Git", "Vercel", "Figma", "Vitest", "Playwright"],
};

// Acento por categoría (solo visual: color del punto y del borde en hover)
const ACCENTS = ["var(--brand-500)", "var(--accent)", "var(--resource-1)", "var(--brand-600)"];

export function Skills() {
  return (
    <section className={styles.section} aria-label="Habilidades">
      <h2 className={styles.h2}>Habilidades</h2>
      <div className={styles.grid}>
        {Object.entries(SKILLS).map(([cat, items], i) => (
          <div
            key={cat}
            className={styles.group}
            style={{ "--chip-accent": ACCENTS[i % ACCENTS.length] } as CSSProperties}
          >
            <h3 className={styles.cat}>{cat}</h3>
            <div className={styles.chips}>
              {items.map((s) => (
                <span key={s} className={styles.chip}>
                  <span className={styles.dot} aria-hidden="true" />
                  {s}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
