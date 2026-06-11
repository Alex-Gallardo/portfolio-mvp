"use client";

import { type ChangeEvent, useState } from "react";
import { type BucketName, uploadFile } from "@/lib/supabase/storage";
import { type FileItem } from "./types";
import styles from "./FileRepeater.module.css";

type UploadState = "idle" | "uploading" | "error";

interface FileRowProps {
  item: FileItem;
  bucket: BucketName;
  prefix?: string;
  accept?: string;
  isFirst: boolean;
  isLast: boolean;
  onChange: (patch: Partial<FileItem>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

function formatSize(bytes: number): string {
  if (!bytes) return "";
  const kb = bytes / 1024;
  return kb < 1024 ? `${kb.toFixed(0)} KB` : `${(kb / 1024).toFixed(1)} MB`;
}

export function FileRow({
  item,
  bucket,
  prefix,
  accept,
  isFirst,
  isLast,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: FileRowProps) {
  const [state, setState] = useState<UploadState>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setState("uploading");
    setError(null);
    try {
      const uploaded = await uploadFile(bucket, file, prefix);
      onChange({
        storagePath: uploaded.path,
        fileName: uploaded.fileName,
        mimeType: uploaded.mimeType,
        sizeBytes: uploaded.sizeBytes,
        // si aún no hay etiqueta, sugerimos el nombre del archivo
        ...(item.label ? {} : { label: uploaded.fileName }),
      });
      setState("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir");
      setState("error");
    }
  }

  const hasFile = Boolean(item.storagePath);

  return (
    <li className={styles.row}>
      <div className={styles.reorder}>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={onMoveUp}
          disabled={isFirst}
          aria-label="Subir"
        >
          ▲
        </button>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={onMoveDown}
          disabled={isLast}
          aria-label="Bajar"
        >
          ▼
        </button>
      </div>

      <div className={styles.fields}>
        <input
          type="text"
          className={styles.labelInput}
          placeholder="Etiqueta (ej. Plantilla en PDF)"
          value={item.label}
          onChange={(e) => onChange({ label: e.target.value })}
        />

        <div className={styles.fileLine}>
          <input type="file" accept={accept} className={styles.fileInput} onChange={handleFile} />
          {state === "uploading" ? <span className={styles.status}>Subiendo…</span> : null}
          {hasFile && state !== "uploading" ? (
            <span className={styles.fileMeta}>
              ✓ {item.fileName}
              {formatSize(item.sizeBytes) ? ` · ${formatSize(item.sizeBytes)}` : ""}
            </span>
          ) : null}
          {error ? <span className={styles.error}>{error}</span> : null}
        </div>
      </div>

      <button
        type="button"
        className={styles.removeBtn}
        onClick={onRemove}
        aria-label="Eliminar archivo"
      >
        Eliminar
      </button>
    </li>
  );
}
