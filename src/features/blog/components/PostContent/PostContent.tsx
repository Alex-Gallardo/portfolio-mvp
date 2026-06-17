import styles from "./PostContent.module.css";

export function PostContent({ html }: { html: string }) {
  return <div className={styles.prose} dangerouslySetInnerHTML={{ __html: html }} />;
}
