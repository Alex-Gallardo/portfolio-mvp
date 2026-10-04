import { ShopCanvas } from "../shop-scene/ShopCanvas";
import { INTRO_ID } from "../RecursosIntro/RecursosIntro";
import styles from "./RecursosHero.module.css";

/**
 * Hero de /recursos: la tienda del aventurero en pixel art, animada en
 * bucle, ocupando casi toda la pantalla. Es pura escena (decorativa); el
 * título y los filtros viven en el letrero de debajo (RecursosIntro), al
 * que lleva el indicador de scroll.
 */
export function RecursosHero() {
  return (
    <header className={styles.hero}>
      <div className={styles.scene} aria-hidden="true">
        <ShopCanvas scene="shop" className={styles.canvas} />
      </div>

      <a href={`#${INTRO_ID}`} className={styles.cue}>
        <span className={styles.cueIcon} aria-hidden="true">
          {/* Escritorio: ratón con rueda; táctil: flecha de deslizar */}
          <svg
            className={styles.mouse}
            viewBox="0 0 7 10"
            width="14"
            height="20"
            fill="currentColor"
            shapeRendering="crispEdges"
          >
            <path d="M1 0h5v1h-5zM0 1h1v8h-1zM6 1h1v8h-1zM1 9h5v1h-5z" />
            <rect className={styles.wheel} x="3" y="2" width="1" height="2" />
          </svg>
          <svg
            className={styles.swipe}
            viewBox="0 0 7 7"
            width="14"
            height="14"
            fill="currentColor"
            shapeRendering="crispEdges"
          >
            <path d="M3 0h1v1h-1zM2 1h3v1h-3zM1 2h5v1h-5zM0 3h7v1h-7zM3 4h1v3h-1z" />
          </svg>
        </span>
        <span className={styles.cueText}>
          <span className={styles.desktopOnly}>Entra a la tienda</span>
          <span className={styles.touchOnly}>Desliza para entrar</span>
        </span>
        <span className={styles.chevrons} aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <svg
              key={i}
              viewBox="0 0 7 4"
              width="14"
              height="8"
              fill="currentColor"
              shapeRendering="crispEdges"
            >
              <path d="M0 0h1v1h-1zM6 0h1v1h-1zM1 1h1v1h-1zM5 1h1v1h-1zM2 2h1v1h-1zM4 2h1v1h-1zM3 3h1v1h-1z" />
            </svg>
          ))}
        </span>
      </a>
    </header>
  );
}
