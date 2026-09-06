import { AchievementCard, type Achievement } from "./AchievementCard";
import { Carousel } from "@/components/ui/Carousel/Carousel";
import styles from "./Achievements.module.css";

/**
 * `credentialUrl` es opcional a propósito: el sello "Verificar" solo aparece
 * cuando hay una credencial real detrás. Un badge de verificación sin destino
 * es exactamente el tipo de señal que destruye la confianza que busca generar.
 */
const ACHIEVEMENTS: Achievement[] = [
  {
    id: "a1",
    title: "Next.js avanzado",
    issuer: "Curso pro",
    year: "2024",
    kind: "curso",
    hue: 0,
  },
  {
    id: "a2",
    title: "Accesibilidad web",
    issuer: "Certificación",
    year: "2023",
    kind: "certificacion",
    hue: 72,
  },
  {
    id: "a3",
    title: "SEO técnico",
    issuer: "Programa",
    year: "2023",
    kind: "programa",
    hue: 144,
  },
  {
    id: "a4",
    title: "Smart contracts",
    issuer: "Bootcamp",
    year: "2024",
    kind: "bootcamp",
    hue: 216,
  },
];

export function Achievements() {
  return (
    <section className={styles.section} aria-labelledby="achievements-title">
      <header className={styles.head}>
        <div>
          <p className={styles.eyebrow}>Formación</p>
          <h2 id="achievements-title" className={styles.h2}>
            Logros y certificaciones
          </h2>
        </div>
        <p className={styles.lead}>
          Lo que he estudiado en serio, con fecha y emisor. Pasa el cursor por encima.
        </p>
      </header>

      <Carousel
        ariaLabel="Logros y certificaciones"
        items={ACHIEVEMENTS}
        getKey={(a) => a.id}
        renderItem={(a) => <AchievementCard achievement={a} />}
      />
    </section>
  );
}
