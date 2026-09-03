import type { CSSProperties } from "react";
import Link from "next/link";
import styles from "./Skills.module.css";

/**
 * Nivel de profundidad real, no de "conocimiento".
 *   3 · Núcleo    — lo uso a diario y tomo decisiones de arquitectura con ello
 *   2 · Sólido    — lo uso con regularidad y me muevo sin fricción
 *   1 · En órbita — lo he usado en proyectos concretos, sigo aprendiendo
 *
 * El nivel gobierna el peso visual Y el brillo: núcleo = mena rara que
 * centellea, en órbita = piedra que no brilla. Ese es el mensaje.
 */
type Level = 1 | 2 | 3;

type Skill = { name: string; level: Level };

type Group = {
  id: string;
  title: string;
  claim: string;
  accent: string;
  skills: Skill[];
};

const GROUPS: Group[] = [
  {
    id: "frontend",
    title: "Frontend",
    claim: "Interfaces rápidas, accesibles y calmadas.",
    accent: "var(--brand-500)",
    skills: [
      { name: "Next.js", level: 3 },
      { name: "TypeScript", level: 3 },
      { name: "React", level: 3 },
      { name: "CSS Modules", level: 3 },
      { name: "Accesibilidad", level: 3 },
      { name: "Zustand", level: 3 },
    ],
  },
  {
    id: "backend",
    title: "Backend y datos",
    claim: "Tipado de punta a punta, sin sorpresas en producción.",
    accent: "var(--accent)",
    skills: [
      { name: "Prisma", level: 3 },
      { name: "PostgreSQL", level: 3 },
      { name: "Supabase", level: 3 },
      { name: "Node.js", level: 3 },
      { name: "Zod", level: 3 },
      { name: "REST", level: 3 },
    ],
  },
  {
    id: "tooling",
    title: "Entrega",
    claim: "Del commit a producción sin romper nada.",
    accent: "var(--brand-600)",
    skills: [
      { name: "Git", level: 3 },
      { name: "Vercel", level: 3 },
      { name: "Vitest", level: 3 },
      { name: "Figma", level: 3 },
      { name: "Playwright", level: 3 },
    ],
  },
  {
    id: "web3",
    title: "Web3",
    claim: "Interfaces claras para un dominio complejo.",
    accent: "var(--brand-700)",
    skills: [
      { name: "Wallets", level: 3 },
      { name: "ethers.js", level: 3 },
      { name: "Solidity", level: 3 },
      { name: "Smart contracts", level: 3 },
    ],
  },
];

const LEVEL_LABEL: Record<Level, string> = {
  3: "dominio principal",
  2: "uso habitual",
  1: "en aprendizaje",
};

/**
 * Ciclos del destello por nivel. Decimales primos entre sí a propósito: el
 * patrón combinado tarda minutos en repetirse, así que se percibe aleatorio
 * en vez de como un pulso. Nivel 1 no tiene: es piedra, no mena.
 */
const SHINE: Record<Level, { a: string; b?: string }> = {
  3: { a: "3.7s", b: "5.9s" },
  2: { a: "6.7s" },
  1: { a: "0s" },
};

/** Puntos de nacimiento del destello. Nunca centrados. */
const SPOTS = [
  { x1: "18%", y1: "30%", x2: "74%", y2: "68%" },
  { x1: "62%", y1: "24%", x2: "27%", y2: "71%" },
  { x1: "35%", y1: "22%", x2: "81%", y2: "62%" },
  { x1: "78%", y1: "34%", x2: "22%", y2: "66%" },
  { x1: "48%", y1: "26%", x2: "88%", y2: "70%" },
];

export function Skills() {
  let cursor = 0; // índice global: desincroniza también entre categorías

  return (
    <section className={styles.section} aria-labelledby="skills-title">
      <header className={styles.head}>
        <p className={styles.eyebrow}>Stack</p>

        <h2 id="skills-title" className={styles.h2}>
          Con qué <span className={styles.gradient}>construyo</span>
        </h2>

        <p className={styles.lead}>
          No es una lista de logos. Es lo que uso cada día, ordenado por profundidad real:{" "}
          <strong className={styles.leadStrong}>lo que domino brilla más</strong>.
        </p>
      </header>

      <div className={styles.grid}>
        {GROUPS.map((g) => (
          <article
            key={g.id}
            className={styles.panel}
            style={{ "--chip-accent": g.accent } as CSSProperties}
          >
            <div className={styles.rail} aria-hidden="true" />

            <h3 className={styles.cat}>{g.title}</h3>
            <p className={styles.claim}>{g.claim}</p>

            <ul className={styles.chips}>
              {g.skills.map((s) => {
                const spot = SPOTS[cursor % SPOTS.length]!;
                const shine = SHINE[s.level];
                const i = cursor++;

                return (
                  <li
                    key={s.name}
                    className={styles.chip}
                    data-level={s.level}
                    style={
                      {
                        "--i": i,
                        "--gx1": spot.x1,
                        "--gy1": spot.y1,
                        "--gx2": spot.x2,
                        "--gy2": spot.y2,
                        "--shine-a": shine.a,
                        "--shine-b": shine.b ?? shine.a,
                      } as CSSProperties
                    }
                  >
                    {/* Anillo metálico: solo en núcleo. El barrido comparte
                        reloj con el destello, así son un mismo evento. */}
                    {s.level === 3 ? <span className={styles.rim} aria-hidden="true" /> : null}

                    <span className={styles.dot} aria-hidden="true" />
                    {s.name}

                    {/* El nivel se transmite visualmente por brillo y peso;
                        esto lo hace legible para lectores de pantalla. */}
                    <span className={styles.srOnly}>{` — ${LEVEL_LABEL[s.level]}`}</span>
                  </li>
                );
              })}
            </ul>
          </article>
        ))}
      </div>

      <footer className={styles.foot}>
        <Link href="/servicios" className={styles.cta} data-track="skills-to-services">
          ¿Tu proyecto necesita alguna de estas? Ver servicios →
        </Link>
      </footer>
    </section>
  );
}
