import type { ReactNode } from "react";
import styles from "./Carousel.module.css";

interface CarouselProps<T> {
  items: T[];
  renderItem: (item: T) => ReactNode;
  getKey: (item: T) => string;
  ariaLabel: string;
}

export function Carousel<T>({ items, renderItem, getKey, ariaLabel }: CarouselProps<T>) {
  return (
    <ul className={styles.track} aria-label={ariaLabel} role="list">
      {items.map((item) => (
        <li key={getKey(item)} className={styles.slide}>
          {renderItem(item)}
        </li>
      ))}
    </ul>
  );
}
