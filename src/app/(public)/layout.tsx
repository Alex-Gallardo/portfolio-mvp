import { AuroraBackground, NavGlass, Footer } from "@/components/layout";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuroraBackground />
      <NavGlass />
      <main>{children}</main>
      <Footer />
    </>
  );
}
