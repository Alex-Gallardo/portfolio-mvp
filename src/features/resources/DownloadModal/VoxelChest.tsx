import styles from "./VoxelChest.module.css";

export type ChestState = "idle" | "loading" | "success" | "error";

/**
 * Cofre voxel en CSS 3D: cuerpo y tapa como cajas de 6 caras con textura
 * pixel (tablones, herrajes, candado). La tapa gira en su bisagra al
 * abrirse; del interior sale luz y un archivo. Decorativo.
 */
export function VoxelChest({ state }: { state: ChestState }) {
  return (
    <div className={styles.scene} data-state={state} aria-hidden="true">
      <div className={styles.chest}>
        {/* Luz del interior y botín */}
        <span className={styles.glow} />
        <span className={styles.loot}>
          <span className={styles.file} />
          <span className={styles.coin} data-i="0" />
          <span className={styles.coin} data-i="1" />
          <span className={styles.coin} data-i="2" />
        </span>

        <div className={styles.body}>
          <span className={`${styles.face} ${styles.front}`} />
          <span className={`${styles.face} ${styles.back}`} />
          <span className={`${styles.face} ${styles.left}`} />
          <span className={`${styles.face} ${styles.right}`} />
          <span className={`${styles.face} ${styles.top}`} />
          <span className={`${styles.face} ${styles.bottom}`} />
        </div>

        <div className={styles.lid}>
          <span className={`${styles.face} ${styles.lidFront}`} />
          <span className={`${styles.face} ${styles.lidBack}`} />
          <span className={`${styles.face} ${styles.lidLeft}`} />
          <span className={`${styles.face} ${styles.lidRight}`} />
          <span className={`${styles.face} ${styles.lidTop}`} />
          <span className={`${styles.face} ${styles.lidBottom}`} />
        </div>

        <span className={styles.lock} />
      </div>

      <span className={styles.shadow} />
      <span className={styles.sparks}>
        {Array.from({ length: 8 }, (_, i) => (
          <i key={i} style={{ "--a": `${i * 45}deg` } as React.CSSProperties} />
        ))}
      </span>
    </div>
  );
}
