"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useCart } from "@/context/cart-context";
import { Trash2 } from "lucide-react";

function CheckoutInner() {
  const { lines, subtotal, setQty, removeSku, clear } = useCart();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const search = useSearchParams();
  const canceled = search.get("canceled") === "1";

  async function payWithStripe() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          items: lines.map((l) => ({ skuId: l.skuId, qty: l.qty })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || data.error || "Checkout failed");
        return;
      }
      if (data.url) {
        clear();
        window.location.href = data.url as string;
        return;
      }
      setError("No Checkout URL returned");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-stripe-navy sm:text-4xl">
        Checkout
      </h1>
      <p className="mt-2 text-stripe-ink">
        Pay with Stripe Checkout. After payment, your fleet provisions
        automatically via webhook.
      </p>

      {canceled && (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Checkout was canceled. Your cart is still here when you are ready.
        </p>
      )}

      {lines.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-stripe-border bg-white p-10 text-center">
          <p className="text-stripe-ink">Your cart is empty.</p>
          <Link
            href="/catalog"
            className="mt-4 inline-flex rounded-full bg-stripe-accent px-4 py-2 text-sm font-semibold text-white"
          >
            Browse catalog
          </Link>
        </div>
      ) : (
        <div className="mt-10 space-y-6">
          <ul className="divide-y divide-stripe-border rounded-2xl border border-stripe-border bg-white shadow-soft">
            {lines.map((line) => (
              <li
                key={line.skuId}
                className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-stripe-navy">{line.name}</p>
                  <p className="text-sm text-stripe-muted">
                    ${line.priceMonthlyUsd} / month each
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-stripe-ink">
                    Qty
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={line.qty}
                      onChange={(e) =>
                        setQty(line.skuId, Number(e.target.value))
                      }
                      className="w-16 rounded-lg border border-stripe-border bg-white px-2 py-1 text-sm text-stripe-navy"
                    />
                  </label>
                  <p className="text-sm font-semibold tabular-nums text-stripe-navy">
                    ${line.priceMonthlyUsd * line.qty}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeSku(line.skuId)}
                    className="inline-flex items-center gap-1 rounded-lg border border-stripe-border px-2 py-1 text-xs text-stripe-muted hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-4 rounded-2xl border border-stripe-border bg-white p-6 shadow-soft sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-stripe-muted">Estimated monthly</p>
              <p className="text-3xl font-semibold tabular-nums text-stripe-navy">
                ${subtotal}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={clear}
                className="rounded-full border border-stripe-border px-4 py-2 text-sm font-medium text-stripe-ink hover:bg-stripe-soft"
              >
                Clear cart
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={payWithStripe}
                className="rounded-full bg-stripe-accent px-5 py-2 text-sm font-semibold text-white hover:bg-stripe-accentDark disabled:opacity-60"
              >
                {busy ? "Redirecting…" : "Pay with Stripe"}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="p-10 text-stripe-ink">Loading…</div>}>
      <CheckoutInner />
    </Suspense>
  );
}
