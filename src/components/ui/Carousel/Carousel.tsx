import type { ReactNode } from "react";
import { CarouselShell } from "./CarouselShell";
import styles from "./Carousel.module.css";

interface CarouselProps<T> {
  items: T[];
  renderItem: (item: T) => ReactNode;
  getKey: (item: T) => string;
  ariaLabel: string;
}

/**
 * Server Component. Mantiene la API original (items + render props)
 * y resuelve las funciones AQUÍ, antes de cruzar la frontera al cliente.
 * Al CarouselShell (client) solo le llegan ReactNode serializables.
 */
export function Carousel<T>({ items, renderItem, getKey, ariaLabel }: CarouselProps<T>) {
  return (
    <CarouselShell ariaLabel={ariaLabel}>
      {items.map((item) => (
        <li key={getKey(item)} className={styles.slide}>
          {renderItem(item)}
        </li>
      ))}
    </CarouselShell>
  );
}
