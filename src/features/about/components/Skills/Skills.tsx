import { Badge } from "@/components/ui/Badge/Badge";
import styles from "./Skills.module.css";

const SKILLS: Record<string, string[]> = {
  Frontend: ["React", "Next.js", "TypeScript", "CSS", "Accesibilidad"],
  Backend: ["Node.js", "Prisma", "PostgreSQL", "Supabase", "REST"],
  Web3: ["Solidity", "ethers.js", "Wallets", "Smart contracts"],
  Herramientas: ["Git", "Vercel", "Figma", "Vitest", "Playwright"],
};

export function Skills() {
  return (
    <section className={styles.section} aria-label="Habilidades">
      <h2 className={styles.h2}>Habilidades</h2>
      <div className={styles.grid}>
        {Object.entries(SKILLS).map(([cat, items]) => (
          <div key={cat} className={styles.group}>
            <h3 className={styles.cat}>{cat}</h3>
            <div className={styles.chips}>
              {items.map((s) => (
                <Badge key={s} variant="default">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
