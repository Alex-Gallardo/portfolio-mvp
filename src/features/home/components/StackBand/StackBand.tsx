import type { CSSProperties } from "react";
import { TECHS, type Tech } from "./stack-icons";
import styles from "./StackBand.module.css";

type StackBandProps = {
  /** Eyebrow sobre la cinta. Pasa `null` para ocultarlo. */
  label?: string | null;
  /** Segundos por logo. Más alto = más lento. */
  speed?: number;
  /** Invierte el sentido del scroll (útil si apilas dos cintas). */
  reverse?: boolean;
};

/**
 * Cinta infinita de logos.
 *
 * Es un Server Component: la animación es 100% CSS, no hay estado ni efectos,
 * así que no necesita "use client" ni entra en el bundle del cliente.
 *
 * El loop es exacto porque el track contiene dos copias idénticas del grupo y
 * la animación desplaza -50%. Cada grupo lleva su gap final en
 * `padding-inline-end`, así que ambas mitades miden exactamente lo mismo y no
 * hay salto en la costura.
 */
export function StackBand({ label = "Trabajo con", speed = 2.4, reverse = false }: StackBandProps) {
  const duration = `${(TECHS.length * speed).toFixed(1)}s`;

  return (
    <section
      className={styles.band}
      aria-label="Tecnologías con las que trabajo"
      style={{ "--band-duration": duration } as CSSProperties}
    >
      {label ? <p className={styles.label}>{label}</p> : null}

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
