import { NextResponse } from "next/server";
import { ensureDefaultTenant } from "@/server/control-plane";

export const runtime = "nodejs";

export async function GET() {
  const { tenantId } = ensureDefaultTenant();
  const gatewayHttp =
    process.env.A2A_GATEWAY_HTTP_URL || "http://127.0.0.1:8787";
  try {
    const res = await fetch(
      `${gatewayHttp}/v1/connections?tenantId=${encodeURIComponent(tenantId)}`,
      { cache: "no-store" },
    );
    const data = await res.json();
    return NextResponse.json({ tenantId, ...data });
  } catch {
    return NextResponse.json({
      tenantId,
      connections: [],
      error: "gateway_unreachable",
    });
  }
}
