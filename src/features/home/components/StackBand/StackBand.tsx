import { Badge } from "@/components/ui/Badge/Badge";
import styles from "./StackBand.module.css";

const TECHS = [
  "Next.js",
  "TypeScript",
  "React",
  "Prisma",
  "PostgreSQL",
  "Supabase",
  "Node.js",
  "CSS",
  "Vercel",
  "Solidity",
];

export function StackBand() {
  return (
    <section className={styles.band} aria-label="Tecnologías con las que trabajo">
      <p className={styles.label}>Trabajo con</p>
      <div className={styles.list}>
        {TECHS.map((t) => (
          <Badge key={t} variant="default">
            {t}
          </Badge>
        ))}
      </div>
    </section>
  );
}
