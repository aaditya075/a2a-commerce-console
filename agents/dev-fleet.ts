import { A2AClient } from "./a2a-client";
import { handleConciergeIntent } from "./workers/concierge-agent";
import { handleBrandVoiceIntent } from "./workers/brand-voice-agent";
import { handleInventoryIntent } from "./workers/inventory-agent";

type ProvisionResponse = {
  tenantId: string;
  agents: Array<{ id: string; skuId: string; displayName: string; provider: string }>;
  credentials: Array<{ agentId: string; skuId: string; token: string }>;
};

const NEXT_BASE = process.env.A2A_CONTROL_PLANE_URL ?? "http://127.0.0.1:3000";
const GATEWAY_URL = process.env.A2A_GATEWAY_URL ?? "ws://127.0.0.1:8787";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForNext() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`${NEXT_BASE}/api/tenants`, { method: "POST" });
      if (res.ok) return;
    } catch {
      // ignore
    }
    await sleep(1000);
  }
  throw new Error("Next control plane not reachable on /api/tenants");
}

async function getFleet() {
  const res = await fetch(`${NEXT_BASE}/api/fleet`);
  if (!res.ok) throw new Error(`fleet GET failed: ${res.status}`);
  return (await res.json()) as { tenantId: string; fleet: any[] };
}

async function issueToken(agentId: string) {
  const res = await fetch(`${NEXT_BASE}/api/agent-keys/issue`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ agentId }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`issueToken failed (${agentId}): ${res.status} ${text}`);
  }
  const json = (await res.json()) as { token: string };
  return json.token;
}

async function provisionDefaultFleet(): Promise<ProvisionResponse> {
  const res = await fetch(`${NEXT_BASE}/api/fleet/provision`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      items: [
        { skuId: "sku-concierge", qty: 1 },
        { skuId: "sku-brand", qty: 1 },
        { skuId: "sku-inventory", qty: 1 },
      ],
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`provision failed: ${res.status} ${text}`);
  }
  return (await res.json()) as ProvisionResponse;
}

async function main() {
  console.log(`[agents] control plane: ${NEXT_BASE}`);
  console.log(`[agents] gateway: ${GATEWAY_URL}`);
  await waitForNext();

  const fleet = await getFleet();
  let tenantId = fleet.tenantId;
  let agents: Array<{ id: string; skuId: string; displayName: string; provider: string }> =
    [];

  if ((fleet.fleet?.length ?? 0) === 0) {
    console.log("[agents] no fleet found; provisioning default fleet");
    const provisioned = await provisionDefaultFleet();
    tenantId = provisioned.tenantId;
    agents = provisioned.agents;
  } else {
    console.log(`[agents] fleet exists (${fleet.fleet.length}); issuing keys`);
    agents = fleet.fleet;
  }

  const clients: A2AClient[] = [];

  for (const agent of agents) {
    const token = await issueToken(agent.id);
    const skuId = agent.skuId;

    const provider: "openai" | "anthropic" =
      skuId === "sku-brand" ? "anthropic" : "openai";

    const capabilities =
      skuId === "sku-concierge"
        ? ["product.search", "checkout.handoff"]
        : skuId === "sku-brand"
          ? ["copy.review"]
          : ["inventory.reserve"];

    const client = new A2AClient(
      {
        gatewayUrl: GATEWAY_URL,
        tenantId,
        agentId: agent.id,
        provider,
        token,
        capabilities,
      },
      async ({ intent, payload }) => {
        if (skuId === "sku-concierge") {
          return handleConciergeIntent({ provider, intent, payload });
        }
        if (skuId === "sku-brand") {
          return handleBrandVoiceIntent({ provider, intent, payload });
        }
        return handleInventoryIntent({ intent, payload });
      },
    );

    await client.connect();
    clients.push(client);
    console.log(`[agents] connected ${agent.id} (${skuId}) -> ${capabilities.join(", ")}`);
  }

  console.log(`[agents] ready: ${clients.length} agents connected`);
  // Keep process alive.
  process.stdin.resume();
}

main().catch((err) => {
  console.error("[agents] fatal:", err);
  process.exitCode = 1;
});

