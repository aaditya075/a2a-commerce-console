import { demoA2AFeed, demoFleet, agentCatalog } from "@/lib/mock-data";
import { ProviderBadges } from "@/components/provider-badges";
import { Activity, Cpu, Link2, Server } from "lucide-react";

function statusColor(status: string) {
  if (status === "healthy") return "bg-emerald-400";
  if (status === "degraded") return "bg-amber-400";
  return "bg-slate-400";
}

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Fleet operations
          </h1>
          <p className="mt-2 max-w-2xl text-ink-400">
            Monitor agent health, cross-LLM peers, and live A2A traffic. This
            dashboard uses illustrative data to show how teams could run agentic
            commerce at scale.
          </p>
        </div>
        <div className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-ink-300">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-signal" aria-hidden />
            <span>
              Regions <strong className="text-white">4</strong>
            </span>
          </div>
          <span className="text-white/20" aria-hidden>
            |
          </span>
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-pulse" aria-hidden />
            <span>
              Active SKUs <strong className="text-white">5</strong>
            </span>
          </div>
        </div>
      </header>

      <section className="mt-10 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink-500">
            <Activity className="h-4 w-4 text-signal" aria-hidden />
            Running agents
          </h2>
          <ul className="mt-4 space-y-3">
            {demoFleet.map((agent) => {
              const sku = agentCatalog.find((s) => s.id === agent.skuId);
              return (
                <li key={agent.id}>
                  <article className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-panel backdrop-blur sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-1.5 h-2.5 w-2.5 rounded-full ${statusColor(agent.status)}`}
                        title={agent.status}
                      />
                      <div>
                        <p className="font-semibold text-white">
                          {agent.displayName}
                        </p>
                        <p className="text-xs text-ink-500">
                          {sku?.name ?? agent.skuId} · last handshake{" "}
                          {new Date(agent.lastHandshakeAt).toLocaleTimeString(
                            [],
                            { hour: "2-digit", minute: "2-digit" },
                          )}
                        </p>
                        {sku && (
                          <ProviderBadges
                            providers={sku.compatibleProviders}
                            compact
                          />
                        )}
                      </div>
                    </div>
                    <dl className="grid grid-cols-2 gap-4 text-sm sm:text-right">
                      <div>
                        <dt className="text-ink-500">A2A peers</dt>
                        <dd className="font-semibold tabular-nums text-white">
                          {agent.peerCount}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-ink-500">Msgs / 24h</dt>
                        <dd className="font-semibold tabular-nums text-white">
                          {agent.throughput24h.toLocaleString()}
                        </dd>
                      </div>
                    </dl>
                  </article>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink-500">
            <Link2 className="h-4 w-4 text-pulse" aria-hidden />
            Live A2A feed
          </h2>
          <ul className="mt-4 space-y-3">
            {demoA2AFeed.map((msg) => (
              <li key={msg.id}>
                <article className="rounded-2xl border border-white/10 bg-ink-900/50 p-4 text-sm">
                  <p className="font-mono text-xs text-ink-500">
                    {msg.fromAgent}{" "}
                    <span className="text-ink-600">→</span> {msg.toAgent}
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-wide text-signal-dim">
                    {msg.intent}
                  </p>
                  <p className="mt-1 text-ink-200">{msg.payloadSummary}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] text-ink-500">Across</span>
                    <ProviderBadges
                      providers={[msg.fromProvider, msg.toProvider]}
                      compact
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-ink-600">
                    {new Date(msg.at).toLocaleString()}
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
