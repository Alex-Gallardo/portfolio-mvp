import Link from "next/link";
import { Card } from "@/components/ui/Card/Card";
import { prisma } from "@/lib/prisma";

import {
  getBranding,
  getSocial,
  getCopiesHome,
  getSeo,
  getNavigation,
} from "@/features/settings/queries";
import { getSectionsConfig } from "@/features/content/queries";
import { PAGE_SECTIONS } from "@/features/content/sections";
import { saveFlatSetting } from "@/features/settings/actions";

import { KeyValueForm } from "@/features/settings/components/KeyValueForm";
import { NavEditor } from "@/features/settings/components/NavEditor";
import { SectionsEditor } from "@/features/settings/components/SectionEditor";
import { ContentEditor } from "@/features/settings/components/ContentEditor";
import { DESIGN_CHAPTER_DEFAULTS } from "@/features/design/design-content";

import styles from "./ajustes.module.css";

export const dynamic = "force-dynamic";

const TABS = [
  { key: "marca", label: "Marca" },
  { key: "textos", label: "Textos" },
  { key: "menu", label: "Menú" },
  { key: "secciones", label: "Secciones" },
  { key: "seo", label: "SEO" },
  { key: "contenido", label: "Contenido" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function isTab(v: string | undefined): v is TabKey {
  return !!v && TABS.some((t) => t.key === v);
}

// Mezcla el registro de secciones con la config guardada (visible/orden).
async function sectionRowsFor(page: string) {
  const cfg = await getSectionsConfig(page);
  const registry = PAGE_SECTIONS[page] ?? [];
  const byKey = new Map((cfg ?? []).map((c) => [c.key, c]));
  const ordered =
    cfg && cfg.length
      ? [...registry].sort(
          (a, b) => (byKey.get(a.key)?.order ?? 99) - (byKey.get(b.key)?.order ?? 99),
        )
      : registry;
  return ordered.map((s) => ({
    key: s.key,
    label: s.label,
    visible: byKey.get(s.key)?.visible !== false,
    order: byKey.get(s.key)?.order ?? 0,
  }));
}

export default async function AjustesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const active: TabKey = isTab(tab) ? tab : "marca";

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.h1}>Ajustes</h1>
      </header>

      <nav className={styles.tabs} aria-label="Secciones de ajustes">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin/ajustes?tab=${t.key}`}
            className={`${styles.tab} ${active === t.key ? styles.tabActive : ""}`}
            aria-current={active === t.key ? "page" : undefined}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      <Card className={styles.content}>
        {active === "marca" ? await MarcaTab() : null}
        {active === "textos" ? await TextosTab() : null}
        {active === "menu" ? await MenuTab() : null}
        {active === "secciones" ? await SeccionesTab() : null}
        {active === "seo" ? await SeoTab() : null}
        {active === "contenido" ? await ContenidoTab() : null}
      </Card>
    </div>
  );
}

/* ---- Paneles (Server) ---- */

async function MarcaTab() {
  const [branding, social] = await Promise.all([getBranding(), getSocial()]);
  return (
    <div className={styles.stack}>
      <KeyValueForm
        title="Marca"
        settingKey="branding"
        initial={branding as unknown as Record<string, string>}
        action={saveFlatSetting}
        fields={[
          { name: "name", label: "Nombre de marca" },
          { name: "logoUrl", label: "Logo (URL)", type: "url" },
          { name: "primaryColor", label: "Color primario", type: "color" },
          { name: "accentColor", label: "Color de acento", type: "color" },
          { name: "font", label: "Tipografía display" },
        ]}
      />
      <KeyValueForm
        title="Redes sociales"
        settingKey="social"
        initial={social as unknown as Record<string, string>}
        action={saveFlatSetting}
        fields={[
          { name: "github", label: "GitHub (URL)", type: "url" },
          { name: "linkedin", label: "LinkedIn (URL)", type: "url" },
          { name: "x", label: "X (URL)", type: "url" },
        ]}
      />
    </div>
  );
}

async function TextosTab() {
  const copies = await getCopiesHome();
  return (
    <KeyValueForm
      title="Copies de la Home"
      settingKey="copies.home"
      initial={copies as unknown as Record<string, string>}
      action={saveFlatSetting}
      fields={[
        { name: "ctaPrimary", label: "CTA principal" },
        { name: "ctaSecondary", label: "CTA secundario" },
      ]}
    />
  );
}

async function MenuTab() {
  const nav = await getNavigation();
  return <NavEditor initial={nav} />;
}

async function SeccionesTab() {
  const [home, about, crypto] = await Promise.all([
    sectionRowsFor("home"),
    sectionRowsFor("about"),
    sectionRowsFor("crypto"),
  ]);
  return (
    <div className={styles.stack}>
      <SectionsEditor page="home" initial={home} />
      <SectionsEditor page="about" initial={about} />
      <SectionsEditor page="crypto" initial={crypto} />
    </div>
  );
}

async function SeoTab() {
  const seo = await getSeo();
  return (
    <KeyValueForm
      title="SEO por defecto"
      settingKey="seo"
      initial={seo as unknown as Record<string, string>}
      action={saveFlatSetting}
      fields={[
        { name: "titleBase", label: "Título base (%s · …)" },
        { name: "description", label: "Descripción por defecto", type: "textarea" },
        { name: "ogImage", label: "Imagen OG por defecto (URL)", type: "url" },
      ]}
    />
  );
}

async function ContenidoTab() {
  const blocks = await prisma.contentBlock.findMany({
    orderBy: [{ page: "asc" }, { order: "asc" }],
    select: { key: true, page: true, title: true, body: true },
  });
  const existingKeys = new Set(blocks.map((block) => block.key));
  const designDefaults = DESIGN_CHAPTER_DEFAULTS.map((chapter) => ({
    key: chapter.key,
    page: "design",
    title: chapter.title,
    body: chapter.body,
  }));
  const editableBlocks = [
    ...blocks.map((b) => ({ key: b.key, page: b.page, title: b.title ?? "", body: b.body })),
    ...designDefaults.filter((block) => !existingKeys.has(block.key)),
  ];
  return <ContentEditor blocks={editableBlocks} />;
}
