import { formatNumber, formatPercent } from "../../format";
import styles from "./Funnel.module.css";

interface FunnelData {
  visitors: number;
  resourceViews: number;
  leads: number;
  downloads: number;
  contacts: number;
}

export function Funnel({ data }: { data: FunnelData }) {
  const stages = [
    { key: "E0", label: "Visitantes", value: data.visitors },
    { key: "E1", label: "Vistas de recursos", value: data.resourceViews },
    { key: "E1", label: "Leads captados", value: data.leads },
    { key: "E1", label: "Descargas", value: data.downloads },
    { key: "E4", label: "Contactos", value: data.contacts },
  ];
  const max = Math.max(...stages.map((s) => s.value), 1);

  return (
    <ol className={styles.funnel}>
      {stages.map((s, i) => {
        const width = Math.max((s.value / max) * 100, 2);
        const prev = i > 0 ? stages[i - 1]?.value : null;
        const rate = prev && prev > 0 ? (s.value / prev) * 100 : null;
        return (
          <li key={`${s.label}-${i}`} className={styles.stage}>
            <div className={styles.row}>
              <span className={styles.escalon}>{s.key}</span>
              <span className={styles.label}>{s.label}</span>
              <span className={styles.value}>{formatNumber(s.value)}</span>
            </div>
            <div className={styles.barTrack}>
              <div className={styles.bar} style={{ width: `${width}%` }} />
            </div>
            {rate !== null ? (
              <span className={styles.rate}>{formatPercent(rate)} del paso anterior</span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
