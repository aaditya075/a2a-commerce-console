"use client";

import { useCart } from "@/context/cart-context";
import { agentCatalog } from "@/lib/mock-data";
import { ProviderBadges } from "@/components/provider-badges";
import { Check, Plus } from "lucide-react";

export default function CatalogPage() {
  const { addSku, lines } = useCart();
  const qtyFor = (id: string) =>
    lines.find((l) => l.skuId === id)?.qty ?? 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Agent catalog
        </h1>
        <p className="mt-3 text-ink-400">
          Each SKU is a managed agent profile with A2A envelopes, observability,
          and cross-provider compatibility. Add agents to your cart to
          provision a fleet—demo UI only; no billing attached.
        </p>
      </header>

      <ul className="mt-12 grid gap-6 lg:grid-cols-2">
        {agentCatalog.map((sku) => (
          <li key={sku.id}>
            <article className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-panel backdrop-blur">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                    {sku.category}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-white">
                    {sku.name}
                  </h2>
                  <p className="mt-1 text-sm text-signal-dim">{sku.tagline}</p>
                </div>
                {sku.badge && (
                  <span className="rounded-full bg-pulse/15 px-2.5 py-1 text-xs font-semibold text-pulse">
                    {sku.badge}
                  </span>
                )}
              </div>

              <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-400">
                {sku.description}
              </p>

              <div className="mt-5 rounded-xl border border-white/10 bg-ink-900/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                  A2A capabilities
                </p>
                <ul className="mt-2 space-y-1.5">
                  {sku.a2aCapabilities.map((cap) => (
                    <li
                      key={cap}
                      className="flex items-start gap-2 text-sm text-ink-200"
                    >
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-signal"
                        aria-hidden
                      />
                      {cap}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Interoperates with
                </p>
                <ProviderBadges providers={sku.compatibleProviders} />
              </div>

              <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-white/10 pt-6">
                <div>
                  <p className="text-xs text-ink-500">From</p>
                  <p className="text-2xl font-semibold tabular-nums text-white">
                    ${sku.priceMonthlyUsd}
                    <span className="text-sm font-normal text-ink-400">
                      {" "}
                      / mo
                    </span>
                  </p>
                  <p className="text-xs text-ink-500">
                    {sku.includedSeats} seats · {sku.sla}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => addSku(sku.id, sku.name, sku.priceMonthlyUsd)}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-signal to-pulse px-4 py-2.5 text-sm font-semibold text-ink-950 shadow-lift transition hover:brightness-110"
                >
                  {qtyFor(sku.id) > 0 ? (
                    <>
                      <Plus className="h-4 w-4" aria-hidden />
                      Add another ({qtyFor(sku.id)} in cart)
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" aria-hidden />
                      Add to cart
                    </>
                  )}
                </button>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
