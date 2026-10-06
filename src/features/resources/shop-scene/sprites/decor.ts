import type { SpriteDef } from "../draw";

/** Decoración de la tienda: lo que le da carácter sin venderse. */

export const SKULL: SpriteDef = {
  map: [
    "..xxxxx..",
    ".xKKKKKx.",
    "xKKKKKKkx",
    "xKxxKxxkx",
    "xKxxKxxkx",
    "xKKKxKKkx",
    ".xkKKKkx.",
    "..xkxkx..",
    "..xxxxx..",
  ],
  key: { x: "ink", K: "k3", k: "k1" },
};

/** Cartel de "se busca": la imagen y el sello se tiñen. */
export const POSTER: SpriteDef = {
  map: [
    "xxxxxxxxxxx",
    "xkkkkkkkkkx",
    "xkxxxxxxxkx",
    "xkxpppppxkx",
    "xkxpPPPpxkx",
    "xkxpPPPpxkx",
    "xkxpppppxkx",
    "xkxxxxxxxkx",
    "xkkkkkkkkkx",
    "xkKKKKKKKkx",
    "xkkkkkkkkkx",
    "xkKKKKKkkkx",
    "xkkkkkkkkkx",
    "xxxxxxxxxxx",
  ],
  key: { x: "k0", k: "k2", K: "k0", p: "picture", P: "figure" },
};

export const NOTE: SpriteDef = {
  map: ["xxxxxxx", "xkkkkkx", "xkKKKkx", "xkkkkkx", "xkKKkkx", "xkkkkkx", "xxxxxxx"],
  key: { x: "k0", k: "k1", K: "k0" },
};

/** Hojas de planta grande (monstera); se mecen con blitSheared. */
export const LEAVES: SpriteDef = {
  map: [
    "......E......",
    "....EEeE..E..",
    "..E.EeeEEEe..",
    ".EeEEeEeeeEE.",
    "EeeeEEeEeEeE.",
    ".EeeE.EEe.Ee.",
    "..EE.eEe.EE..",
    "....eEEe.....",
    ".....eE......",
    "......e......",
  ],
  key: { E: "e2", e: "e1" },
};

export const SMALL_LEAVES: SpriteDef = {
  map: ["..E.E..", ".EeEeE.", "EeE.EeE", ".eEeEe.", "..eEe..", "...e..."],
  key: { E: "e2", e: "e1" },
};

export const POT: SpriteDef = {
  map: ["xxxxxxxxx", "xRRRRRRrx", ".xrRRRrx.", ".xrRRRrx.", "..xxxxx.."],
  key: { x: "ink", R: "t2", r: "t1" },
};

export const SMALL_POT: SpriteDef = {
  map: ["xxxxxxx", "xRRRRrx", ".xRRrx.", ".xxxxx."],
  key: { x: "ink", R: "t2", r: "t1" },
};

/** Gato atigrado durmiendo hecho un ovillo (la cola es procedural). */
export const CAT: SpriteDef = {
  map: [
    ".x...x..........",
    "xOx.xOx.........",
    "xOOOOOxxxxxxx...",
    "xOOOOOOOoOOoOx..",
    "xOxOOxOOoOOoOOx.",
    "xOOnOOOOOOOOOOx.",
    "xWWWOOOOoOOoOOx.",
    ".xxxxxxxxxxxxx..",
  ],
  key: { x: "ink", O: "m2", o: "m1", W: "k3", n: "r3" },
};

export const COBWEB: SpriteDef = {
  map: [
    "wwwwwwwww",
    "w.w..w.w.",
    "w..w.w.w.",
    "ww..ww...",
    "w.ww.w...",
    "w..w.....",
    "w.w......",
    "ww.......",
    "w........",
  ],
  key: { w: "k2" },
};

/** Antorcha en su aplique de hierro (la llama es procedural). */
export const TORCH: SpriteDef = {
  map: [
    ".xxxxx.",
    ".xsSsx.",
    "..xsx..",
    "..xwx..",
    "..xwx..",
    "xxxwxxx",
    "xsxwxsx",
    "..xwx..",
    "..xwx..",
    "...x...",
  ],
  key: { x: "ink", s: "s1", S: "s3", w: "w3" },
};
