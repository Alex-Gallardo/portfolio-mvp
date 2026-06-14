import { getPublishedServices } from "@/features/services/queries";
import { ServiceCard } from "@/features/services/components/ServiceCard/ServiceCard";
import { type ServiceListItem } from "@/features/services/types";
import styles from "./servicios.module.css";

export const revalidate = 3600;

export default async function ServicesPage() {
  const services = await getPublishedServices();
  const items: ServiceListItem[] = services.map((s) => ({
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
      <header className={styles.hero}>
        <h1 className={styles.h1}>Servicios</h1>
        <p className={styles.sub}>Desarrollo, diseño y SEO técnico para que tu marca destaque.</p>
      </header>

      {items.length === 0 ? (
        <p className={styles.empty}>Pronto publicaré mis servicios.</p>
      ) : (
        <div className={styles.grid}>
          {items.map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
      )}
    </main>
  );
}
