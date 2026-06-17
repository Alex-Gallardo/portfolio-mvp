export type ClientEventType = "PAGEVIEW" | "CLICK" | "SCROLL_DEPTH" | "CONVERSION" | "OUTBOUND";

interface TrackPayload {
  type: ClientEventType;
  path: string;
  element?: string;
  label?: string;
  referrer?: string;
}

/**
 * Envía un evento sin bloquear la navegación.
 * Usa sendBeacon (sobrevive al unload de la página); cae a fetch keepalive.
 */
export function track(type: ClientEventType, data: Omit<Partial<TrackPayload>, "type"> = {}): void {
  if (typeof window === "undefined") return;

  const payload: TrackPayload = {
    type,
    path: window.location.pathname,
    referrer: document.referrer || undefined,
    ...data,
  };
  const body = JSON.stringify(payload);

  try {
    const blob = new Blob([body], { type: "application/json" });
    if (navigator.sendBeacon?.("/api/track", blob)) return;
  } catch {
    /* cae a fetch */
  }

  void fetch("/api/track", {
    method: "POST",
    body,
    headers: { "Content-Type": "application/json" },
    keepalive: true,
  }).catch(() => {});
}
