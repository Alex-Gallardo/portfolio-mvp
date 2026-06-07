import Link from "next/link";
import styles from "./Footer.module.css";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/crypto", label: "Crypto" },
  { href: "/blog", label: "Blog" },
  { href: "/servicios", label: "Servicios" },
  { href: "/proyectos", label: "Proyectos" },
  { href: "/recursos", label: "Recursos" },
];

const LEGAL = [
  { href: "/privacidad", label: "Privacidad" },
  { href: "/terminos", label: "Términos" },
];

// sameAs para SEO (se conectará a site_settings en el S6-T5)
const SOCIAL = [
  { href: "https://github.com/", label: "GitHub" },
  { href: "https://www.linkedin.com/", label: "LinkedIn" },
  { href: "https://x.com/", label: "X" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        {/* Marca + tagline + redes */}
        <div className={styles.brandCol}>
          <span className={styles.brand}>Portfolio</span>
          <p className={styles.tagline}>
            Desarrollo, diseño y SEO técnico para que tu marca destaque.
          </p>
          <ul className={styles.social}>
            {SOCIAL.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Navegación */}
        <nav className={styles.col} aria-label="Navegación del pie">
          <h2 className={styles.colTitle}>Navegación</h2>
          <ul className={styles.list}>
            {NAV.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={styles.link}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Legal */}
        <nav className={styles.col} aria-label="Enlaces legales">
          <h2 className={styles.colTitle}>Legal</h2>
          <ul className={styles.list}>
            {LEGAL.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={styles.link}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Placeholder del formulario (se implementa en el S6-T4) */}
        <div className={styles.col}>
          <h2 className={styles.colTitle}>¿Tienes una idea?</h2>
          <p className={styles.tagline}>Cuéntamela. (Formulario próximamente.)</p>
        </div>
      </div>

      <div className={`container ${styles.bottom}`}>
        <p>© {year} Portfolio. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
