import Link from "next/link";
import { getPublishedPosts } from "@/features/blog/queries";
import { BlogList } from "@/features/blog/components/BlogList/BlogList";
import { type PostListItem } from "@/features/blog/types";
import styles from "./blog.module.css";
import { Badge } from "@/components/ui/Badge/Badge";

export const revalidate = 3600; // ISR: revalida cada hora

function fmt(date: Date | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default async function BlogPage() {
  const posts = await getPublishedPosts();
  const items: PostListItem[] = posts.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    coverUrl: p.coverUrl,
    tags: p.tags,
    readMinutes: p.readMinutes ?? 3,
    dateLabel: fmt(p.publishedAt),
  }));

  const [featured, ...rest] = items;

  return (
    <main className={styles.wrap}>
      <header className={styles.hero}>
        <h1 className={styles.h1}>Blog</h1>
        <p className={styles.sub}>Ideas sobre desarrollo web, performance y SEO.</p>
      </header>

      {items.length === 0 ? (
        <p className={styles.empty}>Aún no hay artículos aquí, pero pronto.</p>
      ) : (
        <>
          {featured ? (
            <Link
              href={`/blog/${featured.slug}`}
              className={styles.featured}
              data-track={`blog-featured:${featured.slug}`}
            >
              {featured.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={featured.coverUrl} alt="" className={styles.featuredCover} />
              ) : (
                <div className={styles.featuredPlaceholder} aria-hidden="true" />
              )}
              <div className={styles.featuredBody}>
                <Badge variant="brand">Más reciente</Badge>
                <h2 className={styles.featuredTitle}>{featured.title}</h2>
                {featured.excerpt ? (
                  <p className={styles.featuredExcerpt}>{featured.excerpt}</p>
                ) : null}
                <span className={styles.meta}>
                  {featured.dateLabel} · {featured.readMinutes} min
                </span>
              </div>
            </Link>
          ) : null}

          <BlogList posts={rest} />
        </>
      )}
    </main>
  );
}
