import Image from "next/image";
import Link from "next/link";
import { type ResourceCategory } from "@prisma/client";
import { CATEGORY_LABELS } from "../categories";
import { Glyph } from "./icons";
import styles from "./catalog.module.css";

export type TopResource = {
  slug: string;
  title: string;
  coverUrl: string | null;
  category: ResourceCategory;
  downloadCount: number;
};

const numberFmt = new Intl.NumberFormat("es-GT");

/**
 * Columna derecha: contexto de la tienda. Inventario en números, top de
 * descargas (o "Recién llegados" mientras nadie haya descargado nada) y el
 * CTA compacto del taller de encargos.
 */
export function CatalogAside({
  totalResources,
  totalDownloads,
  liveCategories,
  top,
}: {
  totalResources: number;
  totalDownloads: number;
  liveCategories: number;
  top: TopResource[];
}) {
  const ranked = top.some((r) => r.downloadCount > 0);

  return (
    <aside className={`${styles.tokens} ${styles.aside}`} aria-label="Sobre la tienda">
      <section className={styles.panel} aria-labelledby="aside-stats">
        <h2 id="aside-stats" className={styles.heading}>
          La tienda en números
        </h2>
        <ul className={styles.stats}>
          <li className={styles.slot}>
            <Glyph name="ALL" />
            <strong>{numberFmt.format(totalResources)}</strong>
            <span>recursos</span>
          </li>
          {totalDownloads > 0 ? (
            <li className={styles.slot}>
              <Glyph name="DOWNLOAD" />
              <strong>+{numberFmt.format(totalDownloads)}</strong>
              <span>descargas</span>
            </li>
          ) : null}
          <li className={styles.slot}>
            <Glyph name="OTRO" />
            <strong>{liveCategories}</strong>
            <span>categorías</span>
          </li>
        </ul>
      </section>

      {top.length > 0 ? (
        <section className={styles.panel} aria-labelledby="aside-top">
          <h2 id="aside-top" className={styles.heading}>
            {ranked ? "Más descargados" : "Recién llegados"}
          </h2>
          <ol className={styles.list}>
            {top.map((r, i) => (
              <li key={r.slug}>
                <Link href={`/recursos/${r.slug}`} className={styles.topItem}>
                  <span className={styles.thumb}>
                    <span className={styles.rank} aria-hidden="true">
                      {i + 1}
                    </span>
                    {r.coverUrl ? (
                      <Image src={r.coverUrl} alt="" fill sizes="56px" />
                    ) : (
                      <Glyph name={r.category} size={21} />
                    )}
                  </span>
                  <span>
                    <span className={styles.topTitle}>{r.title}</span>
                    <span className={styles.topMeta}>
                      {ranked ? (
                        <>
                          <Glyph name="DOWNLOAD" size={10} />
                          {numberFmt.format(r.downloadCount)} descargas
                        </>
                      ) : (
                        CATEGORY_LABELS[r.category]
                      )}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <section className={styles.panel} aria-labelledby="aside-cta">
        <h2 id="aside-cta" className={styles.heading}>
          Taller de encargos
        </h2>
        <p className={styles.ctaTitle}>¿Lo construimos juntos?</p>
        <p className={styles.ctaText}>
          Si prefieres no implementarlo solo, lo forjamos a tu medida.
        </p>
        <Link href="/servicios" className={styles.btn} data-track="recursos-aside-servicios">
          Pedir un encargo
        </Link>
      </section>
    </aside>
  );
}
