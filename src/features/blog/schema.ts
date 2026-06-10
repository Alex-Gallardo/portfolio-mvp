import { z } from "zod";
import { type Post } from "@prisma/client";
import { type FieldConfig } from "@/features/admin/types";

export const postSchema = z.object({
  title: z.string().min(1, "El título es obligatorio"),
  slug: z
    .string()
    .min(1, "El slug es obligatorio")
    .regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
  excerpt: z.string().max(300, "Máximo 300 caracteres"),
  content: z.string().min(1, "El contenido es obligatorio"),
  coverUrl: z.string(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  tags: z.string(),
  readMinutes: z.coerce.number().int().min(1, "Mínimo 1 minuto").max(60, "Máximo 60"),
});

export type PostFormValues = z.infer<typeof postSchema>;

export const postDefaults: PostFormValues = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverUrl: "",
  status: "DRAFT",
  tags: "",
  readMinutes: 3,
};

// Convierte un Post de la DB al shape del formulario (array de tags → string, etc.)
export function toFormValues(post: Post): PostFormValues {
  return {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? "",
    content: post.content,
    coverUrl: post.coverUrl ?? "",
    status: post.status,
    tags: post.tags.join(", "),
    readMinutes: post.readMinutes ?? 3,
  };
}

export const postFields: FieldConfig<PostFormValues>[] = [
  { name: "title", label: "Título", type: "text", required: true },
  { name: "slug", label: "Slug", type: "text", required: true, placeholder: "mi-articulo" },
  { name: "excerpt", label: "Extracto", type: "textarea", placeholder: "Resumen corto…" },
  { name: "content", label: "Contenido (Markdown)", type: "textarea", required: true },
  { name: "coverUrl", label: "URL de portada", type: "text", placeholder: "https://…" },
  {
    name: "status",
    label: "Estado",
    type: "select",
    required: true,
    options: [
      { value: "DRAFT", label: "Borrador" },
      { value: "PUBLISHED", label: "Publicado" },
      { value: "ARCHIVED", label: "Archivado" },
    ],
  },
  { name: "tags", label: "Tags (separados por coma)", type: "text", placeholder: "nextjs, seo" },
  { name: "readMinutes", label: "Minutos de lectura", type: "number" },
];
