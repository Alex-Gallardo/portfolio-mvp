import { ThemeToggle } from "@/components/layout/ThemeToggle/ThemeToggle";

export default function Home() {
  return (
    <main
      className="container"
      style={{
        paddingBlock: "var(--sp-16)",
        display: "grid",
        gap: "var(--sp-6)",
        placeItems: "start",
      }}
    >
      <h1 style={{ fontSize: "var(--fs-2xl)" }}>Prueba del tema</h1>
      <p style={{ color: "var(--fg-muted)" }}>
        Pulsa el botón, recarga la página y verifica que el tema se mantiene sin parpadeo.
      </p>
      <ThemeToggle />
    </main>
  );
}
