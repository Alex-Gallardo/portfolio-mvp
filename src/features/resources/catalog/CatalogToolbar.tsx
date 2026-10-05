import Link from "next/link";
import { type ResourceCategory } from "@prisma/client";
import { CATEGORY_LABELS } from "../categories";
import { Glyph } from "./icons";
import { ORDERS, catalogHref, type CatalogOrder } from "./params";
import styles from "./catalog.module.css";

/**
 * Cabecera del catálogo: título, pestañas de orden (en la URL, sin JS),
 * número de resultados y el filtro activo, que se quita con un clic.
 */
export function CatalogToolbar({
  activeCategory,
  orden,
  results,
}: {
  activeCategory?: ResourceCategory;
  orden: CatalogOrder;
  results: number;
}) {
  return (
    <div className={`${styles.tokens} ${styles.panel} ${styles.toolbar}`}>
      <h2 id="catalog-title" className={styles.toolbarTitle}>
        Catálogo
      </h2>

      <nav aria-label="Ordenar recursos">
        <ul className={styles.tabs}>
          {ORDERS.map((o) => (
            <li key={o.value}>
              <Link
                href={catalogHref({ categoria: activeCategory, orden: o.value })}
                className={styles.tab}
                aria-current={orden === o.value ? "page" : undefined}
              >
                {o.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <p className={styles.meta} aria-live="polite">
        <span>
          <strong>{results}</strong> resultado{results === 1 ? "" : "s"}
        </span>
        {activeCategory ? (
          <Link href={catalogHref({ orden })} className={styles.clear}>
            {CATEGORY_LABELS[activeCategory]}
            <Glyph name="CLOSE" size={10} />
            <span className={styles.srOnly}>(quitar filtro)</span>
          </Link>
        ) : null}
      </p>
    </div>
  );
}
