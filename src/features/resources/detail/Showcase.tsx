"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import Image from "next/image";

import { FLAT, computeTilt } from "@/lib/tilt";
import { FileIcon } from "./sprites";
import type { FileKind } from "./files";
import styles from "./Showcase.module.css";

interface ShowcaseProps {
  title: string;
  coverUrl: string | null;
  /** Icono pixel grande cuando no hay portada. */
  fallbackKind: FileKind;
  categoryLabel: string;
  isNew?: boolean;
}

/** Destellos del marco: duraciones primas entre sí → no se perciben en bucle. */
const SPARKS = [
  { x: "6%", y: "4px", d: 4.3 },
  { x: "calc(100% - 4px)", y: "22%", d: 5.3, big: true },
  { x: "4px", y: "64%", d: 3.7 },
  { x: "72%", y: "calc(100% - 4px)", d: 6.1, big: true },
  { x: "38%", y: "4px", d: 4.7 },
];

/**
 * La pieza en su vitrina: la portada en un marco pixel que se inclina hacia
 * el puntero por pasos de 2° (como un sprite rotado por fotogramas), con
 * reflejo y destellos. En táctil y con movimiento reducido queda plana.
 */
export function Showcase({ title, coverUrl, fallbackKind, categoryLabel, isNew }: ShowcaseProps) {
  const frameRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    let raf = 0;
    let x = 0;
    let y = 0;
    const apply = () => {
      raf = 0;
      const t = computeTilt(x, y, frame.getBoundingClientRect(), 8, 2);
      frame.style.setProperty("--rx", `${t.rx}deg`);
      frame.style.setProperty("--ry", `${t.ry}deg`);
      frame.style.setProperty("--gx", `${t.gx}%`);
      frame.style.setProperty("--gy", `${t.gy}%`);
    };
    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      frame.style.setProperty("--rx", `${FLAT.rx}deg`);
      frame.style.setProperty("--ry", `${FLAT.ry}deg`);
      frame.style.setProperty("--gx", `${FLAT.gx}%`);
      frame.style.setProperty("--gy", `${FLAT.gy}%`);
    };
    frame.addEventListener("pointermove", onMove, { passive: true });
    frame.addEventListener("pointerleave", onLeave);
    return () => {
      onLeave();
      frame.removeEventListener("pointermove", onMove);
      frame.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div className={styles.stage}>
      <div ref={frameRef} className={styles.frame}>
        <span className={styles.chassis} aria-hidden="true" />
        <div className={styles.media}>
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={`Vista previa de ${title}`}
              fill
              sizes="(max-width: 900px) 92vw, 46vw"
              className={styles.cover}
              priority
            />
          ) : (
            <div className={styles.fallback} aria-hidden="true">
              <FileIcon kind={fallbackKind} scale={10} className={styles.fallbackIcon} />
            </div>
          )}
          <span className={styles.screen} aria-hidden="true" />
          <span className={styles.glare} aria-hidden="true" />
          <div className={styles.tags}>
            <span className={styles.badge}>{categoryLabel}</span>
            {isNew ? <span className={styles.badgeNew}>Nuevo</span> : null}
          </div>
        </div>
        <span className={styles.sparks} aria-hidden="true">
          {SPARKS.map((s, i) => (
            <i
              key={i}
              className={styles.spark}
              data-big={s.big || undefined}
              style={
                {
                  "--x": s.x,
                  "--y": s.y,
                  "--d": `${s.d}s`,
                  "--delay": `-${i * 1.3}s`,
                } as CSSProperties
              }
            />
          ))}
        </span>
      </div>
      <span className={styles.ground} aria-hidden="true" />
    </div>
  );
}
