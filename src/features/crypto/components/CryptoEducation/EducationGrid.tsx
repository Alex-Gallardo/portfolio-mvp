"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { FLAT, computeTilt, type Tilt } from "./tilt";

interface EducationGridProps {
  className?: string;
  children: ReactNode;
}

/** Ritmo de los bucles CSS mientras el puntero está sobre la tarjeta. */
const HOVER_RATE = 1.6;

function setTilt(tile: HTMLElement, t: Tilt) {
  tile.style.setProperty("--rx", `${t.rx}deg`);
  tile.style.setProperty("--ry", `${t.ry}deg`);
  tile.style.setProperty("--gx", `${t.gx}%`);
  tile.style.setProperty("--gy", `${t.gy}%`);
}

/** Acelera (o restaura) los bucles de la ilustración sin saltos de fotograma. */
function setLoopRate(tile: HTMLElement, rate: number) {
  for (const animation of tile.getAnimations({ subtree: true })) {
    if (animation instanceof CSSAnimation) animation.updatePlaybackRate(rate);
  }
}

/**
 * Lista del bento (las tarjetas se renderizan en el servidor).
 * - Pausa los bucles cuando la sección no está en pantalla (`data-paused`).
 * - Con puntero fino: inclinación 3D + reflejo que sigue al cursor, y los
 *   bucles de esa tarjeta van más rápido mientras está en hover.
 * - prefers-reduced-motion: no hay inclinación (y el CSS congela los bucles).
 */
export function EducationGrid({ className, children }: EducationGridProps) {
  const listRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    const list = listRef.current;
    const section = list?.closest("section");
    if (!list || !section) return;

    const visibility = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((e) => e.isIntersecting);
        section.toggleAttribute("data-paused", !visible);
      },
      { rootMargin: "120px 0px" },
    );
    visibility.observe(section);

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (reducedMotion || !finePointer) return () => visibility.disconnect();

    const tiles = Array.from(list.querySelectorAll<HTMLElement>("[data-tilt]"));
    const cleanups: (() => void)[] = [];

    for (const tile of tiles) {
      let frame = 0;
      let x = 0;
      let y = 0;

      const apply = () => {
        frame = 0;
        setTilt(tile, computeTilt(x, y, tile.getBoundingClientRect()));
      };
      const onEnter = () => {
        tile.dataset.hover = "true";
        setLoopRate(tile, HOVER_RATE);
      };
      const onMove = (e: PointerEvent) => {
        x = e.clientX;
        y = e.clientY;
        if (!frame) frame = requestAnimationFrame(apply);
      };
      const onLeave = () => {
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        delete tile.dataset.hover;
        setTilt(tile, FLAT);
        setLoopRate(tile, 1);
      };

      tile.addEventListener("pointerenter", onEnter);
      tile.addEventListener("pointermove", onMove, { passive: true });
      tile.addEventListener("pointerleave", onLeave);
      cleanups.push(() => {
        onLeave();
        tile.removeEventListener("pointerenter", onEnter);
        tile.removeEventListener("pointermove", onMove);
        tile.removeEventListener("pointerleave", onLeave);
      });
    }

    return () => {
      visibility.disconnect();
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return (
    <ul ref={listRef} className={className} role="list">
      {children}
    </ul>
  );
}
