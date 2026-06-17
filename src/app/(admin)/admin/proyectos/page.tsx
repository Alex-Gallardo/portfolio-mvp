import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProjectsTable } from "@/features/projects/ProjectsTable";
import { deleteProject } from "@/features/projects/actions";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const projects = await prisma.project.findMany({ orderBy: { order: "asc" } });

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
        <h1>Proyectos</h1>
        <Link href="/admin/proyectos/new">+ Nuevo proyecto</Link>
      </header>
      <ProjectsTable rows={projects} onDelete={deleteProject} />
    </section>
  );
}
