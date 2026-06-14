import { z } from "zod";
import { type Service, type ServiceAttachment } from "@prisma/client";
import { type FieldConfig } from "@/features/admin/types";
import { type FileItem } from "@/features/admin/FileRepeater/types";

// --- Escalares (validados en cliente por AdminForm) ---
export const serviceSchema = z.object({
  title: z.string().min(1, "El título es obligatorio"),
  slug: z
    .string()
    .min(1, "El slug es obligatorio")
    .regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
  summary: z.string().min(1, "El resumen es obligatorio"),
  content: z.string().min(1, "El contenido es obligatorio"),
  icon: z.string(),
  // priceFrom como string: permite vacío. Prisma convierte el string a Decimal al guardar.
  priceFrom: z
    .string()
    .refine((v) => v === "" || /^\d+(\.\d{1,2})?$/.test(v), "Precio inválido (ej. 1200 o 1200.50)"),
  features: z.string(), // separado por comas, como los tags
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  order: z.coerce.number().int().min(0),
});
export type ServiceFormValues = z.infer<typeof serviceSchema>;

// --- Archivo individual (adjuntos OPCIONALES, mismo shape que PostAttachment) ---
const attachmentItemSchema = z.object({
  id: z.string(),
  label: z.string().min(1, "Cada archivo necesita una etiqueta"),
  storagePath: z.string().min(1, "Falta subir un archivo en alguna fila"),
  fileName: z.string(),
  mimeType: z.string(),
  sizeBytes: z.number(),
});

// --- Payload completo (servidor) ---
export const serviceFullSchema = serviceSchema.extend({
  files: z.array(attachmentItemSchema),
});
export type ServiceFullValues = z.infer<typeof serviceFullSchema>;

export const serviceDefaults: ServiceFormValues = {
  title: "",
  slug: "",
  summary: "",
  content: "",
  icon: "",
  priceFrom: "",
  features: "",
  status: "PUBLISHED", // Service nace publicado por defecto (ver schema Prisma)
  order: 0,
};

export function toFormValues(s: Service): ServiceFormValues {
  return {
    title: s.title,
    slug: s.slug,
    summary: s.summary,
    content: s.content,
    icon: s.icon ?? "",
    priceFrom: s.priceFrom?.toString() ?? "", // Decimal | null → string
    features: s.features.join(", "),
    status: s.status,
    order: s.order,
  };
}

export function toAttachmentItems(attachments: ServiceAttachment[]): FileItem[] {
  return attachments.map((a) => ({
    id: a.id,
    label: a.label,
    storagePath: a.storagePath,
    fileName: a.fileName,
    mimeType: "",
    sizeBytes: 0,
  }));
}

export const serviceFields: FieldConfig<ServiceFormValues>[] = [
  { name: "title", label: "Título", type: "text", required: true },
  { name: "slug", label: "Slug", type: "text", required: true, placeholder: "desarrollo-web" },
  { name: "summary", label: "Resumen corto", type: "textarea", required: true },
  { name: "content", label: "Contenido (Markdown)", type: "textarea", required: true },
  { name: "icon", label: "Icono (emoji o nombre)", type: "text", placeholder: "🛠️" },
  { name: "priceFrom", label: "Precio desde (opcional)", type: "text", placeholder: "1200" },
  {
    name: "features",
    label: "Características (separadas por coma)",
    type: "text",
    placeholder: "SSR, SEO, Analítica",
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
  { name: "order", label: "Orden", type: "number" },
];
