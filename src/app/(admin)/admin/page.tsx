import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { logout } from "./actions";

export default async function AdminPlaceholderPage() {
  const profile = await getProfile();

  // El proxy ya bloqueó a los sin sesión. Aquí validamos el ROL.
  if (!profile || (profile.role !== "ADMIN" && profile.role !== "EDITOR")) {
    redirect("/login");
  }

  return (
    <main style={{ padding: 32 }}>
      <p>
        Hola, {profile.email} (rol: {profile.role}). El shell completo llega en el S2-T4.
      </p>
      <form action={logout}>
        <button type="submit">Cerrar sesión</button>
      </form>
    </main>
  );
}
