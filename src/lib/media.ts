/** Construye la URL pública del bucket 'media' a partir de un storagePath. */
export function mediaPublicUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http")) return path; // ya es una URL completa
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return `${base}/storage/v1/object/public/media/${path}`;
}
