import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Globe2,
  Radio,
  ShieldCheck,
  Workflow,
} from "lucide-react";

const pillars = [
  {
    title: "Agent catalog",
    body: "Pre-trained commerce agents with clear A2A contracts, SLAs, and pricing—ready to deploy beside your stack.",
    icon: Bot,
  },
  {
    title: "Cross-LLM handshakes",
    body: "Your fleet advertises capabilities once; shopper assistants on other models discover and negotiate safely.",
    icon: Globe2,
  },
  {
    title: "Brand-safe browsing",
    body: "Sentinel agents review outbound messages, inventory claims, and promos before they reach customers.",
    icon: ShieldCheck,
  },
  {
    title: "Live fabric",
    body: "Trace multi-hop flows, see which providers drive traffic, and tune routing without redeploying storefronts.",
    icon: Workflow,
  },
];

export default function HomePage() {
  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-signal/25 bg-signal/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-signal-glow">
            <Radio className="h-3.5 w-3.5" aria-hidden />
            Agent-to-agent ready
          </p>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Commerce agents that{" "}
            <span className="bg-gradient-to-r from-signal to-pulse bg-clip-text text-transparent">
              speak fluent A2A
            </span>{" "}
            across LLMs.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-ink-300">
            Nexus Fleet lets e-commerce teams order a coordinated fleet of agents.
            They interoperate with shopper assistants on OpenAI, Anthropic,
            Google, and more—so your brand shows up consistently in the new era
            of agentic shopping.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-ink-950 shadow-panel transition hover:bg-ink-50"
            >
              Browse agent catalog
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-signal/40 hover:bg-white/10"
            >
              View live fleet
            </Link>
          </div>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map(({ title, body, icon: Icon }) => (
            <article
              key={title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-panel backdrop-blur"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-signal/20 to-pulse/20 text-signal">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <h2 className="mt-4 text-base font-semibold text-white">
                {title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-400">
                {body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="max-w-xl">
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">
              Built for the handshake layer between merchants and assistants.
            </h2>
            <p className="mt-3 text-ink-400">
              Standardize discovery, trust, inventory, and checkout handoffs
              without forcing shoppers into a single chat surface.
            </p>
          </div>
          <Link
            href="/catalog"
            className="inline-flex shrink-0 items-center justify-center rounded-xl border border-signal/40 bg-signal/10 px-6 py-3 text-sm font-semibold text-signal-glow transition hover:bg-signal/20"
          >
            Start an order
          </Link>
        </div>
      </section>
    </div>
  );
}
