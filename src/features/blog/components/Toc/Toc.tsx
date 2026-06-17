import { type TocItem } from "@/lib/markdown";
import styles from "./Toc.module.css";

export function Toc({ items }: { items: TocItem[] }) {
  if (items.length === 0) return null;
  return (
    <details className={styles.toc} open>
      <summary className={styles.summary}>Contenido</summary>
      <nav aria-label="Tabla de contenidos">
        <ul className={styles.list}>
          {items.map((it) => (
            <li key={it.id} className={it.depth === 3 ? styles.sub : undefined}>
              <a href={`#${it.id}`} className={styles.link}>
                {it.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </details>
  );
}
