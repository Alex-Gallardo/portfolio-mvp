/**
 * Dónde flota cada objeto 3D del hero crypto.
 *
 * El texto del hero va centrado y llega del CMS, así que su tamaño varía.
 * El componente mide el bloque de texto real (px) y aquí se reparten los
 * objetos en el espacio libre alrededor:
 *   - "sides": hay aire lateral (desktop) → objetos en los márgenes.
 *   - "bands": pantalla estrecha (móvil/tablet vertical) → franjas encima
 *     y debajo del texto.
 * El resultado se da en píxeles y se convierte a mundo con la cámara.
 */

export type SceneObject = "coin" | "eth" | "chain" | "coinSmall";

export interface Rect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface PxPlacement {
  /** centro en px, relativo a la esquina superior izquierda del hero */
  cx: number;
  cy: number;
  /** tamaño principal en px (diámetro, alto o ancho según el objeto) */
  size: number;
  /** profundidad en mundo; negativo = más lejos (más parallax) */
  z: number;
}

export type SceneLayout = Record<SceneObject, PxPlacement>;
export type LayoutKind = "sides" | "bands";

export interface CameraSpec {
  /** FOV vertical en grados */
  fov: number;
  /** distancia de la cámara al plano z = 0 */
  distance: number;
}

export const CAMERA: CameraSpec = { fov: 35, distance: 14 };

/** Tamaño de cada objeto en unidades de mundo con escala 1 (ver createCryptoScene). */
export const BASE_SIZE: Record<SceneObject, number> = {
  coin: 2, // diámetro
  eth: 2.5, // alto
  chain: 4.2, // ancho visible (bloques girados + perspectiva)
  coinSmall: 2, // diámetro
};

/** Alto reservado para el navbar flotante (px). */
export const NAV_CLEARANCE = 96;
/** Margen lateral mínimo (px) para usar el layout "sides". */
export const MIN_SIDE_SPACE = 170;
/** Separación mínima entre un objeto y el texto (px). */
export const TEXT_GAP = 12;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export function layoutKind(width: number, text: Rect): LayoutKind {
  const side = Math.min(text.left, width - text.right);
  return side >= MIN_SIDE_SPACE ? "sides" : "bands";
}

/**
 * Relación ancho/alto en pantalla de cada objeto respecto a su `size`.
 * Sirve para calcular la caja que ocupa (y comprobar que no pisa el texto).
 */
export const ASPECT: Record<SceneObject, { w: number; h: number }> = {
  coin: { w: 1, h: 1 },
  coinSmall: { w: 1, h: 1 },
  eth: { w: 0.62, h: 1 },
  chain: { w: 1, h: 0.42 },
};

export function boxOf(name: SceneObject, p: PxPlacement): Rect {
  const hw = (p.size * ASPECT[name].w) / 2;
  const hh = (p.size * ASPECT[name].h) / 2;
  return { left: p.cx - hw, right: p.cx + hw, top: p.cy - hh, bottom: p.cy + hh };
}

export function computeLayout(width: number, height: number, text: Rect): SceneLayout {
  if (layoutKind(width, text) === "sides") {
    const m = Math.min(text.left, width - text.right) - TEXT_GAP;
    const textH = text.bottom - text.top;
    const coin = clamp(m * 0.52, 100, 200);
    const eth = clamp(m * 0.95, 150, 320);
    const chain = clamp(m * 0.86, 150, 340);
    return {
      coin: { cx: m * 0.5, cy: text.top + textH * 0.22, size: coin, z: 0 },
      eth: { cx: width - m * 0.5, cy: text.top + textH * 0.26, size: eth, z: 0.4 },
      coinSmall: {
        cx: m * 0.5,
        cy: Math.min(height - 70, text.bottom - textH * 0.05),
        size: coin * 0.5,
        z: -2,
      },
      chain: {
        cx: width - m * 0.5,
        cy: Math.min(height - 80, text.bottom - textH * 0.02),
        size: chain,
        z: -1,
      },
    };
  }

  // ---- bandas arriba / abajo del texto ----
  const topBand = Math.max(0, text.top - NAV_CLEARANCE - TEXT_GAP);
  const bottomBand = Math.max(0, height - text.bottom - TEXT_GAP);
  const topY = NAV_CLEARANCE + topBand / 2;
  const bottomY = text.bottom + TEXT_GAP + bottomBand / 2;

  const coin = clamp(Math.min(topBand * 0.82, width * 0.3), 56, 150);
  const eth = clamp(Math.min(topBand * 0.95, width * 0.4), 64, 170);
  const chain = clamp(Math.min((bottomBand * 0.85) / ASPECT.chain.h, width * 0.5), 100, 260);
  const coinSmall = clamp(Math.min(bottomBand * 0.6, width * 0.2), 40, 90);

  return {
    coin: { cx: width * 0.27, cy: topY, size: coin, z: 0 },
    eth: { cx: width * 0.73, cy: topY, size: eth, z: 0.3 },
    chain: { cx: width * 0.64, cy: bottomY, size: chain, z: -0.6 },
    coinSmall: { cx: width * 0.2, cy: bottomY, size: coinSmall, z: -1.2 },
  };
}

/** Semialto visible (unidades de mundo) a la profundidad `z`. */
export function visibleHalfHeight(camera: CameraSpec, z = 0) {
  return (camera.distance - z) * Math.tan(((camera.fov / 2) * Math.PI) / 180);
}

/**
 * Pasa una colocación en px a posición y escala de mundo.
 * A cualquier profundidad el objeto se ve del tamaño pedido en px.
 */
export function toWorld(
  name: SceneObject,
  p: PxPlacement,
  width: number,
  height: number,
  camera: CameraSpec = CAMERA,
) {
  const unitsPerPx = (2 * visibleHalfHeight(camera, p.z)) / height;
  return {
    x: (p.cx - width / 2) * unitsPerPx,
    y: (height / 2 - p.cy) * unitsPerPx,
    z: p.z,
    scale: (p.size * unitsPerPx) / BASE_SIZE[name],
  };
}
