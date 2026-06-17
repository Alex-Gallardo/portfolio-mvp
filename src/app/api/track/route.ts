import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs"; // Prisma no corre en edge

const SESSION_COOKIE = "pa_sid";
const SESSION_MAX_AGE = 60 * 60 * 24 * 180; // 180 días

const payloadSchema = z.object({
  type: z.enum(["PAGEVIEW", "CLICK", "SCROLL_DEPTH", "CONVERSION", "OUTBOUND"]),
  path: z.string().min(1).max(512),
  element: z.string().max(256).optional(),
  label: z.string().max(256).optional(),
  referrer: z.string().max(512).optional(),
});

// --- Derivación ligera del user-agent (sin dependencias) ---
function parseDevice(ua: string): string {
  if (/iPad|Tablet|PlayBook|Silk/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua)))
    return "tablet";
  if (/Mobi|iPhone|iPod|Android.*Mobile|Windows Phone/i.test(ua)) return "mobile";
  return "desktop";
}
function parseOS(ua: string): string | null {
  if (/Windows NT/i.test(ua)) return "Windows";
  if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
  if (/Mac OS X/i.test(ua)) return "macOS";
  if (/Android/i.test(ua)) return "Android";
  if (/Linux/i.test(ua)) return "Linux";
  return null;
}
function parseBrowser(ua: string): string | null {
  if (/Edg\//i.test(ua)) return "Edge"; // Edge antes que Chrome
  if (/OPR\/|Opera/i.test(ua)) return "Opera";
  if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) return "Chrome";
  if (/Firefox\//i.test(ua)) return "Firefox";
  if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) return "Safari"; // Safari al final
  return null;
}
function decodeHeader(v: string | null): string | null {
  if (!v) return null;
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

const NO_CONTENT = () => new NextResponse(null, { status: 204 });

export async function POST(request: NextRequest) {
  // 1) Parseo tolerante (sendBeacon manda text/plain a veces)
  let raw: unknown;
  try {
    raw = JSON.parse(await request.text());
  } catch {
    return NO_CONTENT();
  }
  const parsed = payloadSchema.safeParse(raw);
  if (!parsed.success) return NO_CONTENT();
  const data = parsed.data;

  // 2) Sesión: lee cookie; si no hay, genera id nuevo
  let sid = request.cookies.get(SESSION_COOKIE)?.value;
  const isNew = !sid;
  if (!sid) sid = randomUUID();

  // 3) Metadatos derivados en servidor (la IP no se almacena)
  const ua = request.headers.get("user-agent") ?? "";
  const country = request.headers.get("x-vercel-ip-country") ?? null;
  const city = decodeHeader(request.headers.get("x-vercel-ip-city"));

  try {
    // upsert por id: crea la sesión la 1ª vez; si ya existe, refresca lastSeen
    await prisma.analyticsSession.upsert({
      where: { id: sid },
      create: {
        id: sid,
        device: parseDevice(ua),
        browser: parseBrowser(ua),
        os: parseOS(ua),
        country,
        city,
      },
      update: { lastSeen: new Date() },
    });

    await prisma.analyticsEvent.create({
      data: {
        sessionId: sid,
        type: data.type,
        path: data.path,
        element: data.element ?? null,
        label: data.label ?? null,
        referrer: data.referrer ?? null,
      },
    });
  } catch {
    return NO_CONTENT(); // nunca rompemos la experiencia por un fallo de analítica
  }

  const res = NO_CONTENT();
  if (isNew) {
    res.cookies.set(SESSION_COOKIE, sid, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
  }
  return res;
}
