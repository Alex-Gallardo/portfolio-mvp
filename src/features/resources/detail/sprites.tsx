import type { FileKind } from "./files";

/**
 * Sprites pixel de la ficha y del modal de descarga. Cada icono es un mapa
 * de píxeles ("#" pinta, "." vacío; letras = segundo color) convertido a
 * paths de rectángulos de 1 px y pintado a escala entera con `crispEdges`.
 */

type Sprite = { cols: number; rows: number; d: string; d2: string };

function toPath(map: readonly string[], ch: string): string {
  let d = "";
  map.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      if (row[x] !== ch) continue;
      let run = 1;
      while (row[x + run] === ch) run++;
      d += `M${x} ${y}h${run}v1h-${run}z`;
      x += run - 1;
    }
  });
  return d;
}

function sprite(map: readonly string[]): Sprite {
  return { cols: map[0]?.length ?? 0, rows: map.length, d: toPath(map, "#"), d2: toPath(map, "o") };
}

/* Documento base 9×11 con la esquina doblada; "o" = detalle del tipo */
const PDF = sprite([
  "######...",
  "#....##..",
  "#....#.#.",
  "#....####",
  "#.ooo...#",
  "#.o.o...#",
  "#.ooo...#",
  "#.o.....#",
  "#.o.....#",
  "#.......#",
  "#########",
]);
const DOC = sprite([
  "######...",
  "#....##..",
  "#....#.#.",
  "#....####",
  "#.ooooo.#",
  "#.......#",
  "#.ooooo.#",
  "#.......#",
  "#.ooo...#",
  "#.......#",
  "#########",
]);
const SHEET = sprite([
  "######...",
  "#....##..",
  "#....#.#.",
  "#....####",
  "#.o.o.o.#",
  "#.ooooo.#",
  "#.o.o.o.#",
  "#.ooooo.#",
  "#.o.o.o.#",
  "#.......#",
  "#########",
]);
const CODE = sprite([
  "######...",
  "#....##..",
  "#....#.#.",
  "#....####",
  "#..o....#",
  "#.o..o..#",
  "#..o..o.#",
  "#....o..#",
  "#.......#",
  "#.......#",
  "#########",
]);
const IMAGE = sprite([
  "#########",
  "#.......#",
  "#..oo...#",
  "#..oo...#",
  "#.......#",
  "#....o..#",
  "#...ooo.#",
  "#.ooooo.#",
  "#ooooooo#",
  "#.......#",
  "#########",
]);
const ARCHIVE = sprite([
  ".#######.",
  "#########",
  "#...o...#",
  "#...o...#",
  "#..ooo..#",
  "#...o...#",
  "#...o...#",
  "#..ooo..#",
  "#..o.o..#",
  "#..ooo..#",
  "#########",
]);
const FIGMA = sprite([
  ".........",
  "..ooo.oo.",
  "..o.o.o.o",
  "..ooo.oo.",
  "..o.o.oo.",
  "..ooo.o.o",
  "..o......",
  "..ooo....",
  "..o.o....",
  "..ooo....",
  ".........",
]);
const FILE = sprite([
  "######...",
  "#....##..",
  "#....#.#.",
  "#....####",
  "#.......#",
  "#.......#",
  "#.......#",
  "#.......#",
  "#.......#",
  "#.......#",
  "#########",
]);

export const FILE_SPRITES: Record<FileKind, Sprite> = {
  pdf: PDF,
  figma: FIGMA,
  archive: ARCHIVE,
  doc: DOC,
  sheet: SHEET,
  image: IMAGE,
  code: CODE,
  file: FILE,
};

export const UI_SPRITES = {
  /* flecha de descarga */
  download: sprite([
    "...##...",
    "...##...",
    ".######.",
    "..####..",
    "...##...",
    "##....##",
    "##....##",
    "########",
  ]),
  /* flecha atrás */
  back: sprite([
    "...#....",
    "..##....",
    ".#######",
    "########",
    ".#######",
    "..##....",
    "...#....",
  ]),
  /* enlace (dos eslabones) */
  link: sprite([
    "..###...",
    ".#...#..",
    "#..#..#.",
    "#.#.#.#.",
    ".#..#..#",
    "..#...#.",
    "...###..",
  ]),
  /* check */
  check: sprite([
    ".......#",
    "......##",
    ".....##.",
    "#...##..",
    "##.##...",
    ".###....",
    "..#.....",
  ]),
  /* moneda */
  coin: sprite([".####.", "#oo..#", "#o..o#", "#o..o#", "#..oo#", ".####."]),
  /* estrella */
  star: sprite(["...#...", "..###..", "#######", ".#####.", "..###..", ".##.##.", "##...##"]),
  /* escudo */
  shield: sprite(["#######", "#.....#", "#....##", "#.#.#.#", "#..#..#", ".#...#.", "..###.."]),
  /* martillo (taller) */
  hammer: sprite([
    "..####..",
    "..####..",
    "####.##.",
    "..##....",
    "...##...",
    "....##..",
    ".....##.",
    "......##",
  ]),
  /* sobre (email) */
  mail: sprite([
    "########",
    "#......#",
    "##....##",
    "#.#..#.#",
    "#..##..#",
    "#......#",
    "########",
  ]),
  /* persona */
  user: sprite(["..###..", ".#####.", ".#####.", "..###..", ".#####.", "#######", "#######"]),
  /* candado */
  lock: sprite(["..###..", ".#...#.", ".#...#.", "#######", "#######", "##.#.##", "#######"]),
  /* reloj */
  clock: sprite([".#####.", "#..#..#", "#..#..#", "#..##.#", "#.....#", "#.....#", ".#####."]),
} as const;

export type UiSpriteName = keyof typeof UI_SPRITES;

export function PixelSprite({
  sprite: { cols, rows, d, d2 },
  scale = 2,
  className,
  accent,
}: {
  sprite: Sprite;
  scale?: number;
  className?: string;
  /** Color del segundo canal ("o"); por defecto, el mismo que el primero. */
  accent?: string;
}) {
  return (
    <svg
      viewBox={`0 0 ${cols} ${rows}`}
      width={cols * scale}
      height={rows * scale}
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden="true"
      className={className}
    >
      <path d={d} />
      {d2 ? <path d={d2} fill={accent ?? "currentColor"} /> : null}
    </svg>
  );
}

export function FileIcon({
  kind,
  scale = 2,
  className,
}: {
  kind: FileKind;
  scale?: number;
  className?: string;
}) {
  return (
    <PixelSprite
      sprite={FILE_SPRITES[kind]}
      scale={scale}
      className={className}
      accent="var(--file-accent, currentColor)"
    />
  );
}
