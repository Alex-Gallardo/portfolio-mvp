export type HeroOrientation = "desktop" | "mobile";
export type HeroTheme = "light" | "dark";

/**
 * Debe coincidir con el breakpoint de HeroHome.module.css:
 * en pantallas más altas que anchas se usa el video vertical 9:16.
 */
export const HERO_MOBILE_QUERY = "(max-aspect-ratio: 9/10)";

const BASE = "/hero/scroll";

/** Modo claro = la escena atardece; modo oscuro = ya es de noche y la lámpara está encendida. */
const MODE: Record<HeroTheme, "day" | "night"> = { light: "day", dark: "night" };

export const HERO_POSTERS = {
  desktop: { light: `${BASE}/poster-desktop-day.webp`, dark: `${BASE}/poster-desktop-night.webp` },
  mobile: { light: `${BASE}/poster-mobile-day.webp`, dark: `${BASE}/poster-mobile-night.webp` },
} as const;

export const HERO_POSTER_SIZE = {
  desktop: { width: 1920, height: 1080 },
  mobile: { width: 720, height: 1280 },
} as const;

/** Por encima de este ancho físico (px CSS × DPR) se usa el video 1080p en desktop. */
const HD_THRESHOLD = 1500;

export function pickHeroVideo(
  orientation: HeroOrientation,
  theme: HeroTheme,
  viewportWidth: number,
  devicePixelRatio: number,
): string {
  const mode = MODE[theme];
  if (orientation === "mobile") return `${BASE}/mobile-${mode}.mp4`;
  const hd = viewportWidth * devicePixelRatio > HD_THRESHOLD;
  return `${BASE}/desktop-${mode}-${hd ? "1080p" : "720p"}.mp4`;
}
