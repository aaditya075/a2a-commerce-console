import { NextResponse } from "next/server";
import { z } from "zod";
import { ensureDefaultTenant, issueAgentKey, provisionFleet } from "@/server/control-plane";

export const runtime = "nodejs";

const BodySchema = z.object({
  items: z
    .array(
      z.object({
        skuId: z.string().min(1),
        qty: z.number().int().min(1).max(99),
      }),
    )
    .min(1),
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

  const agents = provisionFleet({ tenantId, items: parsed.data.items });

  // Issue a key+token for each created agent so the local dev fleet runner can start them.
  const credentials = agents.map((a) => ({
    agentId: a.id,
    skuId: a.skuId,
    displayName: a.displayName,
    ...issueAgentKey({ tenantId, agentId: a.id }),
  }));

  return NextResponse.json({ tenantId, agents, credentials });
}

