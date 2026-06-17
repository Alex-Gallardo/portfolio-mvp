import { Card } from "@/components/ui/Card/Card";
import { getDashboardData } from "@/features/analytics/queries";
import { formatNumber, formatPercent } from "@/features/analytics/format";
import { RangeFilter } from "@/features/analytics/components/RangeFilter/RangeFilter";
import { Funnel } from "@/features/analytics/components/Funnel/Funnel";
import { TrendChart } from "@/features/analytics/components/TrendChart";
import { DevicesChart } from "@/features/analytics/components/DevicesChart";
import styles from "./analitica.module.css";

export const dynamic = "force-dynamic"; // siempre datos frescos (la caché la pone unstable_cache)

const RANGE_DAYS: Record<string, number> = { "1d": 1, "7d": 7, "30d": 30, "90d": 90 };

export default async function AnaliticaPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range } = await searchParams;
  const activeRange = range && RANGE_DAYS[range] ? range : "7d";
  //   Validar que dia se queda como default
  const data = await getDashboardData(RANGE_DAYS[activeRange] || 7);
  const { kpis } = data;

  const KPI_CARDS = [
    { label: "Visitas", value: formatNumber(kpis.pageviews) },
    { label: "Visitantes únicos", value: formatNumber(kpis.visitors) },
    { label: "Leads captados", value: formatNumber(kpis.leads) },
    { label: "Descargas", value: formatNumber(kpis.downloads) },
    { label: "Conversiones", value: formatNumber(kpis.conversions) },
    { label: "Tasa de conversión", value: formatPercent(kpis.conversionRate) },
    { label: "Tasa de captura", value: formatPercent(kpis.captureRate) },
    { label: "Scroll promedio", value: `${kpis.avgScroll}%` },
  ];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.h1}>Analítica</h1>
        <RangeFilter active={activeRange} />
      </header>

      {/* KPIs */}
      <section className={styles.kpis}>
        {KPI_CARDS.map((k) => (
          <Card key={k.label} className={styles.kpi}>
            <span className={styles.kpiValue}>{k.value}</span>
            <span className={styles.kpiLabel}>{k.label}</span>
          </Card>
        ))}
      </section>

      {/* Tendencia + Dispositivos */}
      <section className={styles.row2}>
        <Card className={styles.panel}>
          <h2 className={styles.h2}>Visitas por día</h2>
          <TrendChart data={data.trend} />
        </Card>
        <Card className={styles.panel}>
          <h2 className={styles.h2}>Dispositivos</h2>
          <DevicesChart data={data.devices} />
        </Card>
      </section>

      {/* Embudo de la escalera */}
      <section>
        <Card className={styles.panel}>
          <h2 className={styles.h2}>Embudo de la escalera de valor</h2>
          <Funnel data={data.funnel} />
        </Card>
      </section>

      {/* Tablas */}
      <section className={styles.row2}>
        <Card className={styles.panel}>
          <h2 className={styles.h2}>Páginas más vistas</h2>
          <Table
            rows={data.topPaths.map((p) => [p.path, formatNumber(p.count)])}
            empty="Aún no hay vistas."
          />
        </Card>
        <Card className={styles.panel}>
          <h2 className={styles.h2}>Clics por elemento</h2>
          <Table
            rows={data.topClicks.map((c) => [c.element, formatNumber(c.count)])}
            empty="Aún no hay clics."
          />
        </Card>
      </section>

      <section className={styles.row2}>
        <Card className={styles.panel}>
          <h2 className={styles.h2}>Recursos más descargados</h2>
          <Table
            rows={data.topResources.map((r) => [r.title, formatNumber(r.downloads)])}
            empty="Aún no hay descargas."
          />
        </Card>
        <Card className={styles.panel}>
          <h2 className={styles.h2}>Ubicaciones</h2>
          <Table
            rows={data.countries.map((c) => [c.name, formatNumber(c.value)])}
            empty="Sin datos de ubicación."
          />
        </Card>
      </section>
    </div>
  );
}

// Tabla simple de 2 columnas (clave → valor)
function Table({ rows, empty }: { rows: [string, string][]; empty: string }) {
  if (rows.length === 0) return <p className={styles.empty}>{empty}</p>;
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <tbody>
          {rows.map(([k, v], i) => (
            <tr key={`${k}-${i}`}>
              <td className={styles.tdKey} title={k}>
                {k}
              </td>
              <td className={styles.tdVal}>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
