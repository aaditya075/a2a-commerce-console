import { agentReserve } from "../catalog-store";

export async function handleInventoryIntent(input: {
  intent: string;
  payload: any;
}) {
  if (input.intent !== "inventory.reserve") {
    return { error: "unsupported_intent", intent: input.intent };
  }

  const sku = String(input.payload?.sku ?? "unknown");
  const qty = Number(input.payload?.qty ?? 1);
  const ttlMinutes = Number(input.payload?.ttlMinutes ?? 15);

  return agentReserve(sku, qty, ttlMinutes);
}
