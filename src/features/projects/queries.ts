import { prisma } from "@/lib/prisma";

export async function getPublishedProjects() {
  return prisma.project.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ featured: "desc" }, { order: "asc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      coverUrl: true,
      stack: true,
      featured: true,
    },
  });
}

export async function getPublishedProjectSlugs() {
  const projects = await prisma.project.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
  });
  return projects.map((p) => p.slug);
}

export async function getProjectBySlug(slug: string) {
  return prisma.project.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { images: { orderBy: { order: "asc" } } },
  });
}

/** Otros proyectos publicados, excluyendo el actual (destacados primero). */
export async function getRelatedProjects(projectId: string, limit = 3) {
  return prisma.project.findMany({
    where: { status: "PUBLISHED", id: { not: projectId } },
    orderBy: [{ featured: "desc" }, { order: "asc" }],
    take: limit,
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      coverUrl: true,
      stack: true,
      featured: true,
    },
  });
}
