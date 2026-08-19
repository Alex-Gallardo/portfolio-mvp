import assert from "node:assert/strict";
import test from "node:test";

import { clamp01, getCoverRect, getSequencePosition } from "./sequence";

test("clamp01 limits progress to the valid range", () => {
  assert.equal(clamp01(-0.3), 0);
  assert.equal(clamp01(0.42), 0.42);
  assert.equal(clamp01(1.4), 1);
});

test("getSequencePosition maps the complete scroll range", () => {
  assert.deepEqual(getSequencePosition(0, 5), {
    currentIndex: 0,
    nextIndex: 1,
    blend: 0,
  });
  assert.deepEqual(getSequencePosition(0.125, 5), {
    currentIndex: 0,
    nextIndex: 1,
    blend: 0.5,
  });
  assert.deepEqual(getSequencePosition(0.5, 5), {
    currentIndex: 2,
    nextIndex: 3,
    blend: 0,
  });
  assert.deepEqual(getSequencePosition(1, 5), {
    currentIndex: 4,
    nextIndex: 4,
    blend: 0,
  });
});

test("getSequencePosition handles an empty or single-frame fallback", () => {
  assert.deepEqual(getSequencePosition(0.75, 0), {
    currentIndex: 0,
    nextIndex: 0,
    blend: 0,
  });
  assert.deepEqual(getSequencePosition(0.75, 1), {
    currentIndex: 0,
    nextIndex: 0,
    blend: 0,
  });
});

test("getCoverRect preserves aspect ratio and centers the crop", () => {
  assert.deepEqual(getCoverRect(1600, 900, 400, 400), {
    x: -155.55555555555554,
    y: 0,
    width: 711.1111111111111,
    height: 400,
  });
  assert.deepEqual(getCoverRect(900, 1600, 400, 400), {
    x: 0,
    y: -155.55555555555554,
    width: 400,
    height: 711.1111111111111,
  });
});
