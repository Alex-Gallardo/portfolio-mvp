import Link from "next/link";
import { getLeads, getResourcesWithLeads } from "@/features/leads/queries";
import { rangeToSince } from "@/features/leads/csv";
import { LeadFilters } from "@/features/leads/components/LeadFilters/LeadFilters";
import styles from "./leads.module.css";

export const dynamic = "force-dynamic";

function buildExportHref(resource?: string, range?: string): string {
  const sp = new URLSearchParams();
  if (resource) sp.set("resource", resource);
  if (range && range !== "all") sp.set("range", range);
  const qs = sp.toString();
  return qs ? `/admin/leads/export?${qs}` : "/admin/leads/export";
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ resource?: string; range?: string }>;
}) {
  const { resource, range } = await searchParams;
  const activeRange = range ?? "all";
  const since = rangeToSince(activeRange);

  const [leads, resources] = await Promise.all([
    getLeads({ resourceId: resource, since }),
    getResourcesWithLeads(),
  ]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.h1}>Leads</h1>
          <p className={styles.sub}>
            {leads.length} {leads.length === 1 ? "correo captado" : "correos captados"}
          </p>
        </div>
        {leads.length > 0 ? (
          <Link
            href={buildExportHref(resource, activeRange)}
            className={styles.export}
            prefetch={false}
            download
          >
            ⬇ Exportar CSV
          </Link>
        ) : null}
      </header>

      <LeadFilters resources={resources} activeResource={resource} activeRange={activeRange} />

      {leads.length === 0 ? (
        <p className={styles.empty}>
          Aún no hay leads con este filtro. Cuando alguien descargue un recurso con su email,
          aparecerá aquí.
        </p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Email</th>
                <th>Nombre</th>
                <th>Recurso</th>
                <th>Consent.</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id}>
                  <td className={styles.email}>{l.email}</td>
                  <td>{l.name ?? "—"}</td>
                  <td>{l.sourceResource?.title ?? "—"}</td>
                  <td>{l.consent ? "Sí" : "No"}</td>
                  <td className={styles.date}>
                    {l.createdAt.toLocaleDateString("es", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
