import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import { DESIGN_DESKTOP_FRAMES, DESIGN_FRAME_COUNT, DESIGN_MOBILE_FRAMES } from "./design-content";

test("desktop and mobile sequences expose the configured number of frames", () => {
  assert.equal(DESIGN_DESKTOP_FRAMES.length, DESIGN_FRAME_COUNT);
  assert.equal(DESIGN_MOBILE_FRAMES.length, DESIGN_FRAME_COUNT);
});

test("every design frame exists, is WebP and remains inside the asset budget", () => {
  const allFrames = [...DESIGN_DESKTOP_FRAMES, ...DESIGN_MOBILE_FRAMES];

  for (const publicPath of allFrames) {
    const filePath = join(process.cwd(), "public", publicPath.replace(/^\//, ""));
    assert.equal(existsSync(filePath), true, `Missing design frame: ${publicPath}`);
    assert.ok(statSync(filePath).size < 200 * 1024, `Design frame exceeds 200 KB: ${publicPath}`);

    const header = readFileSync(filePath).subarray(0, 12);
    assert.equal(header.subarray(0, 4).toString("ascii"), "RIFF");
    assert.equal(header.subarray(8, 12).toString("ascii"), "WEBP");
  }
});
