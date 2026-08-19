"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { getCoverRect, getSequencePosition } from "../../sequence";
import styles from "./DesignScrollExperience.module.css";

interface DesignCta {
  href: string;
  label: string;
}

export interface DesignChapter {
  eyebrow: string;
  title: string;
  body: string;
  align: "left" | "right";
  primaryCta?: DesignCta;
  secondaryCta?: DesignCta;
}

interface DesignScrollExperienceProps {
  desktopFrames: string[];
  mobileFrames: string[];
  chapters: DesignChapter[];
}

const MOBILE_QUERY = "(max-width: 700px), (orientation: portrait) and (max-width: 900px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const MAX_DECODED_FRAMES = 14;

function subscribeToQuery(query: string, callback: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function useMediaQuery(query: string, serverValue = false) {
  return useSyncExternalStore(
    (callback) => subscribeToQuery(query, callback),
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

function getNearestReadyFrame(cache: Map<number, HTMLImageElement>, index: number) {
  let nearest: HTMLImageElement | null = null;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const [candidateIndex, image] of cache) {
    if (!image.complete || image.naturalWidth === 0) continue;
    const distance = Math.abs(candidateIndex - index);
    if (distance < nearestDistance) {
      nearest = image;
      nearestDistance = distance;
    }
  }

  return nearest;
}

function drawCover(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
  alpha = 1,
) {
  const rect = getCoverRect(image.naturalWidth, image.naturalHeight, width, height);
  context.save();
  context.globalAlpha = alpha;
  context.drawImage(image, rect.x, rect.y, rect.width, rect.height);
  context.restore();
}

export function DesignScrollExperience({
  desktopFrames,
  mobileFrames,
  chapters,
}: DesignScrollExperienceProps) {
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const prefersReducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  const frames = isMobile ? mobileFrames : desktopFrames;
  const finalDesktop = desktopFrames.at(-1) ?? desktopFrames[0] ?? "";
  const finalMobile = mobileFrames.at(-1) ?? mobileFrames[0] ?? finalDesktop;

  const rootRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const posterRef = useRef<HTMLPictureElement | null>(null);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const [activeChapter, setActiveChapter] = useState(0);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas || frames.length === 0 || prefersReducedMotion) return;

    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;

    const cache = new Map<number, HTMLImageElement>();
    const inFlight = new Set<number>();
    let progress = 0;
    let animationFrame = 0;
    let cancelled = false;

    const trimCache = (centerIndex: number) => {
      if (cache.size <= MAX_DECODED_FRAMES) return;
      const removable = [...cache.keys()]
        .filter((index) => Math.abs(index - centerIndex) > 3)
        .sort((a, b) => Math.abs(b - centerIndex) - Math.abs(a - centerIndex));

      while (cache.size > MAX_DECODED_FRAMES && removable.length > 0) {
        const index = removable.shift();
        if (index === undefined) break;
        const image = cache.get(index);
        cache.delete(index);
        if (image) image.src = "";
      }
    };

    const resizeCanvas = () => {
      const bounds = canvas.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(bounds.width * pixelRatio));
      const height = Math.max(1, Math.round(bounds.height * pixelRatio));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const render = () => {
      animationFrame = 0;
      resizeCanvas();

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const position = getSequencePosition(progress, frames.length);
      const current = cache.get(position.currentIndex);
      const next = cache.get(position.nextIndex);
      const fallback = getNearestReadyFrame(cache, position.currentIndex);

      context.fillStyle = "#02040a";
      context.fillRect(0, 0, width, height);

      if (current?.complete && current.naturalWidth > 0) {
        drawCover(context, current, width, height);
      } else if (fallback) {
        drawCover(context, fallback, width, height);
      }

      if (
        next &&
        next !== current &&
        next.complete &&
        next.naturalWidth > 0 &&
        position.blend > 0
      ) {
        const easedBlend = position.blend * position.blend * (3 - 2 * position.blend);
        drawCover(context, next, width, height, easedBlend);
      }
    };

    const scheduleRender = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(render);
    };

    const ensureFrame = (index: number) => {
      if (index < 0 || index >= frames.length || cache.has(index) || inFlight.has(index)) return;
      inFlight.add(index);
      const image = new Image();
      image.decoding = "async";
      image.src = frames[index] ?? "";
      image.onload = () => {
        if (cancelled) return;
        inFlight.delete(index);
        cache.set(index, image);
        trimCache(getSequencePosition(progress, frames.length).currentIndex);
        if (index === 0) {
          posterRef.current?.setAttribute("data-hidden", "true");
          loaderRef.current?.setAttribute("data-hidden", "true");
        }
        scheduleRender();
      };
      image.onerror = () => inFlight.delete(index);
    };

    const warmFrames = (centerIndex: number) => {
      const offsets = [0, 1, -1, 2, -2, 3, -3, 4, -4];
      for (const offset of offsets) ensureFrame(centerIndex + offset);
    };

    const updateFromScroll = () => {
      const bounds = root.getBoundingClientRect();
      const scrollRange = Math.max(1, root.offsetHeight - window.innerHeight);
      progress = Math.min(1, Math.max(0, -bounds.top / scrollRange));
      root.style.setProperty("--design-progress", String(progress));

      const position = getSequencePosition(progress, frames.length);
      warmFrames(position.currentIndex);

      const chapterIndex = Math.min(
        chapters.length - 1,
        Math.max(0, Math.round(progress * (chapters.length - 1))),
      );
      setActiveChapter((current) => (current === chapterIndex ? current : chapterIndex));
      scheduleRender();
    };

    const resizeObserver = new ResizeObserver(() => scheduleRender());
    resizeObserver.observe(canvas);
    window.addEventListener("scroll", updateFromScroll, { passive: true });
    window.addEventListener("resize", updateFromScroll, { passive: true });

    ensureFrame(0);
    warmFrames(0);
    updateFromScroll();

    return () => {
      cancelled = true;
      resizeObserver.disconnect();
      window.removeEventListener("scroll", updateFromScroll);
      window.removeEventListener("resize", updateFromScroll);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      for (const image of cache.values()) image.src = "";
      cache.clear();
      inFlight.clear();
    };
  }, [chapters.length, frames, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <section className={styles.reducedExperience} aria-label="Experiencia de Diseño 3D">
        <picture className={styles.reducedPoster}>
          <source media={MOBILE_QUERY} srcSet={finalMobile} />
          <img src={finalDesktop} alt="" width="1672" height="941" />
        </picture>
        <div className={styles.reducedScrim} aria-hidden="true" />
        <div className={styles.reducedContent}>
          {chapters.map((chapter, index) => (
            <article key={chapter.eyebrow} className={styles.reducedChapter}>
              <p className={styles.eyebrow}>{chapter.eyebrow}</p>
              {index === 0 ? (
                <h1 className={styles.title}>{chapter.title}</h1>
              ) : (
                <h2 className={styles.title}>{chapter.title}</h2>
              )}
              <p className={styles.body}>{chapter.body}</p>
              <ChapterActions chapter={chapter} />
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section ref={rootRef} className={styles.story} aria-label="Experiencia de Diseño 3D">
      <div className={styles.stickyStage}>
        <picture ref={posterRef} className={styles.poster}>
          <source media={MOBILE_QUERY} srcSet={mobileFrames[0]} />
          <img src={desktopFrames[0]} alt="" width="1672" height="941" fetchPriority="high" />
        </picture>
        <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
        <div className={styles.scrim} aria-hidden="true" />

        <div className={styles.chapters}>
          {chapters.map((chapter, index) => (
            <article
              key={chapter.eyebrow}
              className={[
                styles.chapter,
                chapter.align === "right" ? styles.chapterRight : styles.chapterLeft,
                index === activeChapter ? styles.chapterActive : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-hidden={index !== activeChapter}
              inert={index !== activeChapter}
            >
              <div className={styles.copy}>
                <p className={styles.eyebrow}>{chapter.eyebrow}</p>
                {index === 0 ? (
                  <h1 className={styles.title}>{chapter.title}</h1>
                ) : (
                  <h2 className={styles.title}>{chapter.title}</h2>
                )}
                <p className={styles.body}>{chapter.body}</p>
                <ChapterActions chapter={chapter} />
                {index === 0 ? (
                  <span className={styles.scrollCue} aria-hidden="true">
                    Desliza para descubrir <span />
                  </span>
                ) : null}
              </div>
            </article>
          ))}
        </div>

        <div ref={loaderRef} className={styles.loader} role="status">
          Preparando la escena
        </div>
        <div className={styles.progress} aria-hidden="true">
          <span />
        </div>
      </div>
    </section>
  );
}

function ChapterActions({ chapter }: { chapter: DesignChapter }) {
  if (!chapter.primaryCta && !chapter.secondaryCta) return null;

  return (
    <div className={styles.actions}>
      {chapter.primaryCta ? (
        <Link
          href={chapter.primaryCta.href}
          className={styles.primary}
          data-track="design-cta-contact"
        >
          {chapter.primaryCta.label}
        </Link>
      ) : null}
      {chapter.secondaryCta ? (
        <Link
          href={chapter.secondaryCta.href}
          className={styles.secondary}
          data-track="design-cta-projects"
        >
          {chapter.secondaryCta.label}
        </Link>
      ) : null}
    </div>
  );
}
