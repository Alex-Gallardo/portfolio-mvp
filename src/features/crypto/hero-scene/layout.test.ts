import { test } from "node:test";
import assert from "node:assert/strict";

import {
  BASE_SIZE,
  CAMERA,
  NAV_CLEARANCE,
  boxOf,
  computeLayout,
  layoutKind,
  toWorld,
  visibleHalfHeight,
  type Rect,
  type SceneObject,
} from "./layout";

const close = (a: number, b: number, eps = 1e-6) => Math.abs(a - b) < eps;

/** Bloque de texto centrado de `w`×`h` px dentro del hero. */
function centered(width: number, height: number, w: number, h: number, top?: number): Rect {
  const left = (width - Math.min(w, width - 32)) / 2;
  const t = top ?? (height - h) / 2;
  return { left, right: width - left, top: t, bottom: t + h };
}

const overlaps = (a: Rect, b: Rect) =>
  a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

// Tamaños reales medidos del hero (ancho, alto, ancho texto, alto texto, top texto)
const VIEWPORTS: [string, number, number, number, number, number?][] = [
  ["desktop 1920", 1920, 917, 800, 470],
  ["desktop 1440", 1440, 900, 800, 470],
  ["laptop 1280", 1280, 720, 800, 460],
  ["tablet 768", 768, 1024, 720, 520, 260],
  ["móvil 390", 390, 900, 358, 540, 236],
  ["móvil 375", 375, 860, 343, 520, 236],
];

test("layoutKind: laterales con aire, bandas cuando no cabe", () => {
  assert.equal(layoutKind(1920, centered(1920, 900, 800, 470)), "sides");
  assert.equal(layoutKind(1280, centered(1280, 720, 800, 460)), "sides");
  assert.equal(layoutKind(1024, centered(1024, 768, 800, 460)), "bands");
  assert.equal(layoutKind(375, centered(375, 860, 343, 520)), "bands");
});

for (const [label, width, height, tw, th, top] of VIEWPORTS) {
  test(`${label}: ningún objeto pisa el texto ni se sale del hero`, () => {
    const text = centered(width, height, tw, th, top);
    const layout = computeLayout(width, height, text);
    for (const [name, p] of Object.entries(layout) as [
      SceneObject,
      (typeof layout)[SceneObject],
    ][]) {
      const box = boxOf(name, p);
      assert.equal(overlaps(box, text), false, `${name} pisa el texto`);
      assert.ok(box.left >= 0 && box.right <= width, `${name} se sale por los lados`);
      assert.ok(box.bottom <= height, `${name} se sale por abajo`);
      assert.ok(p.size > 0, `${name} sin tamaño`);
    }
  });
}

test("en bandas, los objetos de arriba quedan bajo el navbar", () => {
  const text = centered(375, 860, 343, 520, 236);
  const layout = computeLayout(375, 860, text);
  assert.ok(boxOf("coin", layout.coin).top >= NAV_CLEARANCE);
  assert.ok(boxOf("eth", layout.eth).top >= NAV_CLEARANCE);
});

test("visibleHalfHeight sigue la geometría de la cámara", () => {
  assert.ok(close(visibleHalfHeight({ fov: 90, distance: 10 }), 10)); // tan(45°) = 1
  assert.ok(visibleHalfHeight(CAMERA, -3) > visibleHalfHeight(CAMERA, 0));
});

test("toWorld: el centro del hero es el origen y el tamaño en px se respeta", () => {
  const w = 1600;
  const h = 900;
  const center = toWorld("coin", { cx: w / 2, cy: h / 2, size: 200, z: 0 }, w, h);
  assert.ok(close(center.x, 0) && close(center.y, 0));

  // 200 px de diámetro → en mundo mide 200 * (alto visible / alto px)
  const unitsPerPx = (2 * visibleHalfHeight(CAMERA, 0)) / h;
  assert.ok(close(center.scale * BASE_SIZE.coin, 200 * unitsPerPx));

  // más lejos, misma apariencia en px → escala de mundo mayor
  const far = toWorld("coin", { cx: w / 2, cy: h / 2, size: 200, z: -2 }, w, h);
  assert.ok(far.scale > center.scale);

  // arriba a la izquierda → x negativa, y positiva
  const corner = toWorld("eth", { cx: 0, cy: 0, size: 100, z: 0 }, w, h);
  assert.ok(corner.x < 0 && corner.y > 0);
});
