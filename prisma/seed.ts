import { PrismaClient, Role, ContentStatus, ResourceCategory } from "@prisma/client";

const prisma = new PrismaClient();

// UUID fijo del admin. Cuando montes Supabase Auth (S2-T3), crea el usuario
// admin con ESTE MISMO id en auth.users para que el Profile y el usuario coincidan.
const ADMIN_ID = "782e9298-8401-4577-9500-5423c64a49f7";

// Borra todo en orden hijo → padre para no romper claves foráneas.
// Esto hace el seed re-ejecutable (puedes correrlo las veces que quieras).
async function clean() {
  await prisma.resourceDownload.deleteMany();
  await prisma.analyticsEvent.deleteMany();
  await prisma.analyticsSession.deleteMany();
  await prisma.resourceFile.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.projectImage.deleteMany();
  await prisma.postAttachment.deleteMany();
  await prisma.serviceAttachment.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.contentBlock.deleteMany();
  await prisma.siteSetting.deleteMany();
  await prisma.post.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.project.deleteMany();
  await prisma.service.deleteMany();
  await prisma.category.deleteMany();
  await prisma.profile.deleteMany();
}

async function main() {
  console.log("🧹 Limpiando datos previos…");
  await clean();

  // 1) ADMIN
  console.log("👤 Creando admin…");
  const admin = await prisma.profile.create({
    data: {
      id: ADMIN_ID,
      email: "admin@tumarca.dev",
      fullName: "Tu Nombre",
      role: Role.ADMIN,
    },
  });

  // 2) CATEGORÍAS
  console.log("🏷️  Creando categorías…");
  await prisma.category.createMany({
    data: [
      { name: "Desarrollo Web", slug: "desarrollo-web" },
      { name: "SEO", slug: "seo" },
      { name: "Blockchain", slug: "blockchain" },
    ],
  });

  // 3) POSTS (3) — conectados a categorías y al admin. Uno queda en DRAFT.
  console.log("📝 Creando posts…");
  await prisma.post.create({
    data: {
      slug: "nextjs-rapido-seo",
      title: "Cómo hacer un Next.js rapidísimo y bien posicionado",
      excerpt: "Las claves de performance y SEO técnico que aplico en cada proyecto.",
      content: "## TL;DR\nServer Components, imágenes optimizadas e ISR son la base…",
      status: ContentStatus.PUBLISHED,
      tags: ["nextjs", "seo", "performance"],
      readMinutes: 6,
      publishedAt: new Date(),
      authorId: admin.id,
      categories: { connect: [{ slug: "desarrollo-web" }, { slug: "seo" }] },
    },
  });
  await prisma.post.create({
    data: {
      slug: "core-web-vitals-verde",
      title: "Core Web Vitals en verde: guía práctica",
      excerpt: "LCP, INP y CLS explicados con ejemplos reales.",
      content: "## Qué son los Core Web Vitals\nMétricas que Google usa como señal…",
      status: ContentStatus.PUBLISHED,
      tags: ["performance", "web-vitals"],
      readMinutes: 8,
      publishedAt: new Date(),
      authorId: admin.id,
      categories: { connect: [{ slug: "desarrollo-web" }] },
    },
  });
  await prisma.post.create({
    data: {
      slug: "intro-web3-sin-friccion",
      title: "Introducción a Web3 sin fricción",
      excerpt: "Interfaces claras para un mundo complejo.",
      content: "## Web3 para humanos\nEmpecemos por lo básico…",
      status: ContentStatus.DRAFT, // borrador, para probar filtros publicado/borrador
      tags: ["web3", "blockchain"],
      readMinutes: 5,
      authorId: admin.id,
      categories: { connect: [{ slug: "blockchain" }] },
    },
  });

  // 4) SERVICIOS (3) — uno con un attachment de ejemplo
  console.log("🛠️  Creando servicios…");
  await prisma.service.create({
    data: {
      slug: "desarrollo-web",
      title: "Desarrollo Web a medida",
      summary: "Webs rápidas, accesibles y listas para posicionar.",
      content: "Construyo tu web con Next.js, cuidando performance y SEO desde el día uno.",
      icon: "code",
      priceFrom: "1200",
      features: ["Next.js + TypeScript", "SEO técnico", "Diseño responsive"],
      status: ContentStatus.PUBLISHED,
      order: 1,
      attachments: {
        create: [
          {
            label: "Brief de proyecto (PDF)",
            storagePath: "services/desarrollo-web/brief.pdf",
            fileName: "brief.pdf",
            order: 0,
          },
        ],
      },
    },
  });
  await prisma.service.create({
    data: {
      slug: "seo-tecnico",
      title: "SEO Técnico",
      summary: "Que Google y los agentes de IA te encuentren y te citen.",
      content: "Auditoría técnica, datos estructurados y velocidad para escalar tu visibilidad.",
      icon: "search",
      priceFrom: "800",
      features: ["Auditoría CWV", "JSON-LD", "Sitemap y robots"],
      status: ContentStatus.PUBLISHED,
      order: 2,
    },
  });
  await prisma.service.create({
    data: {
      slug: "diseno-ui",
      title: "Diseño UI/UX",
      summary: "Interfaces limpias, calmadas y que convierten.",
      content: "Sistemas de diseño, prototipos y accesibilidad para una experiencia premium.",
      icon: "palette",
      priceFrom: "600",
      features: ["Design system", "Prototipos", "Accesibilidad AA"],
      status: ContentStatus.PUBLISHED,
      order: 3,
    },
  });

  // 5) PROYECTOS (3) — con galería de imágenes ilimitada (nested create)
  console.log("📁 Creando proyectos…");
  await prisma.project.create({
    data: {
      slug: "tienda-online-headless",
      title: "Tienda online headless",
      summary: "E-commerce rápido con Next.js y pagos integrados.",
      content: "Caso de estudio de un e-commerce headless con checkout optimizado.",
      coverUrl: "https://picsum.photos/seed/tienda/1200/630",
      liveUrl: "https://ejemplo.com",
      repoUrl: "https://github.com/tu-usuario/tienda",
      stack: ["Next.js", "TypeScript", "Stripe"],
      featured: true,
      status: ContentStatus.PUBLISHED,
      order: 1,
      authorId: admin.id,
      images: {
        create: [
          { url: "https://picsum.photos/seed/tienda1/800/600", alt: "Home de la tienda", order: 0 },
          { url: "https://picsum.photos/seed/tienda2/800/600", alt: "Ficha de producto", order: 1 },
        ],
      },
    },
  });
  await prisma.project.create({
    data: {
      slug: "dashboard-analitica",
      title: "Dashboard de analítica",
      summary: "Panel en tiempo real con visualizaciones claras.",
      content: "Cómo diseñé un dashboard rápido con datos agregados y gráficos ligeros.",
      coverUrl: "https://picsum.photos/seed/dashboard/1200/630",
      stack: ["React", "Recharts", "Prisma"],
      featured: true,
      status: ContentStatus.PUBLISHED,
      order: 2,
      authorId: admin.id,
      images: {
        create: [
          { url: "https://picsum.photos/seed/dash1/800/600", alt: "Vista general", order: 0 },
        ],
      },
    },
  });
  await prisma.project.create({
    data: {
      slug: "dapp-web3-votacion",
      title: "dApp Web3 de votación",
      summary: "Aplicación descentralizada sobre Ethereum.",
      content: "Detalles técnicos de una dApp de votación con conexión de wallet.",
      coverUrl: "https://picsum.photos/seed/dapp/1200/630",
      stack: ["Solidity", "Next.js", "ethers.js"],
      featured: false,
      status: ContentStatus.PUBLISHED,
      order: 3,
      authorId: admin.id,
      images: {
        create: [
          {
            url: "https://picsum.photos/seed/dapp1/800/600",
            alt: "Pantalla de votación",
            order: 0,
          },
          { url: "https://picsum.photos/seed/dapp2/800/600", alt: "Conexión de wallet", order: 1 },
        ],
      },
    },
  });

  // 6) RECURSOS (3) — escalón 1, cada uno con 1-2 archivos descargables.
  // Uno con requireEmail=false para probar la descarga directa sin modal.
  console.log("🎁 Creando recursos (lead magnet)…");
  await prisma.resource.create({
    data: {
      slug: "checklist-seo-tecnico",
      title: "Checklist de SEO técnico (PDF)",
      summary: "47 puntos para auditar el SEO técnico de cualquier web.",
      content: "Cubre metadata, JSON-LD, sitemap, robots y Core Web Vitals.",
      coverUrl: "https://picsum.photos/seed/seo-checklist/1200/630",
      category: ResourceCategory.MARKETING,
      status: ContentStatus.PUBLISHED,
      featured: true,
      order: 1,
      requireEmail: true,
      authorId: admin.id,
      files: {
        create: [
          {
            label: "Checklist en PDF",
            storagePath: "resources/checklist-seo-tecnico/checklist.pdf",
            fileName: "checklist-seo.pdf",
            mimeType: "application/pdf",
            sizeBytes: 245000,
            order: 0,
          },
        ],
      },
    },
  });
  await prisma.resource.create({
    data: {
      slug: "plantilla-portafolio-figma",
      title: "Plantilla de portafolio en Figma",
      summary: "El diseño base de este portafolio, listo para personalizar.",
      content: "Incluye componentes, tokens de color y tipografía.",
      coverUrl: "https://picsum.photos/seed/figma-template/1200/630",
      category: ResourceCategory.DISENO,
      status: ContentStatus.PUBLISHED,
      featured: false,
      order: 2,
      requireEmail: true,
      authorId: admin.id,
      files: {
        create: [
          {
            label: "Archivo de Figma (.fig)",
            storagePath: "resources/plantilla-portafolio-figma/portafolio.fig",
            fileName: "portafolio.fig",
            mimeType: "application/octet-stream",
            sizeBytes: 1800000,
            order: 0,
          },
          {
            label: "Guía de uso (PDF)",
            storagePath: "resources/plantilla-portafolio-figma/guia.pdf",
            fileName: "guia-uso.pdf",
            mimeType: "application/pdf",
            sizeBytes: 320000,
            order: 1,
          },
        ],
      },
    },
  });
  await prisma.resource.create({
    data: {
      slug: "kit-componentes-react",
      title: "Kit de componentes React",
      summary: "Botones, cards y modal con CSS puro, listos para copiar.",
      content: "Un .zip con los componentes base de este proyecto.",
      coverUrl: "https://picsum.photos/seed/react-kit/1200/630",
      category: ResourceCategory.WEB,
      status: ContentStatus.PUBLISHED,
      featured: false,
      order: 3,
      requireEmail: false, // descarga directa, sin pedir email
      authorId: admin.id,
      files: {
        create: [
          {
            label: "Componentes (.zip)",
            storagePath: "resources/kit-componentes-react/kit.zip",
            fileName: "kit-componentes.zip",
            mimeType: "application/zip",
            sizeBytes: 540000,
            order: 0,
          },
        ],
      },
    },
  });

  // 7) CONTENT BLOCKS (textos editables desde el admin)
  // ⚠️ Las claves DEBEN coincidir con las que leen las páginas del S5-T4:
  //   - Home:   home.hero, home.about, home.resources, home.projects, home.services, home.posts
  //   - About:  about.hero, about.resources, about.posts, about.projects
  //   - Crypto: crypto.hero
  // Los bloques con body "" son solo títulos de sección (el cuerpo no se usa);
  // existen para que el editor del S6-T5 ya tenga con qué trabajar.
  console.log("🧱 Creando bloques de contenido…");
  await prisma.contentBlock.createMany({
    data: [
      // --- HOME ---
      {
        key: "home.hero",
        page: "home",
        title: "Construyo experiencias web rápidas que posicionan y convierten.",
        body: "Desarrollo, diseño y SEO técnico para que tu marca destaque en buscadores y en la era de la IA.",
        order: 0,
      },
      {
        key: "home.about",
        page: "home",
        title: "Hola, soy [Nombre]",
        body: "Dev full-stack enfocado en performance y experiencia. Diseño y construyo productos web rápidos, accesibles y pensados para crecer.",
        order: 1,
      },
      {
        key: "home.resources",
        page: "home",
        title: "Recursos gratis recién lanzados",
        body: "",
        order: 2,
      },
      { key: "home.projects", page: "home", title: "Proyectos destacados", body: "", order: 3 },
      { key: "home.services", page: "home", title: "Servicios", body: "", order: 4 },
      { key: "home.posts", page: "home", title: "Del blog", body: "", order: 5 },

      // --- ABOUT ---
      {
        key: "about.hero", // antes era "about.bio"; el AboutHero lee "about.hero"
        page: "about",
        title: "Soy [Nombre], dev full-stack",
        body: "Enfocado en performance y experiencia. Diseño y construyo productos web rápidos, accesibles y pensados para crecer.",
        order: 0,
      },
      {
        key: "about.resources",
        page: "about",
        title: "Recursos gratis recién lanzados",
        body: "",
        order: 1,
      },
      { key: "about.posts", page: "about", title: "Últimos artículos", body: "", order: 2 },
      { key: "about.projects", page: "about", title: "Últimos proyectos", body: "", order: 3 },

      // --- CRYPTO ---
      {
        key: "crypto.hero",
        page: "crypto",
        title: "Web3 y blockchain sin fricción",
        body: "Interfaces claras para un mundo complejo.",
        order: 0,
      },
      // ⚠️ No consumido aún: el FAQ se sirve desde features/crypto/faq.ts (constante TS),
      // no desde content_blocks. Se conserva por si más adelante mueves el FAQ a la DB.
      {
        key: "crypto.faq.1",
        page: "crypto",
        title: "¿Qué es una dApp?",
        body: "Una aplicación descentralizada que se ejecuta sobre una blockchain.",
        order: 1,
      },
    ],
  });

  // 8) SITE SETTINGS (branding, copies, navegación, social, seo + secciones)
  console.log("⚙️  Creando ajustes del sitio…");
  await prisma.siteSetting.createMany({
    data: [
      {
        key: "branding",
        value: {
          name: "TuMarca",
          logoUrl: "/images/logo.svg",
          primaryColor: "#4f6bff",
          accentColor: "#00d4b8",
          font: "Sora",
        },
      },
      {
        key: "copies.home",
        value: {
          ctaPrimary: "Hablemos de tu proyecto",
          ctaSecondary: "Ver recursos gratis",
        },
      },
      {
        key: "navigation",
        value: {
          items: [
            { label: "Home", href: "/" },
            { label: "About", href: "/about" },
            { label: "Crypto", href: "/crypto" },
            { label: "Blog", href: "/blog" },
            { label: "Recursos", href: "/recursos" },
          ],
        },
      },
      {
        key: "social",
        value: {
          github: "https://github.com/tu-usuario",
          linkedin: "https://linkedin.com/in/tu-usuario",
          x: "https://x.com/tu-usuario",
        },
      },
      {
        key: "seo",
        value: {
          titleBase: "TuMarca",
          description: "Desarrollo, diseño y SEO técnico con Next.js.",
          ogImage: "/images/og-default.png",
        },
      },

      // --- S5-T4: orden + visibilidad de secciones por página ---
      // getSectionsConfig("home"|"about"|"crypto") lee estas claves.
      // Las claves de cada item DEBEN coincidir con las del registro `sections`
      // de cada page.tsx. No ocultes "hero": lleva el único <h1>.
      {
        key: "sections.home",
        value: [
          { key: "hero", visible: true, order: 0 },
          { key: "about", visible: true, order: 1 },
          { key: "stack", visible: true, order: 2 },
          { key: "resources", visible: true, order: 3 },
          { key: "projects", visible: true, order: 4 },
          { key: "services", visible: true, order: 5 },
          { key: "posts", visible: true, order: 6 },
          { key: "metrics", visible: true, order: 7 },
          { key: "social", visible: true, order: 8 },
          { key: "crypto", visible: true, order: 9 },
          { key: "closing", visible: true, order: 10 },
        ],
      },
      {
        key: "sections.about",
        value: [
          { key: "hero", visible: true, order: 0 },
          { key: "timeline", visible: true, order: 1 },
          { key: "skills", visible: true, order: 2 },
          { key: "tech", visible: true, order: 3 },
          { key: "values", visible: true, order: 4 },
          { key: "method", visible: true, order: 5 },
          { key: "achievements", visible: true, order: 6 },
          { key: "resources", visible: true, order: 7 },
          { key: "posts", visible: true, order: 8 },
          { key: "projects", visible: true, order: 9 },
        ],
      },
      {
        key: "sections.crypto",
        value: [
          { key: "hero", visible: true, order: 0 },
          { key: "education", visible: true, order: 1 },
          { key: "projects", visible: true, order: 2 },
          { key: "faq", visible: true, order: 3 },
          { key: "cta", visible: true, order: 4 },
        ],
      },
    ],
  });

  console.log("✅ Seed completado.");
}

main()
  .catch((e) => {
    console.error("❌ Error en el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
