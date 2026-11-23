import { BlogHeroMedia } from "./BlogHeroMedia";
import styles from "./BlogHero.module.css";

export function BlogHero() {
  return (
    <header className={styles.hero}>
      <BlogHeroMedia />
      <div className={styles.copy}>
        <h1>Blog</h1>
        <p>Ideas sobre desarrollo web, performance y SEO.</p>
      </div>
    </header>
  );
}
