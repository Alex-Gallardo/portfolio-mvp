import { type LeadRow } from "./queries";

/** Convierte un rango ("7d"/"30d"/"90d"/"all") a una fecha `since` o undefined. */
export function rangeToSince(range: string | undefined): Date | undefined {
  const days: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90 };
  if (!range || !days[range]) return undefined; // "all" o inválido → sin límite
  return new Date(Date.now() - days[range] * 24 * 60 * 60 * 1000);
}

/** Escapa un campo según RFC 4180 (comillas, comas, saltos de línea). */
function escapeCell(value: string): string {
  const needsQuotes = /[",\n\r]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

const HEADERS = [
  "email",
  "nombre",
  "consentimiento",
  "recurso",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "fecha",
] as const;

export function leadsToCsv(leads: LeadRow[]): string {
  const lines = [HEADERS.join(",")];
  for (const l of leads) {
    const row = [
      l.email,
      l.name ?? "",
      l.consent ? "sí" : "no",
      l.sourceResource?.title ?? "",
      l.utmSource ?? "",
      l.utmMedium ?? "",
      l.utmCampaign ?? "",
      l.createdAt.toISOString(),
    ].map((c) => escapeCell(String(c)));
    lines.push(row.join(","));
  }
  // \uFEFF (BOM) para que Excel abra los acentos en UTF-8 correctamente.
  return "\uFEFF" + lines.join("\r\n");
}
