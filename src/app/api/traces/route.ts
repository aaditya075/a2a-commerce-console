import { NextResponse } from "next/server";
import { ensureDefaultTenant, listTraces } from "@/server/control-plane";

export const runtime = "nodejs";

export async function GET() {
  const { tenantId } = ensureDefaultTenant();
  const traces = listTraces(tenantId, 50);
  return NextResponse.json({ tenantId, traces });
}

