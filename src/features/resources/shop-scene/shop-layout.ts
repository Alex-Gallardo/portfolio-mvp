/**
 * Plano de la tienda: dónde va cada mueble según el tamaño lógico del
 * canvas. Es una función pura (sin canvas) para poder testear que nada se
 * pisa ni se sale en los tamaños típicos.
 *
 *   techo · viga · lámpara de campanas, faroles y plantas colgantes
 *   [pared]  [estantería]  cortina │ VENTANAL │ cortina  [estantería]  [pared]
 *   caldero, carteles, báculo                 armería, cofre, planta
 *   ══════════════ mostrador con vitrina · gato durmiendo ══════════════
 */

export type Rect = { x: number; y: number; w: number; h: number };

export type ShopPlan = {
  W: number;
  H: number;
  portrait: boolean;
  /** Fin del techo de tablones y altura de la viga maestra. */
  beamY: number;
  beamH: number;
  floorY: number;
  /** Ventanal en arco: el arco es un semicírculo de radio w/2. */
  window: Rect;
  sill: Rect;
  /** Hueco entre ventanal y estantería, donde cuelgan las cortinas. */
  gap: number;
  shelves: { rect: Rect; boards: number[] }[];
  /** Pared libre a los lados de las estanterías (sólo en pantallas anchas). */
  outer: { left: Rect | null; right: Rect | null };
  counter: Rect;
  vitrina: Rect;
  chandelier: { x: number; y: number; len: number };
  lanterns: { x: number; len: number }[];
  cat: { x: number; y: number };
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const even = (v: number) => Math.round(v / 2) * 2;

export const CAT_W = 16;
export const CAT_H = 8;
const MIN_SHELF = 30;
const MIN_OUTER = 34;

export function planShop(W: number, H: number): ShopPlan {
  const portrait = H > W;
  const beamY = 10;
  const beamH = 6;
  const floorY = H - Math.round(H * (portrait ? 0.12 : 0.15));

  // Mostrador al frente, con vitrina en su mitad superior
  const counterH = Math.round(H * (portrait ? 0.2 : 0.25));
  const counterW = portrait ? W - 12 : clamp(Math.round(W * 0.5), 120, 280);
  const counter: Rect = {
    x: Math.round((W - counterW) / 2),
    y: H - counterH,
    w: counterW,
    h: counterH,
  };
  const vitrina: Rect = {
    x: counter.x + 6,
    y: counter.y + 5,
    w: counter.w - 12,
    h: Math.round(counter.h * 0.46),
  };

  // Ventanal en arco, protagonista del centro
  const winW = even(clamp(Math.round(W * (portrait ? 0.34 : 0.24)), 44, 124));
  const winTop = beamY + beamH + Math.round(H * (portrait ? 0.07 : 0.08));
  const winBottom = counter.y - Math.round(H * (portrait ? 0.1 : 0.11));
  const window: Rect = {
    x: Math.round((W - winW) / 2),
    y: winTop,
    w: winW,
    h: Math.max(winW / 2 + 24, winBottom - winTop),
  };
  const sill: Rect = { x: window.x - 6, y: window.y + window.h, w: window.w + 12, h: 4 };

  // Estanterías a ambos lados del ventanal (las cortinas van en el hueco)
  const gap = portrait ? 8 : Math.max(10, Math.round(W * 0.035));
  const shelfTop = beamY + beamH + Math.round(H * 0.1);
  let shelfW = clamp(Math.round(W * 0.17), MIN_SHELF, 96);
  shelfW = Math.min(shelfW, window.x - gap - 6);
  const shelves: ShopPlan["shelves"] = [];
  if (shelfW >= MIN_SHELF) {
    const n = H > 280 ? 7 : H > 200 ? 6 : 5;
    const first = shelfTop + 14;
    const last = floorY - 6;
    const boards = Array.from({ length: n }, (_, i) =>
      Math.round(first + ((last - first) * i) / (n - 1)),
    );
    for (const x of [window.x - gap - shelfW, window.x + window.w + gap]) {
      shelves.push({ rect: { x, y: shelfTop, w: shelfW, h: floorY - shelfTop }, boards });
    }
  }

  // Pared libre fuera de las estanterías
  const leftEdge = shelves[0] ? shelves[0].rect.x - 6 : 0;
  const rightEdge = shelves[1] ? shelves[1].rect.x + shelves[1].rect.w + 6 : W;
  const outerW = Math.min(leftEdge - 6, W - 6 - rightEdge);
  const outer =
    shelves.length && outerW >= MIN_OUTER
      ? {
          left: { x: 6, y: shelfTop, w: leftEdge - 6, h: floorY - shelfTop },
          right: { x: rightEdge, y: shelfTop, w: W - 6 - rightEdge, h: floorY - shelfTop },
        }
      : { left: null, right: null };

  // Colgantes: lámpara de campanas al centro, faroles sobre las estanterías
  const chandelier = { x: Math.round(W / 2), y: beamY + beamH, len: Math.round(H * 0.05) };
  const lanterns = shelves.map((s, i) => ({
    x: Math.round(s.rect.x + s.rect.w / 2),
    len: Math.max(4, shelfTop - beamY - beamH - 16) + (i ? 2 : 0),
  }));

  // El gato duerme en el extremo derecho del mostrador
  const cat = { x: counter.x + counter.w - CAT_W - 6, y: counter.y - CAT_H + 1 };

  return {
    W,
    H,
    portrait,
    beamY,
    beamH,
    floorY,
    window,
    sill,
    gap,
    shelves,
    outer,
    counter,
    vitrina,
    chandelier,
    lanterns,
    cat,
  };
}

export function overlaps(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

export function inside(inner: Rect, outer: Rect): boolean {
  return (
    inner.x >= outer.x &&
    inner.y >= outer.y &&
    inner.x + inner.w <= outer.x + outer.w &&
    inner.y + inner.h <= outer.y + outer.h
  );
}
