"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/cart-context";

const nav = [
  { href: "/", label: "Overview" },
  { href: "/catalog", label: "Catalog" },
  { href: "/playground", label: "Playground" },
  { href: "/dashboard", label: "Dashboard" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { lines } = useCart();
  const count = lines.reduce((n, l) => n + l.qty, 0);

  return (
    <header className="sticky top-0 z-50 border-b border-stripe-border/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-stripe-accent text-sm font-bold text-white">
            N
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-stripe-navy">
            Nexus Fleet
          </span>
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
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                  active
                    ? "bg-stripe-soft text-stripe-navy"
                    : "text-stripe-ink hover:text-stripe-navy"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/checkout"
          className="inline-flex items-center gap-2 rounded-full bg-stripe-accent px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-stripe-accentDark"
        >
          <ShoppingBag className="h-4 w-4" aria-hidden />
          Cart
          {count > 0 && (
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs tabular-nums">
              {count}
            </span>
          )}
        </Link>
      </div>
      <div className="border-t border-stripe-border px-4 py-2 md:hidden">
        <nav className="flex flex-wrap gap-2" aria-label="Primary mobile">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full bg-stripe-soft px-3 py-1 text-xs font-medium text-stripe-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
