import { Button, Card, Badge, Input, Textarea } from "@/components/ui";

export default function Home() {
  return (
    <main
      className="container"
      style={{ paddingBlock: "var(--sp-16)", display: "grid", gap: "var(--sp-8)" }}
    >
      <div style={{ display: "flex", gap: "var(--sp-3)", flexWrap: "wrap" }}>
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="glass">Glass</Button>
        <Button variant="resource">Descargar gratis</Button>
        <Button variant="primary" loading>
          Cargando
        </Button>
        <Button variant="primary" disabled>
          Disabled
        </Button>
      </div>

      <div style={{ display: "flex", gap: "var(--sp-2)", flexWrap: "wrap" }}>
        <Badge>default</Badge>
        <Badge variant="brand">brand</Badge>
        <Badge variant="resource">IA</Badge>
        <Badge variant="success">success</Badge>
      </div>

      <Card interactive style={{ maxWidth: 420 }}>
        <h3 style={{ marginBottom: "var(--sp-3)" }}>Card de ejemplo</h3>
        <p style={{ color: "var(--fg-muted)" }}>Pasa el cursor y mira cómo se eleva.</p>
      </Card>

      <div style={{ display: "grid", gap: "var(--sp-4)", maxWidth: 420 }}>
        <Input name="email" label="Email" placeholder="tu@correo.com" hint="No spam, prometido." />
        <Input
          name="bad"
          label="Con error"
          defaultValue="texto"
          error="Ese email no parece válido"
        />
        <Textarea name="msg" label="Mensaje" placeholder="Cuéntame tu idea..." />
      </div>
    </main>
  );
}
