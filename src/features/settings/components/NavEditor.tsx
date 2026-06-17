"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button/Button";
import { type NavItem } from "../types";
import { saveNavigation } from "../actions";
import styles from "./settings.module.css";

export function NavEditor({ initial }: { initial: NavItem[] }) {
  const [items, setItems] = useState<NavItem[]>(initial);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);

  const update = (i: number, patch: Partial<NavItem>) =>
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const remove = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));
  const add = () => setItems((prev) => [...prev, { label: "", href: "" }]);
  const move = (i: number, dir: -1 | 1) =>
    setItems((prev) => {
      const next: NavItem[] = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      if (next[i] && next[j]) [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const onSave = () =>
    start(async () => {
      await saveNavigation(items);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });

  return (
    <div className={styles.panel}>
      <h2 className={styles.panelTitle}>Menú de navegación</h2>
      {items.map((it, i) => (
        <div key={i} className={styles.item}>
          <div className={styles.itemMain}>
            <input
              className={styles.input}
              placeholder="Etiqueta"
              value={it.label}
              onChange={(e) => update(i, { label: e.target.value })}
              aria-label="Etiqueta"
            />
            <input
              className={styles.input}
              placeholder="/ruta"
              value={it.href}
              onChange={(e) => update(i, { href: e.target.value })}
              aria-label="Enlace"
            />
          </div>
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
            disabled={i === items.length - 1}
            aria-label="Bajar"
          >
            ↓
          </button>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => remove(i)}
            aria-label="Eliminar"
          >
            ✕
          </button>
        </div>
      ))}
      <button type="button" className={styles.addBtn} onClick={add}>
        ➕ Agregar enlace
      </button>
      <div className={styles.saveRow}>
        <Button type="button" variant="primary" loading={pending} onClick={onSave}>
          Guardar menú
        </Button>
        {saved ? <span className={styles.saved}>✓ Guardado</span> : null}
      </div>
    </div>
  );
}
