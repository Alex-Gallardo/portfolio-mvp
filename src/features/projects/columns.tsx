import { type Project } from "@prisma/client";
import { type ColumnConfig } from "@/features/admin/types";

const STATUS: Record<Project["status"], string> = {
  DRAFT: "Borrador",
  PUBLISHED: "Publicado",
  ARCHIVED: "Archivado",
};

export const projectColumns: ColumnConfig<Project>[] = [
  { key: "title", label: "Título" },
  { key: "featured", label: "Destacado", render: (p) => <span>{p.featured ? "⭐" : "—"}</span> },
  { key: "status", label: "Estado", render: (p) => <span>{STATUS[p.status]}</span> },
  { key: "order", label: "Orden" },
];
