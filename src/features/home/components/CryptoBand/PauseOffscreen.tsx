"use client";

import { useEffect, useRef } from "react";

/**
 * Marca la sección contenedora con `data-paused` mientras no está en
 * pantalla, para que el CSS congele sus bucles (animation-play-state).
 * No pinta nada visible.
 */
export function PauseOffscreen() {
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const section = ref.current?.closest("section");
    if (!section) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((e) => e.isIntersecting);
        section.toggleAttribute("data-paused", !visible);
      },
      { rootMargin: "120px 0px" },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return <span ref={ref} hidden />;
}
