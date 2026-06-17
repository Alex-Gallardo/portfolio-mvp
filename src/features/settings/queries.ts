import { prisma } from "@/lib/prisma";
import {
  type Branding,
  DEFAULT_BRANDING,
  type Social,
  DEFAULT_SOCIAL,
  type CopiesHome,
  DEFAULT_COPIES_HOME,
  type Seo,
  DEFAULT_SEO,
  type NavItem,
  DEFAULT_NAV,
} from "./types";

/** Lee un setting "plano" (objeto de strings) y lo fusiona con el default. */
async function readFlat<T extends object>(key: string, fallback: T): Promise<T> {
  const s = await prisma.siteSetting.findUnique({ where: { key } });
  if (!s || typeof s.value !== "object" || s.value === null || Array.isArray(s.value)) {
    return fallback;
  }
  return { ...fallback, ...(s.value as object) } as T;
}

export const getBranding = () => readFlat<Branding>("branding", DEFAULT_BRANDING);
export const getSocial = () => readFlat<Social>("social", DEFAULT_SOCIAL);
export const getCopiesHome = () => readFlat<CopiesHome>("copies.home", DEFAULT_COPIES_HOME);
export const getSeo = () => readFlat<Seo>("seo", DEFAULT_SEO);

export async function getNavigation(): Promise<NavItem[]> {
  const s = await prisma.siteSetting.findUnique({ where: { key: "navigation" } });
  const value = s?.value as { items?: unknown } | null;
  const items = value?.items;
  return Array.isArray(items) ? (items as NavItem[]) : DEFAULT_NAV;
}
