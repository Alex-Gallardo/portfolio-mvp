"use client";

import { useState } from "react";
import {
  useForm,
  type DefaultValues,
  type FieldValues,
  type Path,
  type Resolver,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type ZodType } from "zod";
import { type ActionResult, type FieldConfig } from "../types";
import styles from "./AdminForm.module.css";

interface AdminFormProps<T extends FieldValues> {
  schema: ZodType<T>;
  fields: FieldConfig<T>[];
  defaultValues: DefaultValues<T>;
  action: (values: T) => Promise<ActionResult>;
  submitLabel?: string;
}

export function AdminForm<T extends FieldValues>({
  schema,
  fields,
  defaultValues,
  action,
  submitLabel = "Guardar",
}: AdminFormProps<T>) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<T>({
    // Casteo necesario: el resolver no acepta un schema genérico tal cual.
    resolver: zodResolver(schema as ZodType<T, FieldValues>) as Resolver<T>,
    defaultValues,
  });

  const onSubmit = handleSubmit(async (values) => {
    const res = await action(values as T);
    if (res && !res.ok) setServerError(res.error);
  });

  return (
    <form onSubmit={onSubmit} className={styles.form} noValidate>
      {fields.map((field) => {
        const name = field.name as Path<T>;
        const error = errors[name]?.message as string | undefined;
        return (
          <div key={field.name} className={styles.field}>
            <label htmlFor={field.name} className={styles.label}>
              {field.label}
              {field.required ? <span aria-hidden="true"> *</span> : null}
            </label>

            {field.type === "textarea" ? (
              <textarea
                id={field.name}
                className={styles.input}
                rows={6}
                placeholder={field.placeholder}
                {...register(name)}
              />
            ) : field.type === "select" ? (
              <select id={field.name} className={styles.input} {...register(name)}>
                {field.options?.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : field.type === "checkbox" ? (
              <input
                id={field.name}
                type="checkbox"
                className={styles.checkbox}
                {...register(name)}
              />
            ) : (
              <input
                id={field.name}
                type={field.type === "number" ? "number" : "text"}
                className={styles.input}
                placeholder={field.placeholder}
                {...register(name)}
              />
            )}

            {error ? <p className={styles.error}>{error}</p> : null}
          </div>
        );
      })}

      {serverError ? <p className={styles.error}>{serverError}</p> : null}

      <button type="submit" className={styles.submit} disabled={isSubmitting}>
        {isSubmitting ? "Guardando…" : submitLabel}
      </button>
    </form>
  );
}
