import Link from "next/link";
import { ShopCanvas } from "../shop-scene/ShopCanvas";
import styles from "./WorkshopCta.module.css";

/**
 * Cierre de /recursos: la trastienda de la tienda, donde se hacen encargos
 * a medida. Extiende la escena del hero (misma cabaña, paleta y reloj) y
 * lleva a /servicios.
 */
export function WorkshopCta() {
  return (
    <section className={styles.cta} aria-labelledby="workshop-cta-title">
      <div className={styles.scene} aria-hidden="true">
        <ShopCanvas scene="workshop" className={styles.canvas} />
      </div>

      <div className={styles.panel}>
        <p className={styles.eyebrow}>Taller de encargos</p>
        <h2 id="workshop-cta-title" className={styles.title}>
          ¿Necesitas ayuda implementándolos?
        </h2>
        <p className={styles.sub}>Si prefieres no hacerlo solo, lo forjamos juntos a tu medida.</p>
        <Link href="/servicios" className={styles.btn}>
          Ver servicios
        </Link>
      </div>
    </section>
  );
}
