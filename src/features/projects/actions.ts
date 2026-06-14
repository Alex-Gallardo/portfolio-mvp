"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { runValidated } from "@/features/admin/crud";
import { type ActionResult } from "@/features/admin/types";
import { projectFullSchema, type ProjectFullValues } from "./schema";

const REVALIDATE = ["/admin/proyectos", "/proyectos"];

function toData(v: ProjectFullValues) {
  return {
    title: v.title,
    slug: v.slug,
    summary: v.summary,
    content: v.content,
    coverUrl: v.coverUrl || null,
    liveUrl: v.liveUrl || null,
    repoUrl: v.repoUrl || null,
    stack: v.stack
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    featured: v.featured,
    status: v.status,
    order: v.order,
  };
}

export async function createProject(raw: unknown): Promise<ActionResult> {
  const res = await runValidated(
    projectFullSchema,
    raw,
    async (data) => {
      await prisma.project.create({
        data: {
          ...toData(data),
          images: {
            create: data.images.map((img, index) => ({
              url: img.storagePath, // guardamos el path; la URL pública se deriva al renderizar
              alt: img.label || null,
              order: index,
            })),
          },
        },
      });
    },
    REVALIDATE,
  );
  if (!res.ok) return res;
  redirect("/admin/proyectos");
}

export async function updateProject(id: string, raw: unknown): Promise<ActionResult> {
  const res = await runValidated(
    projectFullSchema,
    raw,
    async (data) => {
      const existing = await prisma.projectImage.findMany({
        where: { projectId: id },
        select: { id: true },
      });
      const existingIds = new Set(existing.map((i) => i.id));
      const incomingIds = new Set(data.images.map((i) => i.id));
      const toDelete = [...existingIds].filter((iid) => !incomingIds.has(iid));

      await prisma.$transaction([
        prisma.project.update({ where: { id }, data: toData(data) }),
        ...toDelete.map((iid) => prisma.projectImage.delete({ where: { id: iid } })),
        ...data.images.map((img, index) =>
          existingIds.has(img.id)
            ? prisma.projectImage.update({
                where: { id: img.id },
                data: { url: img.storagePath, alt: img.label || null, order: index },
              })
            : prisma.projectImage.create({
                data: {
                  projectId: id,
                  url: img.storagePath,
                  alt: img.label || null,
                  order: index,
                },
              }),
        ),
      ]);
    },
    REVALIDATE,
  );
  if (!res.ok) return res;
  redirect("/admin/proyectos");
}

export async function deleteProject(id: string): Promise<ActionResult> {
  try {
    await prisma.project.delete({ where: { id } });
    REVALIDATE.forEach((p) => revalidatePath(p));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "No se pudo eliminar" };
  }
}
