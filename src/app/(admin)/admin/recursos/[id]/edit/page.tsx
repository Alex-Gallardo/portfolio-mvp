import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ResourceForm } from "@/features/resources/ResourceForm";
import { toScalarValues, toFileItems } from "@/features/resources/schema";
import { updateResource } from "@/features/resources/actions";

export default async function EditResourcePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const resource = await prisma.resource.findUnique({
    where: { id },
    include: { files: { orderBy: { order: "asc" } } },
  });
  if (!resource) notFound();

  return (
    <section>
      <h1>Editar recurso</h1>
      <ResourceForm
        defaultValues={toScalarValues(resource)}
        initialFiles={toFileItems(resource.files)}
        action={updateResource.bind(null, resource.id)}
        submitLabel="Guardar cambios"
      />
    </section>
  );
}
