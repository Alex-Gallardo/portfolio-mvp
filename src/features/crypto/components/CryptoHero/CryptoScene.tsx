"use client";

import { useEffect, useRef } from "react";

import { useThemeStore } from "@/stores/useThemeStore";
import styles from "./CryptoHero.module.css";

/**
 * Canvas three.js del hero crypto (decorativo).
 *
 * - three.js se carga con import() dinámico tras hidratar: el texto del
 *   hero (SSR) pinta primero y el LCP no espera al 3D.
 * - Mide el bloque de texto (`[data-hero-text]`) para colocar los objetos
 *   en el espacio libre alrededor.
 * - Pausa el render fuera de pantalla; con prefers-reduced-motion pinta
 *   un único fotograma estático y sin parallax.
 * - Sin WebGL simplemente no aparece: el hero sigue completo con CSS.
 */
export function CryptoScene() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = canvas?.closest("section");
    const text = hero?.querySelector<HTMLElement>("[data-hero-text]");
    if (!canvas || !hero || !text) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const cleanups: (() => void)[] = [];
    let cancelled = false;

    import("@/features/crypto/hero-scene/createCryptoScene")
      .then(({ createCryptoScene }) => {
        if (cancelled) return;
        const isDark = document.documentElement.dataset.theme === "dark";
        const scene = createCryptoScene({
          canvas,
          theme: isDark ? "dark" : "light",
          reducedMotion,
          onFirstFrame: () => {
            canvas.dataset.ready = "true";
          },
        });
        if (!scene) return;
        cleanups.push(() => scene.dispose());

        const relayout = () => {
          const h = hero.getBoundingClientRect();
          const t = text.getBoundingClientRect();
          scene.layout(h.width, h.height, {
            left: t.left - h.left,
            right: t.right - h.left,
            top: t.top - h.top,
            bottom: t.bottom - h.top,
          });
        };
        relayout();
        const resizeObserver = new ResizeObserver(relayout);
        resizeObserver.observe(hero);
        resizeObserver.observe(text);
        cleanups.push(() => resizeObserver.disconnect());

        const visibility = new IntersectionObserver(
          (entries) => scene.setActive(entries.some((e) => e.isIntersecting)),
          { threshold: 0 },
        );
        visibility.observe(hero);
        cleanups.push(() => visibility.disconnect());

        cleanups.push(useThemeStore.subscribe((s) => scene.setTheme(s.theme)));

        if (finePointer && !reducedMotion) {
          const onMove = (e: PointerEvent) => {
            const r = hero.getBoundingClientRect();
            scene.setPointer(
              ((e.clientX - r.left) / r.width) * 2 - 1,
              -(((e.clientY - r.top) / r.height) * 2 - 1),
            );
          };
          const onLeave = () => scene.setPointer(0, 0);
          hero.addEventListener("pointermove", onMove, { passive: true });
          hero.addEventListener("pointerleave", onLeave);
          cleanups.push(() => {
            hero.removeEventListener("pointermove", onMove);
            hero.removeEventListener("pointerleave", onLeave);
          });
        }
      })
      .catch(() => {
        /* el chunk 3D no cargó (red/offline): el hero funciona sin él */
      });

    return () => {
      cancelled = true;
      cleanups.forEach((fn) => fn());
      delete canvas.dataset.ready;
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}
