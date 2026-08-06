import { prisma } from "@/lib/prisma";
import { withPublicDatabaseFallback } from "@/lib/prisma-fallback";
import { type ContentMap, type SectionConfigItem } from "./types";

/** Bloques de texto de una página, indexados por su `key`. */
export async function getContentBlocks(page: string): Promise<ContentMap> {
  const blocks = await withPublicDatabaseFallback(
    () =>
      prisma.contentBlock.findMany({
        where: { page },
        orderBy: { order: "asc" },
      }),
    [],
  );

  const map: ContentMap = {};
  for (const b of blocks) {
    map[b.key] = {
      key: b.key,
      title: b.title,
      body: b.body,
      visible: b.visible,
      order: b.order,
    };
  }
  return map;
}

/** Config de orden/visibilidad de secciones desde site_settings["sections.{page}"]. */
export async function getSectionsConfig(page: string): Promise<SectionConfigItem[] | null> {
  const setting = await withPublicDatabaseFallback(
    () =>
      prisma.siteSetting.findUnique({
        where: { key: `sections.${page}` },
      }),
    null,
  );
  if (!setting || !Array.isArray(setting.value)) return null;
  return setting.value as unknown as SectionConfigItem[];
}
