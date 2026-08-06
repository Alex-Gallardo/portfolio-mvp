"use client";

import { useEffect, useState } from "react";
import type { TransitionEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./AboutBrief.module.css";

interface AboutSlide {
  /** Ruta en /public o URL. Déjalo vacío para usar el placeholder con degradado. */
  src?: string;
  alt: string;
}

interface AboutBriefProps {
  title?: string;
  body?: string;
  /** Imágenes que rotan en la card (mín. 3 recomendado). */
  slides?: AboutSlide[];
}

const SWAP_INTERVAL_MS = 5000;

// Reemplaza por tus imágenes reales: [{ src: "/about/uno.webp", alt: "..." }, ...]
const DEFAULT_SLIDES: AboutSlide[] = [
  { alt: "Vista previa 1" },
  { alt: "Vista previa 2" },
  { alt: "Vista previa 3" },
];

export function AboutBrief({ title, body, slides }: AboutBriefProps) {
  const items = slides && slides.length > 0 ? slides : DEFAULT_SLIDES;
  const len = items.length;

  const [current, setCurrent] = useState(0);
  const [pos, setPos] = useState(1); // 1 = actual a la vista · 0 = corrido al siguiente
  const [animate, setAnimate] = useState(true);

  // Avanza en bucle infinito (no rota si el usuario pidió menos movimiento)
  useEffect(() => {
    if (len <= 1 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }
    const id = setInterval(() => {
      setAnimate(true);
      setPos(0); // dispara el slide de izquierda a derecha
    }, SWAP_INTERVAL_MS);
    return () => clearInterval(id);
  }, [len]);

  // Re-arma el carrusel tras el salto invisible
  useEffect(() => {
    if (!animate && pos === 1) {
      const raf = requestAnimationFrame(() => setAnimate(true));
      return () => cancelAnimationFrame(raf);
    }
    return undefined;
  }, [animate, pos]);

  const handleTransitionEnd = (e: TransitionEvent<HTMLSpanElement>) => {
    if (e.target !== e.currentTarget || e.propertyName !== "transform") return;
    if (pos !== 0) return;
    // El siguiente ya quedó a la vista → salto sin animación al estado base
    setAnimate(false);
    setCurrent((c) => (c + 1) % len);
    setPos(1);
  };

  const nextIndex = (current + 1) % len;
  const windowIdx = len > 1 ? [nextIndex, current] : [current];

  const renderVisual = (i: number) => {
    const item = items[i];
    return item?.src ? (
      <Image
        src={item.src}
        alt={item.alt}
        fill
        sizes="(max-width: 768px) 100vw, 40vw"
        className={styles.img}
      />
    ) : (
      <span className={`${styles.placeholder} ${styles[`variant${i % 3}`]}`}>
        <svg
          className={styles.icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2.5" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="m21 15-4.5-4.5L5 22" />
        </svg>
      </span>
    );
  };

  return (
    <section className={styles.about}>
      <div className={styles.inner}>
        <div className={styles.content}>
          <h2 className={styles.h2}>{title ?? "Hola, soy [Nombre]"}</h2>
          <p className={styles.text}>
            {body ??
              "Dev full-stack enfocado en performance y experiencia. Diseño y construyo productos web rápidos, accesibles y pensados para crecer."}
          </p>
        </div>

        {/* La ÚNICA card: visual de la derecha, clicable, con hover y carrusel */}
        <Link href="/about" className={`${styles.card} ${styles.reveal}`} data-track="home-about">
          <span className={styles.thumb} aria-hidden="true">
            {len > 1 ? (
              <span
                className={`${styles.track} ${animate ? styles.animate : ""}`}
                style={{ transform: `translateX(-${pos * 50}%)` }}
                onTransitionEnd={handleTransitionEnd}
              >
                {windowIdx.map((i, k) => (
                  <span className={styles.slide} key={k}>
                    {renderVisual(i)}
                  </span>
                ))}
              </span>
            ) : (
              <span className={styles.single}>{renderVisual(0)}</span>
            )}
          </span>
          <span className={styles.cta}>Conóceme más →</span>
        </Link>
      </div>
    </section>
  );
}
