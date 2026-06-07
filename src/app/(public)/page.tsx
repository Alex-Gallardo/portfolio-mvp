export default function Home() {
  return (
    <div className="container" style={{ paddingBlock: "calc(var(--sp-24) * 2)" }}>
      <h1 style={{ fontSize: "var(--fs-3xl)" }}>Portfolio MVP</h1>
      <p style={{ color: "var(--fg-muted)", maxWidth: "55ch", marginTop: "var(--sp-4)" }}>
        Layout público montado: fondo aurora, nav glass y footer compartidos por todas las páginas.
        Las secciones reales de la Home llegan en el Sprint 5.
      </p>
    </div>
  );
}
