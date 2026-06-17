// src/lib/seo.ts
import type { Metadata } from "next";
import { getSeo } from "@/features/settings/queries";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export function absoluteUrl(path = "/"): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return new URL(path, SITE_URL).toString();
}

/** Coacciona cualquier valor a string no vacío, o undefined. Blinda contra la forma de getSeo(). */
// function str(v: unknown): string | undefined {
//   return typeof v === "string" && v.trim().length > 0 ? v : undefined;
// }

type BuildMetadataInput = {
  title?: string;
  description?: string;
  path?: string;
  image?: string | null;
  type?: "website" | "article";
  noIndex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
};

export async function buildMetadata(input: BuildMetadataInput = {}): Promise<Metadata> {
  // getSeo() siempre devuelve un Seo completo (fusionado con DEFAULT_SEO).
  const seo = await getSeo();

  const titleBase = seo.titleBase?.trim() || "Portfolio MVP";
  const description =
    input.description ??
    (seo.description?.trim() || "Desarrollo, diseño y SEO técnico para que tu marca destaque.");

  const url = absoluteUrl(input.path ?? "/");
  const ogSource = input.image ?? (seo.ogImage?.trim() || null);
  const ogImage = ogSource ? absoluteUrl(ogSource) : undefined;

  const fullTitle = input.title ? `${input.title} · ${titleBase}` : titleBase;

  return {
    title: input.title,
    description,
    alternates: { canonical: url },
    robots: input.noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: titleBase,
      type: input.type ?? "website",
      locale: "es_ES",
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630 }] } : {}),
      ...(input.type === "article"
        ? { publishedTime: input.publishedTime, modifiedTime: input.modifiedTime }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}
