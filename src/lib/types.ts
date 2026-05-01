export type LlmProvider =
  | "openai"
  | "anthropic"
  | "google"
  | "mistral"
  | "cohere"
  | "meta";

export interface AgentSku {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: "commerce" | "routing" | "brand" | "analytics";
  priceMonthlyUsd: number;
  includedSeats: number;
  a2aCapabilities: string[];
  compatibleProviders: LlmProvider[];
  sla: string;
  badge?: string;
}

export interface FleetAgent {
  id: string;
  skuId: string;
  displayName: string;
  status: "healthy" | "degraded" | "standby";
  lastHandshakeAt: string;
  peerCount: number;
  throughput24h: number;
}

export interface A2AMessage {
  id: string;
  fromAgent: string;
  toAgent: string;
  fromProvider: LlmProvider;
  toProvider: LlmProvider;
  intent: string;
  payloadSummary: string;
  at: string;
}
