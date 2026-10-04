import Link from "next/link";
import { type ResourceCategory } from "@prisma/client";
import { RESOURCE_CATEGORIES } from "../categories";
import { ShopCanvas } from "../shop-scene/ShopCanvas";
import styles from "./RecursosHero.module.css";

/** Ancla del catálogo: los filtros y la flecha bajan directo a los resultados,
 *  que con un hero de 80vh quedan por debajo del pliegue. */
export const CATALOG_ID = "catalogo";

/**
 * Hero de /recursos: la tienda del aventurero en pixel art, animada en
 * bucle detrás de un panel con el título y los filtros. La escena es
 * decorativa; todo el contenido y la navegación siguen siendo HTML.
 */
export function RecursosHero({ activeCategory }: { activeCategory?: ResourceCategory }) {
  return (
    <header className={styles.hero}>
      <div className={styles.scene} aria-hidden="true">
        <ShopCanvas scene="shop" className={styles.canvas} />
      </div>

      <div className={styles.panel}>
        <p className={styles.eyebrow}>Botín para tu próximo proyecto</p>
        <h1 className={styles.title}>Recursos gratis para acelerar tu proyecto</h1>
        <p className={styles.sub}>
          Plantillas, checklists y guías que uso a diario. Descárgalas gratis.
        </p>

        <nav className={styles.chips} aria-label="Filtrar por categoría">
          <Link
            href={`/recursos#${CATALOG_ID}`}
            className={styles.chip}
            aria-current={!activeCategory ? "page" : undefined}
          >
            Todos
          </Link>
          {RESOURCE_CATEGORIES.map((c) => (
            <Link
              key={c.value}
              href={`/recursos?categoria=${c.value}#${CATALOG_ID}`}
              className={styles.chip}
              aria-current={activeCategory === c.value ? "page" : undefined}
            >
              {c.label}
            </Link>
          ))}
        </nav>
      </div>

      <a href={`#${CATALOG_ID}`} className={styles.cue}>
        <span className={styles.srOnly}>Ver los recursos</span>
        <svg
          viewBox="0 0 7 7"
          width="14"
          height="14"
          fill="currentColor"
          shapeRendering="crispEdges"
          aria-hidden="true"
        >
          <path d="M3 0h1v3h-1zM0 3h7v1h-7zM1 4h5v1h-5zM2 5h3v1h-3zM3 6h1v1h-1z" />
        </svg>
      </a>
    </header>
  );
}
