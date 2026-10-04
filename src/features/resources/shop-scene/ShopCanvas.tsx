"use client";

import { useEffect, useRef } from "react";
import { useThemeStore } from "@/stores/useThemeStore";
import type { SceneHandle } from "./engine";
import type { Mode, Scene } from "./draw";

export type ShopSceneName = "shop" | "workshop";

/** Cada escena es su propio chunk: no pesa en el bundle inicial de la página. */
const LOADERS: Record<ShopSceneName, () => Promise<() => Scene>> = {
  shop: () => import("./shop").then((m) => m.createShopScene),
  workshop: () => import("./workshop").then((m) => m.createWorkshopScene),
};

/**
 * Canvas decorativo con la escena pixel animada. El motor y la escena se
 * cargan tras hidratar; hasta entonces se ve el fondo CSS del contenedor.
 * El tema (día/noche) llega del store y se aplica con un fundido.
 */
export function ShopCanvas({ scene, className }: { scene: ShopSceneName; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const handle = useRef<SceneHandle | null>(null);
  const theme = useThemeStore((s) => s.theme);
  const mode: Mode = theme === "dark" ? "night" : "day";
  const modeRef = useRef<Mode>(mode);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let cancelled = false;

    void Promise.all([import("./engine"), LOADERS[scene]()]).then(([engine, create]) => {
      if (cancelled) return;
      handle.current = engine.mountScene(canvas, create(), modeRef.current);
      canvas.dataset.ready = "true";
    });

    return () => {
      cancelled = true;
      handle.current?.destroy();
      handle.current = null;
    };
  }, [scene]);

  useEffect(() => {
    modeRef.current = mode;
    handle.current?.setMode(mode);
  }, [mode]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
