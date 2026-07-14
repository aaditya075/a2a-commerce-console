import Link from "next/link";
import { ArrowRight, Bot, Globe2, ShieldCheck, Workflow } from "lucide-react";

const pillars = [
  {
    title: "Agent catalog",
    body: "Subscribe to managed commerce agents with clear A2A contracts, SLAs, and Stripe billing.",
    icon: Bot,
  },
  {
    title: "Cross-LLM handshakes",
    body: "Advertise once. Shopper assistants on OpenAI and Anthropic discover and negotiate safely.",
    icon: Globe2,
  },
  {
    title: "Real-world tasks",
    body: "Search live catalog inventory, reserve stock, review brand copy, and hand off checkout.",
    icon: ShieldCheck,
  },
  {
    title: "Live fabric",
    body: "Trace multi-hop A2A flows with hop-level evidence for every task your fleet runs.",
    icon: Workflow,
  },
];

export default function HomePage() {
  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold tracking-wide text-stripe-accent">
            Agent-to-agent commerce
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-stripe-navy sm:text-5xl lg:text-[3.5rem] lg:leading-[1.08]">
            Fleet of agents for{" "}
            <span className="text-stripe-accent">brand visibility</span> across
            every assistant.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-stripe-ink">
            Nexus Fleet lets e-commerce teams order interoperable agents that
            speak a real A2A protocol, run catalog and inventory tasks, and
            bill through Stripe subscriptions.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 rounded-full bg-stripe-accent px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-stripe-accentDark"
            >
              Browse agents
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/playground"
              className="inline-flex items-center gap-2 rounded-full border border-stripe-border bg-white px-5 py-3 text-sm font-semibold text-stripe-navy transition hover:border-stripe-accent/40"
            >
              Open playground
            </Link>
          </div>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map(({ title, body, icon: Icon }) => (
            <article
              key={title}
              className="rounded-2xl border border-stripe-border bg-white p-5 shadow-soft"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stripe-soft text-stripe-accent">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <h2 className="mt-4 text-base font-semibold text-stripe-navy">
                {title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-stripe-ink">
                {body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-stripe-border bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-14 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="max-w-xl">
            <h2 className="text-2xl font-semibold text-stripe-navy sm:text-3xl">
              Designed for the handshake layer between merchants and
              assistants.
            </h2>
            <p className="mt-3 text-stripe-ink">
              Standardized discovery, inventory truth, brand review, and
              checkout handoffs—with Stripe for subscriptions.
            </p>
          </div>
          <Link
            href="/checkout"
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-stripe-navy px-6 py-3 text-sm font-semibold text-white"
          >
            Start with Stripe Checkout
          </Link>
        </div>
      </section>
    </div>
  );
}
