import { type ResourceCategory } from "@prisma/client";

export const CATEGORY_LABELS: Record<ResourceCategory, string> = {
  APPS: "Apps",
  WEB: "Web",
  BLOCKCHAIN: "Blockchain",
  DISENO: "Diseño",
  IA: "IA",
  MARKETING: "Marketing",
  OTRO: "Otro",
};

export const RESOURCE_CATEGORIES = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
  value: value as ResourceCategory,
  label,
}));

export function isResourceCategory(v: string | undefined): v is ResourceCategory {
  return v !== undefined && v in CATEGORY_LABELS;
}
