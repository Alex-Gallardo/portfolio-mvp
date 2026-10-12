/**
 * Partes del H1 del hero crypto: texto normal + palabra(s) resaltada(s).
 *
 * El título llega del CMS (`crypto.hero`), así que la marca es texto plano:
 *   "Web3 y blockchain sin *fricción*"  → resalta "fricción"
 * Sin marca, se resalta la última palabra para que el hero nunca pierda
 * su punto focal.
 */
export interface TitleParts {
  before: string;
  highlight: string;
  after: string;
}

// El título ya llega en una sola línea (se normalizan los espacios).
const MARKED = /^(.*?)\*([^*]+)\*(.*)$/;

export function splitTitle(raw: string): TitleParts {
  const title = raw.trim().replace(/\s+/g, " ");
  if (!title) return { before: "", highlight: "", after: "" };

  const [, before = "", mark = "", rest = ""] = MARKED.exec(title) ?? [];
  if (mark.trim()) {
    return {
      before,
      highlight: mark.trim(),
      // Los asteriscos sueltos que queden fuera de la marca no se muestran.
      after: rest.replace(/\*/g, ""),
    };
  }

  const clean = title.replace(/\*/g, "").replace(/\s+/g, " ").trim();
  const lastSpace = clean.lastIndexOf(" ");
  if (lastSpace === -1) return { before: "", highlight: clean, after: "" };
  return {
    before: clean.slice(0, lastSpace + 1),
    highlight: clean.slice(lastSpace + 1),
    after: "",
  };
}

/** Título sin marcas, para metadatos o aria-label. */
export function plainTitle(raw: string): string {
  const { before, highlight, after } = splitTitle(raw);
  return `${before}${highlight}${after}`;
}
