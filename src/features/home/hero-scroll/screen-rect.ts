import { clamp01, getCoverRect } from "@/features/design/sequence";

/**
 * Datos de cámara exportados junto al video del hero.
 * - `w`/`h`: tamaño del render en el que se calcularon las cámaras (no el del mp4 codificado).
 * - `screen`: rectángulo [x0, y0, x1, y1] de la pantalla del monitor en la imagen fuente.
 * - `cam[i]`: [x0, y0, s] → la imagen fuente se recorta desde (x0, y0) y se escala por `s`.
 */
export interface HeroCamera {
  w: number;
  h: number;
  fps: number;
  frames: number;
  screen: readonly [number, number, number, number];
  cam: readonly (readonly [number, number, number])[];
}

export interface ScreenRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export function clampFrame(frame: number, frameCount: number): number {
  if (frameCount <= 0) return 0;
  return Math.min(frameCount - 1, Math.max(0, Math.round(frame)));
}

/** Frame (0-based) que corresponde a un progreso de scroll 0 → 1. */
export function frameForProgress(progress: number, frameCount: number): number {
  return clampFrame(clamp01(progress) * (frameCount - 1), frameCount);
}

/** Tiempo de seek que cae en el centro del frame, para no depender del redondeo del decoder. */
export function seekTimeForFrame(frame: number, fps: number): number {
  return (frame + 0.5) / fps;
}

/** Frame que el video muestra en `time` segundos. */
export function frameFromTime(time: number, fps: number, frameCount: number): number {
  return Math.min(frameCount - 1, Math.max(0, Math.floor(time * fps + 1e-3)));
}

/** Progreso 0 → 1 de un contenedor sticky a partir de su getBoundingClientRect(). */
export function getScrollProgress(top: number, height: number, viewportHeight: number): number {
  const range = height - viewportHeight;
  if (range <= 0) return 0;
  return clamp01(-top / range);
}

export function smoothstep(edge0: number, edge1: number, value: number): number {
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/**
 * Rectángulo de la pantalla del monitor en píxeles del viewport para un frame,
 * cuando el video se pinta con `object-fit: cover` centrado.
 */
export function getScreenRect(
  camera: HeroCamera,
  frame: number,
  viewportWidth: number,
  viewportHeight: number,
): ScreenRect {
  const pose = camera.cam[clampFrame(frame, camera.cam.length)];
  const cover = getCoverRect(camera.w, camera.h, viewportWidth, viewportHeight);
  if (!pose || cover.width === 0) return { left: 0, top: 0, width: 0, height: 0 };

  const [x0, y0, s] = pose;
  const [sx0, sy0, sx1, sy1] = camera.screen;
  const k = cover.width / camera.w;

  return {
    left: cover.x + (sx0 - x0) * s * k,
    top: cover.y + (sy0 - y0) * s * k,
    width: (sx1 - sx0) * s * k,
    height: (sy1 - sy0) * s * k,
  };
}
