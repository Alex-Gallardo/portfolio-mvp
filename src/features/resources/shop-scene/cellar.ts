import { cycle, flicker, hash, wave, wind } from "./loop";
import {
  PAL,
  bayer,
  blit,
  context,
  line,
  makeCanvas,
  px,
  rect,
  sparkle,
  sprite,
  type Ctx,
  type Light,
  type Scene,
  type Tone,
} from "./draw";
import { drawRoom } from "./room";
import { planCellar, type CellarPlan } from "./cellar-layout";
import type { Rect } from "./shop-layout";
import * as S from "./sprites";

/**
 * El almacén de la tienda: fondo fijo detrás del catálogo de /recursos.
 * Al bajar desde el hero "bajas al almacén": muro de piedra, pilares,
 * ventanucos con barrotes y antorchas; en los bordes libres, estandartes,
 * cadenas, barriles, cajas, un mapa del tesoro y gemas incrustadas.
 *
 * Mismo motor, paleta y reloj que la tienda y el taller (bucle sin corte).
 * El centro queda sobrio a propósito: ahí van las columnas del catálogo.
 */

type Spark = { x: number; y: number; k: number; o: number; big?: boolean };
type Glow = { x: number; y: number; r: number; color: string; a: number; bloom?: number };

const PILLAR_W = 8;

const BIG_FLAME = [
  ["..y..", ".yYy.", ".YWY.", "yYWYy", "oYWYo", ".oYo.", "..o.."],
  ["...y.", ".yy..", ".YWYy", "yYWYy", "oYWYo", ".oYo.", "..o.."],
  [".y...", "..yy.", "yYWY.", "yYWYy", "oYWYo", ".oYo.", "..o.."],
];
const FLAME_KEY: Record<string, Tone> = { W: "g4", Y: "g3", y: "o2", o: "o1" };

function bigFlame(c: Ctx, x: number, y: number, frame: number, lean: number) {
  const f = BIG_FLAME[((frame % 3) + 3) % 3] ?? BIG_FLAME[0]!;
  f.forEach((row, r) => {
    const shift = r < 3 ? lean : 0;
    for (let i = 0; i < row.length; i++) {
      const tone = FLAME_KEY[row[i] ?? "."];
      if (tone) px(c, x - 2 + i + shift, y + r, PAL[tone]);
    }
  });
}

export function createCellarScene(): Scene {
  let p: CellarPlan = planCellar(320, 200, 4);
  let staticBase = makeCanvas(1, 1);
  let staticEmit = makeCanvas(1, 1);
  let shafts: { canvas: HTMLCanvasElement; box: Rect }[] = [];
  let sparks: Spark[] = [];
  let glows: Glow[] = [];
  let motes: { x: number; y: number; i: number }[] = [];

  /* ---------- Piezas estáticas ---------- */

  function drawPillar(c: Ctx, x: number) {
    const top = p.beamY + p.beamH;
    const h = p.floorY - top;
    rect(c, x, top, PILLAR_W, h, PAL.w1);
    rect(c, x + 1, top, 1, h, PAL.w3);
    rect(c, x + 2, top, 1, h, PAL.w2);
    rect(c, x + PILLAR_W - 1, top, 1, h, PAL.w0);
    for (let y = top + 9; y < p.floorY - 8; y += 23) {
      rect(c, x + 3, y, 3, 1, PAL.w0); // vetas
      px(c, x + 2, y + 6, PAL.s2); // clavo
    }
    // Basa de piedra y zapata bajo la viga
    rect(c, x - 2, p.floorY - 6, PILLAR_W + 4, 6, PAL.q3);
    rect(c, x - 2, p.floorY - 6, PILLAR_W + 4, 1, PAL.q4);
    rect(c, x - 2, top, PILLAR_W + 4, 3, PAL.w2);
    rect(c, x - 2, top + 3, PILLAR_W + 4, 1, PAL.ink);
  }

  function drawWindow(c: Ctx, w: Rect) {
    // Dintel y jambas de piedra; el cielo es emisivo (se pinta luego)
    rect(c, w.x - 3, w.y - 3, w.w + 6, w.h + 6, PAL.q4);
    rect(c, w.x - 3, w.y - 3, w.w + 6, 1, PAL.k1);
    rect(c, w.x - 2, w.y + w.h + 2, w.w + 4, 2, PAL.q2);
    rect(c, w.x, w.y, w.w, w.h, PAL.n0);
  }

  function drawStack(
    c: Ctx,
    s: Rect,
    side: number,
    items: { s: ReturnType<typeof sprite>; x: number; y: number }[],
  ) {
    const floor = s.y + s.h;
    // Barril
    const bx = side ? s.x + s.w - 13 : s.x;
    rect(c, bx, floor - 16, 13, 16, PAL.w3);
    rect(c, bx, floor - 16, 2, 16, PAL.w2);
    rect(c, bx + 11, floor - 16, 2, 16, PAL.w1);
    rect(c, bx + 6, floor - 15, 1, 15, PAL.w2);
    for (const by of [floor - 13, floor - 4]) {
      rect(c, bx - 1, by, 15, 2, PAL.s2);
      rect(c, bx - 1, by, 15, 1, PAL.s3);
    }
    rect(c, bx + 1, floor - 17, 11, 2, PAL.w1);
    // Cajas apiladas
    const cw = Math.min(16, s.w - 15);
    if (cw < 10) return;
    const cx = side ? s.x : s.x + 15;
    const crate = (x: number, y: number, w: number, h: number) => {
      rect(c, x, y, w, h, PAL.w4);
      rect(c, x, y, w, 1, PAL.w5);
      rect(c, x, y, 1, h, PAL.w2);
      rect(c, x + w - 1, y, 1, h, PAL.w2);
      rect(c, x, y + h - 1, w, 1, PAL.w1);
      line(c, x + 1, y + 1, x + w - 2, y + h - 2, PAL.w2);
      line(c, x + w - 2, y + 1, x + 1, y + h - 2, PAL.w2);
    };
    crate(cx, floor - 12, cw, 12);
    crate(cx + 2, floor - 22, cw - 4, 10);
    // Poción sobre la caja de arriba
    const liquid: Tone = side ? "c2" : "p2";
    const potion = sprite(S.POTION, { liquid });
    const potX = cx + Math.round((cw - potion.w) / 2);
    items.push({ s: potion, x: potX, y: floor - 22 - potion.h });
    glows.push({ x: potX + 3, y: floor - 26, r: 12, color: PAL[liquid], a: 0.6, bloom: 0.7 });
    sparks.push({ x: potX + 2, y: floor - 28, k: 3, o: hash(side + 300) });
  }

  function drawMap(c: Ctx, m: Rect) {
    rect(c, m.x, m.y, m.w, m.h, PAL.k1);
    rect(c, m.x + 1, m.y + 1, m.w - 2, m.h - 2, PAL.k2);
    // Costa y camino punteado hasta la X
    for (let i = 0; i < 6; i++) px(c, m.x + 3 + i, m.y + 4 + (i % 2), PAL.e1);
    for (let i = 0; i < 7; i++)
      if (i % 2 === 0) px(c, m.x + 4 + i * 1.6, m.y + 8 + Math.round(i * 0.6), PAL.r1);
    line(c, m.x + m.w - 6, m.y + m.h - 6, m.x + m.w - 3, m.y + m.h - 3, PAL.r2);
    line(c, m.x + m.w - 3, m.y + m.h - 6, m.x + m.w - 6, m.y + m.h - 3, PAL.r2);
    px(c, m.x + Math.round(m.w / 2), m.y, PAL.r2); // chincheta
    sparks.push({ x: m.x + m.w - 4, y: m.y + m.h - 4, k: 2, o: 0.7 });
  }

  function buildShafts() {
    shafts = p.windows.map((w, i) => {
      const len = Math.round(p.H * 0.55);
      const drift = Math.round(len * 0.45) * (i ? -1 : 1);
      const box: Rect = {
        x: Math.min(w.x, w.x + drift) - 4,
        y: w.y + w.h,
        w: w.w + Math.abs(drift) + 8,
        h: len,
      };
      const canvas = makeCanvas(box.w, box.h);
      const c = context(canvas);
      for (let y = 0; y < len; y++) {
        const q = y / len;
        const a = w.x + drift * q - box.x;
        const b = a + w.w;
        const level = 0.7 * (1 - q);
        for (let x = Math.floor(a); x < b; x++) {
          const bar = (x - Math.floor(a)) % 4 === 3 ? 0.35 : 1; // sombras de los barrotes
          const edge = Math.min(1, Math.min(x - a, b - x) / 3);
          if (level * bar * edge > bayer(x + box.x, y + box.y)) px(c, x, y, "#ffffff");
        }
      }
      return { canvas, box };
    });
  }

  /* ---------- Scene ---------- */

  return {
    layout(W, H, { pxCss }) {
      p = planCellar(W, H, pxCss);
      sparks = [];
      glows = [];
      staticBase = makeCanvas(W, H);
      staticEmit = makeCanvas(W, H);
      const b = context(staticBase);
      const e = context(staticEmit);
      const items: { s: ReturnType<typeof sprite>; x: number; y: number }[] = [];

      drawRoom(b, W, H, { beamY: p.beamY, beamH: p.beamH, floorY: p.floorY, seed: 7 });
      for (const w of p.windows) drawWindow(b, w);
      for (const x of p.pillars) drawPillar(b, x);

      blit(b, sprite(S.COBWEB), PILLAR_W, p.beamY + p.beamH, "base", 0.6);

      p.stacks.forEach((s, side) => drawStack(b, s, side, items));
      if (p.map) drawMap(b, p.map);

      p.gems.forEach((g, i) => {
        const [gem, gemDark] = (
          [
            ["c2", "c1"],
            ["p2", "p1"],
          ] as [Tone, Tone][]
        )[i % 2]!;
        items.push({ s: sprite(S.GEM, { gem, gemDark }), x: g.x - 2, y: g.y - 2 });
        glows.push({ x: g.x, y: g.y, r: 10, color: PAL[gem], a: 0.55, bloom: 0.6 });
        sparks.push({ x: g.x, y: g.y - 1, k: 2 + i, o: hash(i + 310) });
      });

      // Antorchas (el soporte es fijo; la llama, dinámica)
      const torch = sprite(S.TORCH);
      for (const t of p.torches) items.push({ s: torch, x: t.x - 3, y: t.y });

      for (const it of items) {
        blit(b, it.s, it.x, it.y);
        blit(e, it.s, it.x, it.y, "emit");
      }

      buildShafts();
      motes = Array.from({ length: 24 }, (_, i) => {
        const s = shafts[i % Math.max(1, shafts.length)];
        return {
          x: (s?.box.x ?? 0) + hash(i * 5 + 1) * (s?.box.w ?? W),
          y: (s?.box.y ?? 0) + hash(i * 5 + 2) * (s?.box.h ?? H),
          i,
        };
      });
    },

    base(c, t) {
      c.drawImage(staticBase, 0, 0);
      const gust = wind(t);
      const top = p.beamY + p.beamH;

      // Estandartes con el emblema de la tienda, mecidos por la corriente
      p.banners.forEach((bn, i) => {
        rect(c, bn.x - 2, top, bn.w + 4, 2, PAL.s2);
        px(c, bn.x - 3, top, PAL.g2);
        px(c, bn.x + bn.w + 2, top, PAL.g2);
        const sway = 1.6 * (gust - 0.4) + 0.8 * wave(t, 3, i * 1.7);
        const cx = Math.round(bn.w / 2);
        const ey = Math.round(bn.h * 0.36);
        for (let r = 0; r < bn.h; r++) {
          const q = r / bn.h;
          const dx = Math.round(sway * q ** 1.4);
          const tail = bn.h - r; // corte en V de la punta
          const inset = tail < cx ? cx - tail : 0;
          const x = bn.x + dx + inset;
          const w = bn.w - inset * 2;
          if (w <= 0) continue;
          rect(c, x, top + 2 + r, w, 1, r < 2 ? PAL.v1 : PAL.r1);
          px(c, x, top + 2 + r, PAL.ink);
          px(c, x + w - 1, top + 2 + r, PAL.ink);
          if (w > 4) {
            px(c, x + 1, top + 2 + r, PAL.g2);
            px(c, x + w - 2, top + 2 + r, PAL.g2);
          }
          // Emblema: moneda de la tienda
          const d = Math.abs(r - ey);
          if (d <= 3) {
            const half = 3 - Math.floor(d / 1.4);
            rect(c, bn.x + dx + cx - half, top + 2 + r, half * 2 + 1, 1, d === 0 ? PAL.g4 : PAL.g3);
          }
        }
      });

      // Cadenas que oscilan
      for (const [i, ch] of p.chains.entries()) {
        const sway = 1.2 * wave(t, 2, i * 2.3) + (gust - 0.5);
        for (let j = 0; j < ch.len; j++) {
          const x = ch.x + Math.round((sway * j) / ch.len);
          px(c, x, top + j, j % 2 ? PAL.s3 : PAL.s1);
        }
        const hx = ch.x + Math.round(sway);
        line(c, hx, top + ch.len, hx + 2, top + ch.len + 2, PAL.s3);
        px(c, hx + 2, top + ch.len + 1, PAL.s3);
      }
    },

    ambient(mode) {
      return mode === "night" ? "#4a4576" : "#e3d8c6";
    },

    lights(t, mode) {
      const night = mode === "night";
      const out: Light[] = p.torches.map((tc, i) => ({
        x: tc.x,
        y: tc.y - 4,
        r: night ? 64 : 30,
        color: "#ffae55",
        a: (night ? 1 : 0.4) * flicker(t, i + 0.5),
        bloom: 1,
      }));
      for (const w of p.windows) {
        out.push({
          x: w.x + w.w / 2,
          y: w.y + w.h / 2,
          r: night ? 26 : 46,
          color: night ? "#8094ff" : "#fff0c8",
          a: night ? 0.35 : 0.55,
          bloom: 0.5,
        });
      }
      for (const g of glows) {
        out.push({ ...g, r: night ? g.r : Math.round(g.r * 0.6), a: g.a * (night ? 1 : 0.35) });
      }
      return out;
    },

    lightShapes(l, t, mode) {
      const prev = l.globalAlpha;
      l.globalAlpha = mode === "night" ? 0.1 : 0.32 + 0.05 * wave(t, 1, 0.2);
      for (const s of shafts) l.drawImage(s.canvas, s.box.x, s.box.y);
      l.globalAlpha = prev;
    },

    emissive(c, t, mode) {
      const night = mode === "night";
      // Cielo de los ventanucos y sus barrotes
      for (const [i, w] of p.windows.entries()) {
        rect(c, w.x, w.y, w.w, w.h, night ? PAL.n1 : PAL.y1);
        rect(c, w.x, w.y + w.h - 3, w.w, 3, night ? PAL.n2 : PAL.y2);
        if (night) {
          if (wave(t, 3 + i, i) > -0.2) px(c, w.x + 4 + i * 6, w.y + 3, PAL.k3);
        } else {
          const cx = w.x - 8 + Math.round(cycle(t, 1, i * 0.5) * (w.w + 16));
          for (let k = 0; k < 7; k++) {
            const x = cx + k;
            if (x >= w.x && x < w.x + w.w) px(c, x, w.y + 3 + (k > 1 && k < 5 ? 0 : 1), PAL.white);
          }
        }
        for (let x = w.x + 3; x < w.x + w.w; x += 4) rect(c, x, w.y, 1, w.h, PAL.s1);
        rect(c, w.x, w.y + Math.round(w.h / 2), w.w, 1, PAL.s1);
      }

      c.drawImage(staticEmit, 0, 0);

      // Llamas de las antorchas
      const lean = wind(t) > 0.7 ? 1 : 0;
      p.torches.forEach((tc, i) => {
        bigFlame(c, tc.x, tc.y - 7, Math.floor(cycle(t, 40, i * 0.23) * 3), lean);
      });
    },

    overlay(c, t, mode) {
      const night = mode === "night";
      const gust = wind(t);

      // Chispas que suben de las antorchas
      p.torches.forEach((tc, i) => {
        for (let k = 0; k < 3; k++) {
          const q = cycle(t, 4, hash(i * 7 + k + 400));
          c.globalAlpha = 1 - q;
          const x = tc.x + Math.round(wave(t, 6, i + k) * 1.5 + q * 4 * (gust - 0.3));
          px(c, x, tc.y - 8 - Math.round(q * 22), k ? PAL.o2 : PAL.g3);
        }
      });
      c.globalAlpha = 1;

      // Polvo en los haces de luz (día)
      if (!night) {
        for (const m of motes) {
          const x = Math.round(m.x + 2 * wave(t, 1 + (m.i % 3), hash(m.i)) + gust * 2);
          const y = Math.round(m.y + 2 * wave(t, 2 + (m.i % 2), hash(m.i + 9)));
          c.globalAlpha = 0.3 + 0.3 * (0.5 + 0.5 * wave(t, 4 + (m.i % 4), m.i));
          px(c, x, y, PAL.k3);
        }
        c.globalAlpha = 1;
      }

      for (const s of sparks) sparkle(c, s.x, s.y, cycle(t, s.k, s.o), s.big);
    },
  };
}
