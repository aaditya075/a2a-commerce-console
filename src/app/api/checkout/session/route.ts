import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ensureDefaultTenant } from "@/server/control-plane";
import { agentCatalog } from "@/lib/mock-data";
import { appBaseUrl, getStripe, stripeConfigured } from "@/server/stripe";
import { getDb } from "@/server/db";
import { randomId } from "@/server/crypto";
import type Stripe from "stripe";

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

export async function POST(req: NextRequest) {
  if (!stripeConfigured()) {
    return NextResponse.json(
      {
        error: "stripe_not_configured",
        message:
          "Set STRIPE_SECRET_KEY in .env.local to enable Stripe Checkout.",
      },
      { status: 503 },
    );
  }

  const { tenantId } = ensureDefaultTenant();
  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_request", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  for (const item of parsed.data.items) {
    const sku = agentCatalog.find((s) => s.id === item.skuId);
    if (!sku) {
      return NextResponse.json(
        { error: "unknown_sku", skuId: item.skuId },
        { status: 400 },
      );
    }
    line_items.push({
      quantity: item.qty,
      price_data: {
        currency: "usd",
        unit_amount: sku.priceMonthlyUsd * 100,
        recurring: { interval: "month" },
        product_data: {
          name: sku.name,
          description: sku.tagline,
          metadata: { skuId: sku.id },
        },
      },
    });
  }

  const orderId = randomId("ord");
  const db = getDb();
  db.prepare(
    `insert into orders (id, tenant_id, status, items_json, created_at)
     values (?, ?, ?, ?, ?)`,
  ).run(
    orderId,
    tenantId,
    "pending_payment",
    JSON.stringify(parsed.data.items),
    new Date().toISOString(),
  );

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items,
    success_url: `${appBaseUrl()}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appBaseUrl()}/checkout?canceled=1`,
    metadata: {
      tenantId,
      orderId,
      items: JSON.stringify(parsed.data.items),
    },
    subscription_data: {
      metadata: {
        tenantId,
        orderId,
      },
    },
  });

  db.prepare("update orders set stripe_session_id = ? where id = ?").run(
    session.id,
    orderId,
  );

  return NextResponse.json({
    url: session.url,
    sessionId: session.id,
    orderId,
  });
}
