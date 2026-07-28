import { prisma } from "@/lib/prisma";
import { withPublicDatabaseFallback } from "@/lib/prisma-fallback";

export async function getPublishedPosts() {
  return withPublicDatabaseFallback(
    () =>
      prisma.post.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          coverUrl: true,
          tags: true,
          readMinutes: true,
          publishedAt: true,
        },
      }),
    [],
  );
}

export async function getPublishedSlugs() {
  const posts = await withPublicDatabaseFallback(
    () =>
      prisma.post.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true },
      }),
    [],
  );
  return posts.map((p) => p.slug);
}

export async function getPostBySlug(slug: string) {
  return withPublicDatabaseFallback(
    () =>
      prisma.post.findFirst({
        where: { slug, status: "PUBLISHED" },
        include: {
          attachments: { orderBy: { order: "asc" } },
          categories: true,
          author: { select: { fullName: true } },
        },
      }),
    null,
  );
}

/** Posts relacionados por categoría compartida; si no hay categorías, los más recientes. */
export async function getRelatedPosts(postId: string, categoryIds: string[], limit = 3) {
  const base = {
    status: "PUBLISHED" as const,
    id: { not: postId },
  };
  const where =
    categoryIds.length > 0 ? { ...base, categories: { some: { id: { in: categoryIds } } } } : base;

  return withPublicDatabaseFallback(
    () =>
      prisma.post.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        take: limit,
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          coverUrl: true,
          tags: true,
          readMinutes: true,
          publishedAt: true,
        },
      }),
    [],
  );
}

/** Recurso para el CTA contextual (destacado primero, luego por orden). */
export async function getFeaturedResource() {
  return withPublicDatabaseFallback(
    () =>
      prisma.resource.findFirst({
        where: { status: "PUBLISHED" },
        orderBy: [{ featured: "desc" }, { order: "asc" }],
        select: { slug: true, title: true, summary: true },
      }),
    null,
  );
}
