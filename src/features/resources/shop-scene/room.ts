import { hash } from "./loop";
import { PAL, rect, type Ctx } from "./draw";

/**
 * Cabaña común a la tienda y al taller: techo de tablones, viga maestra,
 * muro de piedra, zócalo de madera y suelo de baldosas. Mismos materiales
 * en ambas escenas, así el CTA se lee como una extensión de la tienda.
 */
export function drawRoom(
  c: Ctx,
  W: number,
  H: number,
  {
    beamY = 0,
    beamH,
    floorY,
    seed = 0,
  }: { beamY?: number; beamH: number; floorY: number; seed?: number },
) {
  const wallTop = beamY + beamH;

  // Techo de tablones en sombra
  if (beamY > 0) {
    rect(c, 0, 0, W, beamY, PAL.w0);
    for (let x = 0; x < W; x += 9) {
      rect(c, x, 0, 1, beamY, PAL.ink);
      rect(c, x + 1, 0, 1, beamY, PAL.w1);
    }
  }

  // Muro de piedra: sillares de 10×5 a matajunta, con luz arriba
  rect(c, 0, wallTop, W, floorY - wallTop, PAL.q1);
  let row = 0;
  for (let y = wallTop + 1; y < floorY; y += 6, row++) {
    const off = row % 2 ? 5 : 0;
    for (let x = -off; x < W; x += 11) {
      const n = hash(row * 131 + Math.floor(x / 11) + seed * 977);
      const tone = n > 0.82 ? PAL.q3 : n > 0.3 ? PAL.q2 : PAL.q1;
      rect(c, x, y, 10, 5, tone);
      rect(c, x, y, 10, 1, n > 0.82 ? PAL.q4 : PAL.q3);
      rect(c, x + 9, y + 1, 1, 4, PAL.q0);
      if (n < 0.08) rect(c, x + 3, y + 2, 3, 1, PAL.q0); // grieta
    }
  }

  // Viga maestra
  rect(c, 0, beamY, W, beamH, PAL.w1);
  rect(c, 0, beamY, W, 1, PAL.w3);
  rect(c, 0, beamY + 1, W, 1, PAL.w2);
  rect(c, 0, beamY + beamH - 1, W, 1, PAL.ink);
  for (let x = 14; x < W; x += 48) {
    rect(c, x, beamY + 2, 2, 2, PAL.s2); // clavos
  }

  // Zócalo de tablas verticales
  const wainTop = floorY - Math.max(10, Math.round(H * 0.08));
  rect(c, 0, wainTop, W, floorY - wainTop, PAL.w1);
  for (let x = 0; x < W; x += 6) {
    rect(c, x + 1, wainTop + 3, 1, floorY - wainTop - 3, PAL.w2);
    rect(c, x + 5, wainTop + 3, 1, floorY - wainTop - 3, PAL.w0);
  }
  rect(c, 0, wainTop, W, 2, PAL.w4);
  rect(c, 0, wainTop + 2, W, 1, PAL.w0);

  // Suelo de baldosas: más altas cuanto más cerca de la cámara
  rect(c, 0, floorY, W, H - floorY, PAL.q2);
  rect(c, 0, floorY, W, 1, PAL.ink);
  let fy = floorY + 1;
  let fh = 4;
  let frow = 0;
  while (fy < H) {
    const tw = 10 + fh * 2;
    const off = frow % 2 ? Math.round(tw / 2) : 0;
    for (let x = -off; x < W; x += tw) {
      const n = hash(frow * 53 + Math.floor((x + off) / tw) + seed * 31);
      rect(c, x, fy, tw - 1, fh - 1, n > 0.6 ? PAL.q3 : PAL.q2);
      rect(c, x, fy, tw - 1, 1, n > 0.6 ? PAL.q4 : PAL.q3);
    }
    rect(c, 0, fy + fh - 1, W, 1, PAL.q1);
    fy += fh;
    fh = Math.min(fh + 1, 9);
    frow++;
  }

  // Postes de esquina
  for (const x of [0, W - 4]) {
    rect(c, x, wallTop, 4, floorY - wallTop, PAL.w1);
    rect(c, x + 1, wallTop, 1, floorY - wallTop, PAL.w3);
    rect(c, x + 3, wallTop, 1, floorY - wallTop, PAL.w0);
  }
}
