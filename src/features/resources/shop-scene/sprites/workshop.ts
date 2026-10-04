import type { SpriteDef } from "../draw";

/** Herramientas del taller de encargos (CTA). */

export const HAMMER: SpriteDef = {
  map: [
    "xxxxxxx",
    "xsSSSsx",
    "xsSSSsx",
    "xxxwxxx",
    "...w...",
    "...w...",
    "...w...",
    "...w...",
    "...x...",
  ],
  key: { x: "ink", s: "s2", S: "s3", w: "w3" },
};

export const TONGS: SpriteDef = {
  map: ["x...x", "s...s", ".s.s.", "..x..", ".w.w.", ".w.w.", ".w.w.", ".x.x."],
  key: { x: "ink", s: "s3", w: "w2" },
};

export const SAW: SpriteDef = {
  map: ["xxxx.....", "xwwx.....", "xwwsssssx", "xwwsSSSSx", "xxxs^s^s."],
  key: { x: "ink", w: "w3", s: "s3", S: "s4", "^": "s2" },
};

export const FLASK: SpriteDef = {
  map: [
    "..xgx..",
    "..xgx..",
    "..xgx..",
    ".xg.gx.",
    "xg...gx",
    "xLLLLLx",
    "xLHLLLx",
    ".xLLLx.",
    "..xxx..",
  ],
  key: { x: "ink", g: "s4", L: "!liquid", H: "!k3" },
};

export const ANVIL: SpriteDef = {
  map: [
    "xxxxxxxxxxxxxxx.",
    "xSSSSSSSSSSSSSsx",
    ".xsssssssssssxx.",
    "...xssssssx.....",
    "....xsssx.......",
    "...xsssssx......",
    "..xsssssssx.....",
    "..xxxxxxxxx.....",
  ],
  key: { x: "ink", s: "s2", S: "s3" },
};
