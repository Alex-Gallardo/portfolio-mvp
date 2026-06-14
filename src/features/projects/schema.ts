import { z } from "zod";
import { type Project, type ProjectImage } from "@prisma/client";
import { type FieldConfig } from "@/features/admin/types";
import { type FileItem } from "@/features/admin/FileRepeater/types";

// --- Escalares (validados en cliente por AdminForm) ---
export const projectSchema = z.object({
  title: z.string().min(1, "El título es obligatorio"),
  slug: z
    .string()
    .min(1, "El slug es obligatorio")
    .regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
  summary: z.string().min(1, "El resumen es obligatorio"),
  content: z.string().min(1, "El contenido es obligatorio"),
  coverUrl: z.string(),
  liveUrl: z.string(),
  repoUrl: z.string(),
  stack: z.string(), // separado por comas, como tags/features
  featured: z.boolean(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  order: z.coerce.number().int().min(0),
});
export type ProjectFormValues = z.infer<typeof projectSchema>;

// --- Imagen individual (mismo shape que FileItem; la "label" será el alt) ---
const imageItemSchema = z.object({
  id: z.string(),
  label: z.string().min(1, "Cada imagen necesita un texto alternativo (alt)"),
  storagePath: z.string().min(1, "Falta subir una imagen en alguna fila"),
  fileName: z.string(),
  mimeType: z.string(),
  sizeBytes: z.number(),
});

// --- Payload completo (servidor). Galería OPCIONAL (un proyecto puede ir solo con portada). ---
export const projectFullSchema = projectSchema.extend({
  images: z.array(imageItemSchema),
});
export type ProjectFullValues = z.infer<typeof projectFullSchema>;

export const projectDefaults: ProjectFormValues = {
  title: "",
  slug: "",
  summary: "",
  content: "",
  coverUrl: "",
  liveUrl: "",
  repoUrl: "",
  stack: "",
  featured: false,
  status: "PUBLISHED", // Project nace publicado por defecto (Prisma default)
  order: 0,
};

export function toFormValues(p: Project): ProjectFormValues {
  return {
    title: p.title,
    slug: p.slug,
    summary: p.summary,
    content: p.content,
    coverUrl: p.coverUrl ?? "",
    liveUrl: p.liveUrl ?? "",
    repoUrl: p.repoUrl ?? "",
    stack: p.stack.join(", "),
    featured: p.featured,
    status: p.status,
    order: p.order,
  };
}

// ProjectImage → FileItem para precargar el FileRepeater al editar.
// url guarda el storagePath; alt → label; fileName lo sacamos del path para que la fila no salga vacía.
export function toImageItems(images: ProjectImage[]): FileItem[] {
  return images.map((img) => ({
    id: img.id,
    label: img.alt ?? "",
    storagePath: img.url,
    fileName: img.url.split("/").pop() ?? "",
    mimeType: "",
    sizeBytes: 0,
  }));
}

export const projectFields: FieldConfig<ProjectFormValues>[] = [
  { name: "title", label: "Título", type: "text", required: true },
  { name: "slug", label: "Slug", type: "text", required: true, placeholder: "mi-proyecto" },
  { name: "summary", label: "Resumen corto", type: "textarea", required: true },
  { name: "content", label: "Contenido (Markdown)", type: "textarea", required: true },
  { name: "coverUrl", label: "URL de portada", type: "text", placeholder: "https://…" },
  { name: "liveUrl", label: "URL del demo (opcional)", type: "text", placeholder: "https://…" },
  {
    name: "repoUrl",
    label: "URL del repo (opcional)",
    type: "text",
    placeholder: "https://github.com/…",
  },
  {
    name: "stack",
    label: "Stack (separado por coma)",
    type: "text",
    placeholder: "Next.js, Prisma, Supabase",
  },
  { name: "featured", label: "Destacado", type: "checkbox" },
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
  { name: "order", label: "Orden", type: "number" },
];
