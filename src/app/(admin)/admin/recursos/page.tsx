import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ResourcesTable } from "@/features/resources/ResourcesTable";
import { deleteResource } from "@/features/resources/actions";

export const dynamic = "force-dynamic";

export default async function AdminResourcesPage() {
  const resources = await prisma.resource.findMany({ orderBy: { order: "asc" } });

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
        <h1>Recursos</h1>
        <Link href="/admin/recursos/new">+ Nuevo recurso</Link>
      </header>
      <ResourcesTable rows={resources} onDelete={deleteResource} />
    </section>
  );
}
