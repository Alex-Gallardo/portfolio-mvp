import { z } from "zod";
import { type Resource, type ResourceFile } from "@prisma/client";
import { type FieldConfig } from "@/features/admin/types";
import { type FileItem } from "@/features/admin/FileRepeater/types";

// --- Escalares (se validan en el cliente vía AdminForm) ---
export const resourceScalarSchema = z.object({
  title: z.string().min(1, "El título es obligatorio"),
  slug: z
    .string()
    .min(1, "El slug es obligatorio")
    .regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
  summary: z.string().min(1, "El resumen es obligatorio"),
  content: z.string().min(1, "La descripción es obligatoria"),
  coverUrl: z.string(),
  category: z.enum(["APPS", "WEB", "BLOCKCHAIN", "DISENO", "IA", "MARKETING", "OTRO"]),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  featured: z.boolean(),
  requireEmail: z.boolean(),
  order: z.coerce.number().int().min(0),
});
export type ResourceScalarValues = z.infer<typeof resourceScalarSchema>;

// --- Archivo individual ---
const fileItemSchema = z.object({
  id: z.string(),
  label: z.string().min(1, "Cada archivo necesita una etiqueta"),
  storagePath: z.string().min(1, "Falta subir un archivo en alguna fila"),
  fileName: z.string(),
  mimeType: z.string(),
  sizeBytes: z.number(),
});

// --- Payload completo (se valida en el servidor) ---
export const resourceSchema = resourceScalarSchema.extend({
  files: z.array(fileItemSchema).min(1, "Agrega al menos un archivo descargable"),
});
export type ResourceFullValues = z.infer<typeof resourceSchema>;

export const resourceScalarDefaults: ResourceScalarValues = {
  title: "",
  slug: "",
  summary: "",
  content: "",
  coverUrl: "",
  category: "OTRO",
  status: "DRAFT",
  featured: false,
  requireEmail: true,
  order: 0,
};

export function toScalarValues(r: Resource): ResourceScalarValues {
  return {
    title: r.title,
    slug: r.slug,
    summary: r.summary,
    content: r.content,
    coverUrl: r.coverUrl ?? "",
    category: r.category,
    status: r.status,
    featured: r.featured,
    requireEmail: r.requireEmail,
    order: r.order,
  };
}

export function toFileItems(files: ResourceFile[]): FileItem[] {
  return files.map((f) => ({
    id: f.id,
    label: f.label,
    storagePath: f.storagePath,
    fileName: f.fileName,
    mimeType: f.mimeType ?? "",
    sizeBytes: f.sizeBytes ?? 0,
  }));
}

export const resourceFields: FieldConfig<ResourceScalarValues>[] = [
  { name: "title", label: "Título", type: "text", required: true },
  { name: "slug", label: "Slug", type: "text", required: true, placeholder: "mi-recurso" },
  { name: "summary", label: "Resumen corto", type: "textarea", required: true },
  { name: "content", label: "Descripción (Markdown)", type: "textarea", required: true },
  { name: "coverUrl", label: "URL de portada", type: "text", placeholder: "https://…" },
  {
    name: "category",
    label: "Categoría",
    type: "select",
    required: true,
    options: [
      { value: "APPS", label: "Apps" },
      { value: "WEB", label: "Web" },
      { value: "BLOCKCHAIN", label: "Blockchain" },
      { value: "DISENO", label: "Diseño" },
      { value: "IA", label: "IA" },
      { value: "MARKETING", label: "Marketing" },
      { value: "OTRO", label: "Otro" },
    ],
  },
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
  { name: "featured", label: "Destacado", type: "checkbox" },
  { name: "requireEmail", label: "Pedir email antes de descargar", type: "checkbox" },
  { name: "order", label: "Orden", type: "number" },
];
