import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ServicesTable } from "@/features/services/ServicesTable";
import { deleteService } from "@/features/services/actions";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const services = await prisma.service.findMany({ orderBy: { order: "asc" } });

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
      <ServicesTable rows={services} onDelete={deleteService} />
    </section>
  );
}
