"use client";

import { AdminTable } from "@/features/admin/AdminTable/AdminTable";
import { type ActionResult } from "@/features/admin/types";
import { type Project } from "@prisma/client";
import { projectColumns } from "./columns";

export function ProjectsTable({
  rows,
  onDelete,
}: {
  rows: Project[];
  onDelete: (id: string) => Promise<ActionResult>;
}) {
  return (
    <AdminTable
      rows={rows}
      columns={projectColumns}
      editHref={(p) => `/admin/proyectos/${p.id}/edit`}
      onDelete={onDelete}
    />
  );
}
