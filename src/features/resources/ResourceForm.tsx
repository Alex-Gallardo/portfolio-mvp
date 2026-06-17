"use client";

import { useState } from "react";
import { AdminForm } from "@/features/admin/AdminForm/AdminForm";
import { FileRepeater } from "@/features/admin/FileRepeater/FileRepeater";
import { type FileItem } from "@/features/admin/FileRepeater/types";
import { type ActionResult } from "@/features/admin/types";
import {
  resourceScalarSchema,
  resourceFields,
  resourceScalarDefaults,
  type ResourceScalarValues,
} from "./schema";

interface ResourceFormProps {
  defaultValues?: ResourceScalarValues;
  initialFiles?: FileItem[];
  action: (payload: ResourceScalarValues & { files: FileItem[] }) => Promise<ActionResult>;
  submitLabel?: string;
}

export function ResourceForm({
  defaultValues = resourceScalarDefaults,
  initialFiles = [],
  action,
  submitLabel = "Guardar",
}: ResourceFormProps) {
  const [files, setFiles] = useState<FileItem[]>(initialFiles);

  const handleAction = (values: ResourceScalarValues) => action({ ...values, files });

  return (
    <AdminForm
      schema={resourceScalarSchema}
      fields={resourceFields}
      defaultValues={defaultValues}
      action={handleAction}
      submitLabel={submitLabel}
    >
      <div>
        <strong>Archivos descargables</strong>
        <FileRepeater bucket="files" prefix="recursos" items={files} onChange={setFiles} />
      </div>
    </AdminForm>
  );
}
