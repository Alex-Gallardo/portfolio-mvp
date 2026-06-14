import Link from "next/link";
import { notFound } from "next/navigation";
import { renderMarkdown } from "@/lib/markdown";
import { PostContent } from "@/features/blog/components/PostContent/PostContent";
import {
  getServiceBySlug,
  getRelatedServices,
  getPublishedServiceSlugs,
} from "@/features/services/queries";
import { ServiceCta } from "@/features/services/components/ServiceCta/ServiceCta";
import { ServiceCard } from "@/features/services/components/ServiceCard/ServiceCard";
import { type ServiceListItem } from "@/features/services/types";
import styles from "./service.module.css";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getPublishedServiceSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) notFound();

  const { html } = await renderMarkdown(service.content);
  const relatedRaw = await getRelatedServices(service.id);
  const related: ServiceListItem[] = relatedRaw.map((s) => ({
    id: s.id,
    slug: s.slug,
    title: s.title,
    summary: s.summary,
    icon: s.icon,
    priceLabel: s.priceFrom ? `$${s.priceFrom.toString()}` : null,
    features: s.features,
  }));

  return (
    <main className={styles.wrap}>
      {/* Breadcrumb visible (el JSON-LD BreadcrumbList llega en el S7) */}
      <nav className={styles.breadcrumb} aria-label="Migas de pan">
        <Link href="/">Home</Link> / <Link href="/servicios">Servicios</Link> /{" "}
        <span aria-current="page">{service.title}</span>
      </nav>

      <header className={styles.header}>
        {service.icon ? (
          <span className={styles.icon} aria-hidden="true">
            {service.icon}
          </span>
        ) : null}
        <h1 className={styles.h1}>{service.title}</h1>
        <p className={styles.summary}>{service.summary}</p>
        {service.priceFrom ? (
          <p className={styles.price}>Desde ${service.priceFrom.toString()}</p>
        ) : null}
      </header>

      {service.features.length > 0 ? (
        <section className={styles.features}>
          <h2 className={styles.sectionTitle}>Qué incluye</h2>
          <ul className={styles.featureList}>
            {service.features.map((f) => (
              <li key={f}>✓ {f}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <PostContent html={html} />

      {service.attachments.length > 0 ? (
        <section className={styles.attachments}>
          <h2 className={styles.sectionTitle}>Material</h2>
          <ul className={styles.attachList}>
            {service.attachments.map((a) => (
              <li key={a.id}>
                <span>{a.label}</span> <span className={styles.fileName}>({a.fileName})</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <ServiceCta slug={service.slug} title={service.title} />

      {related.length > 0 ? (
        <section className={styles.related}>
          <h2 className={styles.sectionTitle}>Otros servicios</h2>
          <div className={styles.relatedGrid}>
            {related.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
