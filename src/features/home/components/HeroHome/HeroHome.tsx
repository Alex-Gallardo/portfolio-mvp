"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
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
  /** Secuencia en modo día (imagen 1 → 2 → 3). Si no se pasa, usa placeholders. */
  slides?: HeroSlide[];
  /** Secuencia en modo noche (imagen 4 → 5 → 6). Si no se pasa, reutiliza `slides`. */
  slidesDark?: HeroSlide[];
}

/** Tiempo entre cada paso de la secuencia (ms). La duración del fundido vive en el CSS (--hero-fade). */
const STEP_MS = 2000;
/** Pequeño respiro antes de arrancar cuando el hero entra a la vista. */
const START_DELAY_MS = 450;

// Reemplaza por tus imágenes reales en /public:
//   slides:     [{ src: "/hero/dia-1.webp", alt: "..." }, ...]  (cielo → libros → prado)
//   slidesDark: [{ src: "/hero/noche-1.webp", alt: "..." }, ...] (estrellas → libros → prado)
const DEFAULT_SLIDES: HeroSlide[] = [
  { alt: "Vista previa del proyecto 1" },
  { alt: "Vista previa del proyecto 2" },
  { alt: "Vista previa del proyecto 3" },
];
const DEFAULT_SLIDES_DARK: HeroSlide[] = DEFAULT_SLIDES;

// ─────────────────────────────────────────────────────────────
// Lectura de "prefers-reduced-motion" como VALOR DERIVADO.
// Usamos useSyncExternalStore (la forma idiomática de leer un
// sistema externo del navegador) en lugar de setState dentro de
// un efecto. Ventajas:
//   • No dispara la regla react-hooks/set-state-in-effect.
//   • Es SSR-safe: en el servidor devuelve `false` (no hay window),
//     así evitamos errores de hidratación en Next.js.
//   • Reacciona en vivo si el usuario cambia la preferencia.
// Las funciones se definen FUERA del componente para que su
// referencia sea estable (si no, useSyncExternalStore re-suscribe
// en cada render).
// ─────────────────────────────────────────────────────────────
function subscribeReducedMotion(callback: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}
function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function useReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion, // suscripción (solo corre en el cliente)
    getReducedMotionSnapshot, // snapshot en el cliente
    () => false, // snapshot en el servidor
  );
}

export function HeroHome({ title, subtitle, slides, slidesDark }: HeroHomeProps) {
  const day = slides && slides.length > 0 ? slides : DEFAULT_SLIDES;
  const night =
    slidesDark && slidesDark.length > 0
      ? slidesDark
      : slides && slides.length > 0
        ? slides
        : DEFAULT_SLIDES_DARK;
  const len = Math.max(day.length, night.length);

  const prefersReducedMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement | null>(null);
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0); // capa más alta visible de la secuencia (0 → len-1)

  // Si el usuario pidió menos movimiento, mostramos directamente la imagen final
  // como valor DERIVADO — sin animar y sin tocar el estado.
  const effectiveStep = prefersReducedMotion ? len - 1 : step;

  // Arranca cuando el hero entra en viewport (IntersectionObserver).
  // Se desactiva por completo cuando hay reduced-motion.
  useEffect(() => {
    if (prefersReducedMotion || started) return;

    const node = heroRef.current;
    if (!node) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setStarted(true); // ✅ dentro del callback de una suscripción: permitido
          io.disconnect(); // one-shot: no se repite
        }
      },
      { threshold: 0.35 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [prefersReducedMotion, started]);

  // Avanza la secuencia 0 → 1 → 2 una sola vez.
  // (Para fondo estático: comenta este efecto y usa effectiveStep = len - 1.)
  useEffect(() => {
    if (prefersReducedMotion || !started || step >= len - 1) return;
    const delay = step === 0 ? START_DELAY_MS : STEP_MS;
    const id = window.setTimeout(
      () => setStep((s) => Math.min(s + 1, len - 1)), // ✅ dentro de callback: permitido
      delay,
    );
    return () => window.clearTimeout(id);
  }, [prefersReducedMotion, started, step, len]);

  const renderLayer = (item: HeroSlide | undefined, i: number, priority: boolean) => {
    const visible = i <= effectiveStep;
    return (
      <div
        key={i}
        className={`${styles.layer} ${visible ? styles.layerOn : ""}`}
        style={{ zIndex: i + 1 }}
      >
        {item?.src ? (
          <Image
            src={item.src}
            alt={item.alt}
            fill
            sizes="100vw"
            className={styles.img}
            priority={priority}
            loading={priority ? undefined : "lazy"}
          />
        ) : (
          <div className={`${styles.placeholder} ${styles[`variant${i % 3}`]}`} />
        )}
      </div>
    );
  };

  return (
    <section className={styles.hero} ref={heroRef}>
      {/* Fondo a sangre completa: secuencias día/noche en capas + scrim de legibilidad */}
      <div className={styles.bg} aria-hidden="true">
        <div className={`${styles.stack} ${styles.dayStack}`}>
          {Array.from({ length: len }).map((_, i) => renderLayer(day[i], i, i === 0))}
        </div>
        <div className={`${styles.stack} ${styles.nightStack}`}>
          {Array.from({ length: len }).map((_, i) => renderLayer(night[i], i, i === 0))}
        </div>
        <div className={styles.scrim} />
      </div>

      {/* Contenido centrado encima del fondo */}
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
            <Link href="/#contacto" className={styles.secondary} data-track="home-hero-primary">
              Hablemos de tu proyecto
            </Link>
            <Link href="/recursos" className={styles.secondary} data-track="home-hero-resources">
              Ver recursos gratis
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
