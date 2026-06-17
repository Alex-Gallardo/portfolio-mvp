import Link from "next/link";
import styles from "./LeadFilters.module.css";

interface Props {
  resources: { id: string; title: string; count: number }[];
  activeResource?: string;
  activeRange: string;
}

const RANGES = [
  { key: "all", label: "Todo" },
  { key: "7d", label: "7 días" },
  { key: "30d", label: "30 días" },
  { key: "90d", label: "90 días" },
];

function buildHref(params: { resource?: string; range?: string }): string {
  const sp = new URLSearchParams();
  if (params.resource) sp.set("resource", params.resource);
  if (params.range && params.range !== "all") sp.set("range", params.range);
  const qs = sp.toString();
  return qs ? `/admin/leads?${qs}` : "/admin/leads";
}

export function LeadFilters({ resources, activeResource, activeRange }: Props) {
  return (
    <div className={styles.filters}>
      {/* Rango: pills (Server, vía Link) */}
      <nav className={styles.ranges} aria-label="Rango de fechas">
        {RANGES.map((r) => (
          <Link
            key={r.key}
            href={buildHref({ resource: activeResource, range: r.key })}
            className={`${styles.pill} ${activeRange === r.key ? styles.active : ""}`}
            aria-current={activeRange === r.key ? "page" : undefined}
          >
            {r.label}
          </Link>
        ))}
      </nav>

      {/* Recurso: lista de enlaces (sin JS; "Todos" + cada recurso con su conteo) */}
      {resources.length > 0 ? (
        <nav className={styles.resources} aria-label="Filtrar por recurso">
          <Link
            href={buildHref({ range: activeRange })}
            className={`${styles.chip} ${!activeResource ? styles.active : ""}`}
            aria-current={!activeResource ? "page" : undefined}
          >
            Todos
          </Link>
          {resources.map((r) => (
            <Link
              key={r.id}
              href={buildHref({ resource: r.id, range: activeRange })}
              className={`${styles.chip} ${activeResource === r.id ? styles.active : ""}`}
              aria-current={activeResource === r.id ? "page" : undefined}
            >
              {r.title} <span className={styles.count}>{r.count}</span>
            </Link>
          ))}
        </nav>
      ) : null}
    </div>
  );
}
