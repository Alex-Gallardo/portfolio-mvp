"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import styles from "./WorkMethod.module.css";

interface Method {
  key: string;
  label: string;
  intro: string;
  steps: string[];
}

const METHODS: Method[] = [
  {
    key: "apps",
    label: "Apps",
    intro: "Aplicaciones web a medida, robustas y escalables.",
    steps: ["Descubrimiento", "Prototipo", "Desarrollo", "Lanzamiento"],
  },
  {
    key: "web",
    label: "Web",
    intro: "Sitios rápidos, accesibles y optimizados para SEO.",
    steps: ["Estrategia", "Diseño", "Build", "Optimización"],
  },
  {
    key: "blockchain",
    label: "Blockchain",
    intro: "Interfaces claras para dApps y contratos.",
    steps: ["Análisis", "Contrato", "Integración", "Auditoría"],
  },
  {
    key: "diseno",
    label: "Diseño",
    intro: "Sistemas de diseño coherentes y reutilizables.",
    steps: ["Research", "Tokens", "Componentes", "Guía viva"],
  },
  {
    key: "ia",
    label: "IA",
    intro: "Features con IA integradas de forma útil.",
    steps: ["Caso de uso", "Prompting", "Integración", "Evaluación"],
  },
  {
    key: "marketing",
    label: "Marketing",
    intro: "Embudos medibles que captan y convierten.",
    steps: ["Escalera", "Lead magnet", "Nurture", "Medición"],
  },
];

export function WorkMethod() {
  const [active, setActive] = useState(0);
  const baseId = useId();
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    let next = active;
    if (e.key === "ArrowRight") next = (active + 1) % METHODS.length;
    else if (e.key === "ArrowLeft") next = (active - 1 + METHODS.length) % METHODS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = METHODS.length - 1;
    else return;
    e.preventDefault();
    setActive(next);
    tabsRef.current[next]?.focus();
  };

  const current = METHODS[active];

  return (
    <section className={styles.section} aria-label="Forma de trabajar">
      <h2 className={styles.h2}>Cómo trabajo</h2>

      <div className={styles.tablist} role="tablist" aria-label="Categorías de trabajo">
        {METHODS.map((m, i) => (
          <button
            key={m.key}
            ref={(el) => {
              tabsRef.current[i] = el;
            }}
            role="tab"
            id={`${baseId}-tab-${m.key}`}
            aria-selected={i === active}
            aria-controls={`${baseId}-panel-${m.key}`}
            tabIndex={i === active ? 0 : -1}
            className={`${styles.tab} ${i === active ? styles.tabActive : ""}`}
            onClick={() => setActive(i)}
            onKeyDown={onKeyDown}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`${baseId}-panel-${current?.key}`}
        aria-labelledby={`${baseId}-tab-${current?.key}`}
        className={styles.panel}
      >
        <p className={styles.intro}>{current?.intro}</p>
        <ol className={styles.flow}>
          {current?.steps.map((s, i) => (
            <li key={s} className={styles.step}>
              <span className={styles.stepNum}>{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
