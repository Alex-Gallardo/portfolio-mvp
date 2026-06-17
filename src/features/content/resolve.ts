import { type ContentMap, type SectionConfigItem } from "./types";

export interface ResolvedText {
  title: string | null;
  body: string;
  visible: boolean;
}

/** Texto de un bloque con fallback a valores por defecto. */
export function resolveBlock(
  map: ContentMap,
  key: string,
  fallback: { title?: string; body?: string },
): ResolvedText {
  const block = map[key];
  if (!block) {
    return { title: fallback.title ?? null, body: fallback.body ?? "", visible: true };
  }
  return {
    title: block.title ?? fallback.title ?? null,
    body: block.body || fallback.body || "",
    visible: block.visible,
  };
}

/**
 * Orden + visibilidad de secciones.
 * - Sin config → orden por defecto.
 * - Con config → respeta `order`, oculta `visible:false`, ignora claves desconocidas
 *   y añade al final las secciones por defecto que el config no mencione (no se pierden).
 */
export function orderSections(defaultKeys: string[], config: SectionConfigItem[] | null): string[] {
  if (!config || config.length === 0) return defaultKeys;

  const known = new Set(defaultKeys);
  const configured = config
    .filter((c) => known.has(c.key) && c.visible !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((c) => c.key);

  const mentioned = new Set(config.map((c) => c.key));
  const rest = defaultKeys.filter((k) => !mentioned.has(k));
  return [...configured, ...rest];
}
