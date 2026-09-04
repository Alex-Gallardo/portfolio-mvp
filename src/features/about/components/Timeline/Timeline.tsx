import type { ReactNode } from "react";
import styles from "./Timeline.module.css";

type Shape = "hexagon" | "circle" | "diamond";

type Milestone = {
  year: string;
  title: string;
  text: string;
  shape: Shape;
  glyph: ReactNode;
};

/* ── Glifos inline: sin dependencias, sin peticiones extra ────────────────── */

const IconCode = <path d="M8.5 8 4.5 12l4 4M15.5 8l4 4-4 4M13.5 5l-3 14" />;
const IconLayers = (
  <>
    <path d="M12 3 3.5 7.5 12 12l8.5-4.5L12 3Z" />
    <path d="M3.5 12.5 12 17l8.5-4.5" />
    <path d="M3.5 16.75 12 21.25l8.5-4.5" />
  </>
);
const IconGauge = (
  <>
    <path d="M4 17a8.5 8.5 0 1 1 16 0" />
    <path d="m12 15 3.5-4.5" />
    <circle cx="12" cy="16.5" r="1.2" />
  </>
);
const IconBlocks = (
  <>
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.6" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1.6" />
    <path d="M10.5 7h3a3 3 0 0 1 3 3v3" />
  </>
);

/* ── Datos ───────────────────────────────────────────────────────────────── */

const MILESTONES: Milestone[] = [
  {
    year: "2021",
    title: "Primeros pasos",
    text: "Empecé con HTML, CSS y JavaScript construyendo sitios pequeños.",
    shape: "hexagon",
    glyph: IconCode,
  },
  {
    year: "2022",
    title: "Full-stack",
    text: "Me especialicé en React, Next.js y bases de datos.",
    shape: "circle",
    glyph: IconLayers,
  },
  {
    year: "2023",
    title: "Performance & SEO",
    text: "Foco en Core Web Vitals, accesibilidad y posicionamiento.",
    shape: "diamond",
    glyph: IconGauge,
  },
  {
    year: "2024",
    title: "Web3 & producto",
    text: "Interfaces para blockchain y productos orientados a conversión.",
    shape: "hexagon",
    glyph: IconBlocks,
  },
];

const STATS = [
  { value: "4 años", label: "construyendo" },
  { value: "+20", label: "proyectos" },
  { value: "100", label: "Lighthouse SEO" },
  { value: "< 2.5s", label: "LCP objetivo" },
];

/**
 * Trayectoria en dos columnas: panel sticky a la izquierda, hitos a la derecha.
 *
 * Server Component: todas las animaciones son scroll-driven nativas
 * (`animation-timeline: view()`), así que no hay estado, ni efectos, ni JS en
 * el bundle. Los navegadores sin soporte muestran el contenido estático — los
 * estilos base ya son el estado final visible.
 */
export function Timeline() {
  return (
    <section className={styles.section} aria-labelledby="timeline-title">
      <div className={styles.pattern} aria-hidden="true" />

      <div className={styles.grid}>
        <LeftPanel />

        <ol className={styles.cards}>
          {MILESTONES.map((m, i) => (
            <li
              key={m.year}
              className={styles.item}
              data-accent={(i % 3) + 1}
              data-flip={i % 2 === 1 || undefined}
            >
              <div className={styles.glow} aria-hidden="true" />

              <article className={styles.card}>
                <span className={styles.ghost} aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className={styles.blob} aria-hidden="true" />

                <div className={styles.header}>
                  <ShapeIcon shape={m.shape}>{m.glyph}</ShapeIcon>

                  <div className={styles.heading}>
                    <p className={styles.year}>{m.year}</p>
                    <h3 className={styles.title}>{m.title}</h3>
                  </div>
                </div>

                <div className={styles.rule} aria-hidden="true" />
                <p className={styles.text}>{m.text}</p>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ── Panel izquierdo ─────────────────────────────────────────────────────── */

function LeftPanel() {
  return (
    <div className={styles.panel}>
      <p className={styles.badge}>Trayectoria</p>

      <h2 id="timeline-title" className={styles.h2}>
        Mi
        <br />
        <span className={styles.gradient}>trayectoria</span>
      </h2>

      <p className={styles.lead}>
        De los primeros sitios estáticos a productos completos: rendimiento, accesibilidad y
        conversión medida.
      </p>

      {/* Barra de progreso ligada al scroll de la columna de hitos */}
      <div className={styles.progressRow} aria-hidden="true">
        <div className={styles.progress}>
          <div className={styles.track}>
            <div className={styles.fill} />
          </div>
          <span className={styles.dot} />
        </div>

        <div className={styles.progressMeta}>
          <p>{MILESTONES.length} hitos</p>
          <p>y sumando</p>
        </div>
      </div>

      <dl className={styles.stats}>
        {STATS.map((s) => (
          <div key={s.label} className={styles.stat}>
            <dt className={styles.statValue}>{s.value}</dt>
            <dd className={styles.statLabel}>{s.label}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/* ── Icono con forma recortada ───────────────────────────────────────────── */

function ShapeIcon({ shape, children }: { shape: Shape; children: ReactNode }) {
  return (
    <div className={`${styles.shape} ${styles[shape]}`}>
      <span className={styles.shapeBg} aria-hidden="true" />
      <span className={styles.shapeTint} aria-hidden="true" />
      <svg
        className={styles.glyph}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        {children}
      </svg>
    </div>
  );
}
