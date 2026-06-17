"use client";

import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/Button/Button";
import { saveContentBlock } from "../actions";
import { renderLite } from "../lite-markdown";
import styles from "./settings.module.css";

interface Block {
  key: string;
  page: string;
  title: string;
  body: string;
}

export function ContentEditor({ blocks }: { blocks: Block[] }) {
  const [selected, setSelected] = useState(blocks[0]?.key ?? "");
  const current = blocks.find((b) => b.key === selected);

  const [title, setTitle] = useState(current?.title ?? "");
  const [body, setBody] = useState(current?.body ?? "");
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);

  const onSelect = (key: string) => {
    const b = blocks.find((x) => x.key === key);
    setSelected(key);
    setTitle(b?.title ?? "");
    setBody(b?.body ?? "");
    setSaved(false);
  };

  const previewHtml = useMemo(() => renderLite(body), [body]);

  const onSave = () =>
    start(async () => {
      if (!current) return;
      await saveContentBlock({ key: current.key, page: current.page, title, body });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });

  if (blocks.length === 0) {
    return <p className={styles.hint}>No hay bloques de contenido. Crea algunos en el seed.</p>;
  }

  return (
    <div className={styles.panel}>
      <h2 className={styles.panelTitle}>Textos editables</h2>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="block-select">
          Bloque
        </label>
        <select
          id="block-select"
          className={styles.select}
          value={selected}
          onChange={(e) => onSelect(e.target.value)}
        >
          {blocks.map((b) => (
            <option key={b.key} value={b.key}>
              {b.key}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="block-title">
          Título
        </label>
        <input
          id="block-title"
          className={styles.input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className={styles.split}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="block-body">
            Cuerpo (markdown)
          </label>
          <textarea
            id="block-body"
            className={styles.textarea}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <span className={styles.hint}>
            Soporta # encabezados, **negrita**, *cursiva*, `código`, [enlaces](url) y listas con
            “-”.
          </span>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Vista previa</span>
          <div className={styles.preview} dangerouslySetInnerHTML={{ __html: previewHtml }} />
        </div>
      </div>

      <div className={styles.saveRow}>
        <Button type="button" variant="primary" loading={pending} onClick={onSave}>
          Guardar texto
        </Button>
        {saved ? <span className={styles.saved}>✓ Guardado</span> : null}
      </div>
    </div>
  );
}
