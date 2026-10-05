import Link from "next/link";
import { type ResourceCategory } from "@prisma/client";
import { RESOURCE_CATEGORIES } from "../categories";
import { Glyph } from "./icons";
import { catalogHref, type CatalogOrder } from "./params";
import styles from "./catalog.module.css";

/**
 * Columna izquierda: categorías con icono, número de recursos y la activa
 * resaltada. Fija al hacer scroll en escritorio; en móvil se convierte en
 * una fila de chips deslizable (ver recursos.module.css).
 */
export function CatalogSidebar({
  activeCategory,
  orden,
  counts,
  total,
}: {
  activeCategory?: ResourceCategory;
  orden: CatalogOrder;
  counts: Partial<Record<ResourceCategory, number>>;
  total: number;
}) {
  return (
    <nav
      className={`${styles.tokens} ${styles.panel} ${styles.sidebar}`}
      aria-labelledby="catalog-cats"
    >
      <h2 id="catalog-cats" className={styles.heading}>
        Categorías
      </h2>
      <ul className={`${styles.list} ${styles.catList}`}>
        <li>
          <Link
            href={catalogHref({ orden })}
            className={styles.cat}
            aria-current={!activeCategory ? "page" : undefined}
          >
            <Glyph name="ALL" className={styles.catIcon} />
            Todos
            <Count n={total} />
          </Link>
        </li>
        {RESOURCE_CATEGORIES.map((c) => {
          const n = counts[c.value] ?? 0;
          return (
            <li key={c.value}>
              <Link
                href={catalogHref({ categoria: c.value, orden })}
                className={styles.cat}
                data-empty={n === 0 || undefined}
                aria-current={activeCategory === c.value ? "page" : undefined}
              >
                <Glyph name={c.value} className={styles.catIcon} />
                {c.label}
                <Count n={n} />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** "×3" a la vista; "3 recursos" para lectores de pantalla. */
function Count({ n }: { n: number }) {
  return (
    <span className={styles.count}>
      <span aria-hidden="true">×</span>
      {n}
      <span className={styles.srOnly}> recursos</span>
    </span>
  );
}
