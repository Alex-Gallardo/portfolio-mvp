// Las claves DEBEN coincidir con los registros `sections` de cada page.tsx (S5-T4).
// Idealmente, importa estas claves también desde las páginas para evitar drift.
export const PAGE_SECTIONS: Record<string, { key: string; label: string }[]> = {
  home: [
    { key: "hero", label: "Hero" },
    { key: "about", label: "About breve" },
    { key: "stack", label: "Banda de stack" },
    { key: "resources", label: "Recursos" },
    { key: "projects", label: "Proyectos destacados" },
    { key: "services", label: "Servicios" },
    { key: "posts", label: "Del blog" },
    { key: "metrics", label: "Métricas" },
    { key: "social", label: "Prueba social" },
    { key: "crypto", label: "Banda crypto" },
    { key: "closing", label: "CTA de cierre" },
  ],
  about: [
    { key: "hero", label: "Hero" },
    { key: "timeline", label: "Trayectoria" },
    { key: "skills", label: "Skills" },
    { key: "tech", label: "Tecnologías" },
    { key: "values", label: "Valores" },
    { key: "method", label: "Forma de trabajar" },
    { key: "achievements", label: "Logros" },
    { key: "resources", label: "Recursos" },
    { key: "posts", label: "Últimos posts" },
    { key: "projects", label: "Últimos proyectos" },
  ],
  crypto: [
    { key: "hero", label: "Hero" },
    { key: "education", label: "Educación interactiva" },
    { key: "projects", label: "Proyectos Web3" },
    { key: "faq", label: "FAQ" },
    { key: "cta", label: "CTA de cierre" },
  ],
};

export const HInt_NON_HIDDEN = "hero"; // recordatorio: el hero lleva el <h1>, no ocultarlo
