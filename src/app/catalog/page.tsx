"use client";

import { useCart } from "@/context/cart-context";
import { agentCatalog } from "@/lib/mock-data";
import { ProviderBadges } from "@/components/provider-badges";
import { Check, Plus } from "lucide-react";

export default function CatalogPage() {
  const { addSku, lines } = useCart();
  const qtyFor = (id: string) => lines.find((l) => l.skuId === id)?.qty ?? 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <header className="max-w-2xl">
        <p className="text-sm font-semibold text-stripe-accent">Pricing</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stripe-navy sm:text-4xl">
          Agent catalog
        </h1>
        <p className="mt-3 text-stripe-ink">
          Each SKU is a managed agent with A2A capabilities. Subscribe via
          Stripe Checkout—agents provision after successful payment.
        </p>
      </header>

      <ul className="mt-12 grid gap-6 lg:grid-cols-2">
        {agentCatalog.map((sku) => (
          <li key={sku.id}>
            <article className="flex h-full flex-col rounded-2xl border border-stripe-border bg-white p-6 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-stripe-muted">
                    {sku.category}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-stripe-navy">
                    {sku.name}
                  </h2>
                  <p className="mt-1 text-sm text-stripe-accent">{sku.tagline}</p>
                </div>
                {sku.badge && (
                  <span className="rounded-full bg-stripe-soft px-2.5 py-1 text-xs font-semibold text-stripe-accent">
                    {sku.badge}
                  </span>
                )}
              </div>

              <p className="mt-4 flex-1 text-sm leading-relaxed text-stripe-ink">
                {sku.description}
              </p>

              <div className="mt-5 rounded-xl border border-stripe-border bg-stripe-soft/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-stripe-muted">
                  A2A capabilities
                </p>
                <ul className="mt-2 space-y-1.5">
                  {sku.a2aCapabilities.map((cap) => (
                    <li
                      key={cap}
                      className="flex items-start gap-2 text-sm text-stripe-navy"
                    >
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-stripe-green"
                        aria-hidden
                      />
                      {cap}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-stripe-muted">
                  Interoperates with
                </p>
                <ProviderBadges providers={sku.compatibleProviders} />
              </div>

              <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-stripe-border pt-6">
                <div>
                  <p className="text-xs text-stripe-muted">From</p>
                  <p className="text-2xl font-semibold tabular-nums text-stripe-navy">
                    ${sku.priceMonthlyUsd}
                    <span className="text-sm font-normal text-stripe-muted">
                      {" "}
                      / mo
                    </span>
                  </p>
                  <p className="text-xs text-stripe-muted">
                    {sku.includedSeats} seats · {sku.sla}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => addSku(sku.id, sku.name, sku.priceMonthlyUsd)}
                  className="inline-flex items-center gap-2 rounded-full bg-stripe-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stripe-accentDark"
                >
                  <Plus className="h-4 w-4" aria-hidden />
                  {qtyFor(sku.id) > 0
                    ? `Add another (${qtyFor(sku.id)})`
                    : "Add to cart"}
                </button>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
