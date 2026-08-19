import type { DesignChapter } from "./components/DesignScrollExperience/DesignScrollExperience";
import type { ContentMap } from "@/features/content/types";

export const DESIGN_FRAME_COUNT = 5;

export const DESIGN_DESKTOP_FRAMES = Array.from(
  { length: DESIGN_FRAME_COUNT },
  (_, index) => `/design/sequence/desktop/frame-${String(index + 1).padStart(2, "0")}.webp`,
);

export const DESIGN_MOBILE_FRAMES = Array.from(
  { length: DESIGN_FRAME_COUNT },
  (_, index) => `/design/sequence/mobile/frame-${String(index + 1).padStart(2, "0")}.webp`,
);

export interface DesignChapterDefinition extends DesignChapter {
  key: string;
}

export const DESIGN_CHAPTER_DEFAULTS: DesignChapterDefinition[] = [
  {
    key: "design.hero",
    eyebrow: "Diseño 3D",
    title: "Ideas que cobran volumen.",
    body: "Forma, luz y movimiento para hacer visible lo que todavía no existe.",
    align: "left",
  },
  {
    key: "design.intent",
    eyebrow: "01 · Intención",
    title: "Todo empieza con una emoción.",
    body: "Antes de modelar, defino qué debe provocar.",
    align: "right",
  },
  {
    key: "design.material",
    eyebrow: "02 · Materia",
    title: "El detalle cambia la percepción.",
    body: "Personajes y modelos donde cada superficie cuenta una historia.",
    align: "left",
  },
  {
    key: "design.structure",
    eyebrow: "03 · Estructura",
    title: "Espacios que ya puedes sentir.",
    body: "Arquitectura, proporción y luz antes de que exista la primera pared.",
    align: "right",
  },
  {
    key: "design.transformation",
    eyebrow: "04 · Transformación",
    title: "Tu idea ya tiene forma.",
    body: "Convirtamos una intención en una imagen que permanezca.",
    align: "left",
    primaryCta: { href: "#contacto", label: "Hablemos de tu idea" },
    secondaryCta: { href: "/proyectos", label: "Ver proyectos" },
  },
];

export function resolveDesignChapters(content: ContentMap): DesignChapter[] {
  return DESIGN_CHAPTER_DEFAULTS.map(({ key, ...chapter }) => {
    const block = content[key];
    return {
      ...chapter,
      title: block?.title?.trim() || chapter.title,
      body: block?.body?.trim() || chapter.body,
    };
  });
}
