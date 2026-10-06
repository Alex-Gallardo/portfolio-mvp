import { FPS, frameTime } from "./loop";
import { bayer, context, drawGlow, makeCanvas, type Ctx, type Mode, type Scene } from "./draw";

/**
 * Motor de la escena: dimensiona el canvas a resolución lógica baja, corre el
 * bucle a 24 fps sólo cuando se ve y compone luz y materiales:
 *
 *   materiales → × mapa de luz (ambiente + halos) → luz propia → bloom → partículas
 *
 * El mapa de luz multiplica, así que la noche oscurece de verdad y los
 * objetos con luz propia brillan por encima sin apagarse.
 */

/** Fotograma fijo para movimiento reducido: elegido porque se ve completo. */
const STILL_T = 2.5;
/** Duración del fundido con tramado al cambiar día ↔ noche. */
const DISSOLVE_MS = 420;

/**
 * Tamaño del píxel lógico en píxeles de dispositivo. Sale del viewport y no
 * del contenedor: así el hero y el taller del CTA comparten el mismo grano.
 */
function pixelScale(): number {
  const dpr = window.devicePixelRatio || 1;
  const portrait = window.innerWidth < window.innerHeight * 0.9;
  const target = portrait ? 340 : 240;
  return Math.max(2, Math.round((Math.max(window.innerHeight * 0.95, 560) * dpr) / target));
}

const ditherPatterns = new Map<number, HTMLCanvasElement>();

/** Patrón 4×4 opaco donde el umbral Bayer queda por debajo de `level` (0..16). */
function ditherPattern(level: number): HTMLCanvasElement {
  const hit = ditherPatterns.get(level);
  if (hit) return hit;
  const c = makeCanvas(4, 4);
  const ctx = context(c);
  ctx.fillStyle = "#000";
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      if (bayer(x, y) * 16 < level) ctx.fillRect(x, y, 1, 1);
    }
  }
  ditherPatterns.set(level, c);
  return c;
}

export interface SceneHandle {
  setMode(mode: Mode): void;
  destroy(): void;
}

export function mountScene(
  canvas: HTMLCanvasElement,
  scene: Scene,
  initialMode: Mode,
): SceneHandle {
  const host = canvas.parentElement ?? canvas;
  const ctx = context(canvas);
  const light = makeCanvas(1, 1);
  let lctx = context(light);
  const prev = makeCanvas(1, 1);
  let pctx = context(prev);
  const fade = makeCanvas(1, 1);
  let fctx = context(fade);

  let mode = initialMode;
  let W = 0;
  let H = 0;
  let visible = false;
  let raf = 0;
  let lastFrame = -1;
  let dissolveStart = 0;
  let destroyed = false;

  const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  function resize() {
    const k = pixelScale();
    const dpr = window.devicePixelRatio || 1;
    const box = host.getBoundingClientRect();
    if (box.width === 0 || box.height === 0) return;
    const w = Math.ceil((box.width * dpr) / k);
    const h = Math.ceil((box.height * dpr) / k);
    canvas.style.width = `${(w * k) / dpr}px`;
    canvas.style.height = `${(h * k) / dpr}px`;
    if (w === W && h === H) return;
    W = w;
    H = h;
    for (const c of [canvas, light, prev, fade]) {
      c.width = W;
      c.height = H;
    }
    // Redimensionar resetea el estado del contexto.
    ctx.imageSmoothingEnabled = false;
    lctx = context(light);
    pctx = context(prev);
    fctx = context(fade);
    scene.layout(W, H, { pxCss: k / dpr });
    lastFrame = -1;
    draw(currentTime());
  }

  function currentTime(): number {
    return reducedQuery.matches ? STILL_T : frameTime(performance.now() / 1000);
  }

  function compose(c: Ctx, t: number) {
    c.globalCompositeOperation = "source-over";
    c.globalAlpha = 1;
    scene.base(c, t, mode);

    lctx.globalCompositeOperation = "source-over";
    lctx.globalAlpha = 1;
    lctx.fillStyle = scene.ambient(mode);
    lctx.fillRect(0, 0, W, H);
    lctx.globalCompositeOperation = "lighter";
    const lights = scene.lights(t, mode);
    for (const l of lights) drawGlow(lctx, l);
    scene.lightShapes?.(lctx, t, mode);
    lctx.globalAlpha = 1;

    c.globalCompositeOperation = "multiply";
    c.drawImage(light, 0, 0);
    c.globalCompositeOperation = "source-over";
    scene.emissive(c, t, mode);

    c.globalCompositeOperation = "lighter";
    const bloom = mode === "night" ? 0.55 : 0.18;
    for (const l of lights) if (l.bloom) drawGlow(c, l, 0.7, l.bloom * bloom);
    c.globalCompositeOperation = "source-over";
    c.globalAlpha = 1;
    scene.overlay(c, t, mode);
  }

  function draw(t: number) {
    if (!W || !H || destroyed) return;
    compose(ctx, t);

    // Fundido día ↔ noche: la imagen anterior se va disolviendo por tramado.
    if (dissolveStart) {
      const p = (performance.now() - dissolveStart) / DISSOLVE_MS;
      if (p >= 1) {
        dissolveStart = 0;
      } else {
        fctx.globalCompositeOperation = "source-over";
        fctx.clearRect(0, 0, W, H);
        fctx.drawImage(prev, 0, 0);
        fctx.globalCompositeOperation = "destination-out";
        const pattern = fctx.createPattern(ditherPattern(Math.ceil(p * 16)), "repeat");
        if (pattern) {
          fctx.fillStyle = pattern;
          fctx.fillRect(0, 0, W, H);
        }
        ctx.drawImage(fade, 0, 0);
      }
    }
  }

  function tick(now: number) {
    raf = requestAnimationFrame(tick);
    const frame = Math.floor((now / 1000) * FPS);
    if (frame === lastFrame && !dissolveStart) return;
    lastFrame = frame;
    draw(frameTime(now / 1000));
  }

  function sync() {
    const shouldRun = visible && !document.hidden && !reducedQuery.matches;
    if (shouldRun && !raf) {
      raf = requestAnimationFrame(tick);
    } else if (!shouldRun && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
    if (!shouldRun) draw(currentTime());
  }

  const ro = new ResizeObserver(resize);
  ro.observe(host);
  window.addEventListener("resize", resize);

  const io = new IntersectionObserver(
    (entries) => {
      visible = entries.some((e) => e.isIntersecting);
      sync();
    },
    { rootMargin: "80px" },
  );
  io.observe(canvas);

  document.addEventListener("visibilitychange", sync);
  reducedQuery.addEventListener("change", sync);

  resize();

  return {
    setMode(next) {
      if (next === mode) return;
      if (W && H && !reducedQuery.matches) {
        pctx.globalCompositeOperation = "source-over";
        pctx.clearRect(0, 0, W, H);
        pctx.drawImage(canvas, 0, 0);
        dissolveStart = performance.now();
      }
      mode = next;
      if (!raf) {
        // En pausa (fuera de pantalla o movimiento reducido): sin fundido.
        dissolveStart = 0;
        draw(currentTime());
      }
    },
    destroy() {
      destroyed = true;
      cancelAnimationFrame(raf);
      raf = 0;
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", sync);
      reducedQuery.removeEventListener("change", sync);
    },
  };
}
