"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button/Button";
import styles from "./settings.module.css";

export interface FieldDef {
  name: string;
  label: string;
  type?: "text" | "url" | "color" | "textarea";
}

interface Props {
  title: string;
  settingKey: string;
  fields: FieldDef[];
  initial: Record<string, string>;
  action: (key: string, value: Record<string, string>) => Promise<void>;
}

export function KeyValueForm({ title, settingKey, fields, initial, action }: Props) {
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);

  const set = (name: string, v: string) => setValues((prev) => ({ ...prev, [name]: v }));

  const onSave = () =>
    start(async () => {
      await action(settingKey, values);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });

  return (
    <div className={styles.panel}>
      <h2 className={styles.panelTitle}>{title}</h2>
      {fields.map((f) => (
        <div key={f.name} className={styles.field}>
          <label className={styles.label} htmlFor={`${settingKey}-${f.name}`}>
            {f.label}
          </label>
          {f.type === "textarea" ? (
            <textarea
              id={`${settingKey}-${f.name}`}
              className={styles.textarea}
              value={values[f.name] ?? ""}
              onChange={(e) => set(f.name, e.target.value)}
            />
          ) : f.type === "color" ? (
            <div className={styles.colorRow}>
              <input
                id={`${settingKey}-${f.name}`}
                type="color"
                className={styles.color}
                value={values[f.name] ?? "#000000"}
                onChange={(e) => set(f.name, e.target.value)}
              />
              <input
                className={styles.input}
                value={values[f.name] ?? ""}
                onChange={(e) => set(f.name, e.target.value)}
                aria-label={`${f.label} (hex)`}
              />
            </div>
          ) : (
            <input
              id={`${settingKey}-${f.name}`}
              type={f.type === "url" ? "url" : "text"}
              className={styles.input}
              value={values[f.name] ?? ""}
              onChange={(e) => set(f.name, e.target.value)}
            />
          )}
        </div>
      ))}
      <div className={styles.saveRow}>
        <Button type="button" variant="primary" loading={pending} onClick={onSave}>
          Guardar
        </Button>
        {saved ? <span className={styles.saved}>✓ Guardado</span> : null}
      </div>
    </div>
  );
}
