import { type ResourceCategory } from "@prisma/client";

/** Ancla del catálogo: filtros y pestañas de orden aterrizan aquí. */
export const CATALOG_ID = "catalogo";

export const ORDERS = [
  { value: "destacados", label: "Destacados" },
  { value: "nuevos", label: "Nuevos" },
  { value: "descargas", label: "Más descargados" },
] as const;

export type CatalogOrder = (typeof ORDERS)[number]["value"];

export const DEFAULT_ORDER: CatalogOrder = "destacados";

export function isCatalogOrder(v: string | undefined): v is CatalogOrder {
  return ORDERS.some((o) => o.value === v);
}

/**
 * URL del catálogo con filtro y orden. El orden por defecto no se escribe
 * (URLs limpias y una sola versión canónica); el ancla lleva a los resultados.
 */
export function catalogHref({
  categoria,
  orden = DEFAULT_ORDER,
}: {
  categoria?: ResourceCategory;
  orden?: CatalogOrder;
}): string {
  const params = new URLSearchParams();
  if (categoria) params.set("categoria", categoria);
  if (orden !== DEFAULT_ORDER) params.set("orden", orden);
  const query = params.toString();
  return `/recursos${query ? `?${query}` : ""}#${CATALOG_ID}`;
}

const sizeFmt = new Intl.NumberFormat("es-GT", { maximumFractionDigits: 1 });

/** "840 KB", "12,4 MB"… o null si no hay tamaños registrados. */
export function formatBytes(bytes: number): string | null {
  if (!bytes) return null;
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${sizeFmt.format(bytes / (1024 * 1024))} MB`;
}

/** Extensiones únicas de los archivos del recurso: ["fig", "pdf"]. */
export function fileTypesOf(files: { fileName: string; mimeType: string | null }[]): string[] {
  const types = files
    .map((f) => {
      const ext = f.fileName.includes(".") ? f.fileName.split(".").pop() : undefined;
      return (ext ?? f.mimeType?.split("/").pop() ?? "").toLowerCase();
    })
    .filter((t) => t.length > 0 && t.length <= 5);
  return [...new Set(types)];
}
