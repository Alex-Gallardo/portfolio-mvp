import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSignedUrl } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const schema = z.object({
  resourceSlug: z.string().min(1),
  fileId: z.string().optional(),
  email: z.email("Email no válido").optional(),
  name: z.string().optional(),
  consent: z.boolean().optional().default(false),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  website: z.string().optional(), // honeypot anti-spam
});

// Rate limit simple en memoria (best-effort; ver nota sobre serverless)
const RATE = new Map<string, { count: number; resetAt: number }>();
const LIMIT = 8;
const WINDOW = 60_000;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = RATE.get(ip);
  if (!entry || now > entry.resetAt) {
    RATE.set(ip, { count: 1, resetAt: now + WINDOW });
    return false;
  }
  entry.count += 1;
  return entry.count > LIMIT;
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 },
    );
  }
  const data = parsed.data;

  // Honeypot: el campo oculto debe venir vacío
  if (data.website && data.website.trim() !== "") {
    return NextResponse.json({ error: "Solicitud rechazada" }, { status: 400 });
  }

  // Rate limit por IP
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes, intenta en un minuto." },
      { status: 429 },
    );
  }

  // Recurso publicado + archivos
  const resource = await prisma.resource.findUnique({
    where: { slug: data.resourceSlug },
    include: { files: { orderBy: { order: "asc" } } },
  });
  if (!resource || resource.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Recurso no encontrado" }, { status: 404 });
  }

  // Elegir archivo: el pedido por fileId, o el primero
  const file = data.fileId ? resource.files.find((f) => f.id === data.fileId) : resource.files[0];
  if (!file) {
    return NextResponse.json(
      { error: "Este recurso no tiene archivos disponibles" },
      { status: 400 },
    );
  }

  if (resource.requireEmail && !data.email) {
    return NextResponse.json({ error: "El email es obligatorio para descargar." }, { status: 400 });
  }

  const referrer = request.headers.get("referer");

  // Lead (si hay email) + registro de descarga + contadores, en una transacción
  const leadId = await prisma.$transaction(async (tx) => {
    let leadId: string | null = null;

    if (data.email) {
      const lead = await tx.lead.upsert({
        where: { email: data.email },
        create: {
          email: data.email,
          name: data.name ?? null,
          consent: data.consent,
          sourceResourceId: resource.id,
          utmSource: data.utmSource ?? null,
          utmMedium: data.utmMedium ?? null,
          utmCampaign: data.utmCampaign ?? null,
        },
        update: {
          name: data.name ?? undefined,
          consent: data.consent || undefined,
        },
      });
      leadId = lead.id;
    }

    await tx.resourceDownload.create({
      data: {
        resourceId: resource.id,
        fileId: file.id,
        leadId,
        referrer: referrer ?? null,
      },
    });

    await tx.resource.update({
      where: { id: resource.id },
      data: { downloadCount: { increment: 1 } },
    });
    await tx.resourceFile.update({
      where: { id: file.id },
      data: { downloadCount: { increment: 1 } },
    });

    return leadId;
  });

  // URL firmada temporal del bucket privado (válida 60s)
  let signedUrl: string;
  try {
    signedUrl = await createSignedUrl("files", file.storagePath, 60, file.fileName);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "No se pudo generar la descarga" },
      { status: 500 },
    );
  }

  return NextResponse.json({ signedUrl, fileName: file.fileName, leadId });
}
