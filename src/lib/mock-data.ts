import type { AgentSku, A2AMessage, FleetAgent } from "./types";

export const agentCatalog: AgentSku[] = [
  {
    id: "sku-concierge",
    name: "Concierge Shopper",
    tagline: "Guided discovery across catalogs and LLM surfaces",
    description:
      "Negotiates product fit, compares alternatives, and hands off to checkout agents while preserving merchant policies.",
    category: "commerce",
    priceMonthlyUsd: 499,
    includedSeats: 5,
    a2aCapabilities: [
      "Product graph sync",
      "Policy-safe recommendations",
      "Handoff to payment agents",
    ],
    compatibleProviders: ["openai", "anthropic", "google", "mistral"],
    sla: "99.5% monthly",
    badge: "Popular",
  },
  {
    id: "sku-router",
    name: "Cross-LLM Router",
    tagline: "One merchant brain, many consumer assistants",
    description:
      "Speaks A2A with external assistants so your brand shows up consistently in ChatGPT, Claude, Gemini, and more.",
    category: "routing",
    priceMonthlyUsd: 899,
    includedSeats: 10,
    a2aCapabilities: [
      "Provider-agnostic envelopes",
      "Capability advertisement",
      "Trust & attestation hooks",
    ],
    compatibleProviders: ["openai", "anthropic", "google", "cohere", "meta"],
    sla: "99.9% monthly",
  },
  {
    id: "sku-brand",
    name: "Brand Voice Sentinel",
    tagline: "Tone, claims, and compliance at the edge",
    description:
      "Reviews outbound agent utterances against brand rules and regional regulations before they reach shoppers.",
    category: "brand",
    priceMonthlyUsd: 349,
    includedSeats: 8,
    a2aCapabilities: [
      "Pre-send review",
      "Red-team prompts",
      "Audit trail export",
    ],
    compatibleProviders: ["openai", "anthropic", "google"],
    sla: "99.5% monthly",
  },
  {
    id: "sku-inventory",
    name: "Inventory Pulse",
    tagline: "Real-time stock truth for agent marketplaces",
    description:
      "Pushes authoritative availability to partner agents and reconciles reservations across channels.",
    category: "commerce",
    priceMonthlyUsd: 629,
    includedSeats: 6,
    a2aCapabilities: [
      "Reservation tokens",
      "Webhook + A2A push",
      "Conflict resolution",
    ],
    compatibleProviders: ["openai", "google", "mistral"],
    sla: "99.7% monthly",
  },
  {
    id: "sku-insight",
    name: "Agent Analytics",
    tagline: "See how assistants shop your brand",
    description:
      "Traces multi-hop A2A flows, surfaces drop-off, and attributes revenue to agent referrals.",
    category: "analytics",
    priceMonthlyUsd: 279,
    includedSeats: 15,
    a2aCapabilities: [
      "Trace IDs across hops",
      "Funnel by provider",
      "Export to warehouse",
    ],
    compatibleProviders: ["openai", "anthropic", "google", "cohere"],
    sla: "99.0% monthly",
  },
];

export const demoFleet: FleetAgent[] = [
  {
    id: "ag-1",
    skuId: "sku-concierge",
    displayName: "Concierge · NA storefront",
    status: "healthy",
    lastHandshakeAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    peerCount: 14,
    throughput24h: 18240,
  },
  {
    id: "ag-2",
    skuId: "sku-router",
    displayName: "Router · Global",
    status: "healthy",
    lastHandshakeAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    peerCount: 37,
    throughput24h: 64002,
  },
  {
    id: "ag-3",
    skuId: "sku-brand",
    displayName: "Brand Voice · EU",
    status: "degraded",
    lastHandshakeAt: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
    peerCount: 9,
    throughput24h: 4210,
  },
  {
    id: "ag-4",
    skuId: "sku-inventory",
    displayName: "Inventory · DC-4",
    status: "standby",
    lastHandshakeAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    peerCount: 3,
    throughput24h: 890,
  },
];

export const demoA2AFeed: A2AMessage[] = [
  {
    id: "m1",
    fromAgent: "shopper-assistant.openai",
    toAgent: "concierge.na.acme",
    fromProvider: "openai",
    toProvider: "anthropic",
    intent: "product.search",
    payloadSummary: "Trail runners, wide toe box, ≤ $180, ships to CA",
    at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: "m2",
    fromAgent: "concierge.na.acme",
    toAgent: "inventory.dc4.acme",
    fromProvider: "anthropic",
    toProvider: "google",
    intent: "inventory.reserve",
    payloadSummary: "SKU TR9-442 · qty 1 · TTL 15m",
    at: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
  },
  {
    id: "m3",
    fromAgent: "brand-voice.eu.acme",
    toAgent: "concierge.na.acme",
    fromProvider: "anthropic",
    toProvider: "anthropic",
    intent: "copy.review",
    payloadSummary: "Blocked superlative; suggested compliant rewrite v2",
    at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    id: "m4",
    fromAgent: "router.global.acme",
    toAgent: "partner.merchantbot",
    fromProvider: "google",
    toProvider: "mistral",
    intent: "handoff.checkout",
    payloadSummary: "Opaque cart token + merchant attestations",
    at: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
  },
];

export const providerLabels: Record<string, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  google: "Google",
  mistral: "Mistral",
  cohere: "Cohere",
  meta: "Meta",
};
