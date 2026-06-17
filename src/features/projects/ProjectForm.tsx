"use client";

import { useState } from "react";
import { AdminForm } from "@/features/admin/AdminForm/AdminForm";
import { FileRepeater } from "@/features/admin/FileRepeater/FileRepeater";
import { type FileItem } from "@/features/admin/FileRepeater/types";
import { type ActionResult } from "@/features/admin/types";
import { projectSchema, projectFields, projectDefaults, type ProjectFormValues } from "./schema";

export function ProjectForm({
  defaultValues = projectDefaults,
  initialImages = [],
  action,
  submitLabel = "Guardar",
}: {
  defaultValues?: ProjectFormValues;
  initialImages?: FileItem[];
  action: (values: ProjectFormValues & { images: FileItem[] }) => Promise<ActionResult>;
  submitLabel?: string;
}) {
  const [images, setImages] = useState<FileItem[]>(initialImages);
  const handleAction = (values: ProjectFormValues) => action({ ...values, images });

  return (
    <AdminForm
      schema={projectSchema}
      fields={projectFields}
      defaultValues={defaultValues}
      action={handleAction}
      submitLabel={submitLabel}
    >
      <div>
        <strong>Galería (imágenes ilimitadas)</strong>
        <p style={{ fontSize: "var(--fs-sm)", color: "var(--fg-muted)" }}>
          La etiqueta de cada imagen se usa como texto alternativo (alt).
        </p>
        <FileRepeater
          bucket="media"
          prefix="proyectos"
          accept="image/*"
          items={images}
          onChange={setImages}
          addLabel="➕ Agregar otra imagen"
        />
      </div>
    </AdminForm>
  );
}
