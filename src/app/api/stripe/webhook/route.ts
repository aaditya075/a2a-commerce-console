import { NextResponse } from "next/server";
import { getStripe } from "@/server/stripe";
import { ensureDefaultTenant, provisionFleet } from "@/server/control-plane";
import { getDb } from "@/server/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const stripe = getStripe();
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const rawBody = await req.text();

  let event;
  try {
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } else {
      // Dev fallback when webhook secret not set: parse JSON only.
      event = JSON.parse(rawBody);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "invalid_signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as {
      id: string;
      metadata?: { tenantId?: string; orderId?: string; items?: string };
    };

    const db = getDb();
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

    if (orderId) {
      const order = db
        .prepare("select items_json, status from orders where id = ?")
        .get(orderId) as { items_json: string; status: string } | undefined;
      if (order?.status === "paid") {
        return NextResponse.json({ received: true, duplicate: true });
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

    if (items.length > 0) {
      provisionFleet({
        tenantId: session.metadata?.tenantId || tenantId,
        items,
      });
    }
  }

  return NextResponse.json({ received: true });
}
