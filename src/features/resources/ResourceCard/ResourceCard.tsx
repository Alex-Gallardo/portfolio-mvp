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

  /** Opcional. Extensiones del paquete: ["fig", "pdf"]. Es el dato que más
   *  ayuda a decidir: el visitante quiere saber QUÉ recibe, no cuántos ficheros. */
  fileTypes?: string[] | null;
  /** Opcional. Peso total ya formateado: "12 MB". */
  fileSize?: string | null;
  /** Opcional. Activa el sello "Nuevo" durante NEW_WINDOW_DAYS. */
  publishedAt?: string | Date | null;
}

const NEW_WINDOW_DAYS = 21;
const POPULAR_THRESHOLD = 100;
const MAX_FORMAT_TAGS = 3;

const numberFmt = new Intl.NumberFormat("es-GT");

/** Server Component: `Date.now()` se evalúa en el servidor, sin riesgo de
 *  hydration mismatch. Si algún día esto pasa a "use client", calcula
 *  `isNew` en el data layer y pásalo como prop. */
function isRecent(date: ResourceCardData["publishedAt"]): boolean {
  if (!date) return false;
  const published = new Date(date).getTime();
  if (Number.isNaN(published)) return false;
  return Date.now() - published < NEW_WINDOW_DAYS * 24 * 60 * 60 * 1000;
}

export function ResourceCard({
  resource,
  priority = false,
}: {
  resource: ResourceCardData;
  /** Pásalo en las 2–3 primeras cards del grid para mejorar el LCP. */
  priority?: boolean;
}) {
  const href = `/recursos/${resource.slug}`;
  const categoryLabel = CATEGORY_LABELS[resource.category];
  const formats = (resource.fileTypes ?? []).slice(0, MAX_FORMAT_TAGS);
  const showNew = isRecent(resource.publishedAt);
  const isPopular = resource.downloadCount >= POPULAR_THRESHOLD;

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        {resource.coverUrl ? (
          <Image
            src={resource.coverUrl}
            alt={`Vista previa de ${resource.title}`}
            fill
            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 30vw"
            className={styles.cover}
            priority={priority}
          />
        ) : (
          <div className={styles.coverFallback} aria-hidden="true">
            <PackageIcon className={styles.fallbackIcon} />
          </div>
        )}

        <span className={styles.sheen} aria-hidden="true" />

        <div className={styles.mediaTop}>
          <span className={styles.badge}>{categoryLabel}</span>
          {showNew ? <span className={styles.badgeNew}>Nuevo</span> : null}
        </div>

        {/* Afordancia de "la portada también lleva al detalle".
            Oculto en táctil: ahí toda la card es tappable. */}
        <span className={styles.peek} aria-hidden="true">
          Ver detalles
          <ArrowIcon className={styles.peekIcon} />
        </span>
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>
          {/* Stretched link: el <a> del título cubre toda la card vía ::after,
              así el área de clic es la card completa y sigue habiendo un solo
              tab stop con nombre accesible real. */}
          <Link href={href} className={styles.titleLink}>
            {resource.title}
          </Link>
        </h3>
        <p className={styles.summary}>{resource.summary}</p>
      </div>

      {/* Línea de troquel: separa "qué es" de "qué recibo". */}
      <div className={styles.manifest}>
        <ul className={styles.contents}>
          {formats.map((format) => (
            <li key={format} className={styles.format}>
              {format}
            </li>
          ))}
          <li className={styles.contentsItem}>
            <FileIcon className={styles.metaIcon} />
            {resource.fileCount} archivo{resource.fileCount === 1 ? "" : "s"}
          </li>
          {resource.fileSize ? <li className={styles.contentsItem}>{resource.fileSize}</li> : null}
        </ul>

        {resource.downloadCount > 0 ? (
          <p className={`${styles.downloads} ${isPopular ? styles.downloadsHot : ""}`}>
            <DownloadIcon className={styles.metaIcon} />
            <span>
              <strong>{numberFmt.format(resource.downloadCount)}</strong> descarga
              {resource.downloadCount === 1 ? "" : "s"}
            </span>
          </p>
        ) : null}
      </div>

      <div className={styles.actions}>
        <DownloadButton
          resourceSlug={resource.slug}
          resourceTitle={resource.title}
          className={styles.downloadBtn}
        />

        <p className={styles.trust}>
          <ShieldIcon className={styles.trustIcon} />
          <span>Gratis · Sin spam · 30 seg</span>
        </p>
      </div>
    </article>
  );
}

/* ---------- Iconos ---------- */

type IconProps = { className?: string };

const iconBase = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

function FileIcon({ className }: IconProps) {
  return (
    <svg {...iconBase} className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

function DownloadIcon({ className }: IconProps) {
  return (
    <svg {...iconBase} className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="m7 10 5 5 5-5" />
      <path d="M12 15V3" />
    </svg>
  );
}

function ShieldIcon({ className }: IconProps) {
  return (
    <svg {...iconBase} className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function ArrowIcon({ className }: IconProps) {
  return (
    <svg {...iconBase} className={className}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function PackageIcon({ className }: IconProps) {
  return (
    <svg {...iconBase} className={className}>
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}
