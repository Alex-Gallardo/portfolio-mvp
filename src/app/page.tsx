export default function Home() {
  return (
    <main className="container" style={{ paddingBlock: "var(--sp-16)" }}>
      <h1 style={{ fontSize: "var(--fs-3xl)" }}>Tipografía fluida</h1>
      <p style={{ color: "var(--fg-muted)", marginTop: "var(--sp-4)" }}>
        Redimensiona la ventana y mira cómo el título crece y encoge suave. Cambia el tema editando
        el &lt;html&gt; y verás los colores invertirse.
      </p>
    </main>
  );
}
