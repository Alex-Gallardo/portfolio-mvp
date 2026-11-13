/**
 * Inclinación 3D de una pieza según la posición del puntero.
 *
 * Devuelve los grados de giro (rx, ry) y la posición del reflejo de luz
 * (gx, gy en %). En el centro la pieza queda plana; en los bordes llega
 * a `max` grados, inclinándose "hacia" el puntero.
 *
 * `step` cuantiza los grados (p. ej. 2 → 0, ±2, ±4…): la pieza se mueve
 * por fotogramas, como un sprite, en vez de deslizarse.
 */
export interface TiltRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface Tilt {
  rx: number;
  ry: number;
  gx: number;
  gy: number;
}

export const FLAT: Tilt = { rx: 0, ry: 0, gx: 50, gy: 50 };

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const round = (v: number) => Math.round(v * 100) / 100;
const quantize = (v: number, step: number) => (step > 0 ? Math.round(v / step) * step : v);

export function computeTilt(x: number, y: number, rect: TiltRect, max = 6, step = 0): Tilt {
  if (rect.width <= 0 || rect.height <= 0) return FLAT;
  const px = clamp01((x - rect.left) / rect.width);
  const py = clamp01((y - rect.top) / rect.height);
  return {
    // puntero arriba → el borde superior se hunde (rotateX positivo)
    rx: round(quantize((0.5 - py) * 2 * max, step)),
    // puntero a la derecha → el borde derecho se hunde (rotateY positivo)
    ry: round(quantize((px - 0.5) * 2 * max, step)),
    gx: round(px * 100),
    gy: round(py * 100),
  };
}
