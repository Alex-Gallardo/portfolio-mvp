"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button/Button";
import { type SectionConfigItem } from "@/features/content/types";
import { saveSections } from "../actions";
import styles from "./settings.module.css";

interface Row extends SectionConfigItem {
  label: string;
}

export function SectionsEditor({ page, initial }: { page: string; initial: Row[] }) {
  const [rows, setRows] = useState<Row[]>(initial);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);

  const toggle = (i: number) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, visible: !r.visible } : r)));
  const move = (i: number, dir: -1 | 1) =>
    setRows((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      if (next[i] && next[j]) [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const onSave = () =>
    start(async () => {
      await saveSections(
        page,
        rows.map((r) => ({ key: r.key, visible: r.visible, order: 0 })),
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });

  return (
    <div className={styles.panel}>
      <h2 className={styles.panelTitle}>Secciones · {page}</h2>
      {rows.map((r, i) => (
        <div key={r.key} className={styles.item}>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={r.visible}
              onChange={() => toggle(i)}
              disabled={r.key === "hero"} // el hero lleva el <h1>: no se oculta
            />
          </label>
          <span className={styles.sectionLabel}>
            {r.label}
            {r.key === "hero" ? <span className={styles.hint}> · fija (h1)</span> : null}
          </span>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => move(i, -1)}
            disabled={i === 0}
            aria-label="Subir"
          >
            ↑
          </button>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => move(i, 1)}
            disabled={i === rows.length - 1}
            aria-label="Bajar"
          >
            ↓
          </button>
        </div>
      ))}
      <div className={styles.saveRow}>
        <Button type="button" variant="primary" loading={pending} onClick={onSave}>
          Guardar secciones
        </Button>
        {saved ? <span className={styles.saved}>✓ Guardado</span> : null}
      </div>
    </div>
  );
}
