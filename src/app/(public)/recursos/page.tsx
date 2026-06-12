import { prisma } from "@/lib/prisma";
import { DownloadButton } from "@/features/resources/DownloadButton";

export const revalidate = 60;

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
            <li key={r.id} style={{ marginBottom: "var(--sp-4)" }}>
              <strong>{r.title}</strong> — {r.summary}
              <br />
              <DownloadButton resourceSlug={r.slug} resourceTitle={r.title} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
