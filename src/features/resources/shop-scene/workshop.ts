import { cycle, flicker, hash, wave, wind } from "./loop";
import {
  PAL,
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
  type Sprite,
} from "./draw";
import { drawRoom } from "./room";
import * as S from "./sprites";

/**
 * El taller de encargos: la trastienda donde se fabrica a medida (la
 * metáfora de "servicios"). Comparte cabaña, paleta y reloj con la tienda.
 *
 *   viga · herramientas colgadas y farol (viento)
 *   fragua con fuego · yunque + martillo encantado     tablón de encargos     mesa de alquimia
 *
 * Sin personas: el martillo flota y golpea solo cada 2 s, y suelta chispas.
 */

type Hang = { s: Sprite; x: number; len: number; phase: number; lantern?: boolean };

const STRIKES = 6; // golpes por bucle (cada 2 s)

const FLAME_FRAMES = [
  [".y.", "yWy", "oYo", "oYo"],
  ["y..", ".yy", "oWo", "oYo"],
  ["..y", "yy.", "oWo", "oYo"],
];
const FLAME_KEY: Record<string, string> = { W: PAL.g4, Y: PAL.g3, y: PAL.o2, o: PAL.o1 };

function flame(c: Ctx, x: number, y: number, frame: number) {
  const f = FLAME_FRAMES[((frame % 3) + 3) % 3] ?? FLAME_FRAMES[0]!;
  f.forEach((row, r) => {
    for (let i = 0; i < row.length; i++) {
      const color = FLAME_KEY[row[i] ?? "."];
      if (color) px(c, x - 1 + i, y + r, color);
    }
  });
}

export function createWorkshopScene(): Scene {
  let W = 0;
  let H = 0;
  let staticBase = makeCanvas(1, 1);
  let staticEmit = makeCanvas(1, 1);
  const beamH = 5;
  let floorY = 0;
  let forge = { x: 0, y: 0, w: 0, h: 0 };
  let anvil = { x: 0, y: 0 };
  let table = { x: 0, y: 0, w: 0 };
  let flasks: { x: number; y: number; color: string }[] = [];
  let scroll = { x: 0, y: 0 };
  let hangs: Hang[] = [];
  let sparks: { x: number; y: number; k: number; o: number; big?: boolean }[] = [];

  function hammerPose(t: number) {
    // Sube despacio, cae rápido, impacto al 88 % del ciclo
    const p = cycle(t, STRIKES);
    const rise = p < 0.8 ? p / 0.8 : 1 - (p - 0.8) / 0.08;
    const lift = p < 0.88 ? Math.round(2 + 9 * Math.min(1, Math.max(0, rise))) : 0;
    return { p, y: anvil.y - 9 - lift, impact: p >= 0.88 ? (p - 0.88) / 0.12 : -1 };
  }

  function drawForge(c: Ctx) {
    const { x, y, w, h } = forge;
    // Campana y chimenea
    const hoodW = w - 6;
    rect(c, x + 3 + Math.round((hoodW - 10) / 2), beamH, 10, y - beamH - 6, PAL.s1);
    rect(c, x + 3 + Math.round((hoodW - 10) / 2), beamH, 1, y - beamH - 6, PAL.s2);
    for (let i = 0; i < 6; i++) {
      const inset = 6 - i;
      rect(c, x + 3 + inset, y - 6 + i, hoodW - inset * 2, 1, i === 5 ? PAL.s3 : PAL.s1);
    }
    // Cuerpo de ladrillos
    rect(c, x, y, w, h, PAL.s0);
    for (let row = 0, yy = y + 1; yy < y + h - 1; yy += 4, row++) {
      for (let xx = x + 1 - (row % 2) * 3; xx < x + w - 1; xx += 6) {
        const bx = Math.max(x + 1, xx);
        const bw = Math.min(5, x + w - 1 - bx);
        rect(c, bx, yy, bw, 3, hash(row * 13 + xx) > 0.5 ? PAL.s1 : PAL.s2);
        rect(c, bx, yy, bw, 1, PAL.s3);
      }
    }
    // Boca de la fragua
    const mw = Math.round(w * 0.56);
    const mx = x + Math.round((w - mw) / 2);
    const my = y + 5;
    rect(c, mx - 1, my - 1, mw + 2, h - 8, PAL.ink);
    rect(c, mx, my, mw, h - 10, PAL.r0);
    rect(c, mx, my + h - 13, mw, 3, PAL.s0);
  }

  function drawTable(c: Ctx) {
    const { x, y, w } = table;
    rect(c, x, y, w, 3, PAL.w4);
    rect(c, x, y, w, 1, PAL.w5);
    rect(c, x, y + 3, w, 1, PAL.w0);
    rect(c, x + 2, y + 4, 3, floorY - y - 3, PAL.w2);
    rect(c, x + w - 5, y + 4, 3, floorY - y - 3, PAL.w2);
    rect(c, x + 2, y + 10, w - 4, 2, PAL.w1);
    // Serpentín de cobre del alambique
    const sx = x + Math.round(w * 0.55);
    for (let i = 0; i < 4; i++) line(c, sx, y - 3 - i * 3, sx + 5, y - 4 - i * 3, PAL.o2);
    rect(c, sx + 2, y - 15, 1, 13, PAL.g1);
  }

  function drawBoard(c: Ctx) {
    // Tablón de encargos: papeles clavados (se ve a los lados del panel)
    const bw = Math.min(Math.round(W * 0.34), 110);
    const bx = Math.round((W - bw) / 2);
    const by = beamH + Math.round(H * 0.18);
    const bh = Math.round((floorY - by) * 0.62);
    rect(c, bx, by, bw, bh, PAL.w0);
    rect(c, bx + 1, by + 1, bw - 2, bh - 2, PAL.w4);
    for (let i = 0; i < 9; i++) {
      const pw = 7 + Math.floor(hash(i + 300) * 5);
      const ph = 8 + Math.floor(hash(i + 310) * 5);
      const pxx = bx + 3 + Math.floor(hash(i + 320) * (bw - pw - 6));
      const pyy = by + 3 + Math.floor(hash(i + 330) * (bh - ph - 6));
      rect(c, pxx, pyy, pw, ph, i % 3 ? PAL.k2 : PAL.k1);
      for (let l = 2; l < ph - 1; l += 2) rect(c, pxx + 1, pyy + l, pw - 3, 1, PAL.k0);
      px(c, pxx + Math.floor(pw / 2), pyy, i % 2 ? PAL.r2 : PAL.b2);
    }
  }

  return {
    layout(w, h) {
      W = w;
      H = h;
      floorY = H - Math.max(9, Math.round(H * 0.13));
      const fw = Math.min(Math.max(Math.round(W * 0.15), 26), 44);
      const fh = Math.min(Math.round(H * 0.42), 40);
      forge = { x: 7, y: floorY - fh, w: fw, h: fh };
      anvil = { x: forge.x + fw + 3, y: floorY - 12 };
      const tw = Math.min(Math.max(Math.round(W * 0.18), 30), 56);
      table = { x: W - tw - 8, y: floorY - Math.max(14, Math.round(H * 0.17)), w: tw };
      flasks = [];
      sparks = [];

      hangs = [
        { s: sprite(S.HAMMER), x: Math.round(W * 0.3), len: 3, phase: 0.4 },
        { s: sprite(S.TONGS), x: Math.round(W * 0.36), len: 2, phase: 2.2 },
        {
          s: sprite(S.LANTERN),
          x: Math.round(W * 0.5),
          len: Math.round(H * 0.06),
          phase: 1.3,
          lantern: true,
        },
        { s: sprite(S.SAW), x: Math.round(W * 0.66), len: 2, phase: 3.1 },
        { s: sprite(S.HERBS), x: Math.round(W * 0.74), len: 4, phase: 4.4 },
      ];

      staticBase = makeCanvas(W, H);
      staticEmit = makeCanvas(W, H);
      const b = context(staticBase);
      const e = context(staticEmit);
      drawRoom(b, W, H, { beamH, floorY, seed: 3 });
      if (W > 170) drawBoard(b);
      drawForge(b);
      drawTable(b);

      // Tocón y yunque
      const av = sprite(S.ANVIL);
      rect(b, anvil.x + 3, anvil.y + av.h, 9, floorY - anvil.y - av.h + 2, PAL.w2);
      rect(b, anvil.x + 3, anvil.y + av.h, 9, 1, PAL.w4);
      blit(b, av, anvil.x, anvil.y);
      sparks.push({ x: anvil.x + 13, y: anvil.y + 1, k: 3, o: 0.2 });

      // Frascos sobre la mesa
      const items: { def: typeof S.FLASK; tint: "e2" | "b2" | "o2" | "p2"; dx: number }[] = [
        { def: S.FLASK, tint: "e2", dx: 3 },
        { def: S.TALL_POTION, tint: "b2", dx: 12 },
        { def: S.POTION, tint: "p2", dx: table.w - 10 },
      ];
      for (const it of items) {
        const s = sprite(it.def, { liquid: it.tint });
        if (it.dx + s.w > table.w - 1) continue;
        const fx = table.x + it.dx;
        const fy = table.y - s.h + 1;
        blit(b, s, fx, fy);
        blit(e, s, fx, fy, "emit");
        flasks.push({ x: fx + Math.floor(s.w / 2), y: fy + s.h - 3, color: PAL[it.tint] });
        sparks.push({ x: fx + 2, y: fy + 4, k: 2 + flasks.length, o: hash(flasks.length + 400) });
      }
      scroll = { x: table.x + Math.round(table.w / 2) - 4, y: table.y - 24 };
    },

    base(c, t) {
      c.drawImage(staticBase, 0, 0);
      const gust = wind(t);
      for (const hng of hangs) {
        const dx = Math.round(2 * gust - 1.1 + wave(t, 5, hng.phase));
        for (let j = 0; j <= hng.len; j++) {
          px(
            c,
            hng.x + Math.round((dx * j) / Math.max(1, hng.len)),
            beamH + j,
            hng.lantern ? PAL.s1 : PAL.k0,
          );
        }
        blit(c, hng.s, hng.x + dx - Math.floor(hng.s.w / 2), beamH + hng.len + 1);
      }
      // Martillo encantado
      const hp = hammerPose(t);
      blit(c, sprite(S.HAMMER), anvil.x + 5, hp.y);
      // Pergamino de recetas flotando
      const sy = scroll.y + Math.round(2 * wave(t, 2, 0.8));
      blit(c, sprite(S.SCROLL), scroll.x, sy);
      blit(c, sprite(S.SCROLL), scroll.x + 1, sy + 3);
    },

    ambient(mode) {
      return mode === "night" ? "#67619a" : "#f3e9d8";
    },

    lights(t, mode) {
      const night = mode === "night";
      const gust = wind(t);
      const hp = hammerPose(t);
      const out: Light[] = [
        {
          x: forge.x + forge.w / 2,
          y: forge.y + forge.h - 8,
          r: night ? 44 : 22,
          color: "#ff8a3d",
          a: (night ? 0.95 : 0.4) * flicker(t, 2),
          bloom: 0.9,
        },
        {
          x: anvil.x + 8,
          y: hp.y + 2,
          r: night ? 14 : 8,
          color: PAL.c2,
          a: night ? 0.6 : 0.25,
          bloom: 0.8,
        },
      ];
      if (hp.impact >= 0) {
        out.push({
          x: anvil.x + 8,
          y: anvil.y,
          r: night ? 26 : 14,
          color: "#ffd27a",
          a: (1 - hp.impact) * (night ? 1 : 0.5),
          bloom: 1,
        });
      }
      for (const hng of hangs) {
        if (!hng.lantern) continue;
        const dx = Math.round(2 * gust - 1.1 + wave(t, 5, hng.phase));
        out.push({
          x: hng.x + dx,
          y: beamH + hng.len + 6,
          r: night ? 42 : 22,
          color: "#ffb85c",
          a: (night ? 0.9 : 0.3) * flicker(t, 5),
          bloom: 0.9,
        });
      }
      for (const f of flasks) {
        out.push({
          x: f.x,
          y: f.y,
          r: night ? 12 : 7,
          color: f.color,
          a: night ? 0.6 : 0.25,
          bloom: 0.6,
        });
      }
      return out;
    },

    emissive(c, t, mode) {
      c.drawImage(staticEmit, 0, 0);
      // Fuego de la fragua
      const mw = Math.round(forge.w * 0.56);
      const mx = forge.x + Math.round((forge.w - mw) / 2);
      const base = forge.y + forge.h - 9;
      rect(c, mx, base, mw, 2, PAL.o1);
      for (let x = mx; x < mx + mw; x++)
        if ((x + Math.floor(cycle(t, 24) * 4)) % 3 === 0) px(c, x, base, PAL.g3);
      for (let i = 0; i < Math.floor(mw / 4); i++) {
        flame(c, mx + 2 + i * 4, base - 4, Math.floor(cycle(t, 36, i * 0.27) * 3));
      }
      const night = mode === "night";
      for (const hng of hangs) {
        if (!hng.lantern) continue;
        const dx = Math.round(2 * wind(t) - 1.1 + wave(t, 5, hng.phase));
        blit(
          c,
          hng.s,
          hng.x + dx - Math.floor(hng.s.w / 2),
          beamH + hng.len + 1,
          "emit",
          night ? 1 : 0.75,
        );
      }
      // Runa del martillo encantado
      const hp = hammerPose(t);
      px(c, anvil.x + 8, hp.y + 1, PAL.c3);
      px(c, anvil.x + 7, hp.y + 1, PAL.c2);
      px(c, anvil.x + 9, hp.y + 1, PAL.c2);
    },

    overlay(c, t) {
      const hp = hammerPose(t);
      // Chispas del golpe: abanico con gravedad
      if (hp.impact >= 0) {
        for (let i = 0; i < 10; i++) {
          const ang = Math.PI * (0.08 + 0.84 * hash(i + 500));
          const speed = 6 + hash(i + 510) * 10;
          const q = hp.impact;
          const x = anvil.x + 8 + Math.cos(ang) * speed * q * (i % 2 ? 1 : -1);
          const y = anvil.y - Math.sin(ang) * speed * q + 14 * q * q;
          c.globalAlpha = 1 - q;
          px(c, x, y, i % 3 ? PAL.g3 : PAL.white);
        }
        c.globalAlpha = 1;
      }
      // Ascuas que suben de la fragua
      const mw = Math.round(forge.w * 0.56);
      const mx = forge.x + Math.round((forge.w - mw) / 2);
      for (let i = 0; i < 5; i++) {
        const p = cycle(t, 4, hash(i + 520));
        c.globalAlpha = 1 - p;
        px(
          c,
          mx + Math.floor(hash(i + 530) * mw) + Math.round(wave(t, 6, i) * 1.5),
          forge.y + forge.h - 10 - p * 14,
          PAL.o2,
        );
      }
      // Burbujas en los frascos
      for (const [i, f] of flasks.entries()) {
        const p = cycle(t, 3, hash(i + 540));
        c.globalAlpha = 1 - p;
        px(c, f.x + (i % 2), f.y - 6 - Math.round(p * 8), PAL.k3);
      }
      c.globalAlpha = 1;
      for (const s of sparks) sparkle(c, s.x, s.y, cycle(t, s.k, s.o), s.big);
    },
  };
}
