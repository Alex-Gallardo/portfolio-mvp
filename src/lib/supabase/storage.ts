import { createClient } from "@/lib/supabase/client";

export const BUCKETS = {
  media: "media", // público: imágenes que se muestran en el sitio
  files: "files", // privado: descargables de recursos (lead magnet)
} as const;

export type BucketName = (typeof BUCKETS)[keyof typeof BUCKETS];

export interface UploadedFile {
  path: string; // ruta dentro del bucket (lo que guardas en storagePath)
  fileName: string; // nombre original del archivo
  mimeType: string;
  sizeBytes: number;
}

/**
 * Sube un archivo al bucket. Genera una ruta única para evitar colisiones
 * de nombres. Devuelve los datos que guardarás en la DB (ResourceFile, etc.).
 */
export async function uploadFile(
  bucket: BucketName,
  file: File,
  prefix = "",
): Promise<UploadedFile> {
  const supabase = createClient();
  const ext = file.name.includes(".") ? file.name.split(".").pop() : "";
  const unique = ext ? `${crypto.randomUUID()}.${ext}` : crypto.randomUUID();
  const path = prefix ? `${prefix}/${unique}` : unique;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw new Error(error.message);

  return { path, fileName: file.name, mimeType: file.type, sizeBytes: file.size };
}

/** Borra un archivo del bucket por su ruta. */
export async function removeFile(bucket: BucketName, path: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw new Error(error.message);
}

/** URL pública (solo válida para el bucket 'media', que es público). */
export function getPublicUrl(bucket: BucketName, path: string): string {
  const supabase = createClient();
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
