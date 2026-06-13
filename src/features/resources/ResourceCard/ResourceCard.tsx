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
        </Link>
      ) : null}

      <span className={styles.badge}>{CATEGORY_LABELS[resource.category]}</span>

      <h3 className={styles.title}>
        <Link href={`/recursos/${resource.slug}`} className={styles.titleLink}>
          {resource.title}
        </Link>
      </h3>
      <p className={styles.summary}>{resource.summary}</p>

      <p className={styles.meta}>
        {resource.fileCount} archivo{resource.fileCount === 1 ? "" : "s"}
        {resource.downloadCount > 0
          ? ` · descargado ${resource.downloadCount} ${resource.downloadCount === 1 ? "vez" : "veces"}`
          : ""}
      </p>

      <DownloadButton
        resourceSlug={resource.slug}
        resourceTitle={resource.title}
        className={styles.downloadBtn}
      />

      <p className={styles.trust}>Gratis · Sin spam · 30 seg</p>
    </article>
  );
}
