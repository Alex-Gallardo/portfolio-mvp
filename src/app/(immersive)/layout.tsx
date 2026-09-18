import { Footer, NavGlass } from "@/components/layout";
import { Tracker } from "@/features/analytics/components/Tracker";

import styles from "./immersive-layout.module.css";

// Igual que el layout público: el contenido viene del CMS y se resuelve al
// recibir la petición, así el build no depende de que la base de datos responda.
export const dynamic = "force-dynamic";

export default function ImmersiveLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <NavGlass />
      {children}
      <Footer />
      <Tracker />
    </div>
  );
}
