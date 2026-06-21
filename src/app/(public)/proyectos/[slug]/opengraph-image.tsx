import { prisma } from "@/lib/prisma";
import { getBranding } from "@/features/settings/queries";
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Proyecto";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [project, branding] = await Promise.all([
    prisma.project.findUnique({ where: { slug }, select: { title: true } }),
    getBranding(),
  ]);
  return renderOgImage({
    title: project?.title ?? "Proyecto",
    label: "Proyecto",
    brand: branding.name,
  });
}
