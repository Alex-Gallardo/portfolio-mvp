"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent, RefObject } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./AboutBrief.module.css";

export interface AboutSlide {
  /** Ruta en /public o URL. Déjalo vacío para usar el placeholder con degradado. */
  src?: string;
  alt: string;
}

interface AboutBriefProps {
  /** Etiqueta corta sobre el título. Pasa null/"" para ocultarla. */
  eyebrow?: string;
  title?: string;
  body?: string;
  href?: string;
  /** Imágenes que rotan en la card (mín. 3 recomendado). */
  slides?: AboutSlide[];
  /** Milisegundos entre cambios de imagen. */
  interval?: number;
}

const DEFAULT_INTERVAL = 5200;

// Reemplaza por tus imágenes reales: [{ src: "/about/uno.webp", alt: "..." }, ...]
const DEFAULT_SLIDES: AboutSlide[] = [
  { alt: "Vista previa 1" },
  { alt: "Vista previa 2" },
  { alt: "Vista previa 3" },
];

const cx = (...classes: Array<string | false | undefined>) => classes.filter(Boolean).join(" ");

/* ---------- hooks ----------
 *
 * Los tres hooks de abajo leen sistemas externos al render (matchMedia,
 * document.visibility, IntersectionObserver). El patrón correcto para eso es
 * useSyncExternalStore, no useState + useEffect: React se suscribe, lee el
 * valor real durante el render y no encadena un render extra por cada uno.
 * De paso desaparece el parpadeo del primer frame, en el que el hook antiguo
 * devolvía siempre `false` aunque el usuario tuviera reduced-motion activo.
 */

const noopSubscribe = () => () => {};
const alwaysTrue = () => true;
const alwaysFalse = () => false;

/** true solo después de hidratar. Sustituye a `useEffect(() => setMounted(true), [])`. */
function useIsHydrated() {
  return useSyncExternalStore(noopSubscribe, alwaysTrue, alwaysFalse);
}

/* -- prefers-reduced-motion -- */

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

let reducedMotionMql: MediaQueryList | null = null;
function getReducedMotionMql() {
  reducedMotionMql ??= window.matchMedia(REDUCED_MOTION_QUERY);
  return reducedMotionMql;
}

// Definidos fuera del componente: identidad estable = cero resuscripciones.
const subscribeReducedMotion = (onStoreChange: () => void) => {
  const mql = getReducedMotionMql();
  mql.addEventListener("change", onStoreChange);
  return () => mql.removeEventListener("change", onStoreChange);
};
const getReducedMotion = () => getReducedMotionMql().matches;

function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribeReducedMotion, getReducedMotion, alwaysFalse);
}

/* -- pestaña en segundo plano -- */

const subscribeVisibility = (onStoreChange: () => void) => {
  document.addEventListener("visibilitychange", onStoreChange);
  return () => document.removeEventListener("visibilitychange", onStoreChange);
};
const getDocumentHidden = () => document.hidden;

function useDocumentHidden() {
  return useSyncExternalStore(subscribeVisibility, getDocumentHidden, alwaysFalse);
}

/* -- visibilidad en viewport --
 *
 * Devuelve dos cosas de una sola suscripción:
 *   inView  -> vivo, para pausar el autoplay al salir de pantalla
 *   entered -> latch, para disparar la animación de entrada una única vez
 *
 * El latch vive dentro del snapshot en vez de en un efecto aparte, que era
 * justo lo que disparaba el tercer error del linter.
 */

type Visibility = { inView: boolean; entered: boolean };

const HIDDEN_SNAPSHOT: Visibility = { inView: false, entered: false };
const VISIBLE_SNAPSHOT: Visibility = { inView: true, entered: true };

function useVisibility<T extends Element>(ref: RefObject<T | null>, threshold = 0.25) {
  // El snapshot se guarda por referencia: getSnapshot debe devolver el MISMO
  // objeto mientras nada cambie, o React entra en bucle de renders.
  const snapshot = useRef<Visibility>(HIDDEN_SNAPSHOT);

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const el = ref.current;
      if (!el) return noopSubscribe();

      // Navegador sin IntersectionObserver: lo damos todo por visible.
      if (typeof IntersectionObserver === "undefined") {
        snapshot.current = VISIBLE_SNAPSHOT;
        onStoreChange();
        return noopSubscribe();
      }

      const io = new IntersectionObserver(
        ([entry]) => {
          const inView = entry?.isIntersecting ?? false;
          const current = snapshot.current;
          if (inView === current.inView) return;
          snapshot.current = { inView, entered: current.entered || inView };
          onStoreChange();
        },
        { threshold, rootMargin: "0px 0px -8% 0px" },
      );

      io.observe(el);
      return () => io.disconnect();
    },
    [ref, threshold],
  );

  return useSyncExternalStore(
    subscribe,
    () => snapshot.current,
    () => HIDDEN_SNAPSHOT,
  );
}

/* ---------- componente ---------- */

export function AboutBrief({
  eyebrow = "Sobre mí",
  title,
  body,
  href = "/about",
  slides,
  interval = DEFAULT_INTERVAL,
}: AboutBriefProps) {
  const items = slides && slides.length > 0 ? slides : DEFAULT_SLIDES;
  const len = items.length;

  const sectionRef = useRef<HTMLElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const reduced = usePrefersReducedMotion();
  const { inView, entered } = useVisibility(sectionRef);
  const tabHidden = useDocumentHidden();
  const mounted = useIsHydrated();

  const [hovering, setHovering] = useState(false);
  const [{ index, prev }, setSlide] = useState({ index: 0, prev: -1 });

  const goTo = useCallback((next: number) => {
    setSlide((s) => (s.index === next ? s : { index: next, prev: s.index }));
  }, []);

  const advance = useCallback(() => {
    setSlide((s) => ({ index: (s.index + 1) % len, prev: s.index }));
  }, [len]);

  // Autoplay: solo si está a la vista, sin hover/foco, con la pestaña activa y sin reduced-motion.
  const playing = mounted && inView && !hovering && !tabHidden && !reduced && len > 1;

  useEffect(() => {
    if (!playing) return undefined;
    const id = window.setTimeout(advance, interval);
    return () => window.clearTimeout(id);
  }, [playing, index, interval, advance]);

  /* Parallax + spotlight siguiendo el puntero (solo mouse/pen) */
  const setVars = (vars: Record<string, string>) => {
    const el = cardRef.current;
    if (!el) return;
    for (const [k, v] of Object.entries(vars)) el.style.setProperty(k, v);
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (reduced || e.pointerType === "touch") return;
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() =>
      setVars({
        "--mx": `${(x * 100).toFixed(2)}%`,
        "--my": `${(y * 100).toFixed(2)}%`,
        "--rx": `${((0.5 - y) * 5).toFixed(2)}deg`,
        "--ry": `${((x - 0.5) * 6).toFixed(2)}deg`,
        "--px": `${((0.5 - x) * 12).toFixed(2)}px`,
        "--py": `${((0.5 - y) * 10).toFixed(2)}px`,
      }),
    );
  };

  const resetPointer = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setVars({
      "--mx": "50%",
      "--my": "50%",
      "--rx": "0deg",
      "--ry": "0deg",
      "--px": "0px",
      "--py": "0px",
    });
  };

  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  const renderVisual = (item: AboutSlide, i: number) =>
    item.src ? (
      <Image
        src={item.src}
        alt={item.alt}
        fill
        sizes="(max-width: 768px) 92vw, 40vw"
        className={styles.img}
        draggable={false}
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
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="2.5" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="m21 15-4.5-4.5L5 22" />
        </svg>
      </span>
    );

  return (
    <section
      ref={sectionRef}
      className={cx(styles.about, mounted && styles.js, entered && styles.inView)}
      style={{ "--interval": `${interval}ms` } as CSSProperties}
    >
      <div className={styles.inner}>
        <div className={styles.content}>
          {eyebrow ? (
            <span className={styles.eyebrow} style={{ "--i": 0 } as CSSProperties}>
              {eyebrow}
            </span>
          ) : null}

          <h2 className={styles.h2} style={{ "--i": 1 } as CSSProperties}>
            {title ?? "Hola, me llamo Alexander"}
          </h2>

          <p className={styles.text} style={{ "--i": 2 } as CSSProperties}>
            {body ??
              "Dev full-stack enfocado en performance y experiencia. Diseño y construyo productos web rápidos, accesibles y pensados para crecer."}
          </p>
        </div>

        <div className={styles.cardWrap} style={{ "--i": 3 } as CSSProperties}>
          <div
            ref={cardRef}
            className={cx(styles.card, !playing && styles.paused)}
            onPointerMove={handlePointerMove}
            onPointerEnter={() => setHovering(true)}
            onPointerLeave={() => {
              setHovering(false);
              resetPointer();
            }}
            onFocusCapture={() => setHovering(true)}
            onBlurCapture={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHovering(false);
            }}
          >
            <div
              className={styles.thumb}
              role="group"
              aria-roledescription="carrusel"
              aria-label="Imágenes del perfil"
            >
              {items.map((item, i) => (
                <div
                  key={item.src ?? i}
                  className={cx(
                    styles.slide,
                    i === index && styles.slideActive,
                    i === prev && styles.slideLeaving,
                  )}
                  aria-hidden={i !== index}
                >
                  <div className={styles.media}>{renderVisual(item, i)}</div>
                </div>
              ))}
              <span className={styles.sheen} aria-hidden="true" />
              <span className={styles.vignette} aria-hidden="true" />
            </div>

            <div className={styles.footer}>
              <Link href={href} className={styles.cta} data-track="home-about">
                <span className={styles.ctaLabel}>Conóceme más</span>
                <span className={styles.arrow} aria-hidden="true">
                  →
                </span>
              </Link>

              {len > 1 ? (
                <div className={styles.dots}>
                  {items.map((item, i) => (
                    <button
                      key={item.src ?? i}
                      type="button"
                      className={cx(styles.dot, i === index && styles.dotActive)}
                      aria-label={`Ver imagen ${i + 1} de ${len}`}
                      aria-current={i === index}
                      onClick={() => goTo(i)}
                    >
                      {i === index ? (
                        <span key={index} className={styles.dotFill} aria-hidden="true" />
                      ) : null}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
