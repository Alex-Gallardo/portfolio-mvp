import type { ReactNode } from "react";
import { ShopCanvas } from "../shop-scene/ShopCanvas";
import styles from "./CellarBackdrop.module.css";

/**
 * Fondo del catálogo de /recursos: el almacén de la tienda. La escena va
 * en una capa "sticky" del alto de la pantalla, detrás del contenido; el
 * letrero, las columnas y el taller se desplazan por encima, como una
 * interfaz de juego sobre una escena. Un solo canvas, que se pausa cuando
 * sale de pantalla. Decorativo: no aporta contenido.
 */
export function CellarBackdrop({ children }: { children: ReactNode }) {
  return (
    <div className={styles.cellar}>
      <div className={styles.stage} aria-hidden="true">
        <ShopCanvas scene="cellar" className={styles.canvas} />
      </div>
      {children}
    </div>
  );
}
