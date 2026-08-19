import type { ReactNode } from "react";
import * as simpleIcons from "simple-icons";
import { AWS_PATH, OPENAI_PATH } from "./local-icons";

/**
 * Fuente de verdad de los logos.
 *
 *   npm i simple-icons
 *
 * Paths oficiales, viewBox 0 0 24 24, un solo <path>. Dos excepciones
 * (ChatGPT y AWS) viven en local-icons.ts porque ya no están en el paquete.
 */

type SimpleIcon = { title: string; slug: string; hex: string; path: string };

/**
 * simple-icons renombra exports entre majors (siCss3 -> siCss). Probamos
 * varios nombres para que un `npm update` no rompa la cinta en silencio.
 */
function resolve(...candidates: string[]): SimpleIcon | null {
  const registry = simpleIcons as unknown as Record<string, SimpleIcon | undefined>;
  for (const name of candidates) {
    const icon = registry[name];
    if (icon?.path) return icon;
  }
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[StackBand] Logo no encontrado en simple-icons: ${candidates.join(", ")}`);
  }
  return null;
}

export type Tech = {
  /** Nombre accesible + texto del tooltip */
  label: string;
  /** Color de marca que aparece en hover */
  color: string;
  /** Path oficial (viewBox 0 0 24 24) */
  path?: string;
  /** Escape hatch para logos compuestos por varias formas */
  node?: ReactNode;
  /** Corrección de peso óptico. 1 = sin tocar. */
  scale?: number;
};

/**
 * Varios logos oficiales son negros o casi negros (#000 Next.js y Vercel,
 * #2D3748 Prisma, #363636 Solidity, #3C3C3D Ethereum). Sobre la aurora
 * desaparecen, así que fijamos la variante clara de cada marca.
 * El resto hereda el hex oficial.
 */
const ON_DARK: Record<string, string> = {
  "Next.js": "#FFFFFF",
  Vercel: "#FFFFFF",
  ChatGPT: "#FFFFFF",
  Prisma: "#8FA3FF",
  Ethereum: "#8A92B2",
  Solidity: "#C9CCD1",
  AWS: "#FF9900",
  CSS: "#8B5FD6",
  Python: "#4B8BBE",
  SQL: "#8FB7FF",
};

function tech(label: string, ...candidates: string[]): Tech {
  const icon = resolve(...candidates);
  return {
    label,
    color: ON_DARK[label] ?? (icon ? `#${icon.hex}` : "currentColor"),
    path: icon?.path,
  };
}

/** SQL genérico: no es una marca, así que lo dibujamos nosotros. */
const SqlGlyph = (
  <g
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <ellipse cx="12" cy="5.2" rx="7.2" ry="3.2" />
    <path d="M4.8 5.2v6.4c0 1.77 3.22 3.2 7.2 3.2s7.2-1.43 7.2-3.2V5.2" />
    <path d="M4.8 11.6V18c0 1.77 3.22 3.2 7.2 3.2s7.2-1.43 7.2-3.2v-6.4" />
  </g>
);

/**
 * Orden intencional: framework y lenguajes, datos, infra, herramientas,
 * web3, IA. Al pasar la cinta se lee como un stack, no como una lista.
 */
export const TECHS: Tech[] = [
  tech("Next.js", "siNextdotjs"),
  tech("React", "siReact"),
  tech("TypeScript", "siTypescript"),
  tech("JavaScript", "siJavascript"),
  tech("Node.js", "siNodedotjs"),
  tech("CSS", "siCss", "siCss3"),

  tech("PostgreSQL", "siPostgresql"),
  tech("Prisma", "siPrisma"),
  tech("Supabase", "siSupabase"),
  { label: "SQL", color: ON_DARK.SQL || "#cacaca", node: SqlGlyph },
  tech("SAP", "siSap"),

  tech("Vercel", "siVercel"),
  tech("Cloudflare", "siCloudflare"),
  // Logo apaisado: en una caja cuadrada se ve pequeño, así que lo compensamos.
  { label: "AWS", color: ON_DARK.AWS || "#cacaca", path: AWS_PATH, scale: 1.3 },
  tech("Git", "siGit"),
  tech("Figma", "siFigma"),
  tech("Python", "siPython"),

  tech("Solidity", "siSolidity"),
  tech("Ethereum", "siEthereum"),

  tech("Claude", "siClaude", "siAnthropic"),
  { label: "ChatGPT", color: ON_DARK.ChatGPT || "#cacaca", path: OPENAI_PATH },
  tech("Gemini", "siGooglegemini"),
  tech("Hugging Face", "siHuggingface"),
];
