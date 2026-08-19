"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import styles from "./Metrics.module.css";

type Metric = {
  id: string;
  /** Valor numérico a animar. Omitir si el dato no es numérico. */
  to?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  /** Valor literal para métricas no numéricas (ej. "AA"). */
  display?: string;
  label: string;
  /** Lectura limpia para lectores de pantalla ("< 1.5s" se lee fatal). */
  srValue: string;
  /** Contexto corto que respalda el dato. */
  hint?: string;
};

const METRICS: Metric[] = [
  {
    id: "downloads",
    prefix: "+",
    to: 1200,
    label: "Descargas de recursos",
    srValue: "más de 1.200",
    hint: "guías y plantillas del blog",
  },
  {
    id: "seo",
    to: 100,
    suffix: "/100",
    label: "Lighthouse SEO",
    srValue: "100 sobre 100",
    hint: "media en producción",
  },
  {
    id: "lcp",
    prefix: "<\u2009",
    to: 1.5,
    decimals: 1,
    suffix: "s",
    label: "LCP típico",
    srValue: "menos de 1,5 segundos",
    hint: "Largest Contentful Paint, 4G simulado",
  },
  {
    id: "a11y",
    display: "AA",
    label: "Accesibilidad",
    srValue: "nivel AA",
    hint: "WCAG 2.2 verificado",
  },
];

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

function MetricValue({ metric }: { metric: Metric }) {
  const decimals = metric.decimals ?? 0;
  const format = useMemo(
    () =>
      new Intl.NumberFormat("es-GT", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }),
    [decimals],
  );

  // Se renderiza el valor final en SSR: sin CLS y funciona sin JS.
  const [current, setCurrent] = useState(metric.to ?? 0);
  const ref = useRef<HTMLSpanElement>(null);

  useIsomorphicLayoutEffect(() => {
    const target = metric.to;
    const el = ref.current;
    if (target == null || !el) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || typeof IntersectionObserver === "undefined") return;

    // Se resetea antes del primer paint → no hay parpadeo del valor final.
    setCurrent(0);

    let raf = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();

        const start = performance.now();
        const duration = 1100;
        const tick = (now: number) => {
          const t = Math.min((now - start) / duration, 1);
          setCurrent(target * easeOutExpo(t));
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [metric.to]);

  const finalText = metric.display ?? format.format(metric.to ?? 0);
  const currentText = metric.display ?? format.format(current);

  return (
    <>
      <span ref={ref} className={styles.value} aria-hidden="true">
        {metric.prefix && <span className={styles.affix}>{metric.prefix}</span>}
        <span className={styles.numberSlot}>
          {/* Reserva el ancho del valor final para que no baile al contar */}
          <span className={styles.numberGhost}>{finalText}</span>
          <span className={styles.number}>{currentText}</span>
        </span>
        {metric.suffix && <span className={styles.affix}>{metric.suffix}</span>}
      </span>
      <span className={styles.srOnly}>{metric.srValue}</span>
    </>
  );
}

export function Metrics() {
  const panelRef = useRef<HTMLDListElement>(null);

  const handlePointerMove = (event: ReactPointerEvent<HTMLDListElement>) => {
    const panel = panelRef.current;
    if (!panel || event.pointerType !== "mouse") return;
    const rect = panel.getBoundingClientRect();
    panel.style.setProperty("--pointer-x", `${event.clientX - rect.left}px`);
    panel.style.setProperty("--pointer-y", `${event.clientY - rect.top}px`);
  };

  return (
    <section className={styles.metrics} aria-labelledby="metrics-heading">
      <h2 id="metrics-heading" className={styles.srOnly}>
        Métricas del sitio
      </h2>

      <dl ref={panelRef} className={styles.panel} onPointerMove={handlePointerMove}>
        {METRICS.map((metric) => (
          <div key={metric.id} className={styles.item}>
            {/* dt antes que dd por validez HTML; el CSS invierte el orden visual */}
            <dt className={styles.label}>
              {metric.label}
              {metric.hint && <span className={styles.hint}>{metric.hint}</span>}
            </dt>
            <dd className={styles.valueRow}>
              <MetricValue metric={metric} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
