import { type ResourceCategory } from "@prisma/client";

/**
 * Glifos pixel de 7×7 (se pintan a 2×). Mismo lenguaje que los sprites de
 * las ResourceCard: rectángulos de 1 px, `crispEdges`, color heredado.
 */
export const GLYPHS = {
  ALL: "M3 0h1v1h-1zM2 1h3v1h-3zM0 2h7v1h-7zM1 3h5v1h-5zM2 4h3v1h-3zM1 5h2v1h-2zM4 5h2v1h-2zM0 6h2v1h-2zM5 6h2v1h-2z",
  APPS: "M1 0h5v1h-5zM1 6h5v1h-5zM1 1h1v5h-1zM5 1h1v5h-1zM3 5h1v1h-1z",
  WEB: "M2 0h3v1h-3zM1 1h1v1h-1zM5 1h1v1h-1zM0 2h1v3h-1zM6 2h1v3h-1zM1 5h1v1h-1zM5 5h1v1h-1zM2 6h3v1h-3zM3 1h1v5h-1zM1 3h5v1h-5z",
  BLOCKCHAIN: "M0 0h3v3h-3zM4 4h3v3h-3zM3 1h2v1h-2zM4 2h1v2h-1zM2 3h1v2h-1zM2 5h2v1h-2z",
  DISENO: "M5 0h2v2h-2zM4 2h1v1h-1zM3 3h1v1h-1zM2 4h1v1h-1zM0 5h2v2h-2z",
  IA: "M1 1h5v1h-5zM1 5h5v1h-5zM1 2h1v3h-1zM5 2h1v3h-1zM3 3h1v1h-1zM0 2h1v1h-1zM0 4h1v1h-1zM6 2h1v1h-1zM6 4h1v1h-1zM2 0h1v1h-1zM4 0h1v1h-1zM2 6h1v1h-1zM4 6h1v1h-1z",
  MARKETING: "M0 2h2v3h-2zM2 1h1v5h-1zM3 0h1v7h-1zM5 2h1v1h-1zM5 4h1v1h-1zM6 3h1v1h-1z",
  OTRO: "M1 0h5v1h-5zM0 1h1v6h-1zM6 1h1v6h-1zM0 3h7v1h-7zM3 4h1v1h-1zM0 6h7v1h-7z",
  DOWNLOAD: "M3 0h1v2h-1zM1 2h5v1h-5zM2 3h3v1h-3zM3 4h1v1h-1zM0 5h1v1h-1zM6 5h1v1h-1zM0 6h7v1h-7z",
  CLOSE:
    "M0 0h2v1h-2zM5 0h2v1h-2zM1 1h2v1h-2zM4 1h2v1h-2zM2 2h3v1h-3zM2 3h3v1h-3zM1 4h2v1h-2zM4 4h2v1h-2zM0 5h2v1h-2zM5 5h2v1h-2z",
} as const satisfies Record<ResourceCategory | "ALL" | "DOWNLOAD" | "CLOSE", string>;

export type GlyphName = keyof typeof GLYPHS;

export function Glyph({
  name,
  size = 14,
  className,
}: {
  name: GlyphName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 7 7"
      width={size}
      height={size}
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden="true"
      className={className}
    >
      <path d={GLYPHS[name]} />
    </svg>
  );
}
