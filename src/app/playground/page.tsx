"use client";

import { useEffect, useState } from "react";

type FleetAgent = {
  id: string;
  skuId: string;
  displayName: string;
};

type Connection = {
  agentId: string;
  capabilities: string[];
};

const INTENT_PRESETS: Record<string, { intent: string; payload: string }> = {
  "sku-concierge": {
    intent: "product.search",
    payload: JSON.stringify(
      { query: "trail runners wide toe", maxPrice: 180 },
      null,
      2,
    ),
  },
  "sku-brand": {
    intent: "copy.review",
    payload: JSON.stringify(
      {
        copy: "The world's best jacket that cures fatigue instantly.",
        policy: "Avoid superlatives and medical claims.",
      },
      null,
      2,
    ),
  },
  "sku-inventory": {
    intent: "inventory.reserve",
    payload: JSON.stringify(
      { sku: "TR9-442", qty: 1, ttlMinutes: 15 },
      null,
      2,
    ),
  },
};

export default function PlaygroundPage() {
  const [fleet, setFleet] = useState<FleetAgent[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [agentId, setAgentId] = useState("");
  const [intent, setIntent] = useState("product.search");
  const [payload, setPayload] = useState(
    JSON.stringify({ query: "trail runners", maxPrice: 180 }, null, 2),
  );
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string>("");
  const [products, setProducts] = useState<
    Array<{
      sku: string;
      title: string;
      priceUsd: number;
      stock: number;
    }>
  >([]);

  useEffect(() => {
    async function load() {
      const [f, c, p] = await Promise.all([
        fetch("/api/fleet").then((r) => r.json()),
        fetch("/api/connections").then((r) => r.json()),
        fetch("/api/catalog/products").then((r) => r.json()),
      ]);
      setFleet(f.fleet ?? []);
      setConnections(c.connections ?? []);
      setProducts(p.products ?? []);
      if (!agentId && f.fleet?.[0]?.id) {
        const first = f.fleet[0] as FleetAgent;
        setAgentId(first.id);
        const preset = INTENT_PRESETS[first.skuId];
        if (preset) {
          setIntent(preset.intent);
          setPayload(preset.payload);
        }
      }
    }
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onSelectAgent(id: string) {
    setAgentId(id);
    const agent = fleet.find((a) => a.id === id);
    const preset = agent ? INTENT_PRESETS[agent.skuId] : undefined;
    if (preset) {
      setIntent(preset.intent);
      setPayload(preset.payload);
    }
  }

  async function runTask() {
    setBusy(true);
    setResult("");
    try {
      let parsedPayload: unknown = {};
      try {
        parsedPayload = JSON.parse(payload);
      } catch {
        setResult("Payload must be valid JSON");
        setBusy(false);
        return;
      }

      const res = await fetch("/api/a2a/send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          to: agentId,
          intent,
          payload: parsedPayload,
          timeoutMs: 30000,
        }),
      });
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setResult(err instanceof Error ? err.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  const onlineIds = new Set(connections.map((c) => c.agentId));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <header className="max-w-2xl">
        <p className="text-sm font-semibold text-stripe-accent">A2A Playground</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stripe-navy sm:text-4xl">
          Run real agent tasks
        </h1>
        <p className="mt-3 text-stripe-ink">
          Sends an intent over the WebSocket A2A gateway and waits for the
          agent&apos;s reply. Concierge searches a real catalog; inventory
          reserves stock; brand voice uses your LLM keys when set.
        </p>
      </header>

      <div className="mt-10 grid gap-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          <label className="block text-sm font-medium text-stripe-navy">
            Target agent
            <select
              value={agentId}
              onChange={(e) => onSelectAgent(e.target.value)}
              className="mt-1 w-full rounded-xl border border-stripe-border bg-white px-3 py-2.5 text-sm"
            >
              {fleet.length === 0 && (
                <option value="">No agents — provision or run agents:dev</option>
              )}
              {fleet.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.displayName} {onlineIds.has(a.id) ? "(online)" : "(offline)"}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-stripe-navy">
            Intent
            <input
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              className="mt-1 w-full rounded-xl border border-stripe-border bg-white px-3 py-2.5 font-mono text-sm"
            />
          </label>

          <label className="block text-sm font-medium text-stripe-navy">
            Payload (JSON)
            <textarea
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              rows={10}
              className="mt-1 w-full rounded-xl border border-stripe-border bg-white px-3 py-2.5 font-mono text-sm"
            />
          </label>

          <button
            type="button"
            disabled={busy || !agentId}
            onClick={runTask}
            className="rounded-full bg-stripe-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-stripe-accentDark disabled:opacity-50"
          >
            {busy ? "Waiting for agent…" : "Send A2A task"}
          </button>

          <div className="rounded-2xl border border-stripe-border bg-stripe-navy p-4 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
              Response
            </p>
            <pre className="mt-2 max-h-96 overflow-auto whitespace-pre-wrap font-mono text-xs text-cyan-100">
              {result || "Results appear here after a task completes."}
            </pre>
          </div>
        </div>

        <aside className="space-y-4 lg:col-span-2">
          <div className="rounded-2xl border border-stripe-border bg-white p-5 shadow-soft">
            <h2 className="text-sm font-semibold text-stripe-navy">
              Live catalog stock
            </h2>
            <ul className="mt-3 space-y-2">
              {products.map((p) => (
                <li
                  key={p.sku}
                  className="flex items-center justify-between text-sm"
                >
                  <span>
                    <span className="font-mono text-xs text-stripe-muted">
                      {p.sku}
                    </span>{" "}
                    {p.title}
                  </span>
                  <span className="tabular-nums text-stripe-ink">
                    ${p.priceUsd} · {p.stock} left
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-stripe-border bg-white p-5 shadow-soft text-sm text-stripe-ink">
            <p className="font-semibold text-stripe-navy">Runtime checklist</p>
            <ol className="mt-2 list-decimal space-y-1 pl-4">
              <li>
                <code className="font-mono text-xs">npm run gateway:dev</code>
              </li>
              <li>
                <code className="font-mono text-xs">npm run agents:dev</code>
              </li>
              <li>Set OpenAI / Anthropic keys for LLM-backed skills</li>
              <li>Set Stripe keys for paid subscriptions</li>
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}
