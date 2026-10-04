/**
 * Primitivas de dibujo pixel para las escenas de la tienda.
 * Todo se pinta a resolución lógica baja (≈180 px de alto) y el canvas se
 * escala con `image-rendering: pixelated`: cada píxel lógico es un bloque.
 */

export type Ctx = CanvasRenderingContext2D;
export type Mode = "day" | "night";

/** Fuente de luz: suma un halo con tramado al mapa de luz (y bloom opcional). */
export type Light = {
  x: number;
  y: number;
  r: number;
  color: string;
  a: number;
  /** 0..1 — cuánto halo aditivo deja por encima de la escena ya iluminada. */
  bloom?: number;
};

export interface Scene {
  layout(W: number, H: number): void;
  /** Materiales: lo que la luz tiñe. */
  base(ctx: Ctx, t: number, mode: Mode): void;
  ambient(mode: Mode): string;
  lights(t: number, mode: Mode): Light[];
  /** Formas de luz extra sobre el mapa de luz (haces de sol…). */
  lightShapes?(light: Ctx, t: number, mode: Mode): void;
  /** Píxeles con luz propia: se pintan DESPUÉS de iluminar, sin oscurecer. */
  emissive(ctx: Ctx, t: number, mode: Mode): void;
  /** Partículas y destellos: la capa más alta. */
  overlay(ctx: Ctx, t: number, mode: Mode): void;
}

/* ---------- Paleta ---------- */

export const PAL = {
  ink: "#1b1119",
  // madera
  w0: "#2b1a12",
  w1: "#4a2c1b",
  w2: "#6e4126",
  w3: "#8f5832",
  w4: "#b07440",
  w5: "#d4995a",
  // piedra / metal
  s0: "#232129",
  s1: "#3b3844",
  s2: "#5d5a68",
  s3: "#8b8898",
  s4: "#bdbac8",
  s5: "#eceaf2",
  // oro
  g0: "#6b4413",
  g1: "#a8711f",
  g2: "#dfa52c",
  g3: "#ffd43b",
  g4: "#fff3b0",
  // rojo
  r0: "#4f0f1f",
  r1: "#9c1f39",
  r2: "#e5484d",
  r3: "#ff8f8f",
  // azul (marca)
  b0: "#1a2357",
  b1: "#2c40bd",
  b2: "#4f6bff",
  b3: "#a9b8ff",
  // turquesa (acento)
  c0: "#0b3b3a",
  c1: "#00a08f",
  c2: "#00d4b8",
  c3: "#a6f7ea",
  // verde
  e0: "#1d3b17",
  e1: "#2f7d2a",
  e2: "#62c64b",
  e3: "#c0f59a",
  // púrpura
  p0: "#2a1650",
  p1: "#5c30a8",
  p2: "#9b6bff",
  p3: "#dccbff",
  // marca recursos
  o1: "#ff6b6b",
  o2: "#ffa94d",
  o3: "#ffd43b",
  // papel / tela
  k0: "#5a4632",
  k1: "#d9c39a",
  k2: "#efe0bf",
  k3: "#fff8e8",
  // chocolate
  h0: "#2e170c",
  h1: "#5b2f17",
  h2: "#80461f",
  white: "#ffffff",
} as const;

export type Tone = keyof typeof PAL;

/* ---------- Canvas ---------- */

export function makeCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.ceil(w));
  c.height = Math.max(1, Math.ceil(h));
  return c;
}

export function context(c: HTMLCanvasElement): Ctx {
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("shop-scene: canvas 2D no disponible");
  ctx.imageSmoothingEnabled = false;
  return ctx;
}

export function rect(ctx: Ctx, x: number, y: number, w: number, h: number, color: string) {
  if (w <= 0 || h <= 0) return;
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

export function px(ctx: Ctx, x: number, y: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
}

/** Disco relleno con borde pixel (sin antialias). */
export function disc(ctx: Ctx, cx: number, cy: number, r: number, color: string) {
  ctx.fillStyle = color;
  for (let y = -r; y <= r; y++) {
    const half = Math.floor(Math.sqrt(r * r - y * y) + 0.35);
    ctx.fillRect(Math.round(cx) - half, Math.round(cy) + y, half * 2 + 1, 1);
  }
}

/** Línea de 1 px (Bresenham simplificado por pasos). */
export function line(ctx: Ctx, x0: number, y0: number, x1: number, y1: number, color: string) {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  for (let i = 0; i <= steps; i++) {
    px(ctx, x0 + ((x1 - x0) * i) / steps, y0 + ((y1 - y0) * i) / steps, color);
  }
}

/* ---------- Tramado Bayer 4×4 ---------- */

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);

export function bayer(x: number, y: number): number {
  return BAYER[(y & 3) * 4 + (x & 3)] ?? 0.5;
}

/** Rellena con dos colores mezclados por tramado; `level(y)` 0..1 = cuánto B. */
export function ditherRect(
  ctx: Ctx,
  x0: number,
  y0: number,
  w: number,
  h: number,
  a: string,
  b: string,
  level: (y: number, x: number) => number,
) {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const gx = Math.round(x0) + x;
      const gy = Math.round(y0) + y;
      px(ctx, gx, gy, level(y, x) > bayer(gx, gy) ? b : a);
    }
  }
}

/* ---------- Color ---------- */

function rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/* ---------- Sprites ----------
   Un sprite es un mapa de caracteres; `key` traduce cada carácter a un tono.
   Un tono con "!" delante tiene luz propia: va también a la capa emisiva.
   Los tonos que no están en la paleta (p. ej. "liquid") se resuelven con
   `tint`, así una misma botella sirve para todas las pociones. */

export type SpriteDef = { map: readonly string[]; key: Readonly<Record<string, string>> };
export type Sprite = {
  w: number;
  h: number;
  base: HTMLCanvasElement;
  emit: HTMLCanvasElement | null;
};

const spriteCache = new Map<SpriteDef, Map<string, Sprite>>();

export function sprite(def: SpriteDef, tint: Readonly<Record<string, Tone>> = {}): Sprite {
  const tintKey = JSON.stringify(tint);
  let byTint = spriteCache.get(def);
  if (!byTint) {
    byTint = new Map();
    spriteCache.set(def, byTint);
  }
  const hit = byTint.get(tintKey);
  if (hit) return hit;

  const h = def.map.length;
  const w = def.map[0]?.length ?? 0;
  const base = makeCanvas(w, h);
  const bctx = context(base);
  let emit: HTMLCanvasElement | null = null;
  let ectx: Ctx | null = null;

  def.map.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const tone = def.key[row[x] ?? "."];
      if (!tone) continue;
      const glowing = tone.startsWith("!");
      const name = glowing ? tone.slice(1) : tone;
      const color = PAL[(tint[name] ?? name) as Tone];
      if (!color) continue;
      px(bctx, x, y, color);
      if (glowing) {
        if (!ectx) {
          emit = makeCanvas(w, h);
          ectx = context(emit);
        }
        px(ectx, x, y, color);
      }
    }
  });

  const s: Sprite = { w, h, base, emit };
  byTint.set(tintKey, s);
  return s;
}

/** Pinta un sprite. `pass: "emit"` sólo dibuja sus píxeles con luz propia. */
export function blit(
  ctx: Ctx,
  s: Sprite,
  x: number,
  y: number,
  pass: "base" | "emit" = "base",
  alpha = 1,
) {
  const src = pass === "emit" ? s.emit : s.base;
  if (!src || alpha <= 0) return;
  const prev = ctx.globalAlpha;
  ctx.globalAlpha = prev * alpha;
  ctx.drawImage(src, Math.round(x), Math.round(y));
  ctx.globalAlpha = prev;
}

/* ---------- Halos de luz ----------
   Caída radial cuantizada en 5 niveles con tramado Bayer: la firma clásica
   del pixel art en vez de un degradado suave. */

const glowCache = new Map<string, HTMLCanvasElement>();

export function glow(r: number, color: string): HTMLCanvasElement {
  const radius = Math.max(1, Math.round(r));
  const key = `${radius}|${color}`;
  const hit = glowCache.get(key);
  if (hit) return hit;

  const size = radius * 2 + 1;
  const c = makeCanvas(size, size);
  const ctx = context(c);
  const [cr, cg, cb] = rgb(color);
  const img = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const d = Math.hypot(x - radius, y - radius) / radius;
      if (d >= 1) continue;
      const l = (1 - d) ** 1.8;
      const v = Math.min(1, Math.floor(l * 5 + bayer(x, y)) / 5);
      if (v <= 0) continue;
      const i = (y * size + x) * 4;
      img.data[i] = cr * v;
      img.data[i + 1] = cg * v;
      img.data[i + 2] = cb * v;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  glowCache.set(key, c);
  return c;
}

export function drawGlow(ctx: Ctx, l: Light, scale = 1, alpha = 1) {
  const a = l.a * alpha;
  if (a <= 0.01) return;
  const g = glow(l.r * scale, l.color);
  const prev = ctx.globalAlpha;
  ctx.globalAlpha = Math.min(1, a);
  ctx.drawImage(g, Math.round(l.x - (g.width - 1) / 2), Math.round(l.y - (g.height - 1) / 2));
  ctx.globalAlpha = prev;
}

/* ---------- Destello 8-bit ----------
   El mismo sprite que centellea en las ResourceCard: punto → cruz →
   estrella → cruz → puntas → nada. `p` es el progreso 0..1 de su ciclo;
   la ventana visible es corta a propósito (se percibe como rareza). */

export function sparkle(ctx: Ctx, x: number, y: number, p: number, big = false) {
  const core = PAL.white;
  const arm = PAL.g3;
  const tip = PAL.o2;
  const f = p < 0.04 ? 0 : p < 0.08 ? 1 : p < 0.14 ? 2 : p < 0.18 ? 1 : p < 0.22 ? 3 : -1;
  if (f < 0) return;
  const cx = Math.round(x);
  const cy = Math.round(y);
  const plus = (d: number, c: string) => {
    px(ctx, cx + d, cy, c);
    px(ctx, cx - d, cy, c);
    px(ctx, cx, cy + d, c);
    px(ctx, cx, cy - d, c);
  };
  if (f === 0) px(ctx, cx, cy, arm);
  if (f === 1) {
    px(ctx, cx, cy, core);
    plus(1, arm);
  }
  if (f === 2) {
    px(ctx, cx, cy, core);
    plus(1, core);
    plus(2, arm);
    if (big) plus(3, tip);
    px(ctx, cx + 1, cy + 1, tip);
    px(ctx, cx - 1, cy + 1, tip);
    px(ctx, cx + 1, cy - 1, tip);
    px(ctx, cx - 1, cy - 1, tip);
  }
  if (f === 3) plus(big ? 3 : 2, tip);
}
