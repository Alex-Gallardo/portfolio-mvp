import type { CSSProperties } from "react";
import { TECHS, type Tech } from "@/features/home/components/StackBand/stack-icons"; // ⚠️ ajusta a la ruta real de stack-icons
import styles from "./TechMarquee.module.css";

type TechMarqueeProps = {
  /** Título visible de la sección. */
  title?: string;
  /** Segundos por logo. Más alto = más lento. */
  speed?: number;
  /** Invierte el sentido del scroll. */
  reverse?: boolean;
};

/**
 * Cinta infinita de logos para About.
 *
 * Mismo motor que StackBand: animación 100% CSS, sin estado ni efectos, así
 * que no necesita "use client". El loop es exacto porque el track lleva dos
 * copias idénticas del grupo y la animación desplaza -50%; el gap final vive
 * en el padding de cada grupo para que ambas mitades midan igual.
 */
export function TechMarquee({
  title = "Tecnologías del día a día",
  speed = 2.4,
  reverse = false,
}: TechMarqueeProps) {
  const duration = `${(TECHS.length * speed).toFixed(1)}s`;

  return (
    <section
      className={styles.section}
      aria-labelledby="tech-marquee-title"
      style={{ "--band-duration": duration } as CSSProperties}
    >
      <h2 id="tech-marquee-title" className={styles.h2}>
        {title}
      </h2>

      <div className={styles.viewport}>
        <div className={`${styles.track} ${reverse ? styles.reverse : ""}`}>
          <Row />
          <Row duplicate />
        </div>
      </div>
    </section>
  );
}

function Row({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <ul className={styles.group} aria-hidden={duplicate || undefined}>
      {TECHS.map((t) => (
        <li
          key={t.label}
          className={styles.item}
          data-label={t.label}
          style={
            {
              "--tech-color": t.color,
              ...(t.scale ? { "--icon-scale": t.scale } : {}),
            } as CSSProperties
          }
          role={duplicate ? undefined : "img"}
          aria-label={duplicate ? undefined : t.label}
        >
          <Logo tech={t} />
        </li>
      ))}
    </ul>
  );
}

function Logo({ tech }: { tech: Tech }) {
  if (!tech.path && !tech.node) return null;

  return (
    <svg
      className={styles.svg}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      {tech.path ? <path d={tech.path} fill="currentColor" /> : tech.node}
    </svg>
  );
}
