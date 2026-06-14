import Link from "next/link";
import { Card } from "@/components/ui/Card/Card";
import { Badge } from "@/components/ui/Badge/Badge";
import { type ServiceListItem } from "../../types";
import styles from "./ServiceCard.module.css";

export function ServiceCard({ service }: { service: ServiceListItem }) {
  return (
    <Link
      href={`/servicios/${service.slug}`}
      className={styles.link}
      data-track={`service-card:${service.slug}`}
    >
      <Card interactive className={styles.card}>
        {service.icon ? (
          <span className={styles.icon} aria-hidden="true">
            {service.icon}
          </span>
        ) : null}
        <h3 className={styles.title}>{service.title}</h3>
        <p className={styles.summary}>{service.summary}</p>
        {service.features.length > 0 ? (
          <div className={styles.tags}>
            {service.features.slice(0, 3).map((f) => (
              <Badge key={f} variant="default">
                {f}
              </Badge>
            ))}
          </div>
        ) : null}
        {service.priceLabel ? (
          <span className={styles.price}>Desde {service.priceLabel}</span>
        ) : null}
      </Card>
    </Link>
  );
}
