import { NextRequest, NextResponse } from "next/server";
import { getLeads } from "@/features/leads/queries";
import { leadsToCsv, rangeToSince } from "@/features/leads/csv";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Guard de servidor: el export no debe ser accesible sin sesión admin.
  await requireAdmin();

  const { searchParams } = new URL(request.url);
  const resourceId = searchParams.get("resource") ?? undefined;
  const since = rangeToSince(searchParams.get("range") ?? undefined);

  const leads = await getLeads({ resourceId, since });
  const csv = leadsToCsv(leads);

  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
