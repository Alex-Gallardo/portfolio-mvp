import assert from "node:assert/strict";
import test from "node:test";

import { HERO_CAMERA_DESKTOP, HERO_CAMERA_MOBILE } from "./camera-data";
import { pickHeroVideo } from "./hero-media";
import {
  frameForProgress,
  frameFromTime,
  getScreenRect,
  getScrollProgress,
  seekTimeForFrame,
  smoothstep,
} from "./screen-rect";

const near = (actual: number, expected: number, tolerance = 0.5) =>
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${actual} to be within ${tolerance} of ${expected}`,
  );

test("camera data covers every frame of both videos", () => {
  for (const camera of [HERO_CAMERA_DESKTOP, HERO_CAMERA_MOBILE]) {
    assert.equal(camera.cam.length, camera.frames);
    assert.equal(camera.fps, 30);
  }
});

test("getScreenRect maps frame 0 to the monitor in the source image", () => {
  const rect = getScreenRect(HERO_CAMERA_DESKTOP, 0, 1920, 1080);
  near(rect.left, 698);
  near(rect.top, 142);
  near(rect.width, 519);
  near(rect.height, 238);
});

test("getScreenRect follows object-fit: cover on a different aspect ratio", () => {
  // 1000×1000: cover escala por alto (1000/1080) y recorta los lados.
  const k = 1000 / 1080;
  const offsetX = (1000 - 1920 * k) / 2;
  const rect = getScreenRect(HERO_CAMERA_DESKTOP, 0, 1000, 1000);
  near(rect.left, offsetX + 698 * k);
  near(rect.top, 142 * k);
  near(rect.width, 519 * k);
});

test("getScreenRect zooms towards the monitor on the last frame", () => {
  const first = getScreenRect(HERO_CAMERA_DESKTOP, 0, 1440, 900);
  const last = getScreenRect(HERO_CAMERA_DESKTOP, 149, 1440, 900);
  assert.ok(last.width > first.width * 2.5);
  // Al final la pantalla queda centrada horizontalmente.
  near(last.left + last.width / 2, 720, 2);
});

test("getScreenRect clamps out-of-range frames", () => {
  assert.deepEqual(
    getScreenRect(HERO_CAMERA_MOBILE, 999, 390, 844),
    getScreenRect(HERO_CAMERA_MOBILE, 149, 390, 844),
  );
  assert.deepEqual(
    getScreenRect(HERO_CAMERA_MOBILE, -4, 390, 844),
    getScreenRect(HERO_CAMERA_MOBILE, 0, 390, 844),
  );
});

test("frame, time and scroll progress conversions agree", () => {
  assert.equal(frameForProgress(0, 150), 0);
  assert.equal(frameForProgress(1, 150), 149);
  assert.equal(frameForProgress(0.5, 150), 75);
  assert.equal(frameForProgress(2, 150), 149);
  for (const frame of [0, 1, 74, 149]) {
    assert.equal(frameFromTime(seekTimeForFrame(frame, 30), 30, 150), frame);
  }
  assert.equal(getScrollProgress(0, 3000, 1000), 0);
  assert.equal(getScrollProgress(-1000, 3000, 1000), 0.5);
  assert.equal(getScrollProgress(-5000, 3000, 1000), 1);
  assert.equal(getScrollProgress(-10, 800, 1000), 0);
});

test("smoothstep eases between its edges", () => {
  assert.equal(smoothstep(0.2, 0.4, 0.1), 0);
  near(smoothstep(0.2, 0.4, 0.3), 0.5, 1e-9);
  assert.equal(smoothstep(0.2, 0.4, 0.9), 1);
});

test("pickHeroVideo chooses orientation, theme and resolution", () => {
  assert.equal(pickHeroVideo("mobile", "light", 390, 3), "/hero/scroll/mobile-day.mp4");
  assert.equal(pickHeroVideo("mobile", "dark", 390, 3), "/hero/scroll/mobile-night.mp4");
  assert.equal(pickHeroVideo("desktop", "light", 1280, 1), "/hero/scroll/desktop-day-720p.mp4");
  assert.equal(pickHeroVideo("desktop", "dark", 1440, 2), "/hero/scroll/desktop-night-1080p.mp4");
});
