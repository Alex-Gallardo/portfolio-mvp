import Link from "next/link";
import { type PostListItem } from "../../types";
import styles from "./PostCard.module.css";

export function PostCard({ post }: { post: PostListItem }) {
  return (
    <Link href={`/blog/${post.slug}`} className={styles.link} data-track={`blog-card:${post.slug}`}>
      <article className={styles.card}>
        <div className={styles.media}>
          {post.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.coverUrl} alt="" className={styles.cover} loading="lazy" />
          ) : (
            <div className={styles.coverPlaceholder} aria-hidden="true" />
          )}
          <div className={styles.scrim} aria-hidden="true" />
        </div>

        <span className={styles.readChip}>{post.readMinutes} min</span>

        <div className={styles.body}>
          {post.tags.length > 0 ? (
            <div className={styles.tags}>
              {post.tags.slice(0, 3).map((t) => (
                <span key={t} className={styles.tag}>
                  {t}
                </span>
              ))}
            </div>
          ) : null}

          <h3 className={styles.title}>{post.title}</h3>
          {post.excerpt ? <p className={styles.excerpt}>{post.excerpt}</p> : null}

          <span className={styles.meta}>{post.dateLabel}</span>

          <span className={styles.cta} aria-hidden="true">
            Leer artículo
            <svg viewBox="0 0 24 24" className={styles.ctaIcon} focusable="false">
              <path
                d="M5 12h13M13 6l6 6-6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      </article>
    </Link>
  );
}
