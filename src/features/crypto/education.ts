/**
 * Contenido del bento "Web3, explicado simple" (/crypto).
 *
 * `size` decide la celda del Bento Grid en desktop (4 columnas):
 *   hero   → 2×2   wide → 2×1   square → 1×1   banner → 4×1
 */
export type EducationKey = "wallet" | "tx" | "contracts" | "tokens" | "ux";
export type BentoSize = "hero" | "wide" | "square" | "banner";

export interface EducationCard {
  key: EducationKey;
  tag: string;
  title: string;
  text: string;
  size: BentoSize;
  /** Chips de apoyo (protagonista y banner). */
  points?: string[];
}

export const EDUCATION_CARDS: EducationCard[] = [
  {
    key: "wallet",
    tag: "Identidad",
    title: "Tu wallet, tu identidad",
    text: "Una wallet es tu llave para firmar acciones y demostrar quién eres, sin contraseñas.",
    size: "hero",
    points: ["Identidad verificable", "Firmas con un clic", "Tus activos, tu control"],
  },
  {
    key: "tx",
    tag: "Blockchain",
    title: "Transacciones transparentes",
    text: "Cada acción queda registrada en la cadena: pública, verificable e inmutable.",
    size: "wide",
  },
  {
    key: "contracts",
    tag: "Automatización",
    title: "Contratos inteligentes",
    text: "Programas que se ejecutan solos cuando se cumplen las condiciones. Sin intermediarios.",
    size: "square",
  },
  {
    key: "tokens",
    tag: "Activos",
    title: "Tokens: valor programable",
    text: "Monedas, membresías o coleccionables con reglas escritas en código.",
    size: "square",
  },
  {
    key: "ux",
    tag: "Mi enfoque",
    title: "UX que no asusta",
    text: "Mi trabajo: que todo esto se sienta tan simple como una app normal.",
    size: "banner",
    points: ["Onboarding guiado", "Firmas explicadas", "Errores en lenguaje humano"],
  },
];

/** Celdas que ocupa cada tamaño en el grid de 4 columnas (desktop). */
export const BENTO_CELLS: Record<BentoSize, { cols: number; rows: number }> = {
  hero: { cols: 2, rows: 2 },
  wide: { cols: 2, rows: 1 },
  square: { cols: 1, rows: 1 },
  banner: { cols: 4, rows: 1 },
};

/** Número de la tarjeta con dos dígitos ("01", "02"…). */
export const cardNumber = (index: number) => String(index + 1).padStart(2, "0");
