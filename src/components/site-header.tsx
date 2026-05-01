"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, LayoutDashboard, Sparkles } from "lucide-react";
import { useCart } from "@/context/cart-context";

const nav = [
  { href: "/", label: "Overview" },
  { href: "/catalog", label: "Agent catalog" },
  { href: "/dashboard", label: "Fleet" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { lines } = useCart();
  const count = lines.reduce((n, l) => n + l.qty, 0);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="group flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-signal to-pulse shadow-lift">
            <Sparkles className="h-5 w-5 text-ink-950" aria-hidden />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-tight text-white">
              Nexus Fleet
            </p>
            <p className="text-[11px] text-ink-400">A2A commerce fabric</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {nav.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-ink-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-ink-100 transition hover:border-signal/40 hover:bg-white/10 md:hidden"
          >
            <LayoutDashboard className="h-4 w-4" aria-hidden />
            Fleet
          </Link>
          <Link
            href="/checkout"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-signal to-pulse px-3 py-2 text-sm font-semibold text-ink-950 shadow-lift transition hover:brightness-110"
          >
            <ShoppingBag className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Cart</span>
            {count > 0 && (
              <span className="rounded-full bg-ink-950/15 px-2 py-0.5 text-xs font-bold tabular-nums">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
      <div className="border-t border-white/5 px-4 py-2 md:hidden">
        <nav className="flex flex-wrap gap-2" aria-label="Primary mobile">
          {nav.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-2.5 py-1.5 text-xs font-medium ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-ink-400 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
