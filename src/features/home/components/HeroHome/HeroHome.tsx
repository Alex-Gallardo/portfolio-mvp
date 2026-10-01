"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import { getImageProps } from "next/image";

import { useThemeStore } from "@/stores/useThemeStore";
import { HERO_CAMERA_DESKTOP, HERO_CAMERA_MOBILE } from "@/features/home/hero-scroll/camera-data";
import {
  HERO_MOBILE_QUERY,
  HERO_POSTERS,
  HERO_POSTER_SIZE,
  pickHeroVideo,
  type HeroTheme,
} from "@/features/home/hero-scroll/hero-media";
import {
  frameForProgress,
  frameFromTime,
  getScreenRect,
  getScrollProgress,
  seekTimeForFrame,
  smoothstep,
} from "@/features/home/hero-scroll/screen-rect";
import styles from "./HeroHome.module.css";

interface HeroHomeProps {
  title?: string;
  subtitle?: string;
  /** Línea tipo terminal sobre el H1, dentro del monitor. */
  eyebrow?: string;
}

const DEFAULT_TITLE = "Construyo experiencias web rápidas que posicionan y convierten.";
const DEFAULT_SUBTITLE =
  "Desarrollo, diseño y SEO técnico para que tu marca destaque en buscadores y en la era de la IA.";
const DEFAULT_EYEBROW = "~/portfolio · dev full-stack";

/** Ancho de la capa de diseño que se coloca sobre el monitor (ver HeroHome.module.css). */
const DESIGN_WIDTH = 1200;
/** Inercia del progreso: suaviza los saltos de la rueda del mouse. */
const EASING = 0.14;

// ─────────────────────────────────────────────────────────────
// Media queries como valor derivado (useSyncExternalStore): SSR-safe
// y sin setState dentro de efectos. Las funciones viven fuera del
// componente para que su referencia sea estable.
// ─────────────────────────────────────────────────────────────
function createMediaQueryStore(query: string) {
  return {
    subscribe(callback: () => void) {
      const media = window.matchMedia(query);
      media.addEventListener("change", callback);
      return () => media.removeEventListener("change", callback);
    },
    getSnapshot: () => window.matchMedia(query).matches,
    getServerSnapshot: () => false,
  };
}

const reducedMotionStore = createMediaQueryStore("(prefers-reduced-motion: reduce)");
const mobileStore = createMediaQueryStore(HERO_MOBILE_QUERY);

function useMediaQueryStore(store: ReturnType<typeof createMediaQueryStore>) {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
}

export function HeroHome({ title, subtitle, eyebrow }: HeroHomeProps) {
  const heading = title ?? DEFAULT_TITLE;
  const body = subtitle ?? DEFAULT_SUBTITLE;
  const tag = eyebrow ?? DEFAULT_EYEBROW;

  const theme = useThemeStore((s) => s.theme);
  const prefersReducedMotion = useMediaQueryStore(reducedMotionStore);
  const isMobile = useMediaQueryStore(mobileStore);

  const rootRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const screenRef = useRef<HTMLDivElement | null>(null);
  const actionsRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    const video = videoRef.current;
    const screen = screenRef.current;
    const actions = actionsRef.current;
    const panel = panelRef.current;
    if (!root || !stage || !video || !screen || !actions || !panel) return;

    // Durante la hidratación las media queries llegan con el valor del servidor (false).
    // Si no coinciden con el navegador, React vuelve a renderizar enseguida con el valor
    // real: no arrancamos nada en esta pasada para no descargar el video equivocado.
    if (
      reducedMotionStore.getSnapshot() !== prefersReducedMotion ||
      mobileStore.getSnapshot() !== isMobile
    ) {
      return;
    }

    // Hero estático: el CSS ya muestra todo; solo nos aseguramos de que los CTAs respondan.
    if (prefersReducedMotion) {
      actions.inert = false;
      return;
    }

    const camera = isMobile ? HERO_CAMERA_MOBILE : HERO_CAMERA_DESKTOP;
    const src = pickHeroVideo(
      isMobile ? "mobile" : "desktop",
      theme,
      window.innerWidth,
      window.devicePixelRatio || 1,
    );

    let cancelled = false;
    let objectUrl: string | null = null;
    let shownFrame = -1;
    let targetFrame = 0;
    let raf = 0;
    let inView = false;

    const readProgress = () => {
      const bounds = root.getBoundingClientRect();
      return getScrollProgress(bounds.top, bounds.height, window.innerHeight);
    };

    let eased = readProgress();

    // El CSS ya coloca el texto sobre el monitor en el frame 0;
    // aquí solo aplicamos el delta de cámara del frame que el video muestra.
    const place = (frame: number) => {
      const width = stage.clientWidth;
      const height = stage.clientHeight;
      const base = getScreenRect(camera, 0, width, height);
      const rect = getScreenRect(camera, frame, width, height);
      if (base.width === 0) return;
      screen.style.setProperty("--hero-dx", `${(rect.left - base.left).toFixed(2)}px`);
      screen.style.setProperty("--hero-dy", `${(rect.top - base.top).toFixed(2)}px`);
      screen.style.setProperty("--hero-ds", (rect.width / base.width).toFixed(5));
    };

    // En teléfonos altos, object-fit: cover recorta los lados del monitor:
    // el padding mantiene el texto dentro de la parte visible del último frame.
    const fitPadding = () => {
      if (!isMobile) {
        screen.style.removeProperty("--pad-inline");
        return;
      }
      const width = stage.clientWidth;
      const last = getScreenRect(camera, camera.frames - 1, width, stage.clientHeight);
      if (last.width === 0) return;
      const overflow = Math.max(0, -last.left, last.left + last.width - width);
      const unitsPerPx = DESIGN_WIDTH / last.width;
      screen.style.setProperty("--pad-inline", String(Math.round(overflow * unitsPerPx + 70)));
    };

    const choreograph = (progress: number) => {
      const glow = smoothstep(0.4, 0.56, progress);
      const cta = smoothstep(0.64, 0.78, progress);
      stage.style.setProperty("--hero-intro", (1 - smoothstep(0.01, 0.08, progress)).toFixed(3));
      stage.style.setProperty("--hero-glow", glow.toFixed(3));
      stage.style.setProperty("--hero-title", (0.8 + 0.2 * glow).toFixed(3));
      stage.style.setProperty("--hero-sub", smoothstep(0.56, 0.7, progress).toFixed(3));
      stage.style.setProperty("--hero-cta", cta.toFixed(3));
      stage.style.setProperty("--hero-out", smoothstep(0.94, 1, progress).toFixed(3));
      const hidden = cta < 0.5;
      actions.inert = hidden;
      panel.inert = hidden;
    };

    // Un seek a la vez: el siguiente se pide cuando el video confirma el anterior.
    const seek = () => {
      if (cancelled || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || video.seeking) {
        return;
      }
      if (targetFrame === shownFrame) return;
      video.currentTime = seekTimeForFrame(targetFrame, camera.fps);
    };

    const onSeeked = () => {
      shownFrame = frameFromTime(video.currentTime, camera.fps, camera.frames);
      place(shownFrame);
      stage.dataset.videoReady = "true";
      seek();
    };

    const onLoadedData = () => {
      shownFrame = -1;
      seek();
    };

    const tick = () => {
      raf = 0;
      const progress = readProgress();
      eased += (progress - eased) * EASING;
      if (Math.abs(progress - eased) < 0.0005) eased = progress;
      targetFrame = frameForProgress(eased, camera.frames);
      choreograph(eased);
      seek();
      if (inView && eased !== progress) raf = window.requestAnimationFrame(tick);
    };

    const wake = () => {
      if (inView && !raf) raf = window.requestAnimationFrame(tick);
    };

    const onResize = () => {
      fitPadding();
      place(Math.max(shownFrame, 0));
      wake();
    };

    // El archivo completo en memoria hace que cada seek sea instantáneo.
    const loadVideo = async () => {
      try {
        const response = await fetch(src);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const blob = await response.blob();
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        video.src = objectUrl;
      } catch {
        if (cancelled) return;
        video.src = src;
      }
    };

    const onVideoError = () => {
      if (objectUrl && video.src === objectUrl) video.src = src;
    };

    // No compite con el LCP: el video se pide cuando la página terminó de cargar.
    const startLoading = () => void loadVideo();

    const observer = new IntersectionObserver(([entry]) => {
      inView = entry?.isIntersecting ?? false;
      wake();
    });

    fitPadding();
    place(0);
    choreograph(eased);
    targetFrame = frameForProgress(eased, camera.frames);

    video.addEventListener("loadeddata", onLoadedData);
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("error", onVideoError);
    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    observer.observe(root);

    if (document.readyState === "complete") startLoading();
    else window.addEventListener("load", startLoading, { once: true });

    return () => {
      cancelled = true;
      if (raf) window.cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("scroll", wake);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", startLoading);
      video.removeEventListener("loadeddata", onLoadedData);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onVideoError);
      video.removeAttribute("src");
      video.load();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      delete stage.dataset.videoReady;
    };
  }, [prefersReducedMotion, isMobile, theme]);

  return (
    <section ref={rootRef} className={styles.hero} aria-labelledby="home-hero-title">
      <div ref={stageRef} className={styles.stage}>
        <ThemePoster theme="light" className={`${styles.poster} ${styles.posterDay}`} />
        <ThemePoster theme="dark" className={`${styles.poster} ${styles.posterNight}`} />
        <video
          ref={videoRef}
          className={styles.video}
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          aria-hidden="true"
          tabIndex={-1}
        />
        <div className={styles.scrim} aria-hidden="true" />

        {/* Capa de texto: en modo scroll vive dentro del monitor */}
        <div ref={screenRef} className={styles.screen}>
          <p className={styles.eyebrow}>{tag}</p>
          <h1 id="home-hero-title" className={styles.title}>
            {heading}
          </h1>
          <p className={styles.sub}>{body}</p>
          <div ref={actionsRef} className={styles.actions}>
            <HeroActions />
          </div>
        </div>

        <div className={styles.fade} aria-hidden="true" />

        {/* Vertical: subtítulo y CTAs bajo el monitor (el CSS oculta los del monitor) */}
        <div ref={panelRef} className={styles.panel}>
          <p className={styles.panelText}>{body}</p>
          <div className={styles.panelActions}>
            <HeroActions />
          </div>
        </div>

        <div className={styles.intro} aria-hidden="true">
          <span className={styles.mouse} />
          <span>Desliza para encender</span>
        </div>
      </div>
    </section>
  );
}

function HeroActions() {
  return (
    <>
      <Link href="/#contacto" className={styles.primary} data-track="home-hero-primary">
        Hablemos de tu proyecto
      </Link>
      <Link href="/recursos" className={styles.secondary} data-track="home-hero-resources">
        Ver recursos gratis
      </Link>
    </>
  );
}

/**
 * Poster del frame 0 (candidato a LCP) con dirección de arte horizontal/vertical.
 * Se renderizan los dos temas y el CSS oculta el que no aplica; con loading="lazy"
 * el oculto no se descarga (patrón recomendado en la doc de next/image para temas).
 */
function ThemePoster({ theme, className }: { theme: HeroTheme; className: string }) {
  const common = { alt: "", sizes: "100vw" };
  const {
    props: { srcSet: mobileSrcSet },
  } = getImageProps({ ...common, ...HERO_POSTER_SIZE.mobile, src: HERO_POSTERS.mobile[theme] });
  const { props: desktop } = getImageProps({
    ...common,
    ...HERO_POSTER_SIZE.desktop,
    src: HERO_POSTERS.desktop[theme],
  });

  return (
    <picture className={className}>
      <source media={HERO_MOBILE_QUERY} srcSet={mobileSrcSet} sizes={common.sizes} />
      <img {...desktop} alt="" fetchPriority="high" />
    </picture>
  );
}
