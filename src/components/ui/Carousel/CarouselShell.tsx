"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./Carousel.module.css";

interface CarouselShellProps {
  ariaLabel: string;
  children: ReactNode; // los <li> ya renderizados en servidor
}

export function CarouselShell({ ariaLabel, children }: CarouselShellProps) {
  const trackRef = useRef<HTMLUListElement | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [bar, setBar] = useState({ ratio: 1, travel: 0 });

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const ratio = el.scrollWidth > 0 ? el.clientWidth / el.scrollWidth : 1;
    const progress = max > 0 ? el.scrollLeft / max : 0;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < max - 4);
    setBar({
      ratio,
      travel: ratio < 1 ? progress * ((1 - ratio) / ratio) * 100 : 0,
    });
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return undefined;
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [update]);

  const scrollByStep = useCallback((dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const slide = el.querySelector<HTMLElement>(":scope > li");
    const gap = parseFloat(getComputedStyle(el).columnGap) || 24;
    const step = slide ? slide.offsetWidth + gap : el.clientWidth * 0.8;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * step, behavior: reduced ? "auto" : "smooth" });
  }, []);

  const scrollable = canPrev || canNext;

  return (
    <div className={styles.carousel}>
      <ul ref={trackRef} className={styles.track} aria-label={ariaLabel} role="list">
        {children}
      </ul>

      {scrollable ? (
        <>
          <button
            type="button"
            className={`${styles.arrow} ${styles.arrowPrev}`}
            onClick={() => scrollByStep(-1)}
            disabled={!canPrev}
            aria-label="Anterior"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            className={`${styles.arrow} ${styles.arrowNext}`}
            onClick={() => scrollByStep(1)}
            disabled={!canNext}
            aria-label="Siguiente"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>

          <div className={styles.progress} aria-hidden="true">
            <span
              className={styles.progressBar}
              style={{
                width: `${bar.ratio * 100}%`,
                transform: `translateX(${bar.travel}%)`,
              }}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
