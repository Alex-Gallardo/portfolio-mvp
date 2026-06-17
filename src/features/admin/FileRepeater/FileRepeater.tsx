"use client";

import { useState } from "react";
import { type BucketName, removeFile } from "@/lib/supabase/storage";
import { FileRow } from "./FileRow";
import { type FileItem } from "./types";
import styles from "./FileRepeater.module.css";

interface FileRepeaterProps {
  bucket: BucketName;
  items: FileItem[];
  onChange: (items: FileItem[]) => void;
  prefix?: string;
  accept?: string;
  addLabel?: string;
}

export function FileRepeater({
  bucket,
  items,
  onChange,
  prefix,
  accept,
  addLabel = "➕ Agregar otro archivo",
}: FileRepeaterProps) {
  const [error, setError] = useState<string | null>(null);

  function add() {
    onChange([
      ...items,
      {
        id: crypto.randomUUID(),
        label: "",
        storagePath: "",
        fileName: "",
        mimeType: "",
        sizeBytes: 0,
      },
    ]);
  }

  function update(index: number, patch: Partial<FileItem>) {
    onChange(items.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }

  async function remove(index: number) {
    const item = items[index];
    setError(null);
    // Si ya estaba subido, lo borramos también de Storage (no dejar huérfanos).
    if (item?.storagePath) {
      try {
        await removeFile(bucket, item.storagePath);
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo borrar el archivo del storage");
        return;
      }
    }
    onChange(items.filter((_, i) => i !== index));
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    const a = next[index];
    const b = next[target];
    if (!a || !b) return;
    next[index] = b;
    next[target] = a;
    onChange(next);
  }

  return (
    <div className={styles.repeater}>
      {error ? <p className={styles.error}>{error}</p> : null}

      {items.length === 0 ? (
        <p className={styles.empty}>No hay archivos todavía.</p>
      ) : (
        <ul className={styles.list}>
          {items.map((item, i) => (
            <FileRow
              key={item.id}
              item={item}
              bucket={bucket}
              prefix={prefix}
              accept={accept}
              isFirst={i === 0}
              isLast={i === items.length - 1}
              onChange={(patch) => update(i, patch)}
              onRemove={() => remove(i)}
              onMoveUp={() => move(i, -1)}
              onMoveDown={() => move(i, 1)}
            />
          ))}
        </ul>
      )}

      <button type="button" className={styles.addBtn} onClick={add}>
        {addLabel}
      </button>
    </div>
  );
}
