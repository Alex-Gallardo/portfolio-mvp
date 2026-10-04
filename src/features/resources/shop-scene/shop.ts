import { cycle, flicker, hash, wave, wind } from "./loop";
import {
  PAL,
  bayer,
  blit,
  blitSheared,
  context,
  disc,
  line,
  makeCanvas,
  px,
  rect,
  sparkle,
  sprite,
  type Ctx,
  type Light,
  type Scene,
  type Sprite,
  type Tone,
} from "./draw";
import { drawRoom } from "./room";
import { planShop, type Rect, type ShopPlan } from "./shop-layout";
import * as S from "./sprites";

/**
 * La tienda del aventurero (v2). El plano (`planShop`) decide dónde va cada
 * mueble; aquí se pinta. Lo inmóvil se pre-renderiza una vez por layout
 * (`staticBase` / `staticEmit`); cada fotograma sólo dibuja lo que se mueve:
 * cielo, cortinas, colgantes, plantas, llamas, flotantes, el gato y las
 * partículas. Todo con frecuencias enteras sobre LOOP (bucle sin corte).
 */

type Placed = { s: Sprite; x: number; y: number };
type Spark = { x: number; y: number; k: number; o: number; big?: boolean };
type Glow = { x: number; y: number; r: number; color: string; a: number; bloom?: number };
type Flame = { x: number; y: number; seed: number };

const LIQUIDS: [Tone, Tone][] = [
  ["r2", "r1"],
  ["b2", "b1"],
  ["e2", "e1"],
  ["p2", "p1"],
  ["o2", "o1"],
  ["c2", "c1"],
];
const BOOK_TONES: [Tone, Tone][] = [
  ["r1", "r2"],
  ["b1", "b2"],
  ["e1", "e2"],
  ["p1", "p2"],
  ["w3", "w4"],
  ["c1", "c2"],
  ["v2", "v3"],
  ["h1", "h2"],
];
const GEM_TONES: [Tone, Tone][] = [
  ["c2", "c1"],
  ["p2", "p1"],
  ["r2", "r1"],
  ["e2", "e1"],
];
const POTION_SPRITES = [S.ROUND_POTION, S.HEART_POTION, S.FLASK_POTION, S.VIAL];

/** Qué se coloca en cada tabla; se recorre en bucle hasta llenarla. */
const SHELF_PLANS = [
  ["books", "potions", "skull", "books"],
  ["jar", "books", "gems", "jar"],
  ["potions", "plant", "books", "potions"],
  ["books", "bomb", "jar", "books"],
  ["books", "scroll", "books", "jar"],
  ["potions", "books", "gems", "skull"],
] as const;

type ShelfKind = (typeof SHELF_PLANS)[number][number];

const FLAME_FRAMES = [
  [".y.", "yWy", "oYo", ".o."],
  ["y..", ".yy", "oWo", ".o."],
  ["..y", "yy.", "oWo", ".o."],
];
const FLAME_KEY: Record<string, Tone> = { W: "g4", Y: "g3", y: "o2", o: "o1" };

function flame(c: Ctx, x: number, y: number, frame: number, lean: number) {
  const f = FLAME_FRAMES[((frame % 3) + 3) % 3] ?? FLAME_FRAMES[0]!;
  f.forEach((row, r) => {
    const shift = r < 2 ? lean : 0;
    for (let i = 0; i < row.length; i++) {
      const tone = FLAME_KEY[row[i] ?? "."];
      if (tone) px(c, x - 1 + i + shift, y + r, PAL[tone]);
    }
  });
}

/** ¿Está (x, y) dentro del ventanal en arco, a `inset` px del borde? */
function inArch(x: number, y: number, w: Rect, inset: number): boolean {
  const r = w.w / 2;
  const cx = w.x + r - 0.5;
  const cy = w.y + r;
  if (x < w.x + inset || x > w.x + w.w - 1 - inset || y > w.y + w.h - 1 - inset) return false;
  if (y >= cy) return true;
  return Math.hypot(x - cx, y - cy) <= r - inset;
}

export function createShopScene(): Scene {
  let p: ShopPlan = planShop(320, 200);
  let staticBase = makeCanvas(1, 1);
  let staticEmit = makeCanvas(1, 1);
  let skyDay = makeCanvas(1, 1);
  let skyNight = makeCanvas(1, 1);
  let skyMask = makeCanvas(1, 1);
  let skyLayer = makeCanvas(1, 1);
  let shaft = makeCanvas(1, 1);
  let shaftBox: Rect = { x: 0, y: 0, w: 1, h: 1 };

  let sparks: Spark[] = [];
  let glows: Glow[] = [];
  let flames: Flame[] = [];
  let fuses: { x: number; y: number }[] = [];
  let book = { x: 0, y: 0 };
  let ball = { x: 0, y: 0 };
  let crystal = { x: 0, y: 0 };
  let floatBook = { x: 0, y: 0 };
  let cauldron: { x: number; y: number; w: number } | null = null;
  let floorPlant: { x: number; y: number } | null = null;
  let hangingPlants: { x: number; len: number }[] = [];
  let herbs: { x: number; len: number; phase: number }[] = [];
  let sillPlants: { x: number; y: number }[] = [];
  let note: { x: number; y: number } | null = null;
  let stars: { x: number; y: number; i: number }[] = [];
  let motes: { x: number; y: number; i: number }[] = [];

  /* ---------- Piezas estáticas ---------- */

  function drawWindowFrame(c: Ctx) {
    const w = p.window;
    // Sillares del arco alrededor del ventanal
    const outer: Rect = { x: w.x - 5, y: w.y - 5, w: w.w + 10, h: w.h + 6 };
    for (let y = outer.y; y < w.y + w.h + 1; y++) {
      for (let x = outer.x; x < outer.x + outer.w; x++) {
        if (!inArch(x, y, outer, 0) || inArch(x, y, w, 0)) continue;
        const seam = (x + y * 3) % 7 === 0;
        px(c, x, y, seam ? PAL.q1 : y < w.y + w.w / 2 ? PAL.q4 : PAL.q3);
      }
    }
    // Marco de madera (2 px) por dentro del arco
    for (let y = w.y; y < w.y + w.h; y++) {
      for (let x = w.x; x < w.x + w.w; x++) {
        if (inArch(x, y, w, 0) && !inArch(x, y, w, 2)) px(c, x, y, PAL.w1);
      }
    }
    // Alféizar
    rect(c, p.sill.x, p.sill.y, p.sill.w, 3, PAL.w4);
    rect(c, p.sill.x, p.sill.y, p.sill.w, 1, PAL.w5);
    rect(c, p.sill.x, p.sill.y + 3, p.sill.w, 1, PAL.w0);
    // Barra de las cortinas
    rect(c, w.x - p.gap - 2, w.y - 3, w.w + p.gap * 2 + 4, 2, PAL.s2);
    px(c, w.x - p.gap - 3, w.y - 3, PAL.g2);
    px(c, w.x + w.w + p.gap + 2, w.y - 3, PAL.g2);
  }

  function buildSky() {
    const w = p.window;
    skyDay = makeCanvas(w.w, w.h);
    skyNight = makeCanvas(w.w, w.h);
    skyMask = makeCanvas(w.w, w.h);
    skyLayer = makeCanvas(w.w, w.h);
    const d = context(skyDay);
    const n = context(skyNight);
    const m = context(skyMask);
    const local: Rect = { x: 0, y: 0, w: w.w, h: w.h };
    const horizon = Math.round(w.h * 0.78);

    // Silueta de montañas (noche) y colinas (día): ruido determinista suave
    const ridge = (x: number, amp: number, base: number, seed: number) =>
      base -
      Math.round(
        amp * (0.5 + 0.35 * Math.sin(x * 0.11 + seed) + 0.15 * Math.sin(x * 0.29 + seed * 2)),
      );

    for (let y = 0; y < w.h; y++) {
      const q = y / horizon;
      for (let x = 0; x < w.w; x++) {
        if (!inArch(x, y, local, 2)) continue;
        px(m, x, y, "#000");
        const b = bayer(x, y);
        // Noche: añil arriba, púrpura hacia el horizonte
        let nTone: string = PAL.n0;
        if (q < 0.35) nTone = q * 3 > b ? PAL.n1 : PAL.n0;
        else if (q < 0.7) nTone = (q - 0.35) * 3 > b ? PAL.n2 : PAL.n1;
        else nTone = (q - 0.7) * 3 > b ? PAL.n3 : PAL.n2;
        px(n, x, y, nTone);
        // Día: azul arriba, casi blanco en el horizonte
        const dTone = q < 0.5 ? (q * 2 > b ? PAL.y1 : PAL.y0) : (q - 0.5) * 2 > b ? PAL.y2 : PAL.y1;
        px(d, x, y, dTone);
        // Montañas lejanas y cercanas
        if (y >= ridge(x, w.h * 0.18, horizon + 4, 1.3)) {
          px(n, x, y, PAL.p0);
          px(d, x, y, PAL.e1);
        }
        if (y >= ridge(x, w.h * 0.1, horizon + 12, 4.1)) {
          px(n, x, y, PAL.q0);
          px(d, x, y, PAL.e0);
        }
      }
    }
    // Luna creciente (arriba a la derecha) y sol (arriba a la izquierda)
    const r = Math.max(4, Math.round(w.w * 0.09));
    const mx = Math.round(w.w * 0.66);
    const my = Math.round(w.w * 0.32);
    disc(n, mx, my, r, PAL.k3);
    disc(n, mx - 1, my - 1, r - 1, PAL.g4);
    disc(n, mx + Math.ceil(r * 0.55), my - Math.ceil(r * 0.35), r, PAL.n0);
    disc(d, Math.round(w.w * 0.3), my, r + 1, PAL.g3);
    disc(d, Math.round(w.w * 0.3), my, r - 1, PAL.g4);

    stars = Array.from({ length: 14 }, (_, i) => ({
      x: 3 + Math.floor(hash(i + 900) * (w.w - 6)),
      y: 3 + Math.floor(hash(i + 950) * horizon * 0.7),
      i,
    })).filter((s) => inArch(s.x, s.y, local, 3));
  }

  function drawSky(c: Ctx, t: number, night: boolean) {
    const w = p.window;
    const s = context(skyLayer);
    s.globalCompositeOperation = "source-over";
    s.clearRect(0, 0, w.w, w.h);
    s.drawImage(night ? skyNight : skyDay, 0, 0);
    if (night) {
      for (const st of stars) {
        if (wave(t, 2 + (st.i % 5), st.i) <= -0.3) continue;
        px(s, st.x, st.y, st.i % 3 ? PAL.k3 : PAL.g4);
        if (st.i % 4 === 0 && wave(t, 3, st.i) > 0.7) {
          px(s, st.x + 1, st.y, PAL.n3);
          px(s, st.x - 1, st.y, PAL.n3);
        }
      }
      // Estrella fugaz: cruza una vez por bucle
      const q = cycle(t, 1, 0.15);
      if (q < 0.06) {
        const k = q / 0.06;
        const hx = Math.round(w.w * (0.15 + 0.7 * k));
        const hy = Math.round(w.h * (0.12 + 0.25 * k));
        for (let i = 0; i < 6; i++) {
          s.globalAlpha = 1 - i / 6;
          px(s, hx - i, hy - Math.round(i * 0.4), i ? PAL.k3 : PAL.white);
        }
        s.globalAlpha = 1;
      }
    } else {
      // Nubes que cruzan una vez por bucle: salen por un lado y entran por el otro
      for (let i = 0; i < 3; i++) {
        const span = w.w + 30;
        const cx = Math.round(cycle(t, 1, i / 3) * span) - 15;
        const cy = Math.round(w.h * (0.14 + i * 0.13));
        for (const [ox, oy, len] of [
          [0, 1, 12],
          [3, 0, 6],
          [1, 2, 11],
          [5, -1, 3],
        ] as const) {
          rect(s, cx + ox, cy + oy, len, 1, PAL.white);
        }
        rect(s, cx + 1, cy + 3, 10, 1, PAL.y2);
      }
    }
    s.globalCompositeOperation = "destination-in";
    s.drawImage(skyMask, 0, 0);
    s.globalCompositeOperation = "source-over";
    c.drawImage(skyLayer, w.x, w.y);

    // Parteluces: siluetas oscuras por delante del cielo
    const mid = w.x + Math.round(w.w / 2);
    for (let y = w.y + 2; y < w.y + w.h - 2; y++) {
      if (inArch(mid, y, w, 2)) px(c, mid, y, PAL.w1);
      for (const fx of [0.25, 0.75]) {
        const x = w.x + Math.round(w.w * fx);
        if (y > w.y + w.w * 0.3 && inArch(x, y, w, 2)) px(c, x, y, PAL.w1);
      }
    }
    for (const fy of [0.42, 0.68]) {
      const y = w.y + Math.round(w.h * fy);
      for (let x = w.x + 2; x < w.x + w.w - 2; x++) if (inArch(x, y, w, 2)) px(c, x, y, PAL.w1);
    }
  }

  function buildShaft() {
    // Haz de luz del ventanal hacia el suelo, abriéndose hacia delante
    const w = p.window;
    const x0 = w.x + 4;
    const x1 = w.x + w.w - 4;
    const y0 = w.y + Math.round(w.w * 0.4);
    const y1 = p.floorY + 10;
    const bx0 = x0 - Math.round(p.W * 0.08);
    const bx1 = x1 + Math.round(p.W * 0.02);
    const left = Math.min(x0, bx0);
    shaftBox = { x: left, y: y0, w: Math.max(x1, bx1) - left, h: y1 - y0 };
    shaft = makeCanvas(shaftBox.w, shaftBox.h);
    const c = context(shaft);
    const barW = Math.max(6, Math.round((x1 - x0) / 4));
    for (let y = 0; y < shaftBox.h; y++) {
      const q = y / shaftBox.h;
      const a = x0 + (bx0 - x0) * q - left;
      const b = x1 + (bx1 - x1) * q - left;
      const level = 0.8 * (1 - q * 0.6);
      for (let x = Math.floor(a); x < b; x++) {
        const edge = Math.min(1, Math.min(x - a, b - x) / 4);
        // Sombras verticales de los parteluces dentro del haz
        const bar = (x - Math.floor(a)) % barW === 0 ? 0.5 : 1;
        if (edge * level * bar > bayer(x + left, y + y0)) px(c, x, y, "#ffffff");
      }
    }
  }

  function drawShelfFrame(c: Ctx, r: Rect, boards: number[]) {
    rect(c, r.x, r.y, r.w, r.h, PAL.w0);
    for (let y = r.y + 4; y < r.y + r.h; y += 6) rect(c, r.x + 3, y, r.w - 6, 1, PAL.ink);
    rect(c, r.x, r.y, 3, r.h, PAL.w3);
    rect(c, r.x + r.w - 3, r.y, 3, r.h, PAL.w2);
    rect(c, r.x + 1, r.y, 1, r.h, PAL.w4);
    // Corona moldurada
    rect(c, r.x - 3, r.y - 4, r.w + 6, 4, PAL.w3);
    rect(c, r.x - 3, r.y - 4, r.w + 6, 1, PAL.w5);
    rect(c, r.x - 2, r.y, r.w + 4, 1, PAL.w1);
    for (const by of boards) {
      rect(c, r.x, by, r.w, 3, PAL.w3);
      rect(c, r.x, by, r.w, 1, PAL.w5);
      rect(c, r.x, by + 3, r.w, 1, PAL.ink);
    }
  }

  function fillShelf(c: Ctx, r: Rect, boards: number[], side: number, items: Placed[]) {
    const x0 = r.x + 4;
    const x1 = r.x + r.w - 4;
    boards.forEach((by, bi) => {
      const plan = SHELF_PLANS[(bi + side * 2) % SHELF_PLANS.length]!;
      let x = x0;
      let misses = 0;
      for (let step = 0; step < 40 && x < x1 - 3 && misses < plan.length; step++) {
        const kind: ShelfKind = plan[step % plan.length]!;
        const used = placeItem(c, kind, x, by, x1 - x, bi * 31 + step * 7 + side * 101, items);
        if (used > 0) {
          x += used + 2;
          misses = 0;
        } else {
          misses++;
        }
      }
    });
  }

  /** Coloca un objeto sobre la tabla `by`; devuelve el ancho usado (0 = no cabe). */
  function placeItem(
    c: Ctx,
    kind: ShelfKind,
    x: number,
    by: number,
    room: number,
    seed: number,
    items: Placed[],
  ): number {
    if (kind === "books") {
      const n = 3 + Math.floor(hash(seed) * 4);
      let used = 0;
      for (let i = 0; i < n; i++) {
        const bw = 2 + Math.floor(hash(seed + i * 3) * 3);
        if (used + bw > room) break;
        const bh = 9 + Math.floor(hash(seed + i * 5) * 5);
        const [dark, light] = BOOK_TONES[Math.floor(hash(seed + i * 7) * BOOK_TONES.length)]!;
        const bx = x + used;
        rect(c, bx, by - bh, bw, bh, PAL[dark]);
        rect(c, bx, by - bh, 1, bh, PAL[light]);
        rect(c, bx, by - bh + 2, bw, 1, PAL.g2);
        rect(c, bx, by - 3, bw, 1, PAL.g2);
        if (bw > 2) px(c, bx + 1, by - Math.round(bh / 2), PAL.g3);
        used += bw;
      }
      // Un libro inclinado apoyado en la fila
      if (used + 6 <= room && hash(seed + 99) > 0.5) {
        const [dark] = BOOK_TONES[Math.floor(hash(seed + 77) * BOOK_TONES.length)]!;
        for (let k = 0; k < 10; k++)
          rect(c, x + used + Math.round(k * 0.35), by - 1 - k, 3, 1, PAL[dark]);
        used += 6;
      }
      return used;
    }
    if (kind === "potions") {
      let used = 0;
      for (let i = 0; i < 3; i++) {
        const def = POTION_SPRITES[Math.floor(hash(seed + i * 11) * POTION_SPRITES.length)]!;
        const [liquid, liquidDark] = LIQUIDS[Math.floor(hash(seed + i * 13) * LIQUIDS.length)]!;
        const s = sprite(def, { liquid, liquidDark });
        if (used + s.w > room) break;
        items.push({ s, x: x + used, y: by - s.h });
        glows.push({ x: x + used + s.w / 2, y: by - 4, r: 10, color: PAL[liquid], a: 0.5 });
        if (i === 1)
          sparks.push({ x: x + used + 2, y: by - s.h + 6, k: 2 + (seed % 3), o: hash(seed) });
        used += s.w + 1;
      }
      return Math.max(0, used - 1);
    }
    if (kind === "jar") {
      const s = sprite(S.LABEL_JAR, {
        content: (["h1", "r1", "p1", "e1"] as Tone[])[seed % 4]!,
        mark: (["o1", "c2", "g2", "b2"] as Tone[])[seed % 4]!,
      });
      if (s.w > room) return 0;
      items.push({ s, x, y: by - s.h });
      return s.w;
    }
    if (kind === "skull") {
      const s = sprite(S.SKULL);
      if (s.w > room) return 0;
      items.push({ s, x, y: by - s.h });
      return s.w;
    }
    if (kind === "gems") {
      let used = 0;
      for (let i = 0; i < 2; i++) {
        const [gem, gemDark] = GEM_TONES[(seed + i) % GEM_TONES.length]!;
        const s = sprite(S.GEM, { gem, gemDark });
        if (used + s.w > room) break;
        items.push({ s, x: x + used, y: by - s.h });
        glows.push({ x: x + used + 2, y: by - 3, r: 7, color: PAL[gem], a: 0.55 });
        used += s.w + 1;
      }
      if (used) sparks.push({ x: x + 2, y: by - 4, k: 3, o: hash(seed + 5) });
      return Math.max(0, used - 1);
    }
    if (kind === "plant") {
      const pot = sprite(S.SMALL_POT);
      const leaves = sprite(S.SMALL_LEAVES);
      if (pot.w > room) return 0;
      items.push({ s: leaves, x, y: by - pot.h - leaves.h + 1 }, { s: pot, x, y: by - pot.h });
      return pot.w;
    }
    if (kind === "bomb") {
      if (room < 10) return 0;
      const cx = x + 4;
      const cy = by - 5;
      disc(c, cx, cy, 4, PAL.ink);
      disc(c, cx, cy, 3, PAL.s1);
      px(c, cx - 1, cy - 2, PAL.s3);
      px(c, cx - 2, cy - 1, PAL.s2);
      rect(c, cx - 1, cy, 3, 2, PAL.k3);
      px(c, cx, cy + 1, PAL.ink);
      rect(c, cx, cy - 6, 1, 2, PAL.s2);
      line(c, cx + 1, cy - 6, cx + 3, cy - 8, PAL.k1);
      fuses.push({ x: cx + 3, y: cy - 9 });
      return 9;
    }
    if (kind === "scroll") {
      const s = sprite(S.SCROLL);
      if (s.w + 1 > room) return 0;
      items.push({ s, x, y: by - 3 }, { s, x: x + 1, y: by - 6 });
      return s.w + 1;
    }
    return 0;
  }

  function drawStaffFrame(c: Ctx, x: number, y: number, h: number) {
    const w = 14;
    rect(c, x, y, w, h, PAL.w3);
    rect(c, x, y, w, 1, PAL.w5);
    rect(c, x + 2, y + 2, w - 4, h - 4, PAL.p0);
    rect(c, x + 2, y + 2, w - 4, 1, PAL.ink);
    const sx = x + Math.round(w / 2);
    rect(c, sx, y + 9, 1, h - 12, PAL.w4);
    for (let by = y + 14; by < y + h - 4; by += 8) rect(c, sx - 1, by, 3, 1, PAL.g2);
    // Luna creciente con gema
    disc(c, sx, y + 6, 3, PAL.b3);
    disc(c, sx + 2, y + 5, 3, PAL.p0);
    px(c, sx - 1, y + 8, PAL.p2);
    glows.push({ x: sx, y: y + 9, r: 14, color: PAL.p2, a: 0.6, bloom: 0.8 });
    sparks.push({ x: sx - 2, y: y + 5, k: 3, o: 0.44 });
  }

  function drawRack(c: Ctx, r: Rect, items: Placed[]) {
    const helmet = sprite(S.HELMET);
    const top = r.y + 4;
    const shelfY = top + helmet.h + 2;
    const bottom = shelfY + 5 + 28;
    rect(c, r.x + 2, top, r.w - 4, bottom - top, PAL.w0);
    rect(c, r.x + 3, top + 1, r.w - 6, bottom - top - 2, PAL.w1);
    for (let y = top + 3; y < bottom - 2; y += 4) {
      for (let x = r.x + 5; x < r.x + r.w - 4; x += 4) px(c, x, y, PAL.w0);
    }
    rect(c, r.x + 4, shelfY, r.w - 8, 2, PAL.w3);
    rect(c, r.x + 4, shelfY + 2, r.w - 8, 1, PAL.ink);
    const hx = Math.round(r.x + r.w / 2 - helmet.w / 2);
    items.push({ s: helmet, x: hx, y: shelfY - helmet.h });
    sparks.push({ x: hx + 4, y: shelfY - helmet.h + 5, k: 2, o: 0.62 });

    const rowY = shelfY + 5;
    let x = r.x + 6;
    const fits = (w: number) => x + w <= r.x + r.w - 5;
    const sword = sprite(S.SWORD);
    if (fits(sword.w)) {
      items.push({ s: sword, x, y: rowY });
      glows.push({ x: x + 3, y: rowY + 9, r: 15, color: PAL.c3, a: 0.5, bloom: 0.5 });
      sparks.push({ x: x + 3, y: rowY + 1, k: 3, o: 0.15, big: true });
      x += sword.w + 2;
    }
    const axe = sprite(S.AXE);
    if (fits(axe.w)) {
      items.push({ s: axe, x, y: rowY + 4 });
      x += axe.w + 2;
    }
    const sr = 7;
    if (fits(sr * 2 + 1)) {
      const sx = x + sr;
      const sy = rowY + 10;
      disc(c, sx, sy, sr, PAL.ink);
      disc(c, sx, sy, sr - 1, PAL.s3);
      disc(c, sx, sy, sr - 2, PAL.w3);
      rect(c, sx - 1, sy - sr + 2, 3, sr * 2 - 3, PAL.o1);
      rect(c, sx - sr + 2, sy - 1, sr * 2 - 3, 3, PAL.o1);
      disc(c, sx, sy, 2, PAL.g2);
      px(c, sx - 1, sy - 1, PAL.g4);
      sparks.push({ x: sx, y: sy, k: 2, o: 0.31 });
      x += sr * 2 + 3;
    }
    if (fits(6)) {
      const bh = 24;
      for (let i = 0; i <= bh; i++) {
        const bend = Math.round(4 * Math.sin((Math.PI * i) / bh));
        px(c, x + bend, rowY - 1 + i, PAL.w4);
        px(c, x + bend + 1, rowY - 1 + i, PAL.w2);
      }
      line(c, x, rowY - 1, x, rowY - 1 + bh, PAL.k2);
    }
  }

  function drawCauldronBody(c: Ctx, k: { x: number; y: number; w: number }) {
    rect(c, k.x + 2, k.y + 13, 2, 4, PAL.s1);
    rect(c, k.x + k.w - 4, k.y + 13, 2, 4, PAL.s1);
    for (let i = 0; i < 13; i++) {
      const inset = Math.round(3 * (i / 12) ** 2.2);
      rect(c, k.x + inset, k.y + 2 + i, k.w - inset * 2, 1, i < 3 ? PAL.s2 : PAL.s1);
      px(c, k.x + inset + 1, k.y + 2 + i, PAL.s3);
    }
    rect(c, k.x - 1, k.y, k.w + 2, 3, PAL.s3);
    rect(c, k.x - 1, k.y, k.w + 2, 1, PAL.s4);
  }

  function drawCounter(c: Ctx, items: Placed[]) {
    const k = p.counter;
    const v = p.vitrina;
    // Cuerpo y tablero
    rect(c, k.x, k.y, k.w, k.h, PAL.w2);
    rect(c, k.x - 3, k.y, k.w + 6, 4, PAL.w4);
    rect(c, k.x - 3, k.y, k.w + 6, 1, PAL.w5);
    rect(c, k.x - 3, k.y + 3, k.w + 6, 1, PAL.ink);

    // Vitrina: terciopelo, repisa de cristal y objetos
    rect(c, v.x - 2, v.y - 1, v.w + 4, v.h + 3, PAL.w1);
    for (let y = 0; y < v.h; y++) {
      for (let x = 0; x < v.w; x++) {
        px(c, v.x + x, v.y + y, y / v.h > bayer(x, y) * 0.8 + 0.2 ? PAL.p0 : PAL.q0);
      }
    }
    const shelfY = v.y + Math.round(v.h * 0.5);
    rect(c, v.x, shelfY, v.w, 1, PAL.c1);
    const eggs: [Tone, Tone][] = [
      ["k2", "p2"],
      ["e3", "e1"],
      ["o3", "o1"],
      ["b3", "b1"],
      ["r3", "r1"],
    ];
    let i = 0;
    for (let x = v.x + 4; x < v.x + v.w - 8; x += 13, i++) {
      const [gem, gemDark] = GEM_TONES[i % GEM_TONES.length]!;
      const g = sprite(S.GEM, { gem, gemDark });
      items.push({ s: g, x: x + 1, y: shelfY - g.h });
      glows.push({ x: x + 3, y: shelfY - 3, r: 9, color: PAL[gem], a: 0.45 });
      if (i % 2 === 0) sparks.push({ x: x + 2, y: shelfY - 4, k: 3 + (i % 2), o: hash(i + 600) });
      const [shell, spot] = eggs[i % eggs.length]!;
      const egg = sprite(S.EGG, { shell, spot });
      items.push({ s: egg, x, y: v.y + v.h - egg.h - 1 });
    }
    // Montantes de la vitrina
    const third = Math.round(v.w / 3);
    for (const x of [v.x + third, v.x + third * 2]) {
      rect(c, x, v.y, 2, v.h, PAL.w1);
      px(c, x, v.y, PAL.w3);
    }
    // Armario inferior: paneles y tiradores
    const lowY = v.y + v.h + 3;
    const lowH = k.h - (lowY - k.y) - 3;
    const panels = Math.max(2, Math.round(k.w / 46));
    const pw = Math.floor((k.w - 8) / panels);
    for (let n = 0; n < panels; n++) {
      const x = k.x + 4 + n * pw;
      rect(c, x, lowY, pw - 3, lowH, PAL.w1);
      rect(c, x + 1, lowY + 1, pw - 5, lowH - 2, PAL.w3);
      rect(c, x + 1, lowY + 1, pw - 5, 1, PAL.w4);
      rect(c, x + Math.round(pw / 2) - 2, lowY + 4, 3, 2, PAL.g2);
    }

    // Objetos fijos sobre el mostrador
    const top = k.y;
    const sack = sprite(S.COIN_SACK);
    const sackX = k.x + Math.round(k.w * 0.4);
    items.push({ s: sack, x: sackX, y: top - sack.h + 1 });
    for (let n = 0; n < 4; n++) {
      px(c, sackX + sack.w + 1 + n * 2, top - 1, PAL.g3);
      px(c, sackX + sack.w + 1 + n * 2, top, PAL.g1);
    }
    sparks.push({ x: sackX + 5, y: top - 6, k: 4, o: 0.55, big: true });
    const scale = sprite(S.SCALE);
    const scaleX = k.x + Math.round(k.w * 0.72);
    if (scaleX + scale.w < p.cat.x - 2) items.push({ s: scale, x: scaleX, y: top - scale.h + 1 });

    // Candelabro (las llamas son dinámicas)
    const cx = k.x + 10;
    rect(c, cx - 3, top - 1, 7, 1, PAL.g1);
    rect(c, cx, top - 9, 1, 8, PAL.g2);
    rect(c, cx - 4, top - 9, 9, 1, PAL.g2);
    const candle = sprite(S.CANDLE);
    for (const dx of [-4, 0, 4]) {
      const y = top - 9 - candle.h + (dx === 0 ? -2 : 0);
      items.push({ s: candle, x: cx + dx - 1, y });
      flames.push({ x: cx + dx, y: y - 4, seed: dx + 10 });
    }
  }

  /* ---------- Scene ---------- */

  return {
    layout(W, H) {
      p = planShop(W, H);
      sparks = [];
      glows = [];
      flames = [];
      fuses = [];
      staticBase = makeCanvas(W, H);
      staticEmit = makeCanvas(W, H);
      const b = context(staticBase);
      const e = context(staticEmit);
      const items: Placed[] = [];

      drawRoom(b, W, H, { beamY: p.beamY, beamH: p.beamH, floorY: p.floorY });
      drawWindowFrame(b);
      p.shelves.forEach((s, side) => {
        drawShelfFrame(b, s.rect, s.boards);
        fillShelf(b, s.rect, s.boards, side, items);
      });

      // Paredes laterales (pantallas anchas)
      const L = p.outer.left;
      const R = p.outer.right;
      cauldron = null;
      floorPlant = null;
      note = null;
      hangingPlants = [];
      if (L) {
        blit(b, sprite(S.COBWEB), L.x - 2, p.beamY + p.beamH, "base", 0.7);
        drawStaffFrame(b, L.x + 4, L.y + 6, Math.min(58, Math.round(L.h * 0.45)));
        if (L.w >= 36) {
          const poster = sprite(S.POSTER, { picture: "p1", figure: "o2" });
          items.push({ s: poster, x: L.x + 22, y: L.y + 10 });
          px(b, L.x + 27, L.y + 10, PAL.r2);
          note = { x: L.x + 24, y: L.y + 10 + poster.h + 4 };
        }
        cauldron = { x: L.x + Math.round(L.w / 2) - 10, y: p.floorY - 6, w: 20 };
        hangingPlants.push({ x: Math.round(L.x + L.w / 2), len: Math.round(p.H * 0.06) });
      }
      if (R) {
        drawRack(b, R, items);
        const chest = sprite(S.CHEST);
        items.push({ s: chest, x: R.x + 2, y: p.floorY - chest.h + 4 });
        sparks.push({ x: R.x + 8, y: p.floorY - chest.h + 7, k: 2, o: 0.47 });
        floorPlant = { x: R.x + R.w - 12, y: p.floorY + 4 };
        hangingPlants.push({ x: Math.round(R.x + R.w / 2), len: Math.round(p.H * 0.04) });
      }
      // Repisa de pared y aplique con vela en cada lateral
      const candle = sprite(S.CANDLE);
      [L, R].forEach((z, side) => {
        if (!z) return;
        const by = Math.round(z.y + z.h * 0.66);
        const x0 = z.x + 6;
        const x1 = z.x + z.w - 6;
        rect(b, x0 - 2, by, x1 - x0 + 4, 3, PAL.w3);
        rect(b, x0 - 2, by, x1 - x0 + 4, 1, PAL.w5);
        rect(b, x0 - 2, by + 3, x1 - x0 + 4, 1, PAL.ink);
        rect(b, x0, by + 4, 2, 4, PAL.w1);
        rect(b, x1 - 2, by + 4, 2, 4, PAL.w1);
        const plan: ShelfKind[] = side ? ["jar", "gems", "potions"] : ["potions", "skull", "jar"];
        let x = x0;
        for (const kind of plan) {
          const used = placeItem(b, kind, x, by, x1 - x, 500 + side * 17 + x, items);
          if (used) x += used + 2;
        }
        const sx = side ? z.x + 8 : z.x + z.w - 8;
        const sy = Math.round(z.y + z.h * (side ? 0.5 : 0.42));
        rect(b, sx - 2, sy, 5, 1, PAL.g1);
        rect(b, sx, sy - 2, 1, 2, PAL.g2);
        rect(b, sx - 1, sy + 1, 3, 3, PAL.g0);
        items.push({ s: candle, x: sx - 1, y: sy - 2 - candle.h });
        flames.push({ x: sx, y: sy - 2 - candle.h - 4, seed: 20 + side });
      });

      if (cauldron) drawCauldronBody(b, cauldron);

      drawCounter(b, items);
      for (const it of items) {
        blit(b, it.s, it.x, it.y);
        blit(e, it.s, it.x, it.y, "emit");
      }

      // Plantas del alféizar y manojos colgando delante del ventanal
      const w = p.window;
      sillPlants = [
        { x: w.x + 2, y: p.sill.y },
        { x: w.x + w.w - 9, y: p.sill.y },
      ];
      herbs = [
        { x: w.x + Math.round(w.w * 0.3), len: 4, phase: 0.7 },
        { x: w.x + Math.round(w.w * 0.7), len: 7, phase: 2.9 },
      ];

      // Flotantes: cristal a la izquierda, libro abierto a la derecha
      const left = p.outer.left ?? p.shelves[0]?.rect;
      const right = p.outer.right ?? p.shelves[1]?.rect;
      crystal = left
        ? { x: Math.round(left.x + left.w * 0.7), y: Math.round(p.H * 0.22) }
        : { x: Math.round(W * 0.15), y: Math.round(H * 0.3) };
      floatBook = right
        ? {
            x: Math.round(right.x + right.w / 2 - 8),
            y: p.outer.right ? right.y + 60 : Math.round(p.H * 0.13),
          }
        : { x: Math.round(W * 0.8), y: Math.round(H * 0.3) };
      book = { x: p.counter.x + 24, y: p.counter.y - 5 };
      ball = { x: p.counter.x + Math.round(p.counter.w * 0.6), y: p.counter.y - 12 };
      sparks.push(
        { x: ball.x + 3, y: ball.y + 2, k: 3, o: 0.72 },
        { x: crystal.x + 1, y: crystal.y + 2, k: 4, o: 0.25, big: true },
        { x: floatBook.x + 4, y: floatBook.y + 2, k: 3, o: 0.9 },
      );

      buildSky();
      buildShaft();
      motes = Array.from({ length: 32 }, (_, i) => ({
        x: shaftBox.x + hash(i * 3 + 1) * shaftBox.w,
        y: shaftBox.y + hash(i * 3 + 2) * shaftBox.h,
        i,
      }));
    },

    base(c, t) {
      c.drawImage(staticBase, 0, 0);
      const gust = wind(t);
      const w = p.window;
      const beamBottom = p.beamY + p.beamH;

      // Cortinas: ancladas arriba, se mecen abajo con la ráfaga
      const cw = Math.min(p.gap - 1, 11);
      const top = w.y - 2;
      const len = p.sill.y + 6 - top;
      for (const side of [-1, 1]) {
        const x0 = side < 0 ? w.x - cw - 1 : w.x + w.w + 1;
        for (let r = 0; r < len; r++) {
          const q = r / len;
          const dx = Math.round(
            -side * (2.2 * gust - 1) * q ** 1.6 + wave(t, 4, side) * 1.2 * q ** 2,
          );
          const tied = Math.abs(q - 0.62) < 0.03;
          for (let i = 0; i < cw; i++) {
            const fold = (i + Math.round(q * 2)) % 4;
            const tone = tied ? PAL.g2 : fold === 0 ? PAL.v1 : fold === 1 ? PAL.v3 : PAL.v2;
            px(c, x0 + i + dx, top + r, tone);
          }
          px(c, x0 + dx + (side < 0 ? 0 : cw - 1), top + r, PAL.ink);
        }
      }

      // Lámpara de campanas
      const ch = p.chandelier;
      const cdx = chandelierSway(t);
      line(c, ch.x, beamBottom, ch.x + cdx, beamBottom + ch.len, PAL.s1);
      const barY = beamBottom + ch.len;
      rect(c, ch.x + cdx - 12, barY, 25, 2, PAL.g1);
      rect(c, ch.x + cdx - 12, barY, 25, 1, PAL.g2);
      const bell = sprite(S.BELL_LAMP);
      for (const bx of [-11, 0, 11])
        blit(c, bell, ch.x + cdx + bx - 3, barY + 2 + (bx === 0 ? 2 : 0));

      // Faroles sobre las estanterías
      const lantern = sprite(S.LANTERN);
      p.lanterns.forEach((l, i) => {
        const dx = lanternSway(t, i);
        line(c, l.x, beamBottom, l.x + dx, beamBottom + l.len, PAL.s1);
        blit(c, lantern, l.x + dx - 3, beamBottom + l.len + 1);
      });

      // Manojos de hierbas delante del ventanal
      const herb = sprite(S.HERBS);
      for (const h of herbs) {
        const dx = Math.round(1.8 * gust - 0.9 + wave(t, 5, h.phase));
        line(c, h.x, beamBottom, h.x + dx, w.y - 4 + h.len, PAL.k0);
        blit(c, herb, h.x + dx - 2, w.y - 3 + h.len);
      }

      // Macetas colgantes con lianas
      const pot = sprite(S.SMALL_POT);
      const leaves = sprite(S.SMALL_LEAVES);
      hangingPlants.forEach((hp, i) => {
        const dx = Math.round(1.5 * gust - 0.8 + wave(t, 4, i + 1));
        const py = beamBottom + hp.len;
        line(c, hp.x, beamBottom, hp.x + dx - 3, py, PAL.k0);
        line(c, hp.x, beamBottom, hp.x + dx + 3, py, PAL.k0);
        blitSheared(c, leaves, hp.x + dx - 3, py - leaves.h + 2, dx);
        blit(c, pot, hp.x + dx - 3, py);
        for (let v = 0; v < 3; v++) {
          const vx = hp.x + dx - 2 + v * 2;
          const vl = 8 + v * 4;
          for (let j = 0; j < vl; j++) {
            const sway = Math.round(((dx + wave(t, 6, v + i)) * j) / vl);
            px(c, vx + sway, py + pot.h + j, j % 3 ? PAL.e1 : PAL.e2);
          }
        }
      });

      // Plantas del alféizar y del suelo, mecidas
      sillPlants.forEach((sp, i) => {
        const sway = Math.round((gust - 0.5) * 2 + wave(t, 4, i * 2));
        blitSheared(c, leaves, sp.x, sp.y - pot.h - leaves.h + 1, sway);
        blit(c, pot, sp.x, sp.y - pot.h);
      });
      if (floorPlant) {
        const big = sprite(S.LEAVES);
        const bpot = sprite(S.POT);
        const sway = Math.round(1.6 * gust - 0.6 + 0.8 * wave(t, 3, 1));
        blitSheared(c, big, floorPlant.x - 2, floorPlant.y - bpot.h - big.h + 2, sway);
        blit(c, bpot, floorPlant.x, floorPlant.y - bpot.h);
      }

      // Nota clavada que se agita
      if (note) {
        const flap = Math.round((gust - 0.4) * 3);
        blitSheared(c, sprite(S.NOTE), note.x, note.y, flap, "base", "top");
        px(c, note.x + 3, note.y, PAL.r2);
      }

      if (cauldron) rect(c, cauldron.x + 3, cauldron.y + 15, cauldron.w - 6, 2, PAL.w1);

      // Libro abierto del mostrador: pasa página con el viento
      blit(c, sprite(S.SPELLBOOK, { cover: "r1" }), book.x, book.y);
      flipPage(c, t, book.x + 8, book.y, 2, 0.3, 5);

      blit(c, sprite(S.CRYSTAL_BALL), ball.x - 5, ball.y - 4);

      // Flotantes
      blit(c, sprite(S.CRYSTAL), crystal.x - 3, crystal.y + Math.round(2 * wave(t, 2, 0.3)));
      const fy = floatBook.y + Math.round(2 * wave(t, 3, 1.1));
      blit(c, sprite(S.SPELLBOOK, { cover: "b1" }), floatBook.x, fy);
      flipPage(c, t, floatBook.x + 8, fy, 4, 0.6, 6);

      drawCat(c, t);
    },

    ambient(mode) {
      return mode === "night" ? "#67619a" : "#f3e9d8";
    },

    lights(t, mode) {
      const night = mode === "night";
      const beamBottom = p.beamY + p.beamH;
      const out: Light[] = [];
      const ch = p.chandelier;
      out.push({
        x: ch.x + chandelierSway(t),
        y: beamBottom + ch.len + 6,
        r: night ? 78 : 34,
        color: "#ffc070",
        a: (night ? 1 : 0.35) * flicker(t, 0.3),
        bloom: 1,
      });
      p.lanterns.forEach((l, i) => {
        out.push({
          x: l.x + lanternSway(t, i),
          y: beamBottom + l.len + 6,
          r: night ? 52 : 24,
          color: "#ffb85c",
          a: (night ? 0.95 : 0.3) * flicker(t, i + 1),
          bloom: 0.9,
        });
      });
      const w = p.window;
      out.push({
        x: w.x + w.w / 2,
        y: w.y + w.h * 0.45,
        r: Math.round(w.w * (night ? 0.95 : 1.2)),
        color: night ? "#8094ff" : "#fff0c8",
        a: night ? 0.5 : 0.6,
        bloom: night ? 0.45 : 0.6,
      });
      for (const f of flames) {
        out.push({
          x: f.x,
          y: f.y,
          r: night ? 20 : 9,
          color: "#ffc070",
          a: (night ? 0.7 : 0.25) * flicker(t, f.seed),
          bloom: 0.5,
        });
      }
      out.push(
        {
          x: ball.x,
          y: ball.y,
          r: night ? 34 : 16,
          color: PAL.p2,
          a: (night ? 0.75 : 0.3) * (0.78 + 0.22 * wave(t, 2)),
          bloom: 1,
        },
        {
          x: crystal.x,
          y: crystal.y + 4 + Math.round(2 * wave(t, 2, 0.3)),
          r: night ? 22 : 10,
          color: PAL.p2,
          a: night ? 0.7 : 0.25,
          bloom: 0.9,
        },
        {
          x: floatBook.x + 8,
          y: floatBook.y + 3 + Math.round(2 * wave(t, 3, 1.1)),
          r: night ? 16 : 8,
          color: PAL.p2,
          a: night ? 0.6 : 0.2,
          bloom: 0.8,
        },
        {
          x: p.vitrina.x + p.vitrina.w / 2,
          y: p.vitrina.y + p.vitrina.h / 2,
          r: night ? Math.round(p.vitrina.w * 0.45) : 18,
          color: PAL.c2,
          a: night ? 0.35 : 0.12,
          bloom: 0.4,
        },
      );
      if (cauldron) {
        out.push(
          {
            x: cauldron.x + cauldron.w / 2,
            y: cauldron.y + 14,
            r: night ? 30 : 14,
            color: "#ff8a3d",
            a: (night ? 0.8 : 0.3) * flicker(t, 7),
            bloom: 0.6,
          },
          {
            x: cauldron.x + cauldron.w / 2,
            y: cauldron.y,
            r: night ? 24 : 12,
            color: PAL.e2,
            a: night ? 0.6 : 0.25,
            bloom: 0.6,
          },
        );
      }
      for (const g of glows) {
        out.push({ ...g, r: night ? g.r : Math.round(g.r * 0.6), a: g.a * (night ? 1 : 0.35) });
      }
      if (night) {
        for (let i = 0; i < 8; i++) {
          const f = firefly(t, i);
          if (f.on) out.push({ x: f.x, y: f.y, r: 5, color: PAL.e3, a: 0.5 });
        }
      }
      return out;
    },

    lightShapes(l, t, mode) {
      const prev = l.globalAlpha;
      l.globalAlpha = mode === "night" ? 0.16 : 0.38 + 0.06 * wave(t, 1, 0.5);
      l.drawImage(shaft, shaftBox.x, shaftBox.y);
      l.globalAlpha = prev;
    },

    emissive(c, t, mode) {
      const night = mode === "night";
      drawSky(c, t, night);
      c.drawImage(staticEmit, 0, 0);
      const lean = wind(t) > 0.72 ? 1 : 0;
      const beamBottom = p.beamY + p.beamH;

      // Campanas y faroles encendidos
      const ch = p.chandelier;
      const cdx = chandelierSway(t);
      const bell = sprite(S.BELL_LAMP);
      for (const bx of [-11, 0, 11]) {
        const by = beamBottom + ch.len + 2 + (bx === 0 ? 2 : 0);
        blit(c, bell, ch.x + cdx + bx - 3, by, "emit", night ? 1 : 0.7);
      }
      const lantern = sprite(S.LANTERN);
      p.lanterns.forEach((l, i) => {
        blit(
          c,
          lantern,
          l.x + lanternSway(t, i) - 3,
          beamBottom + l.len + 1,
          "emit",
          night ? 1 : 0.7,
        );
      });

      for (const f of flames) flame(c, f.x, f.y, Math.floor(cycle(t, 48, f.seed * 0.13) * 3), lean);

      // Mechas de las bombas
      fuses.forEach((f, i) => {
        if (wave(t, 18, i) > -0.2) px(c, f.x, f.y, i % 2 ? PAL.g3 : PAL.o2);
        if (wave(t, 29, i) > 0.5) px(c, f.x + 1, f.y - 1, PAL.g4);
      });

      if (cauldron) {
        const k = cauldron;
        for (let i = 0; i < 3; i++) {
          flame(c, k.x + 5 + i * 5, k.y + 12, Math.floor(cycle(t, 36, i * 0.31) * 3), lean);
        }
        rect(c, k.x + 1, k.y + 1, k.w - 2, 2, PAL.e2);
        rect(c, k.x + 2, k.y + 1, k.w - 4, 1, PAL.e3);
        for (let i = 0; i < 4; i++) {
          if (cycle(t, 4, hash(i + 20)) < 0.35) {
            px(c, k.x + 3 + Math.floor(hash(i + 30) * (k.w - 6)), k.y, PAL.e3);
          }
        }
      }

      const sb = sprite(S.SPELLBOOK, { cover: "r1" });
      blit(c, sb, book.x, book.y, "emit", 0.55 + 0.45 * (0.5 + 0.5 * wave(t, 3)));

      blit(c, sprite(S.CRYSTAL_BALL), ball.x - 5, ball.y - 4, "emit", 0.75 + 0.25 * wave(t, 2));
      for (let i = 0; i < 3; i++) {
        const a = Math.PI * 2 * (cycle(t, 2) + i / 3);
        const rx = ball.x + Math.round(10 * Math.cos(a));
        const ry = ball.y - 2 + Math.round(3 * Math.sin(a));
        c.globalAlpha = Math.sin(a) < 0 ? 0.45 : 1;
        px(c, rx, ry, PAL.c3);
        px(c, rx + 1, ry, PAL.c2);
        px(c, rx, ry + 1, PAL.c2);
        c.globalAlpha = 1;
      }

      blit(
        c,
        sprite(S.CRYSTAL),
        crystal.x - 3,
        crystal.y + Math.round(2 * wave(t, 2, 0.3)),
        "emit",
      );
      const fy = floatBook.y + Math.round(2 * wave(t, 3, 1.1));
      blit(c, sprite(S.SPELLBOOK, { cover: "b1" }), floatBook.x, fy, "emit");
    },

    overlay(c, t, mode) {
      const night = mode === "night";
      const gust = wind(t);

      // Cristal de la vitrina: tinte, reflejos fijos y un destello que la recorre
      const v = p.vitrina;
      c.globalAlpha = 0.18;
      rect(c, v.x, v.y, v.w, v.h, PAL.c3);
      c.globalAlpha = 0.35;
      for (let k = 0; k < 2; k++) {
        const sx = v.x + Math.round(v.w * (0.18 + k * 0.45));
        for (let y = 0; y < v.h; y++) px(c, sx + Math.round((v.h - y) * 0.5), v.y + y, PAL.white);
      }
      const g = cycle(t, 1, 0.55);
      if (g < 0.12) {
        const gx = v.x - 10 + Math.round((v.w + 20) * (g / 0.12));
        c.globalAlpha = 0.6;
        for (let y = 0; y < v.h; y++) {
          for (let k = 0; k < 3; k++) {
            const x = gx + k + Math.round((v.h - y) * 0.5);
            if (x >= v.x && x < v.x + v.w) px(c, x, v.y + y, PAL.white);
          }
        }
      }
      c.globalAlpha = 1;

      // Humo de las velas
      flames.forEach((f, i) => {
        const q = cycle(t, 3, hash(i + 70));
        c.globalAlpha = 0.35 * (1 - q);
        px(c, f.x + Math.round(wave(t, 6, i) + q * 3 * gust), f.y - 2 - Math.round(q * 10), PAL.s4);
      });
      c.globalAlpha = 1;

      if (cauldron) {
        const k = cauldron;
        for (let i = 0; i < 6; i++) {
          const q = cycle(t, 3, hash(i + 10));
          const bx = k.x + 3 + Math.floor(hash(i + 50) * (k.w - 6)) + Math.round(wave(t, 6, i));
          c.globalAlpha = 1 - q;
          px(c, bx, k.y - 1 - Math.round(q * 16), PAL.e3);
        }
        c.globalAlpha = 1;
      }

      if (night) {
        for (let i = 0; i < 8; i++) {
          const f = firefly(t, i);
          if (!f.on) continue;
          px(c, f.x, f.y, PAL.e3);
          c.globalAlpha = 0.5;
          px(c, f.x + 1, f.y, PAL.g4);
          c.globalAlpha = 1;
        }
      } else {
        for (const m of motes) {
          const x = Math.round(m.x + 3 * wave(t, 1 + (m.i % 3), hash(m.i)) + gust * 2);
          const y = Math.round(m.y + 2 * wave(t, 2 + (m.i % 2), hash(m.i + 7)));
          c.globalAlpha = 0.35 + 0.35 * (0.5 + 0.5 * wave(t, 4 + (m.i % 5), m.i));
          px(c, x, y, PAL.k3);
        }
        c.globalAlpha = 1;
      }

      // "Zzz" del gato
      const z = cycle(t, 3, 0.2);
      if (z < 0.6) {
        const zx = p.cat.x + 2 + Math.round(z * 4);
        const zy = p.cat.y - 3 - Math.round(z * 10);
        c.globalAlpha = 1 - z / 0.6;
        rect(c, zx, zy, 3, 1, PAL.k3);
        px(c, zx + 1, zy + 1, PAL.k3);
        rect(c, zx, zy + 2, 3, 1, PAL.k3);
        c.globalAlpha = 1;
      }

      for (const s of sparks) sparkle(c, s.x, s.y, cycle(t, s.k, s.o), s.big);
    },
  };

  /* ---------- Ayudantes dinámicos ---------- */

  function chandelierSway(t: number) {
    return Math.round(1.4 * wind(t) - 0.7 + 0.8 * wave(t, 3, 0.5));
  }

  function lanternSway(t: number, i: number) {
    return Math.round(2 * wind(t) - 1.1 + wave(t, 5, i * 2.1));
  }

  function flipPage(
    c: Ctx,
    t: number,
    spine: number,
    y: number,
    k: number,
    offset: number,
    lift: number,
  ) {
    const q = cycle(t, k, offset);
    if (q >= 0.25) return;
    const a = q / 0.25;
    const tipX = spine + Math.round(7 * Math.cos(Math.PI * a));
    const h = Math.round(lift * Math.sin(Math.PI * a));
    line(c, spine, y + 1, tipX, y + 1 - h, PAL.k3);
    line(c, spine, y + 2, tipX, y + 2 - h, PAL.k1);
  }

  function drawCat(c: Ctx, t: number) {
    const { x, y } = p.cat;
    blit(c, sprite(S.CAT), x, y);
    // Respira: el lomo sube un píxel en la inspiración
    if (cycle(t, 4) < 0.5) {
      rect(c, x + 7, y + 1, 6, 1, PAL.ink);
      rect(c, x + 7, y + 2, 6, 1, PAL.m2);
    }
    // La cola se mueve despacio
    const tip = Math.round(wave(t, 3, 0.8));
    px(c, x + 14, y + 6, PAL.m2);
    px(c, x + 15, y + 5, PAL.m2);
    px(c, x + 15, y + 4 + Math.max(0, tip), PAL.m2);
    px(c, x + 16, y + 3 + tip, PAL.m1);
  }

  function firefly(t: number, i: number) {
    const zones = [p.outer.left ?? p.shelves[0]?.rect, p.outer.right ?? p.shelves[1]?.rect].filter(
      (z): z is Rect => !!z,
    );
    const z = zones[i % Math.max(1, zones.length)] ?? { x: 0, y: 0, w: p.W, h: p.H * 0.5 };
    const x = Math.round(z.x + hash(i + 100) * z.w + 6 * wave(t, 1 + (i % 3), hash(i + 101) * 6));
    const y = Math.round(
      z.y + hash(i + 102) * z.h * 0.7 + 4 * wave(t, 2 + (i % 2), hash(i + 103) * 6),
    );
    return { x, y, on: wave(t, 3 + (i % 4), hash(i + 104) * 6) > -0.2 };
  }
}
