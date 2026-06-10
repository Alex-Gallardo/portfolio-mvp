"use client";

import { AdminTable } from "@/features/admin/AdminTable/AdminTable";
import { type ActionResult } from "@/features/admin/types";
import { type Post } from "@prisma/client";
import { postColumns } from "./columns";

export function PostsTable({
  rows,
  onDelete,
}: {
  rows: Post[];
  onDelete: (id: string) => Promise<ActionResult>;
}) {
  return (
    <AdminTable
      rows={rows}
      columns={postColumns}
      editHref={(p) => `/admin/posts/${p.id}/edit`}
      onDelete={onDelete}
    />
  );
}
