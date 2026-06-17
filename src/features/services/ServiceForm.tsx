"use client";

import { useState } from "react";
import { AdminForm } from "@/features/admin/AdminForm/AdminForm";
import { FileRepeater } from "@/features/admin/FileRepeater/FileRepeater";
import { type FileItem } from "@/features/admin/FileRepeater/types";
import { type ActionResult } from "@/features/admin/types";
import { serviceSchema, serviceFields, serviceDefaults, type ServiceFormValues } from "./schema";

export function ServiceForm({
  defaultValues = serviceDefaults,
  initialFiles = [],
  action,
  submitLabel = "Guardar",
}: {
  defaultValues?: ServiceFormValues;
  initialFiles?: FileItem[];
  action: (values: ServiceFormValues & { files: FileItem[] }) => Promise<ActionResult>;
  submitLabel?: string;
}) {
  const [files, setFiles] = useState<FileItem[]>(initialFiles);
  const handleAction = (values: ServiceFormValues) => action({ ...values, files });

  return (
    <AdminForm
      schema={serviceSchema}
      fields={serviceFields}
      defaultValues={defaultValues}
      action={handleAction}
      submitLabel={submitLabel}
    >
      <div>
        <strong>Adjuntos (opcional: briefs, ejemplos…)</strong>
        <FileRepeater bucket="media" prefix="servicios" items={files} onChange={setFiles} />
      </div>
    </AdminForm>
  );
}
