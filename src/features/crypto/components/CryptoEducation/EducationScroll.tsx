"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { cardNumber, resolveActive, type EducationCard } from "@/features/crypto/education";
import { EducationGrid } from "./EducationGrid";
import styles from "./CryptoEducation.module.css";

interface EducationScrollProps {
  cards: EducationCard[];
  /** Ilustraciones renderizadas en el servidor, en el mismo orden que `cards`. */
  arts: ReactNode[];
}

/** Franja central del viewport: la tarjeta que la cruza pasa a ser la activa. */
const BAND = "-45% 0px -45% 0px";

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Scroll sticky (desktop): panel izquierdo fijo con la ilustración de la
 * tarjeta activa (cambia de color e ilustración) y tarjetas de texto que
 * pasan por la derecha. En móvil/tablet el panel se oculta y cada tarjeta
 * muestra su propia ilustración.
 */
export function EducationScroll({ cards, arts }: EducationScrollProps) {
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  // Qué tarjeta cruza la franja central
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-index]"));
    const inBand = new Set<number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = Number((entry.target as HTMLElement).dataset.index);
          if (entry.isIntersecting) inBand.add(index);
          else inBand.delete(index);
        }
        setActive((prev) => resolveActive([...inBand], prev));
      },
      { rootMargin: BAND, threshold: 0 },
    );
    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // La ilustración que entra empieza su historia desde el principio
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const layer = stageRef.current?.querySelector(`[data-layer="${active}"]`);
    if (!layer) return;
    for (const animation of layer.getAnimations({ subtree: true })) {
      if (animation instanceof CSSAnimation) animation.currentTime = 0;
    }
  }, [active]);

  const goTo = (index: number) => {
    rootRef.current?.querySelector(`[data-index="${index}"]`)?.scrollIntoView({
      block: "center",
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  };

  const current = cards[active] ?? cards[0];
  const layerState = (i: number) => (i === active ? "active" : i < active ? "before" : "after");

  return (
    <div ref={rootRef} className={styles.scroller}>
      {/* ---- panel sticky (solo desktop) ---- */}
      <div className={styles.aside}>
        <div
          ref={stageRef}
          className={`${styles.tile} ${styles.stageCard} ${current ? (styles[current.key] ?? "") : ""}`}
        >
          <div className={styles.stageArts} aria-hidden="true">
            {arts.map((art, i) => (
              <div
                key={cards[i]?.key ?? i}
                className={`${styles.art} ${styles.stageLayer}`}
                data-layer={i}
                data-state={layerState(i)}
                data-paused={i === active ? undefined : ""}
              >
                {art}
              </div>
            ))}
          </div>

          <div className={styles.stageCaption} aria-hidden="true">
            {cards.map((card, i) => (
              <div key={card.key} className={styles.captionItem} data-state={layerState(i)}>
                <span className={styles.num}>
                  <span className={styles.numValue}>{cardNumber(i)}</span>
                  {card.tag}
                </span>
                <p className={styles.captionTitle}>{card.title}</p>
              </div>
            ))}
          </div>

          <nav className={styles.progress} aria-label="Ideas de Web3">
            <span className={styles.progressCount} aria-hidden="true">
              {cardNumber(active)} / {cardNumber(cards.length - 1)}
            </span>
            <ol className={styles.progressDots}>
              {cards.map((card, i) => (
                <li key={card.key}>
                  <button
                    type="button"
                    className={styles.progressDot}
                    data-active={i === active || undefined}
                    aria-current={i === active ? "step" : undefined}
                    aria-label={`Ir a: ${card.title}`}
                    onClick={() => goTo(i)}
                  />
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>

      {/* ---- tarjetas de información ---- */}
      <EducationGrid className={styles.list}>
        {cards.map((card, i) => (
          <li
            key={card.key}
            className={styles.item}
            data-index={i}
            data-active={i === active || undefined}
          >
            <article
              className={`${styles.tile} ${styles.card} ${styles[card.key] ?? ""}`}
              data-tilt
            >
              <div className={styles.art} aria-hidden="true">
                {arts[i]}
              </div>
              <div className={styles.body}>
                <span className={styles.num}>
                  <span className={styles.numValue}>{cardNumber(i)}</span>
                  {card.tag}
                </span>
                <h3 className={styles.title}>{card.title}</h3>
                <p className={styles.text}>{card.text}</p>
                {card.points && (
                  <ul className={styles.points}>
                    {card.points.map((point) => (
                      <li key={point} className={styles.point}>
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M5 12.5l4.2 4.2L19 7" />
                        </svg>
                        {point}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <span className={styles.glare} aria-hidden="true" />
            </article>
          </li>
        ))}
      </EducationGrid>
    </div>
  );
}
