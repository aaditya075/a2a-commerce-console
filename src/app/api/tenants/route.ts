import { NextResponse } from "next/server";
import { ensureDefaultTenant } from "@/server/control-plane";

export const runtime = "nodejs";

export async function POST() {
  const { tenantId } = ensureDefaultTenant();
  return NextResponse.json({ tenantId, name: "Default tenant" });
}

