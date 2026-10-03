import type { CSSProperties } from "react";
import Link from "next/link";
import Image from "next/image";
import { Pixelify_Sans } from "next/font/google";
import { type ResourceCategory } from "@prisma/client";
import { CATEGORY_LABELS } from "../categories";
import { DownloadButton } from "../DownloadButton";
import styles from "./ResourceCard.module.css";

/** Fuente pixel con alcance de componente: next/font la auto-hospeda y sólo
 *  la precarga en las rutas que pintan cards. El resumen sigue en Inter:
 *  un párrafo entero en pixel font se lee peor. */
const pixelFont = Pixelify_Sans({
  subsets: ["latin"],
  variable: "--font-pixel",
  display: "swap",
});

export interface ResourceCardData {
  slug: string;
  title: string;
  summary: string;
  category: ResourceCategory;
  coverUrl: string | null;
  downloadCount: number;
  fileCount: number;

  /** Opcional. Extensiones del paquete: ["fig", "pdf"]. Es el dato que más
   *  ayuda a decidir: el visitante quiere saber QUÉ recibe, no cuántos ficheros. */
  fileTypes?: string[] | null;
  /** Opcional. Peso total ya formateado: "12 MB". */
  fileSize?: string | null;
  /** Opcional. Activa el sello "Nuevo" durante NEW_WINDOW_DAYS. */
  publishedAt?: string | Date | null;
}

const NEW_WINDOW_DAYS = 21;
const POPULAR_THRESHOLD = 100;
const MAX_FORMAT_TAGS = 3;

const numberFmt = new Intl.NumberFormat("es-GT");

/**
 * Destellos 8-bit sobre el marco. Mismo truco que Skills: duraciones con
 * decimales primos entre sí → el patrón combinado tarda minutos en repetirse
 * y se percibe aleatorio, no como un pulso.
 *
 * Los de borde sobresalen lo justo para no cortarse contra el padding del
 * Carousel (8px arriba, 4px a los lados); abajo hay sitio de sobra.
 * `extra` → sólo se encienden al desenvolver la card (hover/foco).
 */
type Spark = { x: string; y: string; d: number; big?: boolean; extra?: boolean };

const SPARKS: Spark[] = [
  { x: "88%", y: "3px", d: 4.3 },
  { x: "3px", y: "31%", d: 5.3 },
  { x: "calc(100% - 6px)", y: "54%", d: 3.7, big: true },
  { x: "14%", y: "calc(100% - 2px)", d: 6.1, big: true },
  { x: "76%", y: "24%", d: 4.7 },
  { x: "34%", y: "3px", d: 5.9 },
  { x: "calc(100% - 3px)", y: "14%", d: 3.1, extra: true },
  { x: "3px", y: "72%", d: 4.1, extra: true },
  { x: "58%", y: "calc(100% - 2px)", d: 3.4, big: true, extra: true },
];

/** Server Component: `Date.now()` se evalúa en el servidor, sin riesgo de
 *  hydration mismatch. Si algún día esto pasa a "use client", calcula
 *  `isNew` en el data layer y pásalo como prop. */
function isRecent(date: ResourceCardData["publishedAt"]): boolean {
  if (!date) return false;
  const published = new Date(date).getTime();
  if (Number.isNaN(published)) return false;
  return Date.now() - published < NEW_WINDOW_DAYS * 24 * 60 * 60 * 1000;
}

/** FNV-1a del slug → semilla estable entre renders. Desincroniza las cards
 *  hermanas de un grid, que si no destellarían todas a la vez. */
function seedFrom(slug: string): number {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Fracción determinista en [0, 1) para un canal de la semilla. */
function noise(seed: number, channel: number): number {
  let x = (seed ^ Math.imul(channel + 1, 0x9e3779b9)) >>> 0;
  x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
  x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
}

/** Retraso negativo: el ciclo arranca ya empezado, sin ráfaga al montar. */
function phase(seed: number, channel: number, cycle: number): string {
  return `-${(noise(seed, channel) * cycle).toFixed(2)}s`;
}

export function ResourceCard({
  resource,
  priority = false,
}: {
  resource: ResourceCardData;
  /** Pásalo en las 2–3 primeras cards del grid para mejorar el LCP. */
  priority?: boolean;
}) {
  const href = `/recursos/${resource.slug}`;
  const categoryLabel = CATEGORY_LABELS[resource.category];
  const formats = (resource.fileTypes ?? []).slice(0, MAX_FORMAT_TAGS);
  const showNew = isRecent(resource.publishedAt);
  const isPopular = resource.downloadCount >= POPULAR_THRESHOLD;

  const seed = seedFrom(resource.slug);
  const flip = (seed & 1) === 1; // espejo horizontal: cards vecinas no calcan el dibujo

  return (
    <article
      className={`${styles.card} ${pixelFont.variable}`}
      style={
        {
          "--icon-download": CTA_ICON_MASK,
          "--glint-delay": phase(seed, 90, 7.3),
          "--gem-delay": phase(seed, 91, 3.3),
          "--star-delay": phase(seed, 92, 4.1),
        } as CSSProperties
      }
    >
      {/* Chasis: bloque con grosor + contorno escalonado + superficie
          biselada. Va detrás (z-index -1): el contenido sigue en flujo. */}
      <span className={styles.chassis} aria-hidden="true" />
      {/* Suelo con dithering: el pedestal sobre el que descansa el CTA */}
      <span className={styles.ground} aria-hidden="true" />

      <div className={styles.media}>
        {resource.coverUrl ? (
          <Image
            src={resource.coverUrl}
            alt={`Vista previa de ${resource.title}`}
            fill
            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 30vw"
            className={styles.cover}
            priority={priority}
          />
        ) : (
          <div className={styles.coverFallback} aria-hidden="true">
            <SpriteIcon sprite={SPRITES.chest} scale={5} className={styles.fallbackIcon} />
          </div>
        )}

        <span className={styles.screen} aria-hidden="true" />
        <span className={styles.sheen} aria-hidden="true" />

        <div className={styles.mediaTop}>
          <span className={styles.badge}>{categoryLabel}</span>
          {showNew ? (
            <span className={styles.badgeNew}>
              <SpriteIcon sprite={SPRITES.star} />
              Nuevo
            </span>
          ) : null}
        </div>

        {/* Afordancia de "la portada también lleva al detalle".
            Oculto en táctil: ahí toda la card es tappable. */}
        <span className={styles.peek} aria-hidden="true">
          Ver detalles
          <SpriteIcon sprite={SPRITES.arrow} className={styles.peekIcon} />
        </span>
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>
          {/* Stretched link: el <a> del título cubre toda la card vía ::after,
              así el área de clic es la card completa y sigue habiendo un solo
              tab stop con nombre accesible real. */}
          <Link href={href} className={styles.titleLink}>
            {resource.title}
          </Link>
        </h3>
        <p className={styles.summary}>{resource.summary}</p>
      </div>

      {/* Inventario: separa "qué es" de "qué recibo". */}
      <div className={styles.manifest}>
        <ul className={styles.contents}>
          {formats.map((format) => (
            <li key={format} className={styles.format}>
              {format}
            </li>
          ))}
          <li className={styles.contentsItem}>
            {/* Casilla de inventario con contador de pila. El "×" es sólo
                visual: un lector de pantalla oye "2 archivos". */}
            <span className={styles.slot}>
              <SpriteIcon sprite={SPRITES.file} />
              <span className={styles.stack}>
                <span aria-hidden="true">×</span>
                {resource.fileCount}
              </span>
            </span>{" "}
            archivo{resource.fileCount === 1 ? "" : "s"}
          </li>
          {resource.fileSize ? <li className={styles.contentsItem}>{resource.fileSize}</li> : null}
        </ul>

        {resource.downloadCount > 0 ? (
          <p className={`${styles.downloads} ${isPopular ? styles.downloadsHot : ""}`}>
            <SpriteIcon
              sprite={isPopular ? SPRITES.star : SPRITES.download}
              className={styles.metaIcon}
            />
            <span>
              <strong>{numberFmt.format(resource.downloadCount)}</strong> descarga
              {resource.downloadCount === 1 ? "" : "s"}
            </span>
          </p>
        ) : null}
      </div>

      <div className={styles.actions}>
        <DownloadButton
          resourceSlug={resource.slug}
          resourceTitle={resource.title}
          className={styles.downloadBtn}
        />

        <p className={styles.trust}>
          <SpriteIcon sprite={SPRITES.shield} className={styles.trustIcon} />
          <span>Gratis · Sin spam · 30 seg</span>
        </p>
      </div>

      <span className={styles.sparks} aria-hidden="true">
        {SPARKS.map((s, i) => (
          <i
            key={i}
            className={styles.spark}
            data-big={s.big || undefined}
            data-extra={s.extra || undefined}
            style={
              {
                "--x": flip ? `calc(100% - (${s.x}))` : s.x,
                "--y": s.y,
                "--d": `${s.d}s`,
                "--delay": phase(seed, i, s.d),
              } as CSSProperties
            }
          />
        ))}
      </span>
    </article>
  );
}

/* ---------- Sprites ----------
   Cada icono es su propio mapa de píxeles: "#" pinta, "." queda vacío.
   Se dibujan a escala entera (2× por defecto) para que cada píxel caiga
   en píxeles reales de pantalla y no se emborrone. */

type Sprite = { cols: number; rows: number; d: string };

/** Convierte el mapa en un único path, fusionando rachas horizontales. */
function sprite(map: readonly string[]): Sprite {
  let d = "";
  map.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      if (row[x] !== "#") continue;
      let run = 1;
      while (row[x + run] === "#") run++;
      d += `M${x} ${y}h${run}v1h-${run}z`;
      x += run - 1;
    }
  });
  return { cols: map[0]?.length ?? 0, rows: map.length, d };
}

const SPRITES = {
  file: sprite(["####...", "#..##..", "#..#.#.", "#..####", "#.....#", "#.###.#", "#######"]),
  download: sprite(["...#...", "...#...", ".#####.", "..###..", "...#...", "#.....#", "#######"]),
  star: sprite(["...#...", "..###..", "#######", ".#####.", "..###..", ".##.##.", "##...##"]),
  shield: sprite(["#######", "#.....#", "#....##", "#.#.#.#", "#..#..#", ".#...#.", "..###.."]),
  arrow: sprite(["...#...", "...##..", "...###.", "#######", "...###.", "...##..", "...#..."]),
  chest: sprite([
    ".######.",
    "#......#",
    "#......#",
    "########",
    "#..##..#",
    "#......#",
    "#......#",
    "########",
  ]),
  ctaDownload: sprite([
    "...##...",
    "...##...",
    ".######.",
    "..####..",
    "...##...",
    "##....##",
    "##....##",
    "########",
  ]),
};

/** El icono del CTA vive como máscara CSS para no tocar DownloadButton:
 *  se genera desde el mismo sprite y viaja como custom property. */
const CTA_ICON_MASK = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${SPRITES.ctaDownload.cols} ${SPRITES.ctaDownload.rows}' shape-rendering='crispEdges'><path d='${SPRITES.ctaDownload.d}'/></svg>`,
)}")`;

function SpriteIcon({
  sprite: { cols, rows, d },
  scale = 2,
  className,
}: {
  sprite: Sprite;
  scale?: number;
  className?: string;
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
    </svg>
  );
}
