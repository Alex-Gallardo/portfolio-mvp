import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ServicesTable } from "@/features/services/ServicesTable";
import { deleteService } from "@/features/services/actions";
import { type ServiceRow } from "@/features/services/columns";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const services = await prisma.service.findMany({ orderBy: { order: "asc" } });

  // Decimal → string para poder cruzar a un Client Component (ServicesTable).
  const rows: ServiceRow[] = services.map((s) => ({
    id: s.id,
    title: s.title,
    slug: s.slug,
    status: s.status,
    order: s.order,
    priceFrom: s.priceFrom ? s.priceFrom.toString() : null,
  }));

  return (
    <section>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h1>Servicios</h1>
        <Link href="/admin/servicios/new">+ Nuevo servicio</Link>
      </header>
      <ServicesTable rows={rows} onDelete={deleteService} />
    </section>
  );
}
