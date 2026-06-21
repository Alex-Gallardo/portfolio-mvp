import { prisma } from "@/lib/prisma";
import { getBranding } from "@/features/settings/queries";
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Recurso gratis";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [resource, branding] = await Promise.all([
    prisma.resource.findUnique({ where: { slug }, select: { title: true } }),
    getBranding(),
  ]);
  return renderOgImage({
    title: resource?.title ?? "Recurso",
    label: "Recurso gratis",
    brand: branding.name,
  });
}
