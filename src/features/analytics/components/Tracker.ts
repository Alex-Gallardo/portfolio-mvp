"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { track } from "../tracker";

const MILESTONES = [25, 50, 75, 100];

export function Tracker() {
  const pathname = usePathname();

  // 1) PAGEVIEW en cada cambio de ruta
  useEffect(() => {
    track("PAGEVIEW");
  }, [pathname]);

  // 2) CLICK por delegación en cualquier ancestro con [data-track]
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      const el = target?.closest<HTMLElement>("[data-track]");
      if (!el) return;
      const label = el.dataset.track;
      track("CLICK", { element: label, label });
    }
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  // 3) SCROLL_DEPTH (hitos 25/50/75/100), reiniciando en cada ruta
  const fired = useRef<Set<number>>(new Set());
  useEffect(() => {
    fired.current = new Set();
    let ticking = false;

    function check() {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return; // página más corta que el viewport
      const pct = (window.scrollY / scrollable) * 100;
      for (const m of MILESTONES) {
        if (pct >= m && !fired.current.has(m)) {
          fired.current.add(m);
          track("SCROLL_DEPTH", { label: String(m) });
        }
      }
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        check();
        ticking = false;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    check(); // por si carga ya scrolleada (anclas) o es muy corta
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  return null;
}
