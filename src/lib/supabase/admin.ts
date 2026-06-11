import "server-only";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

/** Genera una URL firmada temporal para un archivo de un bucket privado. */
export async function createSignedUrl(
  bucket: string,
  path: string,
  expiresIn = 60,
): Promise<string> {
  const { data, error } = await supabaseAdmin.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error || !data) {
    throw new Error(error?.message ?? "No se pudo generar la URL firmada");
  }
  return data.signedUrl;
}
