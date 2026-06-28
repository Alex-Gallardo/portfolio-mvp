"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./HeroHome.module.css";

interface HeroSlide {
  /** Ruta en /public o URL. Déjalo vacío para usar el placeholder con degradado. */
  src?: string;
  alt: string;
}

interface HeroHomeProps {
  title?: string;
  subtitle?: string;
  /** Imágenes que rotan en el visual. Si no se pasan, usa placeholders. */
  slides?: HeroSlide[];
}

const SWAP_INTERVAL_MS = 7000;

// Reemplaza por tus imágenes reales: [{ src: "/hero/uno.webp", alt: "..." }, ...]
const DEFAULT_SLIDES: HeroSlide[] = [
  { alt: "Vista previa del proyecto 1" },
  { alt: "Vista previa del proyecto 2" },
  { alt: "Vista previa del proyecto 3" },
];

export function HeroHome({ title, subtitle, slides }: HeroHomeProps) {
  const items = slides && slides.length > 0 ? slides : DEFAULT_SLIDES;
  const len = items.length;

  const [current, setCurrent] = useState(0);
  const [pos, setPos] = useState(1); // 1 = actual a la vista · 0 = corrido hacia el siguiente
  const [animate, setAnimate] = useState(true);

  // Avanza cada 7s (no rota si el usuario pidió menos movimiento)
  useEffect(() => {
    if (len <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
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
  }, [animate, pos]);

  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget || e.propertyName !== "transform") return;
    if (pos !== 0) return;
    // El siguiente ya quedó a la vista → saltamos sin animación al estado base
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
        sizes="(max-width: 1024px) 100vw, 45vw"
        className={styles.img}
        priority={i === 0}
      />
    ) : (
      <div className={`${styles.placeholder} ${styles[`variant${i % 3}`]}`}>
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
      </div>
    );
  };

  return (
    <section className={styles.hero}>
      <div className={styles.inner}>
        <div className={styles.content}>
          <h1 className={`${styles.title} ${styles.reveal}`}>
            {title ?? "Construyo experiencias web rápidas que posicionan y convierten."}
          </h1>
          <p className={`${styles.sub} ${styles.reveal}`}>
            {subtitle ??
              "Desarrollo, diseño y SEO técnico para que tu marca destaque en buscadores y en la era de la IA."}
          </p>
          <div className={`${styles.actions} ${styles.reveal}`}>
            <Link href="/#contacto" className={styles.primary} data-track="home-hero-primary">
              Hablemos de tu proyecto
            </Link>
            <Link href="/recursos" className={styles.secondary} data-track="home-hero-resources">
              Ver recursos gratis
            </Link>
          </div>
        </div>

        <div className={`${styles.visual} ${styles.reveal}`} aria-hidden="true">
          <div className={styles.frame}>
            {len > 1 ? (
              <div
                className={`${styles.track} ${animate ? styles.animate : ""}`}
                style={{ transform: `translateX(-${pos * 50}%)` }}
                onTransitionEnd={handleTransitionEnd}
              >
                {windowIdx.map((i, k) => (
                  <div className={styles.slide} key={k}>
                    {renderVisual(i)}
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.single}>{renderVisual(0)}</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
