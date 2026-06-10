import { type Post } from "@prisma/client";
import { type ColumnConfig } from "@/features/admin/types";

const STATUS: Record<Post["status"], string> = {
  DRAFT: "Borrador",
  PUBLISHED: "Publicado",
  ARCHIVED: "Archivado",
};

export const postColumns: ColumnConfig<Post>[] = [
  { key: "title", label: "Título" },
  { key: "status", label: "Estado", render: (p) => <span>{STATUS[p.status]}</span> },
  {
    key: "createdAt",
    label: "Creado",
    render: (p) => new Date(p.createdAt).toLocaleDateString("es"),
  },
];
