import { AuroraBackground, NavGlass } from "@/components/layout";

export default function Home() {
  return (
    <>
      <AuroraBackground />
      <NavGlass />
      <main
        className="container"
        style={{ paddingBlock: "calc(var(--sp-24) * 2)", display: "grid", gap: "var(--sp-6)" }}
      >
        <h1 style={{ fontSize: "var(--fs-3xl)" }}>NavGlass</h1>
        <p style={{ color: "var(--fg-muted)", maxWidth: "55ch" }}>
          En desktop verás los enlaces en la píldora. Estrecha la ventana a menos de 768px y aparece
          la hamburguesa. Haz scroll hacia abajo para ocultar el nav y hacia arriba para mostrarlo.
        </p>
        {Array.from({ length: 20 }).map((_, i) => (
          <p key={i} style={{ color: "var(--fg-muted)" }}>
            Párrafo de relleno {i + 1} para poder hacer scroll.
          </p>
        ))}
      </main>
    </>
  );
}
