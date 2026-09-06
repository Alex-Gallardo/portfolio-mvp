"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import styles from "./AchievementCard.module.css";

export interface Achievement {
  id: string;
  title: string;
  issuer: string;
  year: string;
  /** Etiqueta del tipo de credencial, mostrada en el sello */
  kind: string;
  /** Desplazamiento del arcoíris del foil, 0-360. Da identidad a cada card. */
  hue: number;
  /** Si existe, la card se vuelve un enlace y aparece el sello "Verificar" */
  credentialUrl?: string;
}

/**
 * Card de certificado con lámina holográfica.
 *
 * Client Component porque el foil sigue al puntero: el handler solo lee la
 * posición relativa y escribe dos custom properties (--px, --py). Todo el
 * resto —inclinación, arcoíris, glitter, destello— se deriva de ahí en CSS.
 *
 * Sin ratón (táctil) o con movimiento reducido, el CSS ignora las variables
 * y deja un brillo sereno en bucle: el efecto degrada, no desaparece.
 */
export function AchievementCard({ achievement: a }: { achievement: Achievement }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const raf = useRef(0);
  const [active, setActive] = useState(false);

  const write = useCallback((px: number, py: number) => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--px", px.toFixed(4));
    el.style.setProperty("--py", py.toFixed(4));
  }, []);

  const onMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      // Solo ratón: en táctil el "hover" se queda pegado tras el tap
      if (e.pointerType !== "mouse") return;
      const el = ref.current;
      if (!el) return;

      cancelAnimationFrame(raf.current);
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      raf.current = requestAnimationFrame(() => write(px, py));
    },
    [write],
  );

  const onEnter = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    setActive(true);
  }, []);

  const onLeave = useCallback(() => {
    cancelAnimationFrame(raf.current);
    setActive(false);
    write(0.5, 0.5); // vuelve al centro y la transición hace el resto
  }, [write]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const Root = a.credentialUrl ? "a" : "div";

  return (
    <div
      ref={ref}
      className={`${styles.stage} ${active ? styles.active : ""}`}
      style={{ "--hue": a.hue } as CSSProperties}
      onPointerEnter={onEnter}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <Root
        className={styles.card}
        {...(a.credentialUrl
          ? {
              href: a.credentialUrl,
              target: "_blank",
              rel: "noopener noreferrer",
              "data-track": `achievement-${a.id}`,
            }
          : {})}
      >
        {/* ---- Capas holográficas (decorativas) ---- */}
        <span className={styles.guilloche} aria-hidden="true" />
        <span className={styles.foil} aria-hidden="true" />
        <span className={styles.glitter} aria-hidden="true" />
        <span className={styles.glare} aria-hidden="true" />
        <span className={styles.edge} aria-hidden="true" />

        {/* ---- Contenido ---- */}
        <div className={styles.content}>
          <div className={styles.top}>
            <Seal kind={a.kind} />
            <span className={styles.year}>{a.year}</span>
          </div>

          <div className={styles.body}>
            <h3 className={styles.title}>{a.title}</h3>
            <p className={styles.issuer}>
              <span className={styles.issuerLabel}>Emitido por</span>
              {a.issuer}
            </p>
          </div>

          <div className={styles.foot}>
            <span className={styles.ribbon} aria-hidden="true" />
            {a.credentialUrl ? (
              <span className={styles.verify}>
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path
                    d="m5 12.5 4.2 4.2L19 7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Verificar
              </span>
            ) : null}
          </div>
        </div>
      </Root>
    </div>
  );
}

/** Sello troquelado: disco dentado + monograma. Puro SVG, sin peticiones. */
function Seal({ kind }: { kind: string }) {
  return (
    <span className={styles.seal}>
      <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <circle className={styles.sealRing} cx="24" cy="24" r="21" />
        <circle className={styles.sealDash} cx="24" cy="24" r="17.5" />
        <path
          className={styles.sealMark}
          d="M16 24.6 21.6 30 32 19"
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className={styles.srOnly}>{kind}</span>
    </span>
  );
}
