import { redirect } from "next/navigation";
import { type ReactNode } from "react";
import { getProfile } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell/AdminShell";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const profile = await getProfile();

  if (!profile || (profile.role !== "ADMIN" && profile.role !== "EDITOR")) {
    redirect("/login");
  }

  return <AdminShell email={profile.email}>{children}</AdminShell>;
}
