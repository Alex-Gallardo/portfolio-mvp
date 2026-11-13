"use client";

import { useEffect, useRef, useState } from "react";

import { PixelSprite, UI_SPRITES } from "./sprites";
import styles from "./ShareButton.module.css";

/**
 * "Copiar enlace" de la ficha: botón pixel que, al pulsar, se hunde y
 * muestra un letrerito "¡Enlace copiado!" que sube y se desvanece por
 * fotogramas. Si el portapapeles no está disponible, abre el diálogo
 * nativo de compartir cuando exista.
 */
export function ShareButton({ title }: { title: string }) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  const flash = (next: "copied" | "error") => {
    setState(next);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState("idle"), 2200);
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share && !navigator.clipboard) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      flash("copied");
    } catch {
      flash("error");
    }
  };

  return (
    <span className={styles.wrap}>
      <button type="button" className={styles.btn} onClick={share} data-state={state}>
        <PixelSprite sprite={state === "copied" ? UI_SPRITES.check : UI_SPRITES.link} />
        {state === "copied" ? "Copiado" : "Copiar enlace"}
      </button>
      <span
        className={styles.toast}
        role="status"
        aria-live="polite"
        data-show={state !== "idle" || undefined}
      >
        {state === "error" ? "No se pudo copiar" : state === "copied" ? "¡Enlace copiado!" : ""}
      </span>
    </span>
  );
}
