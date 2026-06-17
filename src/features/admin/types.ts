import { type ReactNode } from "react";

export type FieldType = "text" | "textarea" | "select" | "checkbox" | "number";

export interface FieldConfig<T> {
  name: keyof T & string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: { value: string; label: string }[]; // para select
  required?: boolean;
}

export interface ColumnConfig<T> {
  key: keyof T & string;
  label: string;
  render?: (row: T) => ReactNode; // para celdas con badges, fechas, etc.
}

export type ActionResult = { ok: true } | { ok: false; error: string };
