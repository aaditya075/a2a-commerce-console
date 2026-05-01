import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { CartProvider } from "@/context/cart-context";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nexus Fleet · Agent-to-Agent Commerce",
  description:
    "Order a fleet of commerce agents that speak A2A across LLM ecosystems for consistent brand visibility.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${jetbrains.variable}`}>
      <body className="font-sans">
        <CartProvider>
          <div className="relative min-h-screen overflow-x-hidden">
            <div
              className="pointer-events-none fixed inset-0 -z-10 bg-radial-glow bg-[length:100%_60%] bg-top bg-no-repeat"
              aria-hidden
            />
            <div
              className="pointer-events-none fixed inset-0 -z-10 bg-grid-fade bg-[size:48px_48px] opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
              aria-hidden
            />
            <SiteHeader />
            <main>{children}</main>
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
