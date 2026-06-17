"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button/Button";
import { type PostListItem } from "../../types";
import { PostCard } from "../PostCard/PostCard";
import styles from "./BlogList.module.css";

export function BlogList({ posts }: { posts: PostListItem[] }) {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => p.tags.forEach((t) => set.add(t)));
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [posts]);

  const visible = activeTag ? posts.filter((p) => p.tags.includes(activeTag)) : posts;

  return (
    <div>
      {allTags.length > 0 ? (
        <div className={styles.filters} role="group" aria-label="Filtrar por tag">
          <Button
            type="button"
            size="sm"
            variant={activeTag === null ? "primary" : "ghost"}
            aria-pressed={activeTag === null}
            onClick={() => setActiveTag(null)}
          >
            Todos
          </Button>
          {allTags.map((t) => (
            <Button
              key={t}
              type="button"
              size="sm"
              variant={activeTag === t ? "primary" : "ghost"}
              aria-pressed={activeTag === t}
              onClick={() => setActiveTag(t)}
            >
              {t}
            </Button>
          ))}
        </div>
      ) : null}

      {visible.length === 0 ? (
        <p className={styles.empty}>No hay artículos con ese tag.</p>
      ) : (
        <div className={styles.grid}>
          {visible.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
