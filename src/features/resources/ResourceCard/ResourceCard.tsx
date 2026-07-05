import Link from "next/link";
import Image from "next/image";
import { type ResourceCategory } from "@prisma/client";
import { CATEGORY_LABELS } from "../categories";
import { DownloadButton } from "../DownloadButton";
import styles from "./ResourceCard.module.css";

export interface ResourceCardData {
  slug: string;
  title: string;
  summary: string;
  category: ResourceCategory;
  coverUrl: string | null;
  downloadCount: number;
  fileCount: number;
}

export function ResourceCard({ resource }: { resource: ResourceCardData }) {
  const categoryLabel = CATEGORY_LABELS[resource.category];

  return (
    <article className={styles.card}>
      {resource.coverUrl ? (
        <Link href={`/recursos/${resource.slug}`} className={styles.coverLink}>
          <Image
            src={resource.coverUrl}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className={styles.cover}
          />
          <span className={styles.badgeFloat}>{categoryLabel}</span>
        </Link>
      ) : (
        <span className={styles.badge}>{categoryLabel}</span>
      )}

      <div className={styles.content}>
        <h3 className={styles.title}>
          <Link href={`/recursos/${resource.slug}`} className={styles.titleLink}>
            {resource.title}
          </Link>
        </h3>
        <p className={styles.summary}>{resource.summary}</p>

        <p className={styles.meta}>
          <svg
            className={styles.metaIcon}
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
          </svg>
          <span>
            {resource.fileCount} archivo{resource.fileCount === 1 ? "" : "s"}
            {resource.downloadCount > 0
              ? ` · descargado ${resource.downloadCount} ${resource.downloadCount === 1 ? "vez" : "veces"}`
              : ""}
          </span>
        </p>
      </div>

      <div className={styles.actions}>
        <DownloadButton
          resourceSlug={resource.slug}
          resourceTitle={resource.title}
          className={styles.downloadBtn}
        />

        <p className={styles.trust}>
          <svg
            className={styles.trustIcon}
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <span>Gratis · Sin spam · 30 seg</span>
        </p>
      </div>
    </article>
  );
}
