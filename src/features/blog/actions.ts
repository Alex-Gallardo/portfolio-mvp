"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { runValidated } from "@/features/admin/crud";
import { type ActionResult } from "@/features/admin/types";
import { postFullSchema, type PostFullValues } from "./schema";

const REVALIDATE = ["/admin/posts", "/blog"];

function toData(v: PostFullValues) {
  return {
    title: v.title,
    slug: v.slug,
    excerpt: v.excerpt || null,
    content: v.content,
    coverUrl: v.coverUrl || null,
    status: v.status,
    tags: v.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    readMinutes: v.readMinutes,
    publishedAt: v.status === "PUBLISHED" ? new Date() : null,
  };
}

export async function createPost(raw: unknown): Promise<ActionResult> {
  const res = await runValidated(
    postFullSchema,
    raw,
    async (data) => {
      await prisma.post.create({
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
  redirect("/admin/posts");
}

export async function updatePost(id: string, raw: unknown): Promise<ActionResult> {
  const res = await runValidated(
    postFullSchema,
    raw,
    async (data) => {
      const existing = await prisma.postAttachment.findMany({
        where: { postId: id },
        select: { id: true },
      });
      const existingIds = new Set(existing.map((f) => f.id));
      const incomingIds = new Set(data.files.map((f) => f.id));
      const toDelete = [...existingIds].filter((fid) => !incomingIds.has(fid));

      await prisma.$transaction([
        prisma.post.update({ where: { id }, data: toData(data) }),
        ...toDelete.map((fid) => prisma.postAttachment.delete({ where: { id: fid } })),
        ...data.files.map((f, index) =>
          existingIds.has(f.id)
            ? prisma.postAttachment.update({
                where: { id: f.id },
                data: {
                  label: f.label,
                  storagePath: f.storagePath,
                  fileName: f.fileName,
                  order: index,
                },
              })
            : prisma.postAttachment.create({
                data: {
                  postId: id,
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
  redirect("/admin/posts");
}

export async function deletePost(id: string): Promise<ActionResult> {
  try {
    await prisma.post.delete({ where: { id } });
    REVALIDATE.forEach((p) => revalidatePath(p));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "No se pudo eliminar" };
  }
}
