"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/auth-actions";
import styles from "./AdminShell.module.css";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/posts", label: "Posts" },
  { href: "/admin/servicios", label: "Servicios" },
  { href: "/admin/proyectos", label: "Proyectos" },
  { href: "/admin/recursos", label: "Recursos" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/mensajes", label: "Mensajes" },
  { href: "/admin/analitica", label: "Analítica" },
  { href: "/admin/ajustes", label: "Ajustes" },
];

export default function AdminShell({ email, children }: { email: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <div className={styles.shell} data-open={open}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>Panel</div>
        <nav className={styles.nav}>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={styles.link}
              aria-current={isActive(item.href) ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <button className={styles.backdrop} aria-label="Cerrar menú" onClick={() => setOpen(false)} />

      <div className={styles.main}>
        <header className={styles.topbar}>
          <button
            className={styles.burger}
            aria-label="Abrir menú"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            ☰
          </button>
          <div className={styles.spacer} />
          <span className={styles.email}>{email}</span>
          <form action={logout}>
            <button type="submit" className={styles.logout}>
              Salir
            </button>
          </form>
        </header>
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
