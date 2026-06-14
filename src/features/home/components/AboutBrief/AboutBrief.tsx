import Link from "next/link";
import styles from "./AboutBrief.module.css";

interface AboutBriefProps {
  title?: string;
  body?: string;
}

export function AboutBrief({ title, body }: AboutBriefProps) {
  return (
    <section className={styles.about}>
      <div className={styles.inner}>
        <h2 className={styles.h2}>{title ?? "Hola, soy [Nombre]"}</h2>
        <p className={styles.text}>
          {body ??
            "Dev full-stack enfocado en performance y experiencia. Diseño y construyo productos web rápidos, accesibles y pensados para crecer."}
        </p>
        <Link href="/about" className={styles.link} data-track="home-about">
          Conóceme más →
        </Link>
      </div>
    </section>
  );
}
