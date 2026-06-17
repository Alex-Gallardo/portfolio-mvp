import Link from "next/link";
import styles from "./RangeFilter.module.css";

const RANGES = [
  { key: "1d", label: "Hoy" },
  { key: "7d", label: "7 días" },
  { key: "30d", label: "30 días" },
  { key: "90d", label: "90 días" },
];

export function RangeFilter({ active }: { active: string }) {
  return (
    <nav className={styles.filter} aria-label="Rango de fechas">
      {RANGES.map((r) => (
        <Link
          key={r.key}
          href={`/admin/analitica?range=${r.key}`}
          className={`${styles.item} ${active === r.key ? styles.active : ""}`}
          aria-current={active === r.key ? "page" : undefined}
        >
          {r.label}
        </Link>
      ))}
    </nav>
  );
}
