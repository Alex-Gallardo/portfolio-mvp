import styles from "./Metrics.module.css";

const METRICS = [
  { value: "+1.200", label: "descargas de recursos" },
  { value: "100", label: "Lighthouse SEO" },
  { value: "< 1.5s", label: "LCP típico" },
  { value: "AA", label: "accesibilidad" },
];

export function Metrics() {
  return (
    <section className={styles.metrics} aria-label="Métricas">
      <div className={styles.grid}>
        {METRICS.map((m) => (
          <div key={m.label} className={styles.item}>
            <span className={styles.value}>{m.value}</span>
            <span className={styles.label}>{m.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
