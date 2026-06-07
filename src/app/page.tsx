import { AuroraBackground } from "@/components/layout/AuroraBackground/AuroraBackground";
import { ThemeToggle } from "@/components/layout/ThemeToggle/ThemeToggle";

export default function Home() {
  return (
    <>
      <AuroraBackground />
      <main
        className="container"
        style={{
          paddingBlock: "var(--sp-24)",
          display: "grid",
          gap: "var(--sp-6)",
          placeItems: "start",
        }}
      >
        <h1 style={{ fontSize: "var(--fs-3xl)" }}>Aurora</h1>
        <p style={{ color: "var(--fg-muted)", maxWidth: "50ch" }}>
          Observa las manchas de color moviéndose suavemente por detrás. Cambia el tema y mira cómo
          se adaptan.
        </p>
        <ThemeToggle />
      </main>
    </>
  );
}
