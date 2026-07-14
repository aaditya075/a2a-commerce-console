"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function SuccessInner() {
  const search = useSearchParams();
  const sessionId = search.get("session_id");
  const [note, setNote] = useState("Confirming payment…");

  useEffect(() => {
    if (!sessionId) {
      setNote("Payment complete. Open the dashboard to see your fleet.");
      return;
    }
    // Best-effort local provision if webhook not reachable in local Stripe CLI.
    fetch("/api/checkout/confirm", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          setNote(
            data.message ||
              "Payment confirmed. Your agents are provisioned.",
          );
        } else {
          setNote(
            "Payment succeeded in Stripe. If agents are missing, ensure the webhook is configured.",
          );
        }
      })
      .catch(() =>
        setNote(
          "Payment succeeded. Configure Stripe webhooks for automatic provisioning.",
        ),
      );
  }, [sessionId]);

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
      <div className="rounded-2xl border border-stripe-border bg-white p-10 shadow-stripe">
        <p className="text-sm font-semibold text-stripe-green">Payment successful</p>
        <h1 className="mt-3 text-2xl font-semibold text-stripe-navy">
          Welcome to Nexus Fleet
        </h1>
        <p className="mt-3 text-stripe-ink">{note}</p>
        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard"
            className="rounded-full bg-stripe-accent px-4 py-2.5 text-sm font-semibold text-white"
          >
            Open dashboard
          </Link>
          <Link
            href="/playground"
            className="rounded-full border border-stripe-border px-4 py-2.5 text-sm font-medium text-stripe-navy"
          >
            Run a real agent task
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="p-10">Loading…</div>}>
      <SuccessInner />
    </Suspense>
  );
}
