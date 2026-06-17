import Link from "next/link";
import { Card } from "@/components/ui/Card/Card";
import { Badge } from "@/components/ui/Badge/Badge";
import { type PostListItem } from "../../types";
import styles from "./PostCard.module.css";

export function PostCard({ post }: { post: PostListItem }) {
  return (
    <Link href={`/blog/${post.slug}`} className={styles.link} data-track={`blog-card:${post.slug}`}>
      <Card interactive className={styles.card}>
        {post.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.coverUrl} alt="" className={styles.cover} loading="lazy" />
        ) : (
          <div className={styles.coverPlaceholder} aria-hidden="true" />
        )}
        <div className={styles.body}>
          {post.tags.length > 0 ? (
            <div className={styles.tags}>
              {post.tags.slice(0, 3).map((t) => (
                <Badge key={t} variant="brand">
                  {t}
                </Badge>
              ))}
            </div>
          ) : null}
          <h3 className={styles.title}>{post.title}</h3>
          {post.excerpt ? <p className={styles.excerpt}>{post.excerpt}</p> : null}
          <span className={styles.meta}>
            {post.dateLabel} · {post.readMinutes} min
          </span>
        </div>
      </Card>
    </Link>
  );
}
