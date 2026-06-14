import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ServiceForm } from "@/features/services/ServiceForm";
import { toFormValues, toAttachmentItems } from "@/features/services/schema";
import { updateService } from "@/features/services/actions";

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = await prisma.service.findUnique({
    where: { id },
    include: { attachments: { orderBy: { order: "asc" } } },
  });
  if (!service) notFound();

  return (
    <section>
      <h1>Editar servicio</h1>
      <ServiceForm
        defaultValues={toFormValues(service)}
        initialFiles={toAttachmentItems(service.attachments)}
        action={updateService.bind(null, service.id)}
        submitLabel="Guardar cambios"
      />
    </section>
  );
}
