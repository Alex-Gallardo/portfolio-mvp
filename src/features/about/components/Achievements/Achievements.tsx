import { Carousel } from "@/components/ui/Carousel/Carousel";
import { Card } from "@/components/ui/Card/Card";
import styles from "./Achievements.module.css";

interface Achievement {
  id: string;
  title: string;
  issuer: string;
  year: string;
}

const ACHIEVEMENTS: Achievement[] = [
  { id: "a1", title: "Next.js avanzado", issuer: "Curso pro", year: "2024" },
  { id: "a2", title: "Accesibilidad web", issuer: "Certificación", year: "2023" },
  { id: "a3", title: "SEO técnico", issuer: "Programa", year: "2023" },
  { id: "a4", title: "Smart contracts", issuer: "Bootcamp", year: "2024" },
];

export function Achievements() {
  return (
    <section className={styles.section} aria-label="Logros y certificaciones">
      <h2 className={styles.h2}>Logros y certificaciones</h2>
      <Carousel
        ariaLabel="Logros y certificaciones"
        items={ACHIEVEMENTS}
        getKey={(a) => a.id}
        renderItem={(a) => (
          <Card className={styles.card}>
            <span className={styles.year}>{a.year}</span>
            <h3 className={styles.title}>{a.title}</h3>
            <p className={styles.issuer}>{a.issuer}</p>
          </Card>
        )}
      />
    </section>
  );
}
