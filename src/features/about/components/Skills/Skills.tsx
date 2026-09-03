import type { CSSProperties } from "react";
import styles from "./Skills.module.css";

const SKILLS: Record<string, string[]> = {
  Frontend: ["React", "Next.js", "TypeScript", "CSS", "Accesibilidad"],
  Backend: ["Node.js", "Prisma", "PostgreSQL", "Supabase", "REST"],
  Web3: ["Solidity", "ethers.js", "Wallets", "Smart contracts"],
  Herramientas: ["Git", "Vercel", "Figma", "Vitest", "Playwright"],
};

// Acento por categoría (solo visual: color del punto, del borde en hover y del destello)
const ACCENTS = ["var(--brand-500)", "var(--accent)", "var(--resource-1)", "var(--brand-600)"];

/**
 * Frecuencia del destello por categoría, al estilo del "tileShine" de Terraria:
 * ciclo largo = mena común, ciclo corto = mena valiosa. Los valores son decimales
 * primos entre sí a propósito — el patrón combinado tarda minutos en repetirse,
 * así que el ojo lo lee como aleatorio en vez de como un pulso.
 */
const SHINE = [
  { a: "6.7s", b: "9.1s" }, // Frontend
  { a: "5.3s", b: "7.9s" }, // Backend
  { a: "3.7s", b: "5.9s" }, // Web3 — la más "rara", destella más
  { a: "7.3s", b: "10.3s" }, // Herramientas
];

/**
 * Puntos donde nace el destello dentro de la píldora. Nunca centrados: en el
 * original la partícula aparece en una posición arbitraria del bloque.
 */
const SPOTS = [
  { x1: "18%", y1: "30%", x2: "74%", y2: "68%" },
  { x1: "62%", y1: "24%", x2: "27%", y2: "71%" },
  { x1: "35%", y1: "22%", x2: "81%", y2: "62%" },
  { x1: "78%", y1: "34%", x2: "22%", y2: "66%" },
  { x1: "48%", y1: "26%", x2: "88%", y2: "70%" },
];

export function Skills() {
  return (
    <section className={styles.section} aria-label="Habilidades">
      <h2 className={styles.h2}>Habilidades</h2>
      <div className={styles.grid}>
        {Object.entries(SKILLS).map(([cat, items], gi) => {
          const shine = SHINE[gi % SHINE.length]!;
          return (
            <div
              key={cat}
              className={styles.group}
              style={
                {
                  "--chip-accent": ACCENTS[gi % ACCENTS.length],
                  "--shine-a": shine.a,
                  "--shine-b": shine.b,
                } as CSSProperties
              }
            >
              <h3 className={styles.cat}>{cat}</h3>
              <div className={styles.chips}>
                {items.map((s, si) => {
                  const spot = SPOTS[si % SPOTS.length]!;
                  // Índice global: desincroniza también entre categorías
                  const i = gi * 7 + si;
                  return (
                    <span
                      key={s}
                      className={styles.chip}
                      style={
                        {
                          "--i": i,
                          "--gx1": spot.x1,
                          "--gy1": spot.y1,
                          "--gx2": spot.x2,
                          "--gy2": spot.y2,
                        } as CSSProperties
                      }
                    >
                      <span className={styles.dot} aria-hidden="true" />
                      {s}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
