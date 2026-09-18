import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let supabaseAdmin: SupabaseClient | undefined;

/**
 * Cliente con service role, creado bajo demanda. Instanciarlo al importar el
 * módulo rompe `next build` (fase "Collecting page data") cuando las env vars
 * no están disponibles en tiempo de build.
 */
function getSupabaseAdmin(): SupabaseClient {
  if (supabaseAdmin) return supabaseAdmin;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en las variables de entorno",
    );
  }

  supabaseAdmin = createClient(url, serviceRoleKey, { auth: { persistSession: false } });
  return supabaseAdmin;
}

/** Genera una URL firmada temporal para un archivo de un bucket privado. */
export async function createSignedUrl(
  bucket: string,
  path: string,
  expiresIn = 60,
  download?: string | boolean,
): Promise<string> {
  const { data, error } = await getSupabaseAdmin()
    .storage.from(bucket)
    .createSignedUrl(path, expiresIn, download !== undefined ? { download } : undefined);
  if (error || !data) {
    throw new Error(error?.message ?? "No se pudo generar la URL firmada");
  }
  return data.signedUrl;
}
