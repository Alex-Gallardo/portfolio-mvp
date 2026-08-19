import { Footer, NavGlass } from "@/components/layout";
import { Tracker } from "@/features/analytics/components/Tracker";

import styles from "./immersive-layout.module.css";

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
