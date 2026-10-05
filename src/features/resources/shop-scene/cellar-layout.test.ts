import { test } from "node:test";
import assert from "node:assert/strict";
import { planCellar } from "./cellar-layout";
import { inside, type Rect } from "./shop-layout";

/** [nombre, W, H lógicos, px CSS por píxel lógico] */
const SIZES: [string, number, number, number][] = [
  ["2560×1440", 640, 360, 4],
  ["1920×1080", 480, 270, 4],
  ["1440×900", 480, 300, 3],
  ["1280×800", 427, 267, 3],
  ["móvil 375×812", 150, 325, 2.5],
];

for (const [name, W, H, pxCss] of SIZES) {
  test(`almacén ${name}: decoración en los bordes y dentro de la escena`, () => {
    const p = planCellar(W, H, pxCss);
    const scene: Rect = { x: 0, y: 0, w: W, h: H };
    const inEdge = (r: Rect) => r.x + r.w <= p.edge || r.x >= W - p.edge;

    for (const r of [...p.banners, ...p.stacks, ...(p.map ? [p.map] : [])]) {
      assert.ok(inside(r, scene), "decoración fuera de la escena");
      assert.ok(inEdge(r), `decoración bajo el contenido: ${JSON.stringify(r)}`);
    }
    for (const g of p.gems) assert.ok(g.x < p.edge || g.x >= W - p.edge, "gema bajo el contenido");
    for (const s of p.stacks) assert.equal(s.y + s.h, p.floorY, "pila que no apoya en el suelo");
    for (const t of p.torches) assert.ok(t.x > 0 && t.x < W && t.y > p.beamY && t.y < p.floorY);
    for (const w of p.windows) assert.ok(inside(w, scene));
  });
}

test("con el contenido llenando la pantalla no hay decoración de bordes", () => {
  const p = planCellar(427, 267, 3); // 1281 px CSS: el catálogo (1360) llena la pantalla
  assert.equal(p.edge, 0);
  assert.equal(p.banners.length + p.stacks.length, 0);
  assert.equal(p.torches.length, 4, "las antorchas siguen, pegadas a los bordes");
});

test("en monitores anchos hay estandartes, pilas, mapa y cadenas", () => {
  const p = planCellar(640, 360, 4);
  assert.ok(p.edge >= 44);
  assert.equal(p.banners.length, 2);
  assert.equal(p.stacks.length, 2);
  assert.ok(p.map);
  assert.equal(p.chains.length, 2);
});
