"use client";

import { useState } from "react";
import { AdminForm } from "@/features/admin/AdminForm/AdminForm";
import { FileRepeater } from "@/features/admin/FileRepeater/FileRepeater";
import { type FileItem } from "@/features/admin/FileRepeater/types";
import { type ActionResult } from "@/features/admin/types";
import { postSchema, postFields, postDefaults, type PostFormValues } from "./schema";

export function PostForm({
  defaultValues = postDefaults,
  initialFiles = [],
  action,
  submitLabel = "Guardar",
}: {
  defaultValues?: PostFormValues;
  initialFiles?: FileItem[];
  action: (values: PostFormValues & { files: FileItem[] }) => Promise<ActionResult>;
  submitLabel?: string;
}) {
  const [files, setFiles] = useState<FileItem[]>(initialFiles);

  const handleAction = (values: PostFormValues) => action({ ...values, files });

  return (
    <AdminForm
      schema={postSchema}
      fields={postFields}
      defaultValues={defaultValues}
      action={handleAction}
      submitLabel={submitLabel}
    >
      <div>
        <strong>Archivos descargables (opcional)</strong>
        <FileRepeater bucket="media" prefix="posts" items={files} onChange={setFiles} />
      </div>
    </AdminForm>
  );
}
