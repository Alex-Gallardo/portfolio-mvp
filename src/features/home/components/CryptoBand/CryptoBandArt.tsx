import type { CSSProperties } from "react";
import { siEthereum } from "simple-icons";

import { BITCOIN_B, BITCOIN_B_VIEWBOX } from "@/features/crypto/glyphs";
import styles from "./CryptoBandArt.module.css";

/**
 * Escena 3D clay de la banda crypto (home). Puro marcado + CSS:
 * - moneda ₿ con grosor real (discos apilados en preserve-3d) que oscila,
 *   con una órbita cuyos nodos pasan por delante y por detrás,
 * - cristal de Ethereum facetado, mini cadena de bloques con pulso,
 *   monedas pequeñas a distintas profundidades, sombras de contacto y destellos.
 * Todo en bucle; decorativa (aria-hidden desde fuera).
 */

type Vars = CSSProperties & Record<`--${string}`, string | number>;

function BitcoinGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox={BITCOIN_B_VIEWBOX} aria-hidden="true">
      <path d={BITCOIN_B} fillRule="evenodd" />
    </svg>
  );
}

function EthGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d={siEthereum.path} />
    </svg>
  );
}

/** Órbita: la mitad trasera va detrás de la moneda y la delantera encima. */
function Orbit({ half }: { half: "back" | "front" }) {
  return (
    <span className={`${styles.orbit} ${half === "back" ? styles.orbitBack : styles.orbitFront}`}>
      <span className={styles.ring} />
      {[0, 1].map((i) => (
        <span key={i} className={styles.arm} style={{ "--o": `${i * -6}s` } as Vars}>
          <span className={styles.node} />
        </span>
      ))}
    </span>
  );
}

/** Moneda con grosor: discos apilados + cara frontal. */
function Coin({ className, variant }: { className?: string; variant: "btc" | "eth" }) {
  return (
    <span
      className={`${styles.coin} ${className ?? ""} ${variant === "eth" ? styles.coinEth : ""}`}
    >
      {[1, 2, 3, 4, 5].map((k) => (
        <span key={k} className={styles.disc} style={{ "--k": k } as Vars} />
      ))}
      <span className={styles.face}>
        {variant === "btc" ? (
          <BitcoinGlyph className={styles.glyph} />
        ) : (
          <EthGlyph className={styles.glyph} />
        )}
      </span>
    </span>
  );
}

export function CryptoBandArt() {
  return (
    <div className={styles.stage}>
      {/* sombras de contacto */}
      <span
        className={styles.shadow}
        style={{ "--x": "9.6em", "--y": "14.2em", "--w": "6.8em" } as Vars}
      />
      <span
        className={styles.shadow}
        style={{ "--x": "20.6em", "--y": "10.6em", "--w": "4em", "--d": "-1.4s" } as Vars}
      />
      <span
        className={styles.shadow}
        style={{ "--x": "0.8em", "--y": "18.3em", "--w": "11em", "--d": "-2.2s" } as Vars}
      />

      {/* monedas lejanas (desenfocadas = profundidad) */}
      <span className={`${styles.float} ${styles.far}`} style={{ "--d": "-2.6s" } as Vars}>
        <Coin className={styles.coinFar} variant="eth" />
      </span>
      <span className={`${styles.float} ${styles.tokenFar}`} style={{ "--d": "-0.8s" } as Vars}>
        <span className={styles.gem} />
      </span>

      {/* órbita trasera → moneda → órbita delantera (flotan juntas) */}
      <span className={`${styles.float} ${styles.mainFloat}`}>
        <Orbit half="back" />
        <Coin className={styles.coinMain} variant="btc" />
        <Orbit half="front" />
      </span>

      {/* moneda pequeña */}
      <span className={`${styles.float} ${styles.smallFloat}`} style={{ "--d": "-1.6s" } as Vars}>
        <Coin className={styles.coinSmall} variant="btc" />
      </span>

      {/* cristal de Ethereum facetado */}
      <span className={`${styles.float} ${styles.ethFloat}`} style={{ "--d": "-1.4s" } as Vars}>
        <span className={styles.crystal}>
          <span className={`${styles.facet} ${styles.f1}`} />
          <span className={`${styles.facet} ${styles.f2}`} />
          <span className={`${styles.facet} ${styles.f3}`} />
          <span className={`${styles.facet} ${styles.f4}`} />
        </span>
      </span>

      {/* mini cadena de bloques con pulso */}
      <span className={`${styles.float} ${styles.chainFloat}`} style={{ "--d": "-2.2s" } as Vars}>
        {[0, 1, 2].map((i) => (
          <span key={i} className={styles.block} style={{ "--i": i } as Vars}>
            {i > 0 && <span className={styles.link} />}
            <span className={styles.cube}>
              <span className={`${styles.cubeFace} ${styles.cubeFront}`} />
              <span className={`${styles.cubeFace} ${styles.cubeSide}`} />
              <span className={`${styles.cubeFace} ${styles.cubeTop}`} />
            </span>
          </span>
        ))}
      </span>

      {/* destellos */}
      {[
        { x: "16.4em", y: "3.6em", s: "1.6em", d: "0s" },
        { x: "4.6em", y: "8.4em", s: "1.1em", d: "-1.1s" },
        { x: "23.8em", y: "8.8em", s: "1.2em", d: "-2s" },
        { x: "11.2em", y: "17.4em", s: "1em", d: "-0.5s" },
      ].map((s) => (
        <span
          key={s.x}
          className={styles.sparkle}
          style={{ "--x": s.x, "--y": s.y, "--s": s.s, "--d": s.d } as Vars}
        />
      ))}
    </div>
  );
}
