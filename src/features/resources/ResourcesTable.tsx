"use client";

import { AdminTable } from "@/features/admin/AdminTable/AdminTable";
import { type ActionResult } from "@/features/admin/types";
import { type Resource } from "@prisma/client";
import { resourceColumns } from "./columns";

export function ResourcesTable({
  rows,
  onDelete,
}: {
  rows: Resource[];
  onDelete: (id: string) => Promise<ActionResult>;
}) {
  return (
    <AdminTable
      rows={rows}
      columns={resourceColumns}
      editHref={(r) => `/admin/recursos/${r.id}/edit`}
      onDelete={onDelete}
    />
  );
}
