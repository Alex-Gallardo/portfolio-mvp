import * as THREE from "three";

import { BITCOIN_B } from "../glyphs";

/**
 * Texturas procedurales (canvas 2D) para la escena del hero crypto.
 * Sin assets externos: todo se dibuja en el cliente al montar la escena.
 */

function makeCanvas(width: number, height = width) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D no disponible");
  return { canvas, ctx };
}

function colorTexture(canvas: HTMLCanvasElement) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/** Dibuja el ₿ centrado, girado como en el logo, ocupando `size` px de alto. */
function drawBitcoinGlyph(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
  const path = new Path2D(BITCOIN_B);
  const scale = size / 16.6; // alto aproximado del glifo en el viewBox
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.translate(-12, -12.1);
  ctx.fill(path, "evenodd");
  ctx.restore();
}

/**
 * Cara de la moneda: oro con anillos concéntricos (acabado torneado),
 * bisel, cuentas en el borde y el ₿ en relieve.
 * Devuelve el color y un bump map en grises para el relieve.
 */
export function createCoinFaceTextures(size = 1024) {
  const c = size / 2;

  // ---- color ----
  const { canvas, ctx } = makeCanvas(size);
  const base = ctx.createRadialGradient(c * 0.7, c * 0.6, size * 0.05, c, c, c);
  base.addColorStop(0, "#ffe9a6");
  base.addColorStop(0.45, "#f7c04a");
  base.addColorStop(0.85, "#d9951c");
  base.addColorStop(1, "#a86a0c");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);

  // anillos torneados
  for (let r = 8; r < c * 0.78; r += 5) {
    ctx.beginPath();
    ctx.arc(c, c, r, 0, Math.PI * 2);
    ctx.strokeStyle = r % 10 === 0 ? "rgba(255,255,255,0.05)" : "rgba(120,70,0,0.05)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // bisel exterior
  ctx.lineWidth = size * 0.045;
  ctx.strokeStyle = "#b67812";
  ctx.beginPath();
  ctx.arc(c, c, c * 0.9, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = size * 0.012;
  ctx.strokeStyle = "rgba(255,240,190,0.9)";
  ctx.beginPath();
  ctx.arc(c, c, c * 0.84, 0, Math.PI * 2);
  ctx.stroke();

  // cuentas del borde
  ctx.fillStyle = "rgba(255,236,170,0.85)";
  const beads = 64;
  for (let i = 0; i < beads; i++) {
    const a = (i / beads) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(c + Math.cos(a) * c * 0.78, c + Math.sin(a) * c * 0.78, size * 0.006, 0, Math.PI * 2);
    ctx.fill();
  }

  // ₿: sombra, cuerpo y brillo para que se lea en relieve
  const glyph = size * 0.5;
  ctx.fillStyle = "rgba(110,60,0,0.55)";
  drawBitcoinGlyph(ctx, c + size * 0.01, c + size * 0.012, glyph);
  const ink = ctx.createLinearGradient(c - glyph / 2, c - glyph / 2, c + glyph / 2, c + glyph / 2);
  ink.addColorStop(0, "#fff6d5");
  ink.addColorStop(0.5, "#ffd765");
  ink.addColorStop(1, "#e8a92c");
  ctx.fillStyle = ink;
  drawBitcoinGlyph(ctx, c, c, glyph);

  // ---- relieve (bump) ----
  const bump = makeCanvas(size);
  bump.ctx.fillStyle = "#6b6b6b";
  bump.ctx.fillRect(0, 0, size, size);
  bump.ctx.lineWidth = size * 0.045;
  bump.ctx.strokeStyle = "#ffffff";
  bump.ctx.beginPath();
  bump.ctx.arc(c, c, c * 0.9, 0, Math.PI * 2);
  bump.ctx.stroke();
  bump.ctx.fillStyle = "#ffffff";
  drawBitcoinGlyph(bump.ctx, c, c, glyph);

  const bumpTexture = new THREE.CanvasTexture(bump.canvas);
  bumpTexture.anisotropy = 4;

  return { map: colorTexture(canvas), bumpMap: bumpTexture };
}

/** Canto estriado de la moneda (se repite alrededor del cilindro). */
export function createCoinEdgeTexture() {
  const { canvas, ctx } = makeCanvas(256, 16);
  for (let x = 0; x < 256; x += 8) {
    const g = ctx.createLinearGradient(x, 0, x + 8, 0);
    g.addColorStop(0, "#9c620b");
    g.addColorStop(0.5, "#ffd56b");
    g.addColorStop(1, "#9c620b");
    ctx.fillStyle = g;
    ctx.fillRect(x, 0, 8, 16);
  }
  const texture = colorTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.repeat.set(6, 1);
  return texture;
}

/** Halo radial suave (blanco → transparente), se tiñe con `material.color`. */
export function createGlowTexture(size = 256) {
  const { canvas, ctx } = makeCanvas(size);
  const c = size / 2;
  const g = ctx.createRadialGradient(c, c, 0, c, c, c);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.3, "rgba(255,255,255,0.6)");
  g.addColorStop(0.65, "rgba(255,255,255,0.18)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return colorTexture(canvas);
}

/** Destello de 4 puntas con núcleo brillante (para los "glints"). */
export function createStarTexture(size = 256) {
  const { canvas, ctx } = makeCanvas(size);
  const c = size / 2;

  const core = ctx.createRadialGradient(c, c, 0, c, c, c * 0.35);
  core.addColorStop(0, "rgba(255,255,255,1)");
  core.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = core;
  ctx.fillRect(0, 0, size, size);

  ctx.globalCompositeOperation = "lighter";
  for (const horizontal of [true, false]) {
    const g = horizontal
      ? ctx.createLinearGradient(0, c, size, c)
      : ctx.createLinearGradient(c, 0, c, size);
    g.addColorStop(0, "rgba(255,255,255,0)");
    g.addColorStop(0.5, "rgba(255,255,255,0.95)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    if (horizontal) ctx.fillRect(0, c - size * 0.012, size, size * 0.024);
    else ctx.fillRect(c - size * 0.012, 0, size * 0.024, size);
  }
  return colorTexture(canvas);
}
