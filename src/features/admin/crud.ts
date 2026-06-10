import "server-only";
import { revalidatePath } from "next/cache";
import { type ZodType } from "zod";
import { type ActionResult } from "./types";

export async function runValidated<TInput>(
  schema: ZodType<TInput>,
  raw: unknown,
  fn: (data: TInput) => Promise<unknown>,
  revalidate: string[] = [],
): Promise<ActionResult> {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  try {
    await fn(parsed.data);
    revalidate.forEach((p) => revalidatePath(p));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error al guardar" };
  }
}
