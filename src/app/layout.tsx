import type { Metadata } from "next";
import { getSeo } from "@/features/settings/queries";
import { SITE_URL } from "@/lib/seo";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeo();
  const titleBase = seo.titleBase?.trim() || "Portfolio MVP";
  const description =
    seo.description?.trim() || "Portafolio profesional con foco en SEO, performance y conversión.";

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: titleBase, template: `%s · ${titleBase}` },
    description,
    openGraph: { siteName: titleBase, locale: "es_ES", type: "website" },
    twitter: { card: "summary_large_image" },
  };
}

const themeScript = `
(function() {
  try {
    var t = localStorage.getItem('theme');
    if (!t) {
      t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.dataset.theme = t;
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
