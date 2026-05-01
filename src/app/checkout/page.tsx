"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/context/cart-context";
import { Trash2 } from "lucide-react";

export default function CheckoutPage() {
  const { lines, subtotal, setQty, removeSku, clear } = useCart();
  const [ordered, setOrdered] = useState(false);

  if (ordered) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <div className="rounded-2xl border border-signal/30 bg-signal/10 p-10">
          <h1 className="text-2xl font-semibold text-white">Order received</h1>
          <p className="mt-3 text-ink-300">
            Demo only: connect billing and your agent runtime to provision real
            workloads. Your cart has been cleared.
          </p>
          <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link
              href="/dashboard"
              className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-ink-950"
            >
              Open fleet dashboard
            </Link>
            <Link
              href="/catalog"
              className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/5"
            >
              Add more agents
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        Cart &amp; order
      </h1>
      <p className="mt-2 text-ink-400">
        Review agents before provisioning. In this demo, submitting clears the
        cart—wire your billing and control plane when you are ready.
      </p>

      {lines.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-white/20 bg-white/[0.02] p-10 text-center">
          <p className="text-ink-300">Your cart is empty.</p>
          <Link
            href="/catalog"
            className="mt-4 inline-flex rounded-xl bg-white px-4 py-2 text-sm font-semibold text-ink-950"
          >
            Browse catalog
          </Link>
        </div>
      ) : (
        <div className="mt-10 space-y-6">
          <ul className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.03]">
            {lines.map((line) => (
              <li
                key={line.skuId}
                className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-white">{line.name}</p>
                  <p className="text-sm text-ink-500">
                    ${line.priceMonthlyUsd} / month each
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-ink-300">
                    Qty
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={line.qty}
                      onChange={(e) =>
                        setQty(line.skuId, Number(e.target.value))
                      }
                      className="w-16 rounded-lg border border-white/15 bg-ink-900 px-2 py-1 text-sm text-white"
                    />
                  </label>
                  <p className="text-sm font-semibold tabular-nums text-white">
                    ${line.priceMonthlyUsd * line.qty}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeSku(line.skuId)}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-xs text-ink-400 hover:border-red-400/40 hover:text-red-300"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-4 rounded-2xl border border-signal/25 bg-signal/5 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-ink-400">Estimated monthly</p>
              <p className="text-3xl font-semibold tabular-nums text-white">
                ${subtotal}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={clear}
                className="rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-ink-200 hover:bg-white/5"
              >
                Clear cart
              </button>
              <button
                type="button"
                onClick={() => {
                  clear();
                  setOrdered(true);
                }}
                className="rounded-xl bg-gradient-to-r from-signal to-pulse px-5 py-2 text-sm font-semibold text-ink-950 shadow-lift"
              >
                Place order
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-ink-600">
            <Link href="/dashboard" className="text-signal hover:underline">
              Open fleet dashboard
            </Link>{" "}
            after you provision.
          </p>
        </div>
      )}
    </div>
  );
}
