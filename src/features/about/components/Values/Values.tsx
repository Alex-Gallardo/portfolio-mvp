import { Card } from "@/components/ui/Card/Card";
import styles from "./Values.module.css";

const VALUES = [
  { icon: "⚡", title: "Velocidad", text: "Cada milisegundo cuenta para la experiencia y el SEO." },
  { icon: "🎯", title: "Conversión", text: "Diseño orientado a que el visitante avance." },
  { icon: "♿", title: "Accesibilidad", text: "Productos usables por todas las personas." },
  { icon: "🤝", title: "Confianza", text: "Comunicación clara y entregas a tiempo." },
];

export function Values() {
  return (
    <section className={styles.section} aria-label="Valores">
      <h2 className={styles.h2}>Lo que me importa</h2>
      <div className={styles.grid}>
        {VALUES.map((v) => (
          <Card key={v.title} className={styles.card}>
            <span className={styles.icon} aria-hidden="true">
              {v.icon}
            </span>
            <h3 className={styles.title}>{v.title}</h3>
            <p className={styles.text}>{v.text}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
