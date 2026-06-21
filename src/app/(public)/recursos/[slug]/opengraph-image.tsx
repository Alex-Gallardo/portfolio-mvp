import { prisma } from "@/lib/prisma";
import { getBranding } from "@/features/settings/queries";
import { CATEGORY_LABELS } from "@/features/resources/categories";
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Recurso gratis";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [resource, branding] = await Promise.all([
    prisma.resource.findUnique({
      where: { slug },
      select: { title: true, category: true, downloadCount: true },
    }),
    getBranding(),
  ]);
  const label = resource ? CATEGORY_LABELS[resource.category] : "Recurso gratis";
  const downloads = resource?.downloadCount ?? 0;
  return renderOgImage({
    title: resource?.title ?? "Recurso",
    label,
    brand: branding.name,
    accent: "#ff6b6b", // coral cálido de Recursos
    metric: downloads > 0 ? `${downloads.toLocaleString("es")} descargas` : "Gratis · Sin spam",
  });
}
