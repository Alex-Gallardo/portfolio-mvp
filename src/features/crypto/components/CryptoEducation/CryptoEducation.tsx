"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./CryptoEducation.module.css";

interface Step {
  key: string;
  icon: string;
  title: string;
  text: string;
}

const STEPS: Step[] = [
  {
    key: "wallet",
    icon: "👛",
    title: "Tu wallet, tu identidad",
    text: "Una wallet es tu llave para firmar acciones y demostrar quién eres, sin contraseñas.",
  },
  {
    key: "tx",
    icon: "🔗",
    title: "Transacciones transparentes",
    text: "Cada acción queda registrada en la cadena: pública, verificable e inmutable.",
  },
  {
    key: "contracts",
    icon: "📜",
    title: "Contratos inteligentes",
    text: "Programas que se ejecutan solos cuando se cumplen las condiciones. Sin intermediarios.",
  },
  {
    key: "ux",
    icon: "✨",
    title: "UX que no asusta",
    text: "Mi trabajo: que todo esto se sienta tan simple como una app normal.",
  },
];

export function CryptoEducation() {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number((entry.target as HTMLElement).dataset.index);
            setActive(idx);
          }
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    refs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.section} aria-label="Cómo funciona Web3">
      <h2 className={styles.h2}>Web3, explicado simple</h2>
      <div className={styles.layout}>
        <div className={styles.visual} aria-hidden="true">
          <div className={styles.card}>
            <span className={styles.icon}>{STEPS[active]?.icon}</span>
            <span className={styles.cardTitle}>{STEPS[active]?.title}</span>
          </div>
        </div>

        <div className={styles.steps}>
          {STEPS.map((s, i) => (
            <div
              key={s.key}
              data-index={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              className={`${styles.step} ${i === active ? styles.stepActive : ""}`}
            >
              <span className={styles.stepIcon} aria-hidden="true">
                {s.icon}
              </span>
              <h3 className={styles.stepTitle}>{s.title}</h3>
              <p className={styles.stepText}>{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
