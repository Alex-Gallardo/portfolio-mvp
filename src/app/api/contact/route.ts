import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";
import { contactBodySchema } from "@/features/contact/schema";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Cuerpo inválido" }, { status: 400 });
  }

  const parsed = contactBodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Datos inválidos" }, { status: 422 });
  }
  const { name, email, message, sourcePage, company } = parsed.data;

  // Honeypot: si el bot rellenó "company", fingimos éxito y no insertamos nada.
  if (company && company.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  // 1) Guarda el mensaje (esto es lo que no puede fallar)
  try {
    await prisma.contactMessage.create({
      data: { name, email, message, sourcePage: sourcePage ?? null },
    });
  } catch {
    return NextResponse.json({ ok: false, error: "No se pudo guardar" }, { status: 500 });
  }

  // 2) Email de aviso (no fatal: si falla, el mensaje ya está guardado)
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (resend && to && from) {
    try {
      await resend.emails.send({
        from,
        to,
        replyTo: email,
        subject: `Nuevo mensaje de ${name}`,
        text: `De: ${name} <${email}>\nPágina: ${sourcePage ?? "—"}\n\n${message}`,
      });
    } catch (e) {
      console.error("Resend falló (el mensaje sí se guardó):", e);
    }
  }

  return NextResponse.json({ ok: true });
}
