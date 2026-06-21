// src/lib/seo.ts
import type { Metadata } from "next";
import { getSeo } from "@/features/settings/queries";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export function absoluteUrl(path = "/"): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return new URL(path, SITE_URL).toString();
}

type BuildMetadataInput = {
  title?: string;
  description?: string;
  path?: string;
  image?: string | null;
  type?: "website" | "article";
  noIndex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  /** La ruta tiene opengraph-image.tsx (OG generada): no emitimos og:image aquí. */
  hasDynamicOgImage?: boolean;
};

export async function buildMetadata(input: BuildMetadataInput = {}): Promise<Metadata> {
  // getSeo() siempre devuelve un Seo completo (fusionado con DEFAULT_SEO).
  const seo = await getSeo();

  const titleBase = seo.titleBase?.trim() || "Portfolio MVP";
  const description =
    input.description ??
    (seo.description?.trim() || "Desarrollo, diseño y SEO técnico para que tu marca destaque.");

  const url = absoluteUrl(input.path ?? "/");
  const ogSource = input.hasDynamicOgImage ? null : (input.image ?? (seo.ogImage?.trim() || null));
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

type Json = Record<string, unknown>;

export function breadcrumbJsonLd(items: { name: string; path: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

export function blogPostingJsonLd(opts: {
  title: string;
  description?: string;
  path: string;
  image?: string | null;
  authorName?: string | null;
  datePublished?: string;
  dateModified?: string;
}): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: opts.title,
    mainEntityOfPage: absoluteUrl(opts.path),
    ...(opts.description ? { description: opts.description } : {}),
    ...(opts.image ? { image: absoluteUrl(opts.image) } : {}),
    ...(opts.authorName ? { author: { "@type": "Person", name: opts.authorName } } : {}),
    ...(opts.datePublished ? { datePublished: opts.datePublished } : {}),
    ...(opts.dateModified ? { dateModified: opts.dateModified } : {}),
  };
}

export function serviceJsonLd(opts: { name: string; description?: string; path: string }): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: opts.name,
    serviceType: opts.name,
    url: absoluteUrl(opts.path),
    ...(opts.description ? { description: opts.description } : {}),
  };
}

export function creativeWorkJsonLd(opts: {
  type?: "CreativeWork" | "SoftwareApplication" | "LearningResource";
  name: string;
  description?: string;
  path: string;
  image?: string | null;
}): Json {
  return {
    "@context": "https://schema.org",
    "@type": opts.type ?? "CreativeWork",
    name: opts.name,
    url: absoluteUrl(opts.path),
    ...(opts.description ? { description: opts.description } : {}),
    ...(opts.image ? { image: absoluteUrl(opts.image) } : {}),
  };
}

export function personJsonLd(opts: {
  name: string;
  url?: string;
  jobTitle?: string;
  sameAs?: string[];
}): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: opts.name,
    url: opts.url ?? SITE_URL,
    ...(opts.jobTitle ? { jobTitle: opts.jobTitle } : {}),
    ...(opts.sameAs && opts.sameAs.length ? { sameAs: opts.sameAs } : {}),
  };
}

export function websiteJsonLd(opts: { name: string; url?: string }): Json {
  const url = opts.url ?? SITE_URL;
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: opts.name,
    url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${url}/blog?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}
