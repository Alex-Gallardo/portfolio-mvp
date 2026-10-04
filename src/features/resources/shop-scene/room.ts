import { hash } from "./loop";
import { PAL, rect, type Ctx } from "./draw";

/**
 * Cabaña común a la tienda y al taller: pared de tablas, zócalo, suelo de
 * tablones, viga y postes de esquina. Mismos materiales en ambas escenas,
 * así el CTA se lee como una extensión de la tienda.
 */
export function drawRoom(
  c: Ctx,
  W: number,
  H: number,
  { beamH, floorY, seed = 0 }: { beamH: number; floorY: number; seed?: number },
) {
  // Pared de tablas horizontales
  rect(c, 0, 0, W, floorY, PAL.w2);
  let row = 0;
  for (let y = beamH; y < floorY; y += 7, row++) {
    const r = row + seed * 97;
    const tone = hash(r * 7 + 1) > 0.72 ? PAL.w3 : PAL.w2;
    rect(c, 0, y, W, 6, tone);
    rect(c, 0, y, W, 1, tone === PAL.w3 ? PAL.w4 : PAL.w3);
    rect(c, 0, y + 6, W, 1, PAL.w1);
    for (let j = 0; j < 3; j++) {
      rect(c, Math.floor(hash(r * 31 + j * 5) * W), y, 1, 6, PAL.w1);
      rect(c, Math.floor(hash(r * 17 + j * 3 + 2) * W), y + 2 + (j % 3), 2, 1, PAL.w1);
    }
  }

  // Zócalo de tablas verticales
  const wainTop = floorY - Math.max(8, Math.round(H * 0.1));
  rect(c, 0, wainTop, W, floorY - wainTop, PAL.w1);
  for (let x = 0; x < W; x += 6) {
    rect(c, x + 1, wainTop + 2, 1, floorY - wainTop - 2, PAL.w2);
    rect(c, x + 5, wainTop + 2, 1, floorY - wainTop - 2, PAL.w0);
  }
  rect(c, 0, wainTop, W, 2, PAL.w4);
  rect(c, 0, wainTop + 2, W, 1, PAL.w0);

  // Suelo de tablones: más altos cuanto más cerca de la cámara
  rect(c, 0, floorY, W, H - floorY, PAL.w3);
  rect(c, 0, floorY, W, 1, PAL.w0);
  let fy = floorY + 1;
  let fh = 3;
  let frow = 0;
  while (fy < H) {
    rect(c, 0, fy, W, fh, frow % 2 ? PAL.w3 : PAL.w4);
    rect(c, 0, fy + fh - 1, W, 1, PAL.w2);
    const off = Math.floor(hash(frow + 90 + seed) * 24);
    for (let x = off; x < W; x += 24) rect(c, x, fy, 1, fh, PAL.w2);
    fy += fh;
    fh = Math.min(fh + 1, 7);
    frow++;
  }

  // Viga superior y postes de esquina
  rect(c, 0, 0, W, beamH, PAL.w1);
  rect(c, 0, beamH - 1, W, 1, PAL.w0);
  rect(c, 0, 1, W, 1, PAL.w2);
  for (const x of [0, W - 4]) {
    rect(c, x, 0, 4, floorY, PAL.w1);
    rect(c, x + 1, 0, 1, floorY, PAL.w2);
    rect(c, x + 3, 0, 1, floorY, PAL.w0);
  }
}
