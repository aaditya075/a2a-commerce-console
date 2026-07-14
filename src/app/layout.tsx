import type { Metadata } from "next";
import { Plus_Jakarta_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { CartProvider } from "@/context/cart-context";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nexus Fleet · Agent-to-Agent Commerce",
  description:
    "Launch a fleet of commerce agents that speak A2A across LLM ecosystems—with Stripe billing and live task execution.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body className="font-sans">
        <CartProvider>
          <div className="relative min-h-screen overflow-x-hidden bg-stripe-glow bg-no-repeat">
            <SiteHeader />
            <main>{children}</main>
            <footer className="border-t border-stripe-border bg-white/70">
              <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-stripe-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <p>Nexus Fleet · A2A commerce console</p>
                <p>Payments by Stripe · Agents over WebSocket A2A</p>
              </div>
            </footer>
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
