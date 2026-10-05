/**
 * Plano del almacén (fondo fijo detrás del catálogo de /recursos). Función
 * pura: decide dónde va cada cosa según el tamaño lógico del canvas y el
 * ancho que ocupa el contenido, para que la decoración viva en los bordes
 * libres y no debajo de las columnas.
 *
 *   viga · estandartes · cadenas · ventanucos con barrotes
 *   [borde: mapa, gemas, barriles]   (contenido)   [borde: estandarte, cajas]
 *   antorchas en los pilares · suelo
 */

import type { Rect } from "./shop-layout";

export type CellarPlan = {
  W: number;
  H: number;
  beamY: number;
  beamH: number;
  floorY: number;
  /** Ancho libre a cada lado del contenido (0 si el contenido llena la pantalla). */
  edge: number;
  pillars: number[];
  torches: { x: number; y: number }[];
  windows: Rect[];
  banners: Rect[];
  chains: { x: number; len: number }[];
  /** Pilas de barriles y cajas sobre el suelo, en los bordes. */
  stacks: Rect[];
  map: Rect | null;
  gems: { x: number; y: number }[];
};

/** Ancho máximo del catálogo en px CSS (ver recursos.module.css → .layout). */
export const CONTENT_MAX_CSS = 1360;

const PILLAR_W = 8;

export function planCellar(W: number, H: number, pxCss: number): CellarPlan {
  const beamY = 6;
  const beamH = 6;
  const floorY = H - Math.max(10, Math.round(H * 0.06));
  const contentW = Math.min(W, Math.ceil(CONTENT_MAX_CSS / Math.max(0.5, pxCss)));
  const edge = Math.max(0, Math.floor((W - contentW) / 2));

  // Pilares: en las esquinas y en el límite del contenido si hay borde
  const pillars = [0, W - PILLAR_W];
  if (edge >= 24) pillars.push(edge - PILLAR_W - 2, W - edge + 2);

  // Antorchas en los pilares interiores (o cerca de los bordes de pantalla)
  const torchXs =
    edge >= 24
      ? [edge - PILLAR_W / 2 - 2, W - edge + PILLAR_W / 2 + 2]
      : [PILLAR_W + 6, W - PILLAR_W - 7];
  const torches = torchXs.flatMap((x) => [
    { x: Math.round(x), y: Math.round(H * 0.32) },
    { x: Math.round(x), y: Math.round(H * 0.72) },
  ]);

  // Ventanucos con barrotes, altos, a un cuarto y tres cuartos del ancho
  const winW = 18;
  const winH = 12;
  const windows = [0.25, 0.75].map((f) => ({
    x: Math.round(W * f - winW / 2),
    y: beamY + beamH + 6,
    w: winW,
    h: winH,
  }));

  // Decoración de bordes: sólo si el borde da para ello
  const banners: Rect[] = [];
  const stacks: Rect[] = [];
  const chains: { x: number; len: number }[] = [];
  let map: Rect | null = null;
  const gems: { x: number; y: number }[] = [];
  if (edge >= 30) {
    const bw = Math.min(14, edge - 16);
    const bh = Math.round(H * 0.26);
    const leftMid = Math.round(edge / 2);
    const rightMid = W - Math.round(edge / 2);
    banners.push(
      { x: leftMid - Math.round(bw / 2), y: beamY + beamH + 2, w: bw, h: bh },
      { x: rightMid - Math.round(bw / 2), y: beamY + beamH + 2, w: bw, h: bh },
    );
    const sw = Math.min(edge - 14, 34);
    stacks.push(
      { x: PILLAR_W + 4, y: floorY - 26, w: sw, h: 26 },
      { x: W - PILLAR_W - 4 - sw, y: floorY - 26, w: sw, h: 26 },
    );
    if (edge >= 44) {
      map = { x: leftMid - 10, y: Math.round(H * 0.5), w: 20, h: 15 };
      chains.push(
        { x: rightMid - 8, len: Math.round(H * 0.18) },
        { x: rightMid + 8, len: Math.round(H * 0.24) },
      );
    }
    gems.push(
      { x: Math.round(edge * 0.3), y: Math.round(H * 0.42) },
      { x: W - Math.round(edge * 0.35), y: Math.round(H * 0.58) },
    );
  }

  return {
    W,
    H,
    beamY,
    beamH,
    floorY,
    edge,
    pillars,
    torches,
    windows,
    banners,
    chains,
    stacks,
    map,
    gems,
  };
}
