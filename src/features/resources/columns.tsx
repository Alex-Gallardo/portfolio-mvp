import { type Resource } from "@prisma/client";
import { type ColumnConfig } from "@/features/admin/types";

const STATUS: Record<Resource["status"], string> = {
  DRAFT: "Borrador",
  PUBLISHED: "Publicado",
  ARCHIVED: "Archivado",
};

export const resourceColumns: ColumnConfig<Resource>[] = [
  { key: "title", label: "Título" },
  { key: "category", label: "Categoría" },
  { key: "status", label: "Estado", render: (r) => STATUS[r.status] },
  { key: "downloadCount", label: "Descargas" },
];
