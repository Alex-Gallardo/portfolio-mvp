import Link from "next/link";
import { type ResourceCategory } from "@prisma/client";
import { RESOURCE_CATEGORIES } from "../categories";
import styles from "./RecursosIntro.module.css";

/** Anclas: el indicador del hero baja al letrero; los filtros, al catálogo. */
export const INTRO_ID = "explorar";
export const CATALOG_ID = "catalogo";

const numberFmt = new Intl.NumberFormat("es-GT");

/**
 * Letrero de la tienda, debajo del hero: qué es, cuánto hay y filtros con
 * el número de recursos de cada categoría (el visitante sabe antes de
 * pulsar si una categoría tiene algo). Se monta sobre el borde inferior del
 * hero, como clavado al mostrador, para que asome en el primer pantallazo.
 */
export function RecursosIntro({
  activeCategory,
  counts,
  totalResources,
  totalDownloads,
}: {
  activeCategory?: ResourceCategory;
  counts: Partial<Record<ResourceCategory, number>>;
  totalResources: number;
  totalDownloads: number;
}) {
  const liveCategories = RESOURCE_CATEGORIES.filter((c) => (counts[c.value] ?? 0) > 0).length;

  return (
    <section id={INTRO_ID} className={styles.intro} aria-labelledby="recursos-title">
      <div className={styles.panel}>
        <div className={styles.head}>
          <div className={styles.copy}>
            <p className={styles.eyebrow}>Botín para tu próximo proyecto</p>
            <h1 id="recursos-title" className={styles.title}>
              Recursos gratis para acelerar tu proyecto
            </h1>
            <p className={styles.sub}>
              Plantillas, checklists y guías que uso a diario. Descárgalas gratis.
            </p>
          </div>

          <ul className={styles.stats} aria-label="La tienda en números">
            <li className={styles.stat}>
              <Glyph d={STAR} />
              <strong>{numberFmt.format(totalResources)}</strong>
              <span>recursos</span>
            </li>
            {totalDownloads > 0 ? (
              <li className={styles.stat}>
                <Glyph d={DOWNLOAD} />
                <strong>+{numberFmt.format(totalDownloads)}</strong>
                <span>descargas</span>
              </li>
            ) : null}
            <li className={styles.stat}>
              <Glyph d={CHEST} />
              <strong>{liveCategories}</strong>
              <span>categorías</span>
            </li>
          </ul>
        </div>

        <nav className={styles.filters} aria-label="Filtrar por categoría">
          <ul className={styles.tabs}>
            <li>
              <Link
                href={`/recursos#${CATALOG_ID}`}
                className={styles.tab}
                aria-current={!activeCategory ? "page" : undefined}
              >
                Todos
                <Count n={totalResources} />
              </Link>
            </li>
            {RESOURCE_CATEGORIES.map((c) => {
              const n = counts[c.value] ?? 0;
              return (
                <li key={c.value}>
                  <Link
                    href={`/recursos?categoria=${c.value}#${CATALOG_ID}`}
                    className={styles.tab}
                    data-empty={n === 0 || undefined}
                    aria-current={activeCategory === c.value ? "page" : undefined}
                  >
                    {c.label}
                    <Count n={n} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </section>
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

/* ---------- Glifos pixel (7×7, 2× escala) ---------- */

const STAR =
  "M3 0h1v1h-1zM2 1h3v1h-3zM0 2h7v1h-7zM1 3h5v1h-5zM2 4h3v1h-3zM1 5h2v1h-2zM4 5h2v1h-2zM0 6h2v1h-2zM5 6h2v1h-2z";
const DOWNLOAD =
  "M3 0h1v2h-1zM1 2h5v1h-5zM2 3h3v1h-3zM3 4h1v1h-1zM0 5h1v1h-1zM6 5h1v1h-1zM0 6h7v1h-7z";
const CHEST = "M1 0h5v1h-5zM0 1h1v6h-1zM6 1h1v6h-1zM0 3h7v1h-7zM3 4h1v1h-1zM0 6h7v1h-7z";

function Glyph({ d }: { d: string }) {
  return (
    <svg
      viewBox="0 0 7 7"
      width="14"
      height="14"
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden="true"
      className={styles.glyph}
    >
      <path d={d} />
    </svg>
  );
}
