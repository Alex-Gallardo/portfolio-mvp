import { test } from "node:test";
import assert from "node:assert/strict";
import { FPS, FRAMES, LOOP, cycle, flicker, frameTime, hash, wave, wind } from "./loop";

const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);

test("el bucle tiene un número entero de fotogramas", () => {
  assert.equal(FRAMES, LOOP * FPS);
  assert.ok(Number.isInteger(FRAMES));
});

test("frameTime envuelve al bucle: el fotograma LOOP es el 0", () => {
  for (const s of [0, 1.234, 5.5, 11.99]) {
    assert.equal(frameTime(s + LOOP), frameTime(s));
    assert.equal(frameTime(s + LOOP * 7), frameTime(s));
  }
  assert.equal(frameTime(LOOP), 0);
  assert.ok(frameTime(LOOP - 1e-6) < LOOP);
});

test("ondas, ciclos, viento y parpadeo coinciden en t y t + LOOP (sin corte)", () => {
  for (let f = 0; f < FRAMES; f += 7) {
    const t = f / FPS;
    for (const k of [1, 2, 3, 5, 23, 61]) {
      close(wave(t, k, 0.7), wave(t + LOOP, k, 0.7));
      close(cycle(t, k, 0.3), cycle(t + LOOP, k, 0.3) % 1);
    }
    close(wind(t), wind(t + LOOP));
    close(flicker(t, 2.2), flicker(t + LOOP, 2.2));
  }
});

test("una frecuencia no entera se rechaza: rompería la continuidad", () => {
  assert.throws(() => wave(1, 1.5));
  assert.throws(() => cycle(1, 0.25));
});

test("viento moderado y parpadeo acotados", () => {
  for (let f = 0; f < FRAMES; f++) {
    const t = f / FPS;
    const w = wind(t);
    assert.ok(w >= 0 && w <= 1.01, `viento fuera de rango: ${w}`);
    const l = flicker(t, 1);
    assert.ok(l > 0.8 && l <= 1, `parpadeo fuera de rango: ${l}`);
  }
});

test("hash es determinista y cae en [0, 1)", () => {
  for (let i = 0; i < 200; i++) {
    const v = hash(i);
    assert.equal(v, hash(i));
    assert.ok(v >= 0 && v < 1);
  }
});
