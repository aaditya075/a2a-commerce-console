import { NextResponse } from "next/server";
import { z } from "zod";
import { ensureDefaultTenant, issueAgentKey } from "@/server/control-plane";

export const runtime = "nodejs";

const BodySchema = z.object({
  agentId: z.string().min(1),
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

  const issued = issueAgentKey({ tenantId, agentId: parsed.data.agentId });
  return NextResponse.json({ tenantId, agentId: parsed.data.agentId, ...issued });
}

