/**
 * Reloj de la escena. Todo lo que se mueve es función pura de `t` y completa
 * un número ENTERO de ciclos en LOOP segundos, así que el fotograma LOOP es
 * idéntico al 0: el bucle no tiene corte. No hay azar por fotograma; el
 * "azar" sale de `hash`, que es determinista.
 */

export const LOOP = 12; // segundos por bucle
export const FPS = 24; // cadencia pixel: suficiente y más barata que 60
export const FRAMES = LOOP * FPS; // 288 fotogramas exactos por bucle

const TAU = Math.PI * 2;

function assertWhole(k: number) {
  if (!Number.isInteger(k)) {
    throw new Error(`shop-scene: ${k} ciclos por bucle rompería la continuidad del bucle`);
  }
}

/** Fotograma cuantizado: segundos dentro del bucle, en pasos de 1/FPS. */
export function frameTime(seconds: number): number {
  const frame = Math.floor(seconds * FPS) % FRAMES;
  return (frame < 0 ? frame + FRAMES : frame) / FPS;
}

/** Seno con `k` ciclos exactos por bucle. */
export function wave(t: number, k: number, phase = 0): number {
  assertWhole(k);
  return Math.sin(TAU * ((k * t) / LOOP) + phase);
}

/** Progreso 0..1 de un ciclo que se repite `k` veces por bucle. */
export function cycle(t: number, k: number, offset = 0): number {
  assertWhole(k);
  const v = ((k * t) / LOOP + offset) % 1;
  return v < 0 ? v + 1 : v;
}

/** Viento moderado 0..1: ráfagas suaves, suma de armónicos enteros. */
export function wind(t: number): number {
  return 0.55 + 0.24 * wave(t, 1, 0.4) + 0.13 * wave(t, 3, 1.7) + 0.08 * wave(t, 7, 2.9);
}

/** Parpadeo de llama/luz alrededor de 1. `seed` desfasa cada fuente. */
export function flicker(t: number, seed: number): number {
  return (
    0.9 +
    0.05 * wave(t, 23, seed) +
    0.035 * wave(t, 37, seed * 1.7) +
    0.015 * wave(t, 61, seed * 2.3)
  );
}

/** Pseudoaleatorio determinista 0..1 para un entero. */
export function hash(n: number): number {
  let x = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b);
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35);
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
}
