import { type ContentStatus } from "@prisma/client";
import { type ColumnConfig } from "@/features/admin/types";

// Tipo plano y serializable para la tabla (sin Decimal).
export interface ServiceRow {
  id: string;
  title: string;
  slug: string;
  status: ContentStatus;
  order: number;
  priceFrom: string | null;
}

const STATUS: Record<ContentStatus, string> = {
  DRAFT: "Borrador",
  PUBLISHED: "Publicado",
  ARCHIVED: "Archivado",
};

export const serviceColumns: ColumnConfig<ServiceRow>[] = [
  { key: "title", label: "Título" },
  {
    key: "priceFrom",
    label: "Precio desde",
    render: (s) => <span>{s.priceFrom ? `$${s.priceFrom}` : "—"}</span>,
  },
  { key: "status", label: "Estado", render: (s) => <span>{STATUS[s.status]}</span> },
  { key: "order", label: "Orden" },
];
