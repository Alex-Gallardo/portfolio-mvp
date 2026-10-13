/**
 * Contenido de "Web3, explicado simple" (/crypto).
 *
 * Desktop: la ilustración de la tarjeta activa vive en un panel sticky a la
 * izquierda y las tarjetas de texto pasan por la derecha al hacer scroll.
 * Móvil/tablet: cada tarjeta lleva su propia ilustración.
 */
export type EducationKey = "wallet" | "tx" | "contracts" | "tokens" | "ux";

export interface EducationCard {
  key: EducationKey;
  tag: string;
  title: string;
  text: string;
  /** Chips de apoyo. */
  points?: string[];
}

export const EDUCATION_CARDS: EducationCard[] = [
  {
    key: "wallet",
    tag: "Identidad",
    title: "Tu wallet, tu identidad",
    text: "Una wallet es tu llave para firmar acciones y demostrar quién eres, sin contraseñas.",
    points: ["Identidad verificable", "Firmas con un clic", "Tus activos, tu control"],
  },
  {
    key: "tx",
    tag: "Blockchain",
    title: "Transacciones transparentes",
    text: "Cada acción queda registrada en la cadena: pública, verificable e inmutable.",
  },
  {
    key: "contracts",
    tag: "Automatización",
    title: "Contratos inteligentes",
    text: "Programas que se ejecutan solos cuando se cumplen las condiciones. Sin intermediarios.",
  },
  {
    key: "tokens",
    tag: "Activos",
    title: "Tokens: valor programable",
    text: "Monedas, membresías o coleccionables con reglas escritas en código.",
  },
  {
    key: "ux",
    tag: "Mi enfoque",
    title: "UX que no asusta",
    text: "Mi trabajo: que todo esto se sienta tan simple como una app normal.",
    points: ["Onboarding guiado", "Firmas explicadas", "Errores en lenguaje humano"],
  },
];

/** Número de la tarjeta con dos dígitos ("01", "02"…). */
export const cardNumber = (index: number) => String(index + 1).padStart(2, "0");

/**
 * Tarjeta activa a partir de las que cruzan la franja central del viewport.
 * - Ninguna en la franja (hueco entre tarjetas) → se mantiene la anterior.
 * - Varias (scroll muy rápido) → gana la más cercana a la anterior que no
 *   sea ella misma, así el cambio avanza paso a paso en la dirección del scroll.
 */
export function resolveActive(inBand: number[], previous: number): number {
  const candidates = inBand.filter((i) => i !== previous);
  if (candidates.length === 0) return previous;
  return candidates.reduce((best, i) =>
    Math.abs(i - previous) < Math.abs(best - previous) ? i : best,
  );
}
