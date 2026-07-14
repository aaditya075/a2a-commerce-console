import { NextResponse } from "next/server";
import { z } from "zod";
import { ensureDefaultTenant } from "@/server/control-plane";

export const runtime = "nodejs";

const BodySchema = z.object({
  to: z.string().min(1),
  intent: z.string().min(1),
  payload: z.unknown().optional(),
  timeoutMs: z.number().int().min(1000).max(60000).optional(),
});

export async function POST(req: Request) {
  const { tenantId } = ensureDefaultTenant();
  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_request", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const gatewayHttp =
    process.env.A2A_GATEWAY_HTTP_URL || "http://127.0.0.1:8787";

  try {
    const res = await fetch(`${gatewayHttp}/v1/send`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        tenantId,
        to: parsed.data.to,
        intent: parsed.data.intent,
        payload: parsed.data.payload ?? {},
        timeoutMs: parsed.data.timeoutMs ?? 25000,
      }),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      {
        error: "gateway_unreachable",
        message:
          err instanceof Error
            ? err.message
            : "Could not reach A2A gateway. Run npm run gateway:dev",
      },
      { status: 503 },
    );
  }
}
