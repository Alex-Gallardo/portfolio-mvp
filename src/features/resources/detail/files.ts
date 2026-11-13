/**
 * Lógica pura de la ficha de un recurso: qué es cada archivo (para el icono
 * pixel del inventario) y cómo se rellena "Más de la tienda".
 */

export type FileKind = "pdf" | "figma" | "archive" | "doc" | "sheet" | "image" | "code" | "file";

export const FILE_KIND_LABELS: Record<FileKind, string> = {
  pdf: "PDF",
  figma: "Figma",
  archive: "Comprimido",
  doc: "Documento",
  sheet: "Hoja de cálculo",
  image: "Imagen",
  code: "Código",
  file: "Archivo",
};

const BY_EXTENSION: Record<string, FileKind> = {
  pdf: "pdf",
  fig: "figma",
  zip: "archive",
  rar: "archive",
  "7z": "archive",
  gz: "archive",
  tar: "archive",
  doc: "doc",
  docx: "doc",
  md: "doc",
  txt: "doc",
  pages: "doc",
  xls: "sheet",
  xlsx: "sheet",
  csv: "sheet",
  numbers: "sheet",
  png: "image",
  jpg: "image",
  jpeg: "image",
  gif: "image",
  webp: "image",
  svg: "image",
  js: "code",
  ts: "code",
  tsx: "code",
  jsx: "code",
  json: "code",
  html: "code",
  css: "code",
  py: "code",
};

/** Extensión en minúsculas, sin punto ("kit.ZIP" → "zip"). */
export function extensionOf(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  if (dot <= 0 || dot === fileName.length - 1) return "";
  return fileName.slice(dot + 1).toLowerCase();
}

/** Tipo de archivo: manda la extensión; el MIME solo desempata. */
export function fileKind(fileName: string, mimeType?: string | null): FileKind {
  const byExt = BY_EXTENSION[extensionOf(fileName)];
  if (byExt) return byExt;
  const mime = (mimeType ?? "").toLowerCase();
  if (mime === "application/pdf") return "pdf";
  if (mime.startsWith("image/")) return "image";
  if (mime.includes("zip") || mime.includes("compressed")) return "archive";
  if (mime.includes("spreadsheet") || mime.includes("excel") || mime === "text/csv") return "sheet";
  if (mime.includes("word") || mime.startsWith("text/")) return "doc";
  return "file";
}

/**
 * Completa la lista de relacionados hasta `limit` con otros recursos de la
 * tienda, sin repetir ni incluir el recurso abierto. Los de la misma
 * categoría van primero.
 */
export function fillRelated<T extends { slug: string }>(
  related: T[],
  others: T[],
  currentSlug: string,
  limit = 3,
): T[] {
  const out: T[] = [];
  const seen = new Set<string>([currentSlug]);
  for (const item of [...related, ...others]) {
    if (out.length >= limit) break;
    if (seen.has(item.slug)) continue;
    seen.add(item.slug);
    out.push(item);
  }
  return out;
}
