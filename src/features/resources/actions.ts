"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { runValidated } from "@/features/admin/crud";
import { type ActionResult } from "@/features/admin/types";
import { resourceSchema, type ResourceFullValues } from "./schema";

const REVALIDATE = ["/admin/recursos", "/recursos"];

function toResourceData(v: ResourceFullValues) {
  return {
    title: v.title,
    slug: v.slug,
    summary: v.summary,
    content: v.content,
    coverUrl: v.coverUrl || null,
    category: v.category,
    status: v.status,
    featured: v.featured,
    requireEmail: v.requireEmail,
    order: v.order,
  };
}

export async function createResource(raw: unknown): Promise<ActionResult> {
  const res = await runValidated(
    resourceSchema,
    raw,
    async (data) => {
      await prisma.resource.create({
        data: {
          ...toResourceData(data),
          files: {
            create: data.files.map((f, index) => ({
              label: f.label,
              storagePath: f.storagePath,
              fileName: f.fileName,
              mimeType: f.mimeType || null,
              sizeBytes: f.sizeBytes || null,
              order: index,
            })),
          },
        },
      });
    },
    REVALIDATE,
  );
  if (!res.ok) return res;
  redirect("/admin/recursos");
}

export async function updateResource(id: string, raw: unknown): Promise<ActionResult> {
  const res = await runValidated(
    resourceSchema,
    raw,
    async (data) => {
      const existing = await prisma.resourceFile.findMany({
        where: { resourceId: id },
        select: { id: true },
      });
      const existingIds = new Set(existing.map((f) => f.id));
      const incomingIds = new Set(data.files.map((f) => f.id));
      const toDelete = [...existingIds].filter((fid) => !incomingIds.has(fid));

      await prisma.$transaction([
        prisma.resource.update({ where: { id }, data: toResourceData(data) }),
        ...toDelete.map((fid) => prisma.resourceFile.delete({ where: { id: fid } })),
        ...data.files.map((f, index) =>
          existingIds.has(f.id)
            ? prisma.resourceFile.update({
                where: { id: f.id },
                data: {
                  label: f.label,
                  storagePath: f.storagePath,
                  fileName: f.fileName,
                  mimeType: f.mimeType || null,
                  sizeBytes: f.sizeBytes || null,
                  order: index,
                },
              })
            : prisma.resourceFile.create({
                data: {
                  resourceId: id,
                  label: f.label,
                  storagePath: f.storagePath,
                  fileName: f.fileName,
                  mimeType: f.mimeType || null,
                  sizeBytes: f.sizeBytes || null,
                  order: index,
                },
              }),
        ),
      ]);
    },
    REVALIDATE,
  );
  if (!res.ok) return res;
  redirect("/admin/recursos");
}

export async function deleteResource(id: string): Promise<ActionResult> {
  try {
    await prisma.resource.delete({ where: { id } });
    REVALIDATE.forEach((p) => revalidatePath(p));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "No se pudo eliminar" };
  }
}
