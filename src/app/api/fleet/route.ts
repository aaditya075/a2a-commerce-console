import { NextResponse } from "next/server";
import { ensureDefaultTenant, listFleet } from "@/server/control-plane";

export const runtime = "nodejs";

export async function GET() {
  const { tenantId } = ensureDefaultTenant();
  const fleet = listFleet(tenantId);
  return NextResponse.json({ tenantId, fleet });
}

