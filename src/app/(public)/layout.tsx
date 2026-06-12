import { AuroraBackground, NavGlass, Footer } from "@/components/layout";
// import { DownloadModal } from "@/features/resources/DownloadModal/DownloadModal";
import { DownloadModal } from "@/features/resources/DownloadModal/DownloadModal";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuroraBackground />
      <NavGlass />
      <main>{children}</main>
      <DownloadModal />
      <Footer />
    </>
  );
}
