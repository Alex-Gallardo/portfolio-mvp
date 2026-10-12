import type { ComponentType, CSSProperties } from "react";
import { siEthereum } from "simple-icons";

import { BITCOIN_B, BITCOIN_B_VIEWBOX } from "@/features/crypto/glyphs";
import type { EducationKey } from "@/features/crypto/education";
import styles from "./illustrations.module.css";

/**
 * Ilustraciones clay del bento educativo. Puro marcado + CSS:
 * cada escena cuenta su concepto con un bucle de `@keyframes`
 * (ver illustrations.module.css). Son decorativas: el texto de la
 * tarjeta ya explica la idea, así que van con aria-hidden desde fuera.
 *
 * Sin animación (prefers-reduced-motion) cada escena muestra su
 * fotograma más descriptivo: son los estilos base.
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

function Check({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12.5l4.2 4.2L19 7" />
    </svg>
  );
}

/** Destello de 4 puntas que parpadea. `--d` desfasa su ciclo. */
function Sparkle({ style }: { style: Vars }) {
  return <span className={styles.sparkle} style={style} />;
}

// ──────────────────────────────────────────────────────────────
// 01 · Wallet: se abre, salen monedas, se firma y se cierra
// ──────────────────────────────────────────────────────────────
function WalletArt() {
  return (
    <div className={`${styles.stage} ${styles.walletStage}`}>
      <span
        className={styles.shadow}
        style={{ "--x": "5em", "--y": "14.7em", "--w": "14em" } as Vars}
      />

      <div className={styles.key}>
        <span className={`${styles.clay} ${styles.keyHead}`} />
        <span className={`${styles.clay} ${styles.keyShaft}`} />
        <span className={`${styles.clay} ${styles.keyTooth}`} />
        <span className={`${styles.clay} ${styles.keyTooth} ${styles.keyTooth2}`} />
      </div>

      <div className={styles.walletFloat}>
        <span className={`${styles.clay} ${styles.walletBody}`} />
        <span
          className={styles.walletCoin}
          style={{ "--tx": "-2.8em", "--ty": "-6.4em", "--rot": "-14deg", "--d": "0s" } as Vars}
        >
          <span className={`${styles.clay} ${styles.coinFace}`}>
            <BitcoinGlyph className={styles.coinGlyph} />
          </span>
        </span>
        <span
          className={styles.walletCoin}
          style={
            {
              "--tx": "2.4em",
              "--ty": "-7.6em",
              "--rot": "12deg",
              "--d": "-0.3s",
              left: "7.6em",
            } as Vars
          }
        >
          <span className={`${styles.clay} ${styles.coinFace} ${styles.coinEth}`}>
            <EthGlyph className={styles.coinGlyph} />
          </span>
        </span>
        <span className={`${styles.clay} ${styles.walletPocket}`} />
        <span className={`${styles.clay} ${styles.walletFlap}`}>
          <span className={`${styles.clay} ${styles.walletClasp}`} />
        </span>
      </div>

      <span className={`${styles.clay} ${styles.badge}`}>
        <span className={styles.badgeAvatar} />
        <span className={styles.badgeText}>0x7a3…f9</span>
        <span className={styles.badgeCheck}>
          <Check className={styles.checkIcon} />
        </span>
      </span>

      <Sparkle style={{ "--x": "17.6em", "--y": "6.2em", "--s": "1.6em", "--d": "-0.4s" }} />
      <Sparkle style={{ "--x": "21.6em", "--y": "1em", "--s": "1.1em", "--d": "-1.3s" }} />
      <Sparkle style={{ "--x": "3.2em", "--y": "2.2em", "--s": "1.2em", "--d": "-2.1s" }} />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// 02 · Transacciones: cae un bloque, el pulso confirma, la cadena avanza
// ──────────────────────────────────────────────────────────────
function ChainArt() {
  return (
    <div className={`${styles.stage} ${styles.chainStage}`}>
      <span
        className={styles.shadow}
        style={{ "--x": "1.5em", "--y": "10.2em", "--w": "21em" } as Vars}
      />
      <div className={styles.track}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`${styles.slot} ${i === 0 ? styles.slotFirst : ""} ${i === 4 ? styles.slotLast : ""}`}
            style={{ "--i": i } as Vars}
          >
            {i > 0 && (
              <span
                className={`${styles.clay} ${styles.link} ${i === 1 ? styles.linkFirst : ""}`}
              />
            )}
            <span className={styles.blockGlow} />
            <div className={styles.cube}>
              <span className={`${styles.face} ${styles.faceFront}`} />
              <span className={`${styles.face} ${styles.faceSide}`} />
              <span className={`${styles.face} ${styles.faceTop}`} />
            </div>
          </div>
        ))}
      </div>
      <span className={`${styles.clay} ${styles.confirm}`}>
        <span className={styles.badgeCheck}>
          <Check className={styles.checkIcon} />
        </span>
        confirmada
      </span>
      <Sparkle style={{ "--x": "20.4em", "--y": "2.6em", "--s": "1.2em", "--d": "-0.8s" }} />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// 03 · Contratos: se escribe el código, giran los engranajes, se sella
// ──────────────────────────────────────────────────────────────
const CODE_LINES = [
  { w: "5.2em", c: "var(--ce-code-1)", indent: "0em" },
  { w: "3.6em", c: "var(--ce-code-2)", indent: "0.9em" },
  { w: "4.6em", c: "var(--ce-code-3)", indent: "0.9em" },
  { w: "2.8em", c: "var(--ce-code-2)", indent: "1.8em" },
  { w: "1.4em", c: "var(--ce-code-1)", indent: "0em" },
];

/** Path de un engranaje de `teeth` dientes (viewBox 0 0 48 48) con hueco central. */
function gearPath(teeth = 8, outer = 22, inner = 17, hole = 6.5) {
  const c = 24;
  const step = (Math.PI * 2) / teeth;
  const pt = (r: number, a: number) =>
    `${(c + r * Math.cos(a)).toFixed(2)} ${(c + r * Math.sin(a)).toFixed(2)}`;
  const parts: string[] = [];
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    // valle → flanco → cresta → flanco
    parts.push(
      pt(inner, a),
      pt(outer, a + step * 0.18),
      pt(outer, a + step * 0.42),
      pt(inner, a + step * 0.6),
    );
  }
  const ring = `M${parts.join(" L")} Z`;
  const holeArc = `M${c - hole} ${c} a${hole} ${hole} 0 1 0 ${hole * 2} 0 a${hole} ${hole} 0 1 0 ${-hole * 2} 0 Z`;
  return `${ring} ${holeArc}`;
}

const GEAR_PATH = gearPath();

function Gear({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <path fillRule="evenodd" d={GEAR_PATH} />
    </svg>
  );
}

function ContractArt() {
  return (
    <div className={`${styles.stage} ${styles.contractStage}`}>
      <span
        className={styles.shadow}
        style={{ "--x": "2.6em", "--y": "14.6em", "--w": "13em" } as Vars}
      />
      <Gear className={`${styles.gear} ${styles.gearBig}`} />
      <Gear className={`${styles.gear} ${styles.gearSmall}`} />
      <div className={styles.docFloat}>
        <div className={`${styles.clay} ${styles.doc}`}>
          <div className={styles.docHead}>
            <span className={styles.docDot} />
            <span className={styles.docTitle} />
          </div>
          <div className={styles.code}>
            {CODE_LINES.map((l, i) => (
              <span
                key={i}
                className={styles.codeLine}
                style={{ "--w": l.w, "--c": l.c, "--indent": l.indent } as Vars}
              />
            ))}
          </div>
          <span className={styles.signLine} />
        </div>
        <span className={styles.sealRing} />
        <span className={`${styles.clay} ${styles.seal}`}>
          <Check className={styles.sealCheck} />
        </span>
      </div>
      <Sparkle style={{ "--x": "15.6em", "--y": "9.2em", "--s": "1.4em", "--d": "-0.2s" }} />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// 04 · Tokens: caen y se apilan, flotan separados y se van
// ──────────────────────────────────────────────────────────────
function TokenCoin({ variant, n }: { variant: "btc" | "eth" | "gem"; n: 1 | 2 | 3 }) {
  return (
    <div className={`${styles.token} ${styles[`token${n}`] ?? ""} ${styles[variant] ?? ""}`}>
      <span className={`${styles.clay} ${styles.tokenEdge}`} />
      <span className={`${styles.clay} ${styles.tokenTop}`}>
        {variant === "btc" && <BitcoinGlyph className={styles.tokenGlyph} />}
        {variant === "eth" && <EthGlyph className={styles.tokenGlyph} />}
        {variant === "gem" && (
          <svg className={styles.tokenGlyph} viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 2l8.66 5v10L12 22l-8.66-5V7z M12 7.5l-4.3 2.5v5l4.3 2.5 4.3-2.5v-5z"
              fillRule="evenodd"
            />
          </svg>
        )}
      </span>
    </div>
  );
}

function TokensArt() {
  return (
    <div className={`${styles.stage} ${styles.tokensStage}`}>
      <span
        className={`${styles.shadow} ${styles.tokenShadow}`}
        style={{ "--x": "5em", "--y": "13.8em", "--w": "10em" } as Vars}
      />
      <div className={styles.stack}>
        <TokenCoin variant="btc" n={1} />
        <TokenCoin variant="eth" n={2} />
        <TokenCoin variant="gem" n={3} />
      </div>
      <Sparkle style={{ "--x": "14.4em", "--y": "3.4em", "--s": "1.4em", "--d": "-1s" }} />
      <Sparkle style={{ "--x": "3.4em", "--y": "6em", "--s": "1em", "--d": "-2.2s" }} />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// 05 · UX: el cursor pulsa "Conectar wallet" → cargando → Conectado ✓
// ──────────────────────────────────────────────────────────────
function UxArt() {
  return (
    <div className={`${styles.stage} ${styles.uxStage}`}>
      <span
        className={styles.shadow}
        style={{ "--x": "2em", "--y": "12.3em", "--w": "18em" } as Vars}
      />
      <div className={styles.uxFloat}>
        <div className={`${styles.clay} ${styles.window}`}>
          <div className={styles.windowBar}>
            <span />
            <span />
            <span />
          </div>
          <span className={styles.skel} style={{ "--w": "9em" } as Vars} />
          <span className={styles.skel} style={{ "--w": "6em", opacity: 0.6 } as Vars} />
          <div className={styles.balance}>
            <span className={`${styles.clay} ${styles.balanceCoin}`}>
              <EthGlyph className={styles.balanceGlyph} />
            </span>
            <span className={styles.skel} style={{ "--w": "5em", margin: 0 } as Vars} />
          </div>
          <span className={styles.ripple} />
          <span className={`${styles.clay} ${styles.connect}`}>
            <span className={`${styles.label} ${styles.labelIdle}`}>Conectar wallet</span>
            <span className={`${styles.label} ${styles.labelBusy}`}>
              <span className={styles.spinner} />
            </span>
            <span className={`${styles.label} ${styles.labelDone}`}>
              <Check className={styles.doneIcon} />
              Conectado
            </span>
          </span>
          <span className={styles.chip}>
            <span className={styles.badgeAvatar} />
            0x7a…f9
          </span>
        </div>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={styles.burst} style={{ "--a": `${i * 90 + 45}deg` } as Vars} />
        ))}
      </div>
      <span className={`${styles.clay} ${styles.shield}`}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2.5l7.5 3v6c0 4.6-3.1 8.4-7.5 10-4.4-1.6-7.5-5.4-7.5-10v-6z" />
          <path className={styles.shieldCheck} d="M8.3 12.2l2.6 2.6 4.8-5" />
        </svg>
      </span>
      <svg className={styles.cursor} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 2.5l15.5 9.2-6.9 1.4 3.9 7.4-2.7 1.4-3.9-7.4-5 4.8z" />
      </svg>
      <Sparkle style={{ "--x": "22.6em", "--y": "9.4em", "--s": "1.2em", "--d": "-1.6s" }} />
    </div>
  );
}

const ARTS: Record<EducationKey, ComponentType> = {
  wallet: WalletArt,
  tx: ChainArt,
  contracts: ContractArt,
  tokens: TokensArt,
  ux: UxArt,
};

export function EducationArt({ kind }: { kind: EducationKey }) {
  const Art = ARTS[kind];
  return <Art />;
}

/** Objetos clay sueltos alrededor del grid (solo desktop). */
export function EducationDecor() {
  return (
    <div className={styles.decor} aria-hidden="true">
      <span className={`${styles.decorItem} ${styles.decorCoin}`}>
        <span className={`${styles.clay} ${styles.coinFace}`}>
          <BitcoinGlyph className={styles.coinGlyph} />
        </span>
      </span>
      <span className={`${styles.decorItem} ${styles.decorCube}`}>
        <span className={styles.cube}>
          <span className={`${styles.face} ${styles.faceFront}`} />
          <span className={`${styles.face} ${styles.faceSide}`} />
          <span className={`${styles.face} ${styles.faceTop}`} />
        </span>
      </span>
      <span className={`${styles.decorItem} ${styles.decorOrb} ${styles.clay}`} />
      <span className={`${styles.decorItem} ${styles.decorEth}`}>
        <span className={`${styles.clay} ${styles.coinFace} ${styles.coinEth}`}>
          <EthGlyph className={styles.coinGlyph} />
        </span>
      </span>
    </div>
  );
}
