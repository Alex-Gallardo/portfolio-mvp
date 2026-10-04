import type { SpriteDef } from "./draw";

/**
 * Mapas de píxeles de la tienda. "." = transparente; cada carácter se
 * traduce con `key`. Un tono con "!" tiene luz propia (capa emisiva).
 * Tonos fuera de paleta ("liquid", "cover"…) se tiñen al usar el sprite.
 */

export const POTION: SpriteDef = {
  map: [
    "..xxx..",
    "..xcx..",
    "..xgx..",
    ".xg.gx.",
    "xgLLLgx",
    "xLHLLLx",
    "xLLLLLx",
    ".xLLLx.",
    "..xxx..",
  ],
  key: { x: "ink", c: "w4", g: "s4", L: "!liquid", H: "!k3" },
};

export const TALL_POTION: SpriteDef = {
  map: [".xcx.", ".xcx.", ".xgx.", "xg.gx", "xLLLx", "xHLLx", "xLLLx", "xLLLx", "xLLLx", "xxxxx"],
  key: { x: "ink", c: "w4", g: "s4", L: "!liquid", H: "!k3" },
};

/** "Elixir de Maná": la bebida energética de los magos. */
export const CAN: SpriteDef = {
  map: ["xsssx", "xCCYx", "xCYCx", "xYYYx", "xCYCx", "xYCCx", "xCCCx", "xsssx"],
  key: { x: "ink", s: "s3", C: "c1", Y: "!g3" },
};

export const CHOCOLATE: SpriteDef = {
  map: ["xxxxxxxx", "xfbbobbx", "xfbobbbx", "xxxxxxxx"],
  key: { x: "ink", f: "g2", b: "h1", o: "o2" },
};

export const MUSHROOM_JAR: SpriteDef = {
  map: [".xxxxx.", "xkkkkkx", "xg....x", "xg.MM.x", "x.MMMMx", "x..s.Mx", "x.ss.sx", "xxxxxxx"],
  key: { x: "ink", k: "w3", g: "s4", M: "!e3", s: "k2" },
};

export const CRYSTAL_BALL: SpriteDef = {
  map: [
    "...xxxxx...",
    "..xPPPPPx..",
    ".xPHHPPPPx.",
    "xPHPPPPQPPx",
    "xPPPPPQQPPx",
    "xPPPQQQPPPx",
    "xPPPPQPPPPx",
    ".xPPPPPPPx.",
    "..xPPPPPx..",
    "...xxxxx...",
    "..xgGGGgx..",
    ".xgGGGGGgx.",
    "xxxxxxxxxxx",
  ],
  key: { x: "ink", P: "!p2", H: "!p3", Q: "!c2", g: "g1", G: "g2" },
};

export const SPELLBOOK: SpriteDef = {
  map: [
    ".xxxxxxx.xxxxxxx.",
    "xkkkkkkkxkkkkkkkx",
    "xkRkRRkkxkkRRkRkx",
    "xkkRkkRkxkRkkRkkx",
    "xkkkkkkkxkkkkkkkx",
    "xxwwwwwwxwwwwwwxx",
  ],
  key: { x: "ink", k: "k2", R: "!p2", w: "cover" },
};

export const COINS: SpriteDef = {
  map: [
    ".....xx......",
    "....xGGx.....",
    "..xxGgGGxx...",
    ".xGGgGGgGGxx.",
    "xGgGGGgGGgGGx",
    "xxxxxxxxxxxxx",
  ],
  key: { x: "ink", G: "g3", g: "g1" },
};

export const LANTERN: SpriteDef = {
  map: [
    "..xxx..",
    ".xgggx.",
    "xxxxxxx",
    "xG.F.Gx",
    "xGFYFGx",
    "xGFYFGx",
    "xGFFFGx",
    "xxxxxxx",
    ".xgggx.",
    "..x.x..",
  ],
  key: { x: "ink", G: "g1", g: "g2", F: "!o2", Y: "!g4" },
};

export const HERBS: SpriteDef = {
  map: [".xwx.", "xeEex", "xEeEx", ".eEe.", ".eEe.", "..e..", "..e.."],
  key: { x: "ink", w: "k1", e: "e1", E: "e2" },
};

export const GARLIC: SpriteDef = {
  map: [".xwx.", "xkKkx", "kKkKk", "xkKkx", ".xkx."],
  key: { x: "ink", w: "k1", k: "k2", K: "k3" },
};

export const SWORD: SpriteDef = {
  map: [
    "...x...",
    "..xCx..",
    ".xBCBx.",
    ".xBCBx.",
    ".xBCBx.",
    ".xBCBx.",
    ".xBCBx.",
    ".xBCBx.",
    ".xBCBx.",
    ".xBCBx.",
    ".xBCBx.",
    ".xBCBx.",
    ".xBCBx.",
    ".xBCBx.",
    ".xBCBx.",
    ".xBCBx.",
    "xxxxxxx",
    "xgGGGgx",
    "xxxxxxx",
    "..xwx..",
    "..xwx..",
    "..xwx..",
    "..xGx..",
    "..xxx..",
  ],
  key: { x: "ink", B: "s4", C: "!c3", g: "g1", G: "g2", w: "w1" },
};

export const STAFF: SpriteDef = {
  map: [
    "..xxx..",
    ".xCCCx.",
    "xCHCCCx",
    "xCCCCCx",
    ".xCCCx.",
    "xGxxxGx",
    ".xGwGx.",
    "..xwx..",
    "..xwx..",
    "..xwx..",
    "..xwx..",
    "..xwx..",
    "..xwx..",
    "..xwx..",
    "..xwx..",
    "..xwx..",
    "..xwx..",
    "..xwx..",
    "..xwx..",
    "..xwx..",
    "..xwx..",
    "..xwx..",
    "..xxx..",
  ],
  key: { x: "ink", C: "!p2", H: "!p3", G: "g2", w: "w3" },
};

export const HELMET: SpriteDef = {
  map: [
    "....rr.....",
    "...rrrr....",
    "....xxx....",
    "..xxsSsxx..",
    ".xssSSSssx.",
    "xssSSSSSssx",
    "xsxxxxxxxsx",
    "xssSsSsSssx",
    "xsssSSSsssx",
    ".xsssssssx.",
    "..xxxxxxx..",
  ],
  key: { x: "ink", s: "s3", S: "s4", r: "r2" },
};

export const CHEST: SpriteDef = {
  map: [
    ".xxxxxxxxxxx.",
    "xwwwwwwwwwwwx",
    "xGWWWWWWWWWGx",
    "xxxxxxxxxxxxx",
    "xwwwwxGxwwwwx",
    "xwwwwxgxwwwwx",
    "xGWWWWWWWWWGx",
    "xwwwwwwwwwwwx",
    "xxxxxxxxxxxxx",
  ],
  key: { x: "ink", w: "w3", W: "w2", G: "g3", g: "g1" },
};

export const SCALE: SpriteDef = {
  map: [
    "......x......",
    "..xxxxGxxxx..",
    "..x...G...x..",
    ".x.x..G..x.x.",
    "xGGGx.G.xGGGx",
    "......G......",
    ".....xGx.....",
    "....xGGGx....",
    "...xxxxxxx...",
  ],
  key: { x: "ink", G: "g2" },
};

export const CRYSTAL: SpriteDef = {
  map: ["...x...", "..xHx..", ".xHPQx.", "xHPPQQx", "xPPPQQx", ".xPPQx.", "..xPx..", "...x..."],
  key: { x: "ink", H: "!p3", P: "!p2", Q: "!p1" },
};

export const AXE: SpriteDef = {
  map: [
    ".xxx..xx.",
    "xESsxxwx.",
    "xESSSxwx.",
    "xESSSxwx.",
    "xESsxxwx.",
    ".xxx.xwx.",
    ".....xwx.",
    ".....xwx.",
    ".....xwx.",
    ".....xwx.",
    ".....xwx.",
    ".....xwx.",
    ".....xwx.",
    ".....xwx.",
    ".....xwx.",
    ".....xwx.",
    ".....xwx.",
    ".....xxx.",
  ],
  key: { x: "ink", E: "s5", S: "s3", s: "s2", w: "w3" },
};

export const SCROLL: SpriteDef = {
  map: ["xxxxxxx", "kKkkkKk", "xxxxxxx"],
  key: { x: "k0", k: "k2", K: "k1" },
};

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
