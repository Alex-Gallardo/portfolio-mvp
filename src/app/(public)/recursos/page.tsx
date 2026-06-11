import { prisma } from "@/lib/prisma";

export const revalidate = 60; // ISR

export default async function RecursosPage() {
  const resources = await prisma.resource.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { order: "asc" },
    include: { files: { orderBy: { order: "asc" } } },
  });

  return (
    <section style={{ maxWidth: 720, margin: "0 auto", padding: "var(--sp-12) var(--gutter)" }}>
      <h1>Recursos</h1>
      {resources.length === 0 ? (
        <p>Pronto subiré nuevos recursos. ¡Vuelve pronto!</p>
      ) : (
        <ul>
          {resources.map((r) => (
            <li key={r.id}>
              <strong>{r.title}</strong> — {r.summary} ({r.files.length} archivo
              {r.files.length === 1 ? "" : "s"})
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
