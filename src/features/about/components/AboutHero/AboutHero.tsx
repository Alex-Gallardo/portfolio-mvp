import Image from "next/image";
import styles from "./AboutHero.module.css";

interface AboutHeroProps {
  title?: string;
  bio?: string;
}

export function AboutHero({ title, bio }: AboutHeroProps) {
  return (
    <section className={styles.hero}>
      <div className={`${styles.inner} u-fade-up`}>
        <Image
          src="/images/avatar.jpg"
          alt="Foto de [Tu Nombre]"
          width={140}
          height={140}
          priority
          className={styles.avatar}
        />
        <div className={styles.text}>
          <h1 className={styles.title}>{title ?? "Soy [Nombre], dev full-stack"}</h1>
          <p className={styles.bio}>
            {bio ??
              "Enfocado en performance y experiencia. Diseño y construyo productos web rápidos, accesibles y pensados para crecer."}
          </p>
          <a href="/cv.pdf" download className={styles.cv} data-track="about-cv">
            Descargar CV
          </a>
        </div>
      </div>
    </section>
  );
}
