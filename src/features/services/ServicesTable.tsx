"use client";

import { AdminTable } from "@/features/admin/AdminTable/AdminTable";
import { type ActionResult } from "@/features/admin/types";
import { serviceColumns, type ServiceRow } from "./columns";

export function ServicesTable({
  rows,
  onDelete,
}: {
  rows: ServiceRow[];
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
