import { prisma } from "@/lib/prisma";
import { withPublicDatabaseFallback } from "@/lib/prisma-fallback";
import { getBranding } from "@/features/settings/queries";
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Artículo del blog";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, branding] = await Promise.all([
    withPublicDatabaseFallback(
      () => prisma.post.findUnique({ where: { slug }, select: { title: true, readMinutes: true } }),
      null,
    ),
    getBranding(),
  ]);
  return renderOgImage({
    title: post?.title ?? "Artículo",
    label: "Blog",
    brand: branding.name,
    metric: `${post?.readMinutes ?? 3} min de lectura`,
  });
}
