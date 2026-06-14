"use client";

import { AdminTable } from "@/features/admin/AdminTable/AdminTable";
import { type ActionResult } from "@/features/admin/types";
import { type Service } from "@prisma/client";
import { serviceColumns } from "./columns";

export function ServicesTable({
  rows,
  onDelete,
}: {
  rows: Service[];
  onDelete: (id: string) => Promise<ActionResult>;
}) {
  return (
    <AdminTable
      rows={rows}
      columns={serviceColumns}
      editHref={(s) => `/admin/servicios/${s.id}/edit`}
      onDelete={onDelete}
    />
  );
}
