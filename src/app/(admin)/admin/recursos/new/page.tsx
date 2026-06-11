import { ResourceForm } from "@/features/resources/ResourceForm";
import { createResource } from "@/features/resources/actions";

export default function NewResourcePage() {
  return (
    <section>
      <h1>Nuevo recurso</h1>
      <ResourceForm action={createResource} submitLabel="Crear recurso" />
    </section>
  );
}
