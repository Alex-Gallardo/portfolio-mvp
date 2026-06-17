"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { runValidated } from "@/features/admin/crud";
import { type ActionResult } from "@/features/admin/types";
import { serviceFullSchema, type ServiceFullValues } from "./schema";

const REVALIDATE = ["/admin/servicios", "/servicios"];

function toData(v: ServiceFullValues) {
  return {
    title: v.title,
    slug: v.slug,
    summary: v.summary,
    content: v.content,
    icon: v.icon || null,
    priceFrom: v.priceFrom.trim() === "" ? null : v.priceFrom.trim(), // string → Decimal (Prisma)
    features: v.features
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean),
    status: v.status,
    order: v.order,
  };
}

export async function createService(raw: unknown): Promise<ActionResult> {
  const res = await runValidated(
    serviceFullSchema,
    raw,
    async (data) => {
      await prisma.service.create({
        data: {
          ...toData(data),
          attachments: {
            create: data.files.map((f, index) => ({
              label: f.label,
              storagePath: f.storagePath,
              fileName: f.fileName,
              order: index,
            })),
          },
        },
      });
    },
    REVALIDATE,
  );
  if (!res.ok) return res;
  redirect("/admin/servicios");
}

export async function updateService(id: string, raw: unknown): Promise<ActionResult> {
  const res = await runValidated(
    serviceFullSchema,
    raw,
    async (data) => {
      const existing = await prisma.serviceAttachment.findMany({
        where: { serviceId: id },
        select: { id: true },
      });
      const existingIds = new Set(existing.map((f) => f.id));
      const incomingIds = new Set(data.files.map((f) => f.id));
      const toDelete = [...existingIds].filter((fid) => !incomingIds.has(fid));

      await prisma.$transaction([
        prisma.service.update({ where: { id }, data: toData(data) }),
        ...toDelete.map((fid) => prisma.serviceAttachment.delete({ where: { id: fid } })),
        ...data.files.map((f, index) =>
          existingIds.has(f.id)
            ? prisma.serviceAttachment.update({
                where: { id: f.id },
                data: {
                  label: f.label,
                  storagePath: f.storagePath,
                  fileName: f.fileName,
                  order: index,
                },
              })
            : prisma.serviceAttachment.create({
                data: {
                  serviceId: id,
                  label: f.label,
                  storagePath: f.storagePath,
                  fileName: f.fileName,
                  order: index,
                },
              }),
        ),
      ]);
    },
    REVALIDATE,
  );
  if (!res.ok) return res;
  redirect("/admin/servicios");
}

export async function deleteService(id: string): Promise<ActionResult> {
  try {
    await prisma.service.delete({ where: { id } });
    REVALIDATE.forEach((p) => revalidatePath(p));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "No se pudo eliminar" };
  }
}
