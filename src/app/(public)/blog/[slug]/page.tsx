import Link from "next/link";
import { notFound } from "next/navigation";
import { renderMarkdown } from "@/lib/markdown";
import {
  getPostBySlug,
  getRelatedPosts,
  getFeaturedResource,
  getPublishedSlugs,
} from "@/features/blog/queries";
import { PostContent } from "@/features/blog/components/PostContent/PostContent";
import { Toc } from "@/features/blog/components/Toc/Toc";
import { ResourceCta } from "@/features/blog/components/ResourceCta/ResourceCta";
import styles from "./post.module.css";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getPublishedSlugs();
  return slugs.map((slug) => ({ slug }));
}

function fmt(date: Date | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/** Parte el HTML por su párrafo central para insertar el CTA a mitad del post. */
function splitMidpoint(html: string): [string, string] {
  const parts = html.split("</p>");
  if (parts.length < 4) return [html, ""];
  const mid = Math.floor(parts.length / 2);
  return [parts.slice(0, mid).join("</p>") + "</p>", parts.slice(mid).join("</p>")];
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const { html, toc } = await renderMarkdown(post.content);
  const categoryIds = post.categories.map((c) => c.id);
  const [related, resource] = await Promise.all([
    getRelatedPosts(post.id, categoryIds),
    getFeaturedResource(),
  ]);

  const [firstHalf, secondHalf] = resource ? splitMidpoint(html) : [html, ""];

  return (
    <main className={styles.wrap}>
      <article className={styles.layout}>
        <div className={styles.content}>
          <header className={styles.header}>
            {post.tags.length > 0 ? (
              <ul className={styles.tags}>
                {post.tags.map((t) => (
                  <li key={t} className={styles.tag}>
                    {t}
                  </li>
                ))}
              </ul>
            ) : null}
            <h1 className={styles.h1}>{post.title}</h1>
            <p className={styles.meta}>
              {post.author?.fullName ? `${post.author.fullName} · ` : ""}
              {fmt(post.publishedAt)} · {post.readMinutes ?? 3} min
            </p>
          </header>

          {post.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.coverUrl} alt="" className={styles.cover} />
          ) : null}

          {resource && secondHalf ? (
            <>
              <PostContent html={firstHalf} />
              <ResourceCta slug={resource.slug} title={resource.title} summary={resource.summary} />
              <PostContent html={secondHalf} />
            </>
          ) : (
            <>
              <PostContent html={html} />
              {resource ? (
                <ResourceCta
                  slug={resource.slug}
                  title={resource.title}
                  summary={resource.summary}
                />
              ) : null}
            </>
          )}

          {post.attachments.length > 0 ? (
            <section className={styles.attachments}>
              <h2 className={styles.attachTitle}>Descargas</h2>
              <ul className={styles.attachList}>
                {post.attachments.map((a) => (
                  <li key={a.id}>
                    <span>{a.label}</span> <span className={styles.fileName}>({a.fileName})</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className={styles.sidebar}>
          <Toc items={toc} />
        </aside>
      </article>

      {related.length > 0 ? (
        <section className={styles.related}>
          <h2 className={styles.relatedTitle}>Artículos relacionados</h2>
          <ul className={styles.relatedList}>
            {related.map((r) => (
              <li key={r.id}>
                <Link href={`/blog/${r.slug}`} className={styles.relatedLink}>
                  {r.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
