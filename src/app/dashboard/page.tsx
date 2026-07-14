"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { agentCatalog } from "@/lib/mock-data";
import { ProviderBadges } from "@/components/provider-badges";
import { Activity, Link2, Radio } from "lucide-react";

type FleetAgent = {
  id: string;
  skuId: string;
  displayName: string;
  provider: string;
  status: string;
  lastHandshakeAt: string | null;
};

type Trace = {
  id: string;
  createdAt: string;
  rootIntent: string;
  status: string;
};

type Connection = {
  agentId: string;
  provider: string;
  capabilities: string[];
};

function statusColor(status: string) {
  if (status === "healthy") return "bg-stripe-green";
  if (status === "degraded") return "bg-amber-400";
  return "bg-slate-300";
}

export default function DashboardPage() {
  const [fleet, setFleet] = useState<FleetAgent[]>([]);
  const [traces, setTraces] = useState<Trace[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      const [f, t, c] = await Promise.all([
        fetch("/api/fleet").then((r) => r.json()),
        fetch("/api/traces").then((r) => r.json()),
        fetch("/api/connections").then((r) => r.json()),
      ]);
      setFleet(f.fleet ?? []);
      setTraces(t.traces ?? []);
      setConnections(c.connections ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  }

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-stripe-accent">Operations</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-stripe-navy sm:text-4xl">
            Fleet dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-stripe-ink">
            Live agent health, connected A2A peers, and recent traces. Data
            refreshes every few seconds.
          </p>
        </div>
        <Link
          href="/playground"
          className="inline-flex items-center gap-2 rounded-full bg-stripe-navy px-4 py-2.5 text-sm font-semibold text-white"
        >
          <Radio className="h-4 w-4" aria-hidden />
          Run a task
        </Link>
      </header>

      {error && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-stripe-border bg-white p-4 shadow-soft">
          <p className="text-xs font-semibold uppercase text-stripe-muted">
            Fleet size
          </p>
          <p className="mt-2 text-3xl font-semibold text-stripe-navy">
            {fleet.length}
          </p>
        </div>
        <div className="rounded-2xl border border-stripe-border bg-white p-4 shadow-soft">
          <p className="text-xs font-semibold uppercase text-stripe-muted">
            Connected now
          </p>
          <p className="mt-2 text-3xl font-semibold text-stripe-navy">
            {connections.length}
          </p>
        </div>
        <div className="rounded-2xl border border-stripe-border bg-white p-4 shadow-soft">
          <p className="text-xs font-semibold uppercase text-stripe-muted">
            Traces
          </p>
          <p className="mt-2 text-3xl font-semibold text-stripe-navy">
            {traces.length}
          </p>
        </div>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-stripe-muted">
            <Activity className="h-4 w-4 text-stripe-accent" aria-hidden />
            Running agents
          </h2>
          <ul className="mt-4 space-y-3">
            {fleet.length === 0 && (
              <li className="rounded-2xl border border-dashed border-stripe-border bg-white p-6 text-sm text-stripe-ink">
                No agents provisioned yet.{" "}
                <Link href="/catalog" className="text-stripe-accent underline">
                  Order from catalog
                </Link>{" "}
                or run <code className="font-mono text-xs">npm run agents:dev</code>{" "}
                for a default fleet.
              </li>
            )}
            {fleet.map((agent) => {
              const sku = agentCatalog.find((s) => s.id === agent.skuId);
              const live = connections.find((c) => c.agentId === agent.id);
              return (
                <li key={agent.id}>
                  <article className="rounded-2xl border border-stripe-border bg-white p-5 shadow-soft">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-1.5 h-2.5 w-2.5 rounded-full ${statusColor(live ? "healthy" : agent.status)}`}
                        />
                        <div>
                          <p className="font-semibold text-stripe-navy">
                            {agent.displayName}
                          </p>
                          <p className="font-mono text-xs text-stripe-muted">
                            {agent.id}
                          </p>
                          <p className="mt-1 text-xs text-stripe-muted">
                            {sku?.name ?? agent.skuId} · {agent.provider}
                            {agent.lastHandshakeAt
                              ? ` · handshake ${new Date(agent.lastHandshakeAt).toLocaleTimeString()}`
                              : ""}
                          </p>
                          {sku && (
                            <ProviderBadges
                              providers={sku.compatibleProviders}
                              compact
                            />
                          )}
                          {live && (
                            <p className="mt-2 text-xs text-stripe-green">
                              Online · {live.capabilities.join(", ") || "no caps"}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-stripe-muted">
            <Link2 className="h-4 w-4 text-stripe-accent" aria-hidden />
            Recent traces
          </h2>
          <ul className="mt-4 space-y-3">
            {traces.length === 0 && (
              <li className="rounded-2xl border border-dashed border-stripe-border bg-white p-4 text-sm text-stripe-ink">
                No traces yet. Send a task from the playground.
              </li>
            )}
            {traces.slice(0, 12).map((trace) => (
              <li key={trace.id}>
                <article className="rounded-2xl border border-stripe-border bg-white p-4 text-sm">
                  <p className="font-mono text-[11px] text-stripe-muted">
                    {trace.id}
                  </p>
                  <p className="mt-1 font-medium text-stripe-navy">
                    {trace.rootIntent}
                  </p>
                  <p className="mt-1 text-xs text-stripe-muted">
                    {new Date(trace.createdAt).toLocaleString()} · {trace.status}
                  </p>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
