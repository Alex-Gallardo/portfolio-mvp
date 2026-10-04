import { test } from "node:test";
import assert from "node:assert/strict";
import { CAT_H, CAT_W, inside, overlaps, planShop } from "./shop-layout";

/** Tamaños lógicos reales: escritorio ancho, portátil, tablet y móvil. */
const SIZES: [string, number, number][] = [
  ["1920×1080", 480, 257],
  ["1440×900", 452, 252],
  ["1280×800", 422, 253],
  ["1024×768", 340, 255],
  ["tablet vertical", 190, 340],
  ["móvil 375×812", 161, 331],
  ["móvil pequeño", 132, 300],
];

for (const [name, W, H] of SIZES) {
  test(`plano ${name}: todo dentro de la escena y sin piezas pisadas`, () => {
    const p = planShop(W, H);
    const scene = { x: 0, y: 0, w: W, h: H };

    assert.ok(inside(p.window, scene), "ventanal fuera");
    assert.ok(inside(p.counter, scene), "mostrador fuera");
    assert.ok(inside(p.vitrina, p.counter), "vitrina fuera del mostrador");

    // El ventanal (con su alféizar) queda por encima del mostrador
    assert.ok(p.sill.y + p.sill.h <= p.counter.y, "el alféizar choca con el mostrador");
    assert.ok(p.window.h >= p.window.w / 2 + 24, "ventanal sin cuerpo bajo el arco");

    for (const s of p.shelves) {
      assert.ok(inside(s.rect, scene), "estantería fuera");
      assert.ok(!overlaps(s.rect, p.window), "estantería sobre el ventanal");
      const sorted = [...s.boards].sort((a, b) => a - b);
      assert.deepEqual(s.boards, sorted, "tablas desordenadas");
      for (const b of s.boards) assert.ok(b > s.rect.y && b < s.rect.y + s.rect.h);
    }

    for (const o of [p.outer.left, p.outer.right]) {
      if (!o) continue;
      assert.ok(inside(o, scene), "pared lateral fuera");
      for (const s of p.shelves) assert.ok(!overlaps(o, s.rect), "pared lateral sobre estantería");
    }

    // El gato duerme sobre el mostrador, entero
    assert.ok(p.cat.x >= p.counter.x && p.cat.x + CAT_W <= p.counter.x + p.counter.w);
    assert.equal(p.cat.y + CAT_H - 1, p.counter.y);
  });
}

test("en móvil vertical también caben las dos estanterías", () => {
  assert.equal(planShop(150, 309).shelves.length, 2);
  assert.equal(planShop(161, 331).shelves.length, 2);
});

test("en pantallas anchas hay estanterías y pared a ambos lados", () => {
  const p = planShop(480, 257);
  assert.equal(p.shelves.length, 2);
  assert.ok(p.outer.left && p.outer.right);
});
