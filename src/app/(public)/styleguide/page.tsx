import type { Metadata } from "next";
import { Button, Card, Badge, Input, Textarea } from "@/components/ui";
import styles from "./Styleguide.module.css";

export const metadata: Metadata = {
  title: "Styleguide",
  description: "Guía de estilos viva del proyecto: tokens y componentes reales.",
};

const COLORS = [
  { var: "--brand-500", hex: "#4f6bff" },
  { var: "--brand-600", hex: "#3b54e6" },
  { var: "--brand-700", hex: "#2c40bd" },
  { var: "--accent", hex: "#00d4b8" },
  { var: "--resource-1", hex: "#ff6b6b" },
  { var: "--resource-2", hex: "#ffa94d" },
  { var: "--resource-3", hex: "#ffd43b" },
  { var: "--success", hex: "#18a957" },
  { var: "--warning", hex: "#e2a600" },
  { var: "--danger", hex: "#e5484d" },
  { var: "--bg", hex: "tema" },
  { var: "--bg-elev", hex: "tema" },
  { var: "--fg", hex: "tema" },
  { var: "--fg-muted", hex: "tema" },
  { var: "--border", hex: "tema" },
];

const FONT_SIZES = [
  { tag: "3xl", var: "--fs-3xl" },
  { tag: "2xl", var: "--fs-2xl" },
  { tag: "xl", var: "--fs-xl" },
  { tag: "lg", var: "--fs-lg" },
  { tag: "base", var: "--fs-base" },
  { tag: "sm", var: "--fs-sm" },
  { tag: "xs", var: "--fs-xs" },
];

const SPACES = [
  "--sp-1",
  "--sp-2",
  "--sp-3",
  "--sp-4",
  "--sp-6",
  "--sp-8",
  "--sp-12",
  "--sp-16",
  "--sp-24",
];
const RADII = ["--radius-sm", "--radius-md", "--radius-lg", "--radius-full"];
const BREAKPOINTS = [
  { name: "--bp-sm", val: "480px" },
  { name: "--bp-md", val: "768px" },
  { name: "--bp-lg", val: "1024px" },
  { name: "--bp-xl", val: "1280px" },
];

export default function StyleguidePage() {
  return (
    <div className={`container ${styles.page}`}>
      <h1 className={styles.pageTitle}>Styleguide</h1>
      <p className={styles.pageLead}>
        Guía de estilos viva. Consume los mismos tokens y componentes que el resto del sitio, así
        que cualquier cambio en <code>tokens.css</code> se refleja aquí. Cambia el tema con el botón
        del nav para verlo todo en claro y oscuro.
      </p>

      {/* ===== COLORES ===== */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Colores</h2>
        <p className={styles.sectionDesc}>
          Marca, acento de recursos (escalón 1), estados y colores semánticos del tema.
        </p>
        <div className={styles.swatchGrid}>
          {COLORS.map((c) => (
            <div key={c.var} className={styles.swatch}>
              <div className={styles.swatchBox} style={{ background: `var(${c.var})` }} />
              <span className={styles.swatchVar}>{c.var}</span>
              <span className={styles.swatchHex}>{c.hex}</span>
            </div>
          ))}
          <div className={styles.swatch}>
            <div className={styles.swatchBox} style={{ background: "var(--resource-grad)" }} />
            <span className={styles.swatchVar}>--resource-grad</span>
            <span className={styles.swatchHex}>gradiente E1</span>
          </div>
        </div>
      </section>

      {/* ===== TIPOGRAFÍA ===== */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Tipografía</h2>
        <p className={styles.sectionDesc}>
          Escala fluida con clamp(): redimensiona la ventana y mira cómo se ajusta.
        </p>
        {FONT_SIZES.map((f) => (
          <div key={f.var} className={styles.typeRow}>
            <span className={styles.typeTag}>{f.tag}</span>
            <span style={{ fontSize: `var(${f.var})`, fontFamily: "var(--font-display)" }}>
              The quick brown fox
            </span>
          </div>
        ))}
      </section>

      {/* ===== BOTONES ===== */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Botones</h2>
        <p className={styles.sectionDesc}>
          Variantes, tamaños y estados. El botón resource usa el gradiente cálido del escalón 1.
        </p>
        <div className={styles.row} style={{ marginBottom: "var(--sp-4)" }}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="glass">Glass</Button>
          <Button variant="resource">Descargar gratis</Button>
        </div>
        <div className={styles.row} style={{ marginBottom: "var(--sp-4)" }}>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
        <div className={styles.row}>
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>

      {/* ===== BADGES ===== */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Badges</h2>
        <div className={styles.row}>
          <Badge>default</Badge>
          <Badge variant="brand">brand</Badge>
          <Badge variant="resource">IA</Badge>
          <Badge variant="success">success</Badge>
          <Badge variant="warning">warning</Badge>
          <Badge variant="danger">danger</Badge>
        </div>
      </section>

      {/* ===== CARDS ===== */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Cards</h2>
        <p className={styles.sectionDesc}>
          Normal y interactiva (pasa el cursor sobre la segunda).
        </p>
        <div className={styles.row} style={{ alignItems: "stretch" }}>
          <Card style={{ maxWidth: 280 }}>
            <h3 style={{ marginBottom: "var(--sp-2)" }}>Card normal</h3>
            <p style={{ color: "var(--fg-muted)", fontSize: "var(--fs-sm)" }}>
              Contenedor estático.
            </p>
          </Card>
          <Card interactive style={{ maxWidth: 280 }}>
            <h3 style={{ marginBottom: "var(--sp-2)" }}>Card interactiva</h3>
            <p style={{ color: "var(--fg-muted)", fontSize: "var(--fs-sm)" }}>Se eleva al hover.</p>
          </Card>
        </div>
      </section>

      {/* ===== INPUTS Y FORMULARIOS ===== */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Inputs y formularios</h2>
        <div className={styles.stack}>
          <Input
            name="sg-email"
            label="Email"
            placeholder="tu@correo.com"
            hint="No spam, prometido."
          />
          <Input
            name="sg-err"
            label="Con error"
            defaultValue="texto"
            error="Ese email no parece válido"
          />
          <Input name="sg-dis" label="Deshabilitado" placeholder="No editable" disabled />
          <Textarea name="sg-msg" label="Mensaje" placeholder="Cuéntame tu idea..." />
        </div>
      </section>

      {/* ===== ANIMACIONES ===== */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Animaciones</h2>
        <p className={styles.sectionDesc}>
          Utilidades reutilizables de animations.css. Respetan prefers-reduced-motion.
        </p>
        <div className={styles.row} style={{ gap: "var(--sp-8)" }}>
          <div>
            <div className={`${styles.demoBox} u-fade-up`} />
            <span className={styles.swatchVar}>.u-fade-up</span>
          </div>
          <div>
            <div className={`${styles.demoBox} u-float`} />
            <span className={styles.swatchVar}>.u-float</span>
          </div>
        </div>
      </section>

      {/* ===== ESPACIADO ===== */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Espaciado</h2>
        <p className={styles.sectionDesc}>Escala base 4px.</p>
        {SPACES.map((s) => (
          <div key={s} className={styles.spaceRow}>
            <span className={styles.spaceTag}>{s}</span>
            <div className={styles.spaceBar} style={{ width: `var(${s})` }} />
          </div>
        ))}
      </section>

      {/* ===== RADIOS ===== */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Radios</h2>
        <div className={styles.radiusGrid}>
          {RADII.map((r) => (
            <div key={r} className={styles.radiusBox} style={{ borderRadius: `var(${r})` }}>
              {r.replace("--radius-", "")}
            </div>
          ))}
        </div>
      </section>

      {/* ===== BREAKPOINTS ===== */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Breakpoints</h2>
        <div className={styles.bpGrid}>
          {BREAKPOINTS.map((b) => (
            <div key={b.name} className={styles.bpCard}>
              <div className={styles.bpName}>{b.name}</div>
              <div className={styles.bpVal}>{b.val}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== ESTADOS ===== */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Estados</h2>
        <p className={styles.sectionDesc}>Loading (skeleton), vacío y error.</p>

        <h3 style={{ fontSize: "var(--fs-base)", marginBottom: "var(--sp-3)" }}>
          Loading skeleton
        </h3>
        <Card style={{ maxWidth: 360 }}>
          <div className={styles.skeleton} style={{ width: "70%", marginBottom: "var(--sp-3)" }} />
          <div className={styles.skeleton} style={{ width: "100%", marginBottom: "var(--sp-2)" }} />
          <div className={styles.skeleton} style={{ width: "90%" }} />
        </Card>

        <h3 style={{ fontSize: "var(--fs-base)", margin: "var(--sp-6) 0 var(--sp-3)" }}>
          Estado vacío
        </h3>
        <Card style={{ maxWidth: 360 }}>
          <div className={styles.empty}>
            <p>Aún no hay artículos aquí, pero pronto.</p>
          </div>
        </Card>
      </section>

      {/* ===== PENDIENTES (crecen con el proyecto) ===== */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Próximamente</h2>
        <p className={styles.sectionDesc}>
          Se documentarán aquí al construirlos: ResourceCard (S3-T6), DownloadModal (S3-T5),
          FileRepeater (S3-T2) y las cards de proyecto/servicio/post (Sprint 4).
        </p>
      </section>
    </div>
  );
}
