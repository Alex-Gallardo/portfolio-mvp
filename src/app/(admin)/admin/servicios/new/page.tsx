import { ServiceForm } from "@/features/services/ServiceForm";
import { createService } from "@/features/services/actions";

export default function NewServicePage() {
  return (
    <section>
      <h1>Nuevo servicio</h1>
      <ServiceForm action={createService} submitLabel="Crear servicio" />
    </section>
  );
}
