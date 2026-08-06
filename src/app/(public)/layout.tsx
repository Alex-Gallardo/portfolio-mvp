import { AuroraBackground, NavGlass, Footer } from "@/components/layout";
// import { DownloadModal } from "@/features/resources/DownloadModal/DownloadModal";
import { DownloadModal } from "@/features/resources/DownloadModal/DownloadModal";
import { Tracker } from "@/features/analytics/components/Tracker";

// El contenido público vive en el CMS. Resolverlo al recibir la petición evita
// que una indisponibilidad temporal de la base de datos invalide el build.
export const dynamic = "force-dynamic";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuroraBackground />
      <NavGlass />
      <main>{children}</main>
      <DownloadModal />
      <Footer />
      <Tracker />
    </>
  );
}
