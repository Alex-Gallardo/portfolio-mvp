import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// Usuario autenticado de Supabase (o null).
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// Perfil con el rol, desde tu DB.
export async function getProfile() {
  const user = await getCurrentUser();
  if (!user) return null;
  return prisma.profile.findUnique({ where: { id: user.id } });
}

export async function isStaff() {
  const profile = await getProfile();
  return profile?.role === "ADMIN" || profile?.role === "EDITOR";
}

export async function isAdmin() {
  const profile = await getProfile();
  return profile?.role === "ADMIN";
}

/**
 * Guard para Server Components / Route Handlers: corta si no hay admin.
 * Devuelve el profile (con rol ADMIN garantizado) si todo va bien.
 */
export async function requireAdmin() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "ADMIN") redirect("/admin");
  return profile;
}
