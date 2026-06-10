"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { runValidated } from "@/features/admin/crud";
import { type ActionResult } from "@/features/admin/types";
import { postSchema, type PostFormValues } from "./schema";

const REVALIDATE = ["/admin/posts", "/blog"];

function toData(v: PostFormValues) {
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
    postSchema,
    raw,
    async (data) => {
      await prisma.post.create({ data: toData(data) });
    },
    REVALIDATE,
  );
  if (!res.ok) return res;
  redirect("/admin/posts"); // fuera del try/catch: redirect() lanza una señal especial
}

export async function updatePost(id: string, raw: unknown): Promise<ActionResult> {
  const res = await runValidated(
    postSchema,
    raw,
    async (data) => {
      await prisma.post.update({ where: { id }, data: toData(data) });
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
