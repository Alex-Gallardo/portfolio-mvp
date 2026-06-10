"use client";

import { AdminForm } from "@/features/admin/AdminForm//AdminForm";
import { type ActionResult } from "@/features/admin/types";
import { postSchema, postFields, postDefaults, type PostFormValues } from "./schema";

export function PostForm({
  defaultValues = postDefaults,
  action,
  submitLabel = "Guardar",
}: {
  defaultValues?: PostFormValues;
  action: (values: PostFormValues) => Promise<ActionResult>;
  submitLabel?: string;
}) {
  return (
    <AdminForm
      schema={postSchema}
      fields={postFields}
      defaultValues={defaultValues}
      action={action}
      submitLabel={submitLabel}
    />
  );
}
