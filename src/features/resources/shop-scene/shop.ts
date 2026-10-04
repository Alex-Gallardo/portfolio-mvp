import { cycle, flicker, hash, wave, wind } from "./loop";
import {
  PAL,
  bayer,
  blit,
  context,
  disc,
  ditherRect,
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
import * as S from "./sprites";

/**
 * La tienda del aventurero: interior de cabaña con cámara fija frontal.
 *
 *   vigas · banderines · faroles e hierbas colgados (viento)
 *   repisas (pociones, chocolates, Elixir de Maná, libros)   ventana   armería
 *   caldero burbujeando                                                 barril
 *   ═══════ mostrador: grimorio abierto, monedas, bola de cristal ═══════
 *
 * La composición se recalcula con el ancho: repisas y armería se anclan a
 * los lados, mostrador y ventana al centro, así nada importante se recorta.
 * Lo que no se mueve se pinta una vez por layout en `staticBase/staticEmit`.
 */

type Placed = { s: Sprite; x: number; y: number };
type Spark = { x: number; y: number; k: number; o: number; big?: boolean; night?: boolean };
type Hang = { s: Sprite; x: number; top: number; len: number; phase: number; lantern?: boolean };
type Glow = { x: number; y: number; r: number; color: string; a: number; bloom?: number };
type Mote = { x: number; y: number; i: number };

const POTION_TINTS: Tone[] = ["r2", "b2", "e2", "p2", "o2", "c2"];
const PENNANTS: Tone[] = ["o1", "o2", "o3", "c2", "p2", "b2"];
const BOOK_TONES: [Tone, Tone][] = [
  ["r1", "r2"],
  ["b1", "b2"],
  ["e1", "e2"],
  ["p1", "p2"],
  ["w3", "w4"],
  ["c1", "c2"],
];

const FLAME_FRAMES = [
  [".y.", "yWy", "oYo", ".o."],
  ["y..", ".yy", "oWo", ".o."],
  ["..y", "yy.", "oWo", ".o."],
];
const FLAME_KEY: Record<string, Tone> = { W: "g4", Y: "g3", y: "o2", o: "o1" };

function flame(ctx: Ctx, x: number, y: number, frame: number, lean: number) {
  const f = FLAME_FRAMES[((frame % 3) + 3) % 3] ?? FLAME_FRAMES[0]!;
  f.forEach((row, r) => {
    const shift = r < 2 ? lean : 0;
    for (let c = 0; c < row.length; c++) {
      const tone = FLAME_KEY[row[c] ?? "."];
      if (tone) px(ctx, x - 1 + c + shift, y + r, PAL[tone]);
    }
  });
}

export function createShopScene(): Scene {
  let W = 0;
  let H = 0;
  let staticBase = makeCanvas(1, 1);
  let staticEmit = makeCanvas(1, 1);
  let beam = makeCanvas(1, 1);

  // Layout
  let beamH = 6;
  let floorY = 0;
  let counterTop = 0;
  let cx0 = 0;
  let cw = 0;
  let win = { x: 0, y: 0, r: 12 };
  let hangs: Hang[] = [];
  let garland = { xa: 0, xb: 0, top: 0, sag: 0 };
  let candle = { x: 0, y: 0 };
  let book = { x: 0, y: 0 };
  let ball = { x: 0, y: 0 };
  let cauldron = { x: 0, y: 0, w: 0, on: true };
  let crystal = { x: 0, y: 0 };
  let grimoire = { x: 0, y: 0 };
  let sparks: Spark[] = [];
  let staticGlows: Glow[] = [];
  let fireflyZones: { x: number; y: number; w: number; h: number }[] = [];
  let motes: Mote[] = [];
  let beamBox = { x: 0, y: 0, w: 0, h: 0 };

  /* ---------- Fondo estático ---------- */

  function drawWindowFrame(c: Ctx) {
    const { x, y, r } = win;
    disc(c, x, y, r + 3, PAL.w0);
    disc(c, x, y, r + 2, PAL.w1);
    disc(c, x, y, r, PAL.b0);
    // Alféizar
    rect(c, x - r - 4, y + r + 1, r * 2 + 9, 2, PAL.w4);
    rect(c, x - r - 4, y + r + 3, r * 2 + 9, 1, PAL.w0);
  }

  function drawShelves(c: Ctx, x0: number, x1: number, boards: number[], items: Placed[]) {
    const top = (boards[0] ?? 40) - Math.round(H * 0.15);
    rect(c, x0, top, x1 - x0, floorY - top, PAL.w1);
    for (let y = top + 3; y < floorY; y += 5) rect(c, x0 + 3, y, x1 - x0 - 6, 1, PAL.w0);
    rect(c, x0, top, 3, floorY - top, PAL.w3);
    rect(c, x1 - 3, top, 3, floorY - top, PAL.w3);
    rect(c, x0 + 1, top, 1, floorY - top, PAL.w4);
    rect(c, x0 - 1, top - 2, x1 - x0 + 2, 3, PAL.w3);
    rect(c, x0 - 1, top - 2, x1 - x0 + 2, 1, PAL.w4);

    const inner0 = x0 + 4;
    const inner1 = x1 - 4;
    boards.forEach((by, bi) => {
      let x = inner0;
      const fits = (w: number) => x + w <= inner1;
      if (bi === 0) {
        let i = 0;
        while (fits(7)) {
          const tall = i % 3 === 2;
          const s = sprite(tall ? S.TALL_POTION : S.POTION, { liquid: POTION_TINTS[i % 6]! });
          if (!fits(s.w)) break;
          items.push({ s, x, y: by - s.h });
          staticGlows.push({
            x: x + s.w / 2,
            y: by - 4,
            r: 9,
            color: PAL[POTION_TINTS[i % 6]!],
            a: 0.55,
          });
          if (i % 2 === 0)
            sparks.push({ x: x + 2, y: by - s.h + 4, k: 2 + (i % 3), o: hash(i + 40) });
          x += s.w + 2;
          i++;
        }
      } else if (bi === 1) {
        let i = 0;
        while (fits(8)) {
          if (i % 2 === 0) {
            const s = sprite(S.CHOCOLATE);
            if (!fits(s.w)) break;
            items.push({ s, x, y: by - 4 }, { s, x: x + 1, y: by - 8 }, { s, x, y: by - 12 });
            sparks.push({ x: x + 1, y: by - 11, k: 3, o: hash(i + 70) });
            x += s.w + 2;
          } else {
            const s = sprite(S.CAN);
            for (let n = 0; n < 2 && fits(s.w); n++) {
              items.push({ s, x, y: by - s.h });
              staticGlows.push({ x: x + 2, y: by - 4, r: 6, color: PAL.g3, a: 0.4 });
              x += s.w + 1;
            }
            x += 1;
          }
          i++;
        }
      } else {
        let i = 0;
        while (fits(3)) {
          if (i === 3 && fits(7)) {
            const s = sprite(S.MUSHROOM_JAR);
            items.push({ s, x, y: by - s.h });
            staticGlows.push({ x: x + 3, y: by - 4, r: 11, color: PAL.e3, a: 0.6, bloom: 0.7 });
            x += s.w + 2;
          } else {
            const [dark, light] = BOOK_TONES[i % BOOK_TONES.length]!;
            const bw = 2 + (hash(i + 5) > 0.5 ? 1 : 0);
            const bh = 7 + Math.floor(hash(i + 9) * 3);
            rect(c, x, by - bh, bw, bh, PAL[dark]);
            rect(c, x, by - bh, 1, bh, PAL[light]);
            rect(c, x, by - bh + 2, bw, 1, PAL.g2);
            rect(c, x, by - 3, bw, 1, PAL.g2);
            x += bw + (i % 4 === 3 ? 2 : 0);
          }
          i++;
        }
      }
      // Tabla (encima de la base de los objetos)
      rect(c, x0, by, x1 - x0, 3, PAL.w3);
      rect(c, x0, by, x1 - x0, 1, PAL.w4);
      rect(c, x0, by + 3, x1 - x0, 1, PAL.w0);
    });
  }

  function drawRack(
    c: Ctx,
    x0: number,
    x1: number,
    top: number,
    maxBottom: number,
    items: Placed[],
  ) {
    const helmet = sprite(S.HELMET);
    const shelfY = top + helmet.h + 2;
    // El tablero se ajusta a lo que cuelga (yelmo + armas de ~26 px)
    const bottom = Math.min(maxBottom, shelfY + 5 + 28);
    rect(c, x0, top, x1 - x0, bottom - top, PAL.w0);
    rect(c, x0 + 1, top + 1, x1 - x0 - 2, bottom - top - 2, PAL.w1);
    for (let y = top + 3; y < bottom - 2; y += 4) {
      for (let x = x0 + 3; x < x1 - 2; x += 4) px(c, x, y, PAL.w0);
    }
    // Repisa para el yelmo
    rect(c, x0 + 2, shelfY, x1 - x0 - 4, 2, PAL.w3);
    rect(c, x0 + 2, shelfY + 2, x1 - x0 - 4, 1, PAL.w0);
    const hx = Math.round((x0 + x1) / 2 - helmet.w / 2);
    items.push({ s: helmet, x: hx, y: shelfY - helmet.h });
    sparks.push({ x: hx + 4, y: shelfY - helmet.h + 5, k: 2, o: 0.62 });

    const rowY = shelfY + 5;
    let x = x0 + 4;
    const sword = sprite(S.SWORD);
    if (x + sword.w <= x1 - 3) {
      items.push({ s: sword, x, y: rowY });
      staticGlows.push({ x: x + 3, y: rowY + 9, r: 15, color: PAL.c3, a: 0.5, bloom: 0.5 });
      sparks.push({ x: x + 3, y: rowY + 1, k: 3, o: 0.15, big: true });
      x += sword.w + 3;
    }
    const staff = sprite(S.STAFF);
    if (x + staff.w <= x1 - 3) {
      items.push({ s: staff, x, y: rowY - 2 });
      staticGlows.push({ x: x + 3, y: rowY + 1, r: 13, color: PAL.p2, a: 0.6, bloom: 0.8 });
      x += staff.w + 3;
    }
    // Escudo redondo con emblema de marca
    const sr = 7;
    if (x + sr * 2 + 1 <= x1 - 3) {
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
      x += sr * 2 + 4;
    }
    // Arco
    if (x + 6 <= x1 - 3) {
      const by0 = rowY - 1;
      const bh = 24;
      for (let i = 0; i <= bh; i++) {
        const bend = Math.round(4 * Math.sin((Math.PI * i) / bh));
        px(c, x + bend, by0 + i, PAL.w4);
        px(c, x + bend + 1, by0 + i, PAL.w2);
      }
      line(c, x, by0, x, by0 + bh, PAL.k2);
    }
  }

  function drawBarrel(c: Ctx, x: number, y: number) {
    // Lanzas asomando
    for (const [dx, h] of [
      [4, 16],
      [9, 20],
      [14, 14],
    ] as const) {
      rect(c, x + dx, y - h, 1, h, PAL.w3);
      rect(c, x + dx - 1, y - h - 3, 3, 3, PAL.s4);
      px(c, x + dx, y - h - 4, PAL.s5);
    }
    rect(c, x, y, 19, 22, PAL.w3);
    rect(c, x, y, 2, 22, PAL.w2);
    rect(c, x + 17, y, 2, 22, PAL.w1);
    rect(c, x + 6, y + 1, 1, 21, PAL.w2);
    rect(c, x + 12, y + 1, 1, 21, PAL.w2);
    for (const by of [y + 3, y + 17]) {
      rect(c, x - 1, by, 21, 2, PAL.s2);
      rect(c, x - 1, by, 21, 1, PAL.s3);
    }
    rect(c, x + 1, y - 1, 17, 2, PAL.w1);
  }

  function drawCauldronBody(c: Ctx) {
    const { x, y, w } = cauldron;
    // Patas y troncos
    rect(c, x + 2, y + 13, 2, 4, PAL.s1);
    rect(c, x + w - 4, y + 13, 2, 4, PAL.s1);
    rect(c, x + 3, y + 15, w - 6, 2, PAL.w1);
    // Cuerpo redondo
    for (let i = 0; i < 13; i++) {
      const inset = Math.round(3 * (i / 12) ** 2.2);
      rect(c, x + inset, y + 2 + i, w - inset * 2, 1, i < 3 ? PAL.s2 : PAL.s1);
      px(c, x + inset + 1, y + 2 + i, PAL.s3);
    }
    rect(c, x - 1, y, w + 2, 3, PAL.s3);
    rect(c, x - 1, y, w + 2, 1, PAL.s4);
  }

  function drawCounter(c: Ctx, items: Placed[]) {
    const x = cx0;
    const top = counterTop;
    rect(c, x - 2, top, cw + 4, 4, PAL.w4);
    rect(c, x - 2, top, cw + 4, 1, PAL.w5);
    rect(c, x - 2, top + 3, cw + 4, 1, PAL.w1);
    for (let bx = x; bx < x + cw; bx += 6) {
      rect(c, bx, top + 4, 6, H - top - 4, PAL.w2);
      rect(c, bx, top + 4, 1, H - top - 4, PAL.w3);
      rect(c, bx + 5, top + 4, 1, H - top - 4, PAL.w1);
    }
    rect(c, x, top + 4, cw, 1, PAL.w0);
    for (const by of [top + 8, H - 6]) {
      rect(c, x, by, cw, 2, PAL.s2);
      rect(c, x, by, cw, 1, PAL.s3);
      for (let rx = x + 3; rx < x + cw; rx += 12) px(c, rx, by, PAL.s5);
    }
    rect(c, x - 3, top + 4, 3, H - top - 4, PAL.w1);
    rect(c, x + cw, top + 4, 3, H - top - 4, PAL.w1);
    // Emblema: moneda de la tienda
    const ex = x + Math.round(cw / 2);
    const ey = Math.round((top + 10 + H - 6) / 2);
    disc(c, ex, ey, 5, PAL.g0);
    disc(c, ex, ey, 4, PAL.g2);
    disc(c, ex, ey, 2, PAL.g1);
    px(c, ex - 2, ey - 2, PAL.g4);
    sparks.push({ x: ex - 1, y: ey - 2, k: 2, o: 0.83 });

    // Objetos fijos sobre el mostrador
    const coins = sprite(S.COINS);
    const coinX = x + Math.round(cw * 0.36);
    items.push({ s: coins, x: coinX, y: top - coins.h + 1 });
    sparks.push(
      { x: coinX + 5, y: top - 4, k: 3, o: 0.05 },
      { x: coinX + 10, y: top - 2, k: 4, o: 0.55, big: true },
    );
    const chest = sprite(S.CHEST);
    const chestX = x + cw - chest.w - 4;
    items.push({ s: chest, x: chestX, y: top - chest.h + 1 });
    sparks.push({ x: chestX + 6, y: top - 4, k: 2, o: 0.47 });
    const scale = sprite(S.SCALE);
    const scaleX = chestX - scale.w - 4;
    if (scaleX > x + cw * 0.72) items.push({ s: scale, x: scaleX, y: top - scale.h + 1 });
  }

  function buildBeam() {
    // Haz de luz de la ventana hacia el suelo, a la izquierda
    const x0 = win.x - 6;
    const x1 = win.x + 6;
    const bx0 = Math.round(win.x - W * 0.26);
    const bx1 = Math.round(win.x - W * 0.08);
    const y0 = win.y;
    const y1 = floorY + 6;
    const left = Math.min(x0, bx0);
    const right = Math.max(x1, bx1);
    beamBox = { x: left, y: y0, w: right - left, h: y1 - y0 };
    beam = makeCanvas(beamBox.w, beamBox.h);
    const c = context(beam);
    for (let y = 0; y < beamBox.h; y++) {
      const q = y / beamBox.h;
      const a = x0 + (bx0 - x0) * q - left;
      const b = x1 + (bx1 - x1) * q - left;
      const level = 0.75 * (1 - q * 0.65);
      for (let x = Math.floor(a); x < b; x++) {
        const edge = Math.min(x - a, b - x) / 3;
        if (Math.min(1, edge) * level > bayer(x + left, y + beamBox.y)) px(c, x, y, "#ffffff");
      }
    }
  }

  /* ---------- Scene ---------- */

  return {
    layout(w, h) {
      W = w;
      H = h;
      const portrait = H > W;
      beamH = 6;
      floorY = H - Math.round(H * (portrait ? 0.12 : 0.13));
      counterTop = H - Math.round(H * (portrait ? 0.17 : 0.2));
      cw = Math.min(Math.max(Math.round(W * (portrait ? 0.86 : 0.5)), 96), 230);
      cx0 = Math.round((W - cw) / 2);
      win = {
        x: Math.round(W / 2),
        y: Math.round(H * (portrait ? 0.14 : 0.155)),
        r: portrait ? 10 : 11,
      };
      sparks = [];
      staticGlows = [];

      const sideW = Math.min(Math.max(Math.round(W * 0.24), 34), 96);
      const shelfX0 = 6;
      const shelfX1 = shelfX0 + sideW;
      const rackX1 = W - 6;
      const rackX0 = rackX1 - sideW;
      const boards = portrait
        ? [0.34, 0.45, 0.56].map((f) => Math.round(H * f))
        : [0.33, 0.49, 0.65].map((f) => Math.round(H * f));
      const rackTop = Math.round(H * (portrait ? 0.28 : 0.27));
      const rackBottom = Math.round(H * (portrait ? 0.6 : 0.68));

      // Sólo si cabe junto al mostrador: detrás quedaría tapado y su fuego
      // (capa emisiva) se pintaría encima del mostrador.
      cauldron = { x: 9, y: floorY - 6, w: 20, on: 9 + 20 + 3 < cx0 - 2 };
      candle = { x: cx0 + 6, y: counterTop - 6 };
      book = { x: cx0 + Math.round(cw * 0.12), y: counterTop - 5 };
      ball = { x: cx0 + Math.round(cw * 0.6), y: counterTop - 12 };
      crystal = { x: Math.round(shelfX0 + sideW * 0.55), y: Math.round(H * 0.17) };
      grimoire = { x: Math.round(rackX0 + sideW / 2 - 8), y: Math.round(H * 0.11) };

      // Colgantes de la viga
      const lanternLen = Math.round(H * 0.07);
      hangs = [
        {
          s: sprite(S.LANTERN),
          x: Math.round(W * 0.33),
          top: beamH,
          len: lanternLen,
          phase: 0,
          lantern: true,
        },
        {
          s: sprite(S.LANTERN),
          x: Math.round(W * 0.67),
          top: beamH,
          len: lanternLen + 3,
          phase: 2.1,
          lantern: true,
        },
        { s: sprite(S.HERBS), x: Math.round(W * 0.12), top: beamH, len: 4, phase: 1.2 },
        { s: sprite(S.HERBS), x: Math.round(W * 0.88), top: beamH, len: 6, phase: 3.3 },
        { s: sprite(S.GARLIC), x: Math.round(W * 0.43), top: beamH, len: 3, phase: 0.7 },
        { s: sprite(S.GARLIC), x: Math.round(W * 0.57), top: beamH, len: 5, phase: 4.1 },
      ];
      garland = {
        xa: Math.round(W * 0.03),
        xb: Math.round(W * 0.97),
        top: beamH + 8,
        sag: Math.round(H * 0.045),
      };

      // Capa estática
      staticBase = makeCanvas(W, H);
      staticEmit = makeCanvas(W, H);
      const bctx = context(staticBase);
      const ectx = context(staticEmit);
      const items: Placed[] = [];
      drawRoom(bctx, W, H, { beamH, floorY });
      drawWindowFrame(bctx);
      drawShelves(bctx, shelfX0, shelfX1, boards, items);
      drawRack(bctx, rackX0, rackX1, rackTop, rackBottom, items);
      // Barril y hacha sólo si caben a la derecha del mostrador
      if (W - 32 > cx0 + cw + 4) {
        drawBarrel(bctx, W - 30, floorY - 14);
        const axe = sprite(S.AXE);
        items.push({ s: axe, x: W - 30 - axe.w - 2, y: floorY - axe.h + 3 });
        sparks.push({ x: W - 30 - axe.w - 1, y: floorY - axe.h + 5, k: 2, o: 0.38 });
      }
      if (cauldron.on) drawCauldronBody(bctx);
      drawCounter(bctx, items);
      for (const it of items) {
        blit(bctx, it.s, it.x, it.y);
        blit(ectx, it.s, it.x, it.y, "emit");
      }

      // Destellos de los flotantes y la bola
      sparks.push(
        { x: ball.x + 3, y: ball.y + 2, k: 3, o: 0.72 },
        { x: crystal.x + 1, y: crystal.y + 2, k: 4, o: 0.25, big: true },
        { x: grimoire.x + 4, y: grimoire.y + 2, k: 3, o: 0.9 },
      );

      // Luciérnagas (noche) y motas de polvo (día)
      fireflyZones = [
        { x: shelfX0 + 2, y: Math.round(H * 0.18), w: sideW, h: Math.round(H * 0.5) },
        { x: rackX0 - 4, y: Math.round(H * 0.16), w: sideW, h: Math.round(H * 0.5) },
      ];
      buildBeam();
      motes = Array.from({ length: 26 }, (_, i) => ({
        x: beamBox.x + hash(i * 3 + 1) * beamBox.w,
        y: beamBox.y + hash(i * 3 + 2) * beamBox.h,
        i,
      }));
    },

    base(c, t) {
      c.drawImage(staticBase, 0, 0);
      const gust = wind(t);

      // Banderines al viento
      const { xa, xb, top, sag } = garland;
      const mid = (xa + xb) / 2;
      const half = (xb - xa) / 2;
      const yAt = (x: number) => top + sag * (1 - ((x - mid) / half) ** 2);
      for (let x = xa; x <= xb; x++) px(c, x, yAt(x), PAL.k0);
      // Cuerdas que la sujetan a la viga
      line(c, xa, beamH, xa, top, PAL.k0);
      line(c, xb, beamH, xb, top, PAL.k0);
      let n = 0;
      for (let x = xa + 3; x < xb - 5; x += 9, n++) {
        const y0 = Math.round(yAt(x + 3)) + 1;
        const flap = Math.round(1.6 * gust * wave(t, 6, n * 0.8));
        const tone = PAL[PENNANTS[n % PENNANTS.length]!];
        for (let r = 0; r < 6; r++) {
          const wdt = Math.round(7 * (1 - r / 6));
          const off = Math.round((flap * r) / 5) + Math.round((7 - wdt) / 2);
          rect(c, x + off, y0 + r, wdt, 1, r === 0 ? PAL.ink : tone);
        }
      }

      // Colgantes: se inclinan con la ráfaga y oscilan
      for (const hng of hangs) {
        const dx = Math.round(2.2 * gust - 1.2 + 1.1 * wave(t, 5, hng.phase));
        for (let j = 0; j <= hng.len; j++) {
          px(
            c,
            hng.x + Math.round((dx * j) / Math.max(1, hng.len)),
            hng.top + j,
            hng.lantern ? PAL.s1 : PAL.k0,
          );
        }
        blit(c, hng.s, hng.x + dx - Math.floor(hng.s.w / 2), hng.top + hng.len + 1);
      }

      // Caldero: llamas bajo la olla
      if (cauldron.on) rect(c, cauldron.x + 3, cauldron.y + 15, cauldron.w - 6, 2, PAL.w1);

      // Grimorio abierto con página que se pasa sola
      const sb = sprite(S.SPELLBOOK, { cover: "r1" });
      blit(c, sb, book.x, book.y);
      const q = cycle(t, 2, 0.3);
      if (q < 0.22) {
        const p = q / 0.22;
        const spine = book.x + 8;
        const tipX = spine + Math.round(7 * Math.cos(Math.PI * p));
        const lift = Math.round(5 * Math.sin(Math.PI * p));
        line(c, spine, book.y + 1, tipX, book.y + 1 - lift, PAL.k3);
        line(c, spine, book.y + 2, tipX, book.y + 2 - lift, PAL.k1);
      }

      // Vela
      rect(c, candle.x - 2, counterTop - 1, 5, 2, PAL.g1);
      rect(c, candle.x - 1, candle.y, 3, 5, PAL.k3);
      rect(c, candle.x + 1, candle.y, 1, 5, PAL.k1);
      px(c, candle.x, candle.y - 1, PAL.ink);

      // Bola de cristal
      blit(c, sprite(S.CRYSTAL_BALL), ball.x - 5, ball.y - 4);

      // Flotantes
      const cy = crystal.y + Math.round(2 * wave(t, 2, 0.3));
      blit(c, sprite(S.CRYSTAL), crystal.x - 3, cy);
      // Libro de hechizos flotante: abierto, pasa páginas con el viento
      const gy = grimoire.y + Math.round(2 * wave(t, 3, 1.1));
      blit(c, sprite(S.SPELLBOOK, { cover: "b1" }), grimoire.x, gy);
      const fq = cycle(t, 4, 0.6);
      if (fq < 0.3) {
        const p = fq / 0.3;
        const spine = grimoire.x + 8;
        const tipX = spine + Math.round(7 * Math.cos(Math.PI * p));
        const lift = Math.round(6 * Math.sin(Math.PI * p));
        line(c, spine, gy + 1, tipX, gy + 1 - lift, PAL.k3);
        line(c, spine, gy + 2, tipX, gy + 2 - lift, PAL.k1);
      }
    },

    ambient(mode) {
      return mode === "night" ? "#5f5a8c" : "#f3e9d8";
    },

    lights(t, mode) {
      const night = mode === "night";
      const gust = wind(t);
      const out: Light[] = [];
      for (const hng of hangs) {
        if (!hng.lantern) continue;
        const dx = Math.round(2.2 * gust - 1.2 + 1.1 * wave(t, 5, hng.phase));
        out.push({
          x: hng.x + dx,
          y: hng.top + hng.len + 6,
          r: night ? 56 : 28,
          color: "#ffb85c",
          a: (night ? 1 : 0.35) * flicker(t, hng.phase + 1),
          bloom: 0.9,
        });
      }
      out.push(
        {
          x: candle.x,
          y: candle.y - 3,
          r: night ? 20 : 10,
          color: "#ffc070",
          a: (night ? 0.85 : 0.3) * flicker(t, 4),
          bloom: 0.7,
        },
        {
          x: ball.x,
          y: ball.y,
          r: night ? 32 : 16,
          color: PAL.p2,
          a: (night ? 0.75 : 0.3) * (0.78 + 0.22 * wave(t, 2)),
          bloom: 1,
        },
        {
          x: crystal.x,
          y: crystal.y + 4 + Math.round(2 * wave(t, 2, 0.3)),
          r: night ? 20 : 10,
          color: PAL.p2,
          a: night ? 0.7 : 0.25,
          bloom: 0.9,
        },
        {
          x: grimoire.x + 8,
          y: grimoire.y + 3 + Math.round(2 * wave(t, 3, 1.1)),
          r: night ? 16 : 8,
          color: PAL.p2,
          a: night ? 0.6 : 0.2,
          bloom: 0.8,
        },
        {
          x: win.x,
          y: win.y,
          r: night ? 40 : 58,
          color: night ? "#7d95ff" : "#fff0c8",
          a: night ? 0.45 : 0.5,
          bloom: night ? 0.4 : 0.6,
        },
      );
      if (cauldron.on) {
        out.push(
          {
            x: cauldron.x + cauldron.w / 2,
            y: cauldron.y + 14,
            r: night ? 28 : 14,
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
      for (const g of staticGlows) {
        out.push({ ...g, r: night ? g.r : Math.round(g.r * 0.6), a: g.a * (night ? 1 : 0.35) });
      }
      if (night) {
        fireflyZones.forEach((z, zi) => {
          for (let i = 0; i < 4; i++) {
            const f = firefly(t, zi * 4 + i, z);
            if (f.on) out.push({ x: f.x, y: f.y, r: 5, color: PAL.e3, a: 0.5 });
          }
        });
      }
      return out;
    },

    lightShapes(lctx, t, mode) {
      const prev = lctx.globalAlpha;
      lctx.globalAlpha = mode === "night" ? 0.12 : 0.34 + 0.06 * wave(t, 1, 0.5);
      lctx.drawImage(beam, beamBox.x, beamBox.y);
      lctx.globalAlpha = prev;
    },

    emissive(c, t, mode) {
      const night = mode === "night";
      drawSky(c, t, night);
      c.drawImage(staticEmit, 0, 0);

      const gust = wind(t);
      for (const hng of hangs) {
        if (!hng.lantern) continue;
        const dx = Math.round(2.2 * gust - 1.2 + 1.1 * wave(t, 5, hng.phase));
        blit(
          c,
          hng.s,
          hng.x + dx - Math.floor(hng.s.w / 2),
          hng.top + hng.len + 1,
          "emit",
          night ? 1 : 0.75,
        );
      }

      // Vela y fuego del caldero
      const lean = gust > 0.72 ? 1 : 0;
      flame(c, candle.x, candle.y - 5, Math.floor(cycle(t, 48) * 3), lean);
      const ct = cauldron;
      if (ct.on) {
        for (let i = 0; i < 3; i++) {
          flame(c, ct.x + 5 + i * 5, ct.y + 12, Math.floor(cycle(t, 36, i * 0.31) * 3), lean);
        }
        // Pócima: superficie con burbujas que revientan
        rect(c, ct.x + 1, ct.y + 1, ct.w - 2, 2, PAL.e2);
        rect(c, ct.x + 2, ct.y + 1, ct.w - 4, 1, PAL.e3);
        for (let i = 0; i < 4; i++) {
          const p = cycle(t, 4, hash(i + 20));
          if (p < 0.35) px(c, ct.x + 3 + Math.floor(hash(i + 30) * (ct.w - 6)), ct.y, PAL.e3);
        }
      }

      // Runas del grimorio, que laten
      const sb = sprite(S.SPELLBOOK, { cover: "r1" });
      blit(c, sb, book.x, book.y, "emit", 0.55 + 0.45 * (0.5 + 0.5 * wave(t, 3)));

      // Bola de cristal + runas en órbita
      blit(c, sprite(S.CRYSTAL_BALL), ball.x - 5, ball.y - 4, "emit", 0.75 + 0.25 * wave(t, 2));
      for (let i = 0; i < 3; i++) {
        const a = Math.PI * 2 * (cycle(t, 2) + i / 3);
        const rx = ball.x + Math.round(10 * Math.cos(a));
        const ry = ball.y - 2 + Math.round(3 * Math.sin(a));
        const behind = Math.sin(a) < 0;
        c.globalAlpha = behind ? 0.45 : 1;
        px(c, rx, ry, PAL.c3);
        px(c, rx + 1, ry, PAL.c2);
        px(c, rx, ry + 1, PAL.c2);
        c.globalAlpha = 1;
      }

      const cy = crystal.y + Math.round(2 * wave(t, 2, 0.3));
      blit(c, sprite(S.CRYSTAL), crystal.x - 3, cy, "emit");
      const gy = grimoire.y + Math.round(2 * wave(t, 3, 1.1));
      blit(c, sprite(S.SPELLBOOK, { cover: "b1" }), grimoire.x, gy, "emit");
    },

    overlay(c, t, mode) {
      const night = mode === "night";
      const gust = wind(t);

      // Burbujas que suben del caldero
      const ct = cauldron;
      for (let i = 0; i < (ct.on ? 6 : 0); i++) {
        const p = cycle(t, 3, hash(i + 10));
        const bx = ct.x + 3 + Math.floor(hash(i + 50) * (ct.w - 6)) + Math.round(wave(t, 6, i));
        c.globalAlpha = 1 - p;
        px(c, bx, ct.y - 1 - Math.round(p * 16), PAL.e3);
      }
      // Chispas del fuego
      for (let i = 0; i < (ct.on ? 4 : 0); i++) {
        const p = cycle(t, 4, hash(i + 60));
        c.globalAlpha = 1 - p;
        px(
          c,
          ct.x + 4 + Math.floor(hash(i + 61) * (ct.w - 8)) + Math.round(p * 3 * gust),
          ct.y + 10 - Math.round(p * 8),
          PAL.o2,
        );
      }
      c.globalAlpha = 1;

      if (night) {
        fireflyZones.forEach((z, zi) => {
          for (let i = 0; i < 4; i++) {
            const f = firefly(t, zi * 4 + i, z);
            if (!f.on) continue;
            px(c, f.x, f.y, PAL.e3);
            c.globalAlpha = 0.5;
            px(c, f.x + 1, f.y, PAL.g4);
            c.globalAlpha = 1;
          }
        });
      } else {
        // Motas de polvo dentro del haz de sol, arrastradas por el viento
        for (const m of motes) {
          const x = Math.round(m.x + 3 * wave(t, 1 + (m.i % 3), hash(m.i)) + gust * 2);
          const y = Math.round(m.y + 2 * wave(t, 2 + (m.i % 2), hash(m.i + 7)));
          const a = 0.35 + 0.35 * (0.5 + 0.5 * wave(t, 4 + (m.i % 5), m.i));
          c.globalAlpha = a;
          px(c, x, y, PAL.k3);
        }
        c.globalAlpha = 1;
      }

      for (const s of sparks) sparkle(c, s.x, s.y, cycle(t, s.k, s.o), s.big);
    },
  };

  /* ---------- Ayudantes que dependen del layout ---------- */

  function firefly(t: number, i: number, z: { x: number; y: number; w: number; h: number }) {
    const x = Math.round(z.x + hash(i + 100) * z.w + 6 * wave(t, 1 + (i % 3), hash(i + 101) * 6));
    const y = Math.round(z.y + hash(i + 102) * z.h + 4 * wave(t, 2 + (i % 2), hash(i + 103) * 6));
    const on = wave(t, 3 + (i % 4), hash(i + 104) * 6) > -0.2;
    return { x, y, on };
  }

  function drawSky(c: Ctx, t: number, night: boolean) {
    const { x, y, r } = win;
    const top = y - r;
    // Cielo con tramado en bandas
    for (let dy = -r; dy <= r; dy++) {
      const half = Math.floor(Math.sqrt(r * r - dy * dy) + 0.35);
      const q = (dy + r) / (r * 2);
      ditherRect(
        c,
        x - half,
        y + dy,
        half * 2 + 1,
        1,
        night ? PAL.b0 : "#7ec8ff",
        night ? "#2a3480" : "#e6f6ff",
        () => (night ? q * 0.6 : q),
      );
    }
    if (night) {
      // Luna y estrellas que titilan
      disc(c, x + 4, top + 7, 3, "#fff6d6");
      disc(c, x + 5, top + 6, 2, PAL.b0);
      for (let i = 0; i < 6; i++) {
        const sx = x - r + 3 + Math.floor(hash(i + 200) * (r * 2 - 6));
        const sy = top + 3 + Math.floor(hash(i + 210) * r);
        if (Math.hypot(sx - x, sy - y) > r - 2) continue;
        const on = wave(t, 2 + (i % 4), i) > -0.4;
        if (on) px(c, sx, sy, i % 3 ? PAL.k3 : PAL.g4);
      }
    } else {
      // Nubes que cruzan una vez por bucle: entran y salen sin corte
      for (let i = 0; i < 2; i++) {
        const span = r * 2 + 14;
        const cxp = x - r - 7 + ((cycle(t, 1, i * 0.5) * span) % span);
        const cyp = top + 6 + i * 7;
        for (const [ox, oy, w] of [
          [0, 1, 9],
          [2, 0, 5],
          [1, 2, 8],
        ] as const) {
          for (let k = 0; k < w; k++) {
            const px0 = Math.round(cxp + ox + k);
            const py0 = cyp + oy;
            if (Math.hypot(px0 - x, py0 - y) <= r) px(c, px0, py0, PAL.white);
          }
        }
      }
    }
    // Parteluces de la ventana
    rect(c, x - r, y, r * 2 + 1, 1, PAL.w1);
    rect(c, x, y - r, 1, r * 2 + 1, PAL.w1);
  }
}
