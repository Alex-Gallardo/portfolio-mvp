import { DownloadButton } from "../DownloadButton";
import { formatBytes } from "../catalog/params";
import { FILE_KIND_LABELS, extensionOf, fileKind } from "./files";
import { FileIcon, PixelSprite, UI_SPRITES } from "./sprites";
import styles from "./FileInventory.module.css";

export interface InventoryFile {
  id: string;
  label: string;
  fileName: string;
  mimeType: string | null;
  sizeBytes: number | null;
}

/**
 * "Qué incluye" como casillas de inventario: icono pixel por tipo de
 * archivo, nombre, extensión y peso, y un botón por casilla. Arriba, el
 * CTA principal (descarga el primer archivo, o el único).
 */
export function FileInventory({
  resourceSlug,
  resourceTitle,
  files,
}: {
  resourceSlug: string;
  resourceTitle: string;
  files: InventoryFile[];
}) {
  const single = files.length === 1;
  const totalBytes = files.reduce((sum, f) => sum + (f.sizeBytes ?? 0), 0);

  return (
    <section className={styles.inventory} aria-labelledby="inventory-title">
      <header className={styles.head}>
        <h2 id="inventory-title" className={styles.heading}>
          Qué incluye
        </h2>
        <span className={styles.summary}>
          {files.length} archivo{single ? "" : "s"}
          {totalBytes ? ` · ${formatBytes(totalBytes)}` : ""}
        </span>
      </header>

      <ul className={styles.slots}>
        {files.map((f, i) => {
          const kind = fileKind(f.fileName, f.mimeType);
          const ext = extensionOf(f.fileName);
          return (
            <li key={f.id} className={styles.slot} style={{ "--i": i } as React.CSSProperties}>
              <span className={styles.icon} data-kind={kind}>
                <FileIcon kind={kind} scale={3} />
              </span>
              <span className={styles.text}>
                <span className={styles.label}>{f.label}</span>
                <span className={styles.meta}>
                  {ext ? <span className={styles.ext}>{ext}</span> : null}
                  <span>{FILE_KIND_LABELS[kind]}</span>
                  {f.sizeBytes ? <span>· {formatBytes(f.sizeBytes)}</span> : null}
                </span>
              </span>
              <DownloadButton
                resourceSlug={resourceSlug}
                resourceTitle={resourceTitle}
                fileId={f.id}
                label={single ? "Descargar gratis" : "Descargar"}
                className={single ? styles.primary : styles.slotBtn}
              />
            </li>
          );
        })}
      </ul>

      {!single ? (
        <DownloadButton
          resourceSlug={resourceSlug}
          resourceTitle={resourceTitle}
          label="Descargar todo gratis"
          className={styles.primary}
        />
      ) : null}

      <p className={styles.trust}>
        <PixelSprite sprite={UI_SPRITES.shield} className={styles.trustIcon} />
        <span>Gratis · Sin spam · Listo en 30 segundos</span>
      </p>
    </section>
  );
}
