"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./../ThemeToggle/ThemeToggle";
import styles from "./NavGlass.module.css";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/crypto", label: "Crypto" },
  { href: "/blog", label: "Blog" },
  { href: "/recursos", label: "Recursos" },
] as const;

export function NavGlass() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const closeMenu = () => setOpen(false);

  // (Opcional) ocultar al bajar / mostrar al subir
  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      setHidden(y > lastScrollY.current && y > 80);
      lastScrollY.current = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Cerrar con Esc + bloquear el scroll del fondo cuando el menú está abierto
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <>
      <header className={[styles.nav, hidden && !open && styles.hidden].filter(Boolean).join(" ")}>
        <Link href="/" className={styles.brand} onClick={closeMenu}>
          Portfolio
        </Link>

        {/* Enlaces visibles en desktop */}
        <nav className={styles.links} aria-label="Navegación principal">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={styles.link}
              aria-current={isActive(l.href) ? "page" : undefined}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <ThemeToggle />
          <button
            type="button"
            className={styles.burger}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className={styles.burgerBox} aria-hidden="true">
              <span className={styles.burgerLine} />
              <span className={styles.burgerLine} />
              <span className={styles.burgerLine} />
            </span>
          </button>
        </div>
      </header>

      {/* Panel a pantalla completa en móvil */}
      <nav
        id="mobile-menu"
        className={[styles.panel, open && styles.panelOpen].filter(Boolean).join(" ")}
        aria-label="Navegación móvil"
        aria-hidden={!open}
      >
        {NAV_LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={styles.panelLink}
            aria-current={isActive(l.href) ? "page" : undefined}
            onClick={closeMenu}
            tabIndex={open ? 0 : -1}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
