import Link from "next/link";
import { type ResourceCategory } from "@prisma/client";
import { CATEGORY_LABELS } from "../categories";
import { Glyph } from "./icons";
import { catalogHref, type CatalogOrder } from "./params";
import styles from "./catalog.module.css";

/** Cofre vacío: no deja al visitante en un callejón sin salida. */
export function EmptyState({
  activeCategory,
  orden,
}: {
  activeCategory?: ResourceCategory;
  orden: CatalogOrder;
}) {
  return (
    <div className={`${styles.tokens} ${styles.panel} ${styles.empty}`}>
      <Glyph name="OTRO" size={56} className={styles.emptyIcon} />
      <p className={styles.emptyTitle}>
        {activeCategory ? "Este cofre aún está vacío" : "La tienda está reponiendo"}
      </p>
      <p className={styles.emptyText}>
        {activeCategory
          ? `Todavía no hay recursos de ${CATEGORY_LABELS[activeCategory]}. Pronto llegarán más.`
          : "Pronto subiré nuevos recursos. ¡Vuelve pronto!"}
      </p>
      {activeCategory ? (
        <Link href={catalogHref({ orden })} className={styles.btn}>
          Ver todos los recursos
        </Link>
      ) : null}
    </div>
  );
}
