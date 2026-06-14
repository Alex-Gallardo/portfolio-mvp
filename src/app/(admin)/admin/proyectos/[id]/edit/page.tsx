import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProjectForm } from "@/features/projects/ProjectForm";
import { toFormValues, toImageItems } from "@/features/projects/schema";
import { updateProject } from "@/features/projects/actions";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: { images: { orderBy: { order: "asc" } } },
  });
  if (!project) notFound();

  return (
    <section>
      <h1>Editar proyecto</h1>
      <ProjectForm
        defaultValues={toFormValues(project)}
        initialImages={toImageItems(project.images)}
        action={updateProject.bind(null, project.id)}
        submitLabel="Guardar cambios"
      />
    </section>
  );
}
