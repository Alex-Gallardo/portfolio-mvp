import { ProjectForm } from "@/features/projects/ProjectForm";
import { createProject } from "@/features/projects/actions";

export default function NewProjectPage() {
  return (
    <section>
      <h1>Nuevo proyecto</h1>
      <ProjectForm action={createProject} submitLabel="Crear proyecto" />
    </section>
  );
}
