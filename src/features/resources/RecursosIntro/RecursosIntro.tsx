import styles from "./RecursosIntro.module.css";

/** Ancla del letrero: el indicador de scroll del hero baja aquí. */
export const INTRO_ID = "explorar";

/**
 * Letrero de la tienda, debajo del hero: qué es y para qué sirve. Se monta
 * sobre el borde inferior del hero, como clavado al mostrador, para que
 * asome en el primer pantallazo. Filtros, orden y cifras viven en el
 * catálogo (columnas laterales), a mano mientras se recorren las cards.
 */
export function RecursosIntro() {
  return (
    <section id={INTRO_ID} className={styles.intro} aria-labelledby="recursos-title">
      <div className={styles.panel}>
        <p className={styles.eyebrow}>Botín para tu próximo proyecto</p>
        <h1 id="recursos-title" className={styles.title}>
          Recursos gratis para acelerar tu proyecto
        </h1>
        <p className={styles.sub}>
          Plantillas, checklists y guías que uso a diario. Descárgalas gratis.
        </p>
      </div>
    </section>
  );
}
