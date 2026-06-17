export interface Branding {
  name: string;
  logoUrl: string;
  primaryColor: string;
  accentColor: string;
  font: string;
}
export const DEFAULT_BRANDING: Branding = {
  name: "TuMarca",
  logoUrl: "/images/logo.svg",
  primaryColor: "#4f6bff",
  accentColor: "#00d4b8",
  font: "Sora",
};

export interface Social {
  github: string;
  linkedin: string;
  x: string;
}
export const DEFAULT_SOCIAL: Social = { github: "", linkedin: "", x: "" };

export interface CopiesHome {
  ctaPrimary: string;
  ctaSecondary: string;
}
export const DEFAULT_COPIES_HOME: CopiesHome = {
  ctaPrimary: "Hablemos de tu proyecto",
  ctaSecondary: "Ver recursos gratis",
};

export interface Seo {
  titleBase: string;
  description: string;
  ogImage: string;
}
export const DEFAULT_SEO: Seo = {
  titleBase: "TuMarca",
  description: "Desarrollo, diseño y SEO técnico con Next.js.",
  ogImage: "/images/og-default.png",
};

export interface NavItem {
  label: string;
  href: string;
}
export const DEFAULT_NAV: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Crypto", href: "/crypto" },
  { label: "Blog", href: "/blog" },
  { label: "Recursos", href: "/recursos" },
];
