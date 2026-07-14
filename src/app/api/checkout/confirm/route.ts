import { NextResponse } from "next/server";
import { z } from "zod";
import { getStripe } from "@/server/stripe";
import { ensureDefaultTenant, provisionFleet } from "@/server/control-plane";
import { getDb } from "@/server/db";

export const runtime = "nodejs";

const BodySchema = z.object({
  sessionId: z.string().min(1),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(parsed.data.sessionId);
  if (session.payment_status !== "paid" && session.status !== "complete") {
    return NextResponse.json(
      { error: "not_paid", status: session.payment_status },
      { status: 400 },
    );
  }

  const { tenantId } = ensureDefaultTenant();
  const orderId = session.metadata?.orderId;
  const itemsRaw = session.metadata?.items;
  let items: Array<{ skuId: string; qty: number }> = [];
  if (itemsRaw) {
    try {
      items = JSON.parse(itemsRaw) as Array<{ skuId: string; qty: number }>;
    } catch {
      items = [];
    }
  }

  const db = getDb();
  if (orderId) {
    const order = db
      .prepare("select items_json, status from orders where id = ?")
      .get(orderId) as { items_json: string; status: string } | undefined;
    if (order?.status === "paid") {
      return NextResponse.json({
        ok: true,
        message: "Already provisioned for this order.",
      });
    }
    if (order && items.length === 0) {
      items = JSON.parse(order.items_json) as Array<{
        skuId: string;
        qty: number;
      }>;
    }
    db.prepare(
      "update orders set status = ?, stripe_session_id = ? where id = ?",
    ).run("paid", session.id, orderId);
  }

  if (items.length === 0) {
    return NextResponse.json(
      { error: "no_items", message: "No SKUs found on session metadata." },
      { status: 400 },
    );
  }

  const agents = provisionFleet({
    tenantId: session.metadata?.tenantId || tenantId,
    items,
  });

  return NextResponse.json({
    ok: true,
    message: `Provisioned ${agents.length} agent(s). Start the agent runner to connect them.`,
    agents,
  });
}
