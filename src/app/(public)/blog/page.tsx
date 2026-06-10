import { prisma } from "@/lib/prisma";

export const revalidate = 60; // ISR

export default async function BlogPage() {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <section style={{ maxWidth: 720, margin: "0 auto", padding: "var(--sp-12) var(--gutter)" }}>
      <h1>Blog</h1>
      {posts.length === 0 ? (
        <p>Aún no hay artículos publicados.</p>
      ) : (
        <ul>
          {posts.map((p) => (
            <li key={p.id}>
              <strong>{p.title}</strong>
              {p.excerpt ? ` — ${p.excerpt}` : null}
              {/* La página de detalle /blog/[slug] llega en el S4-T1 */}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
