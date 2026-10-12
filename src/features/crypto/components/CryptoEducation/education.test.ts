import { test } from "node:test";
import assert from "node:assert/strict";

import { BENTO_CELLS, EDUCATION_CARDS, cardNumber } from "../../education";
import { FLAT, computeTilt } from "./tilt";

// ───────────── contenido ─────────────

test("las tarjetas tienen claves únicas y textos completos", () => {
  const keys = EDUCATION_CARDS.map((c) => c.key);
  assert.equal(new Set(keys).size, keys.length);
  for (const card of EDUCATION_CARDS) {
    assert.ok(card.title.trim(), `${card.key} sin título`);
    assert.ok(card.text.trim(), `${card.key} sin texto`);
    assert.ok(card.tag.trim(), `${card.key} sin etiqueta`);
  }
});

test("el bento llena el grid de 4 columnas sin huecos", () => {
  const cells = EDUCATION_CARDS.reduce((sum, c) => {
    const { cols, rows } = BENTO_CELLS[c.size];
    return sum + cols * rows;
  }, 0);
  assert.equal(cells % 4, 0, `${cells} celdas no completan filas de 4`);
  // una sola tarjeta protagonista
  assert.equal(EDUCATION_CARDS.filter((c) => c.size === "hero").length, 1);
});

test("cardNumber numera con dos dígitos", () => {
  assert.equal(cardNumber(0), "01");
  assert.equal(cardNumber(4), "05");
  assert.equal(cardNumber(11), "12");
});

// ───────────── inclinación ─────────────

const rect = { left: 100, top: 200, width: 400, height: 200 };

test("en el centro la tarjeta queda plana y el reflejo centrado", () => {
  assert.deepEqual(computeTilt(300, 300, rect), FLAT);
});

test("en las esquinas llega al máximo, inclinándose hacia el puntero", () => {
  const topLeft = computeTilt(100, 200, rect, 6);
  assert.deepEqual(topLeft, { rx: 6, ry: -6, gx: 0, gy: 0 });
  const bottomRight = computeTilt(500, 400, rect, 6);
  assert.deepEqual(bottomRight, { rx: -6, ry: 6, gx: 100, gy: 100 });
});

test("fuera de la tarjeta se acota al máximo", () => {
  const far = computeTilt(5000, -5000, rect, 8);
  assert.deepEqual(far, { rx: 8, ry: 8, gx: 100, gy: 0 });
});

test("una tarjeta sin tamaño no se inclina", () => {
  assert.deepEqual(computeTilt(10, 10, { left: 0, top: 0, width: 0, height: 0 }), FLAT);
});
