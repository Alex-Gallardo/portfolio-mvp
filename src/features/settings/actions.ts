"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { type NavItem } from "./types";
import { type SectionConfigItem } from "@/features/content/types";

async function guard() {
  if (!(await isAdmin())) throw new Error("No autorizado");
}

// Branding/nav/social/seo afectan a todo el sitio → revalida el layout público entero.
function revalidateAll() {
  revalidatePath("/", "layout");
}

export async function saveFlatSetting(key: string, value: Record<string, string>) {
  await guard();
  await prisma.siteSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
  revalidateAll();
}

export async function saveNavigation(items: NavItem[]) {
  await guard();
  const clean = items
    .map((i) => ({ label: i.label.trim(), href: i.href.trim() }))
    .filter((i) => i.label && i.href);
  await prisma.siteSetting.upsert({
    where: { key: "navigation" },
    update: { value: { items: clean } },
    create: { key: "navigation", value: { items: clean } },
  });
  revalidateAll();
}

export async function saveSections(page: string, items: SectionConfigItem[]) {
  await guard();
  const normalized = items.map((it, i) => ({
    key: it.key,
    visible: it.visible !== false,
    order: i, // el orden lo da la posición en el array
  }));
  await prisma.siteSetting.upsert({
    where: { key: `sections.${page}` },
    update: { value: normalized },
    create: { key: `sections.${page}`, value: normalized },
  });
  revalidatePath(page === "home" ? "/" : `/${page}`);
}

export async function saveContentBlock(input: {
  key: string;
  page: string;
  title: string;
  body: string;
}) {
  await guard();
  const { key, page, title, body } = input;
  await prisma.contentBlock.upsert({
    where: { key },
    update: { title: title.trim() || null, body },
    create: { key, page, title: title.trim() || null, body },
  });
  revalidatePath(page === "home" ? "/" : `/${page}`);
}
