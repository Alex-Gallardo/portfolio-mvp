"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { type ActionResult, type ColumnConfig } from "../types";
import styles from "./AdminTable.module.css";

type WithId = { id: string };

interface AdminTableProps<T extends WithId> {
  rows: T[];
  columns: ColumnConfig<T>[];
  editHref: (row: T) => string;
  onDelete: (id: string) => Promise<ActionResult>;
  emptyMessage?: string;
}

export function AdminTable<T extends WithId>({
  rows,
  columns,
  editHref,
  onDelete,
  emptyMessage = "Sin registros todavía.",
}: AdminTableProps<T>) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (rows.length === 0) {
    return <p className={styles.empty}>{emptyMessage}</p>;
  }

  function handleDelete(id: string) {
    if (!window.confirm("¿Eliminar este registro? No se puede deshacer.")) return;
    setError(null);
    startTransition(async () => {
      const res = await onDelete(id);
      if (!res.ok) setError(res.error);
    });
  }

  return (
    <div className={styles.wrap}>
      {error ? <p className={styles.error}>{error}</p> : null}
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={styles.th}>
                {c.label}
              </th>
            ))}
            <th className={styles.th}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className={styles.tr}>
              {columns.map((c) => (
                <td key={c.key} className={styles.td} data-label={c.label}>
                  {c.render ? c.render(row) : String(row[c.key] ?? "")}
                </td>
              ))}
              <td className={styles.td} data-label="Acciones">
                <Link href={editHref(row)} className={styles.action}>
                  Editar
                </Link>
                <button
                  type="button"
                  className={styles.actionDanger}
                  onClick={() => handleDelete(row.id)}
                  disabled={pending}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
