import { type Service } from "@prisma/client";
import { type ColumnConfig } from "@/features/admin/types";

const STATUS: Record<Service["status"], string> = {
  DRAFT: "Borrador",
  PUBLISHED: "Publicado",
  ARCHIVED: "Archivado",
};

export const serviceColumns: ColumnConfig<Service>[] = [
  { key: "title", label: "Título" },
  {
    key: "priceFrom",
    label: "Precio desde",
    render: (s) => <span>{s.priceFrom ? `$${s.priceFrom.toString()}` : "—"}</span>,
  },
  { key: "status", label: "Estado", render: (s) => <span>{STATUS[s.status]}</span> },
  { key: "order", label: "Orden" },
];
