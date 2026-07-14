import { agentCatalog } from "@/lib/mock-data";
import type { AgentSku } from "@/lib/types";
import { getDb } from "@/server/db";
import { randomId, sha256Base64Url, signHmacSha256Base64Url } from "@/server/crypto";
import { seedCatalogIfEmpty } from "@/server/catalog";

export type FleetAgentRow = {
  id: string;
  tenantId: string;
  skuId: string;
  displayName: string;
  provider: string;
  status: string;
  lastHandshakeAt: string | null;
  createdAt: string;
};

export type TraceRow = {
  id: string;
  tenantId: string;
  createdAt: string;
  rootIntent: string;
  status: string;
};

export type TraceEventRow = {
  id: string;
  traceId: string;
  tenantId: string;
  ts: string;
  direction: string;
  fromAgent: string;
  toAgent: string;
  type: string;
  intent: string | null;
  bodyJson: string;
};

const DEFAULT_TENANT_ID = "t_default";

export function ensureDefaultTenant() {
  const db = getDb();
  const now = new Date().toISOString();
  const exists = db
    .prepare("select id from tenants where id = ?")
    .get(DEFAULT_TENANT_ID) as { id: string } | undefined;
  if (!exists) {
    db.prepare("insert into tenants (id, name, created_at) values (?, ?, ?)").run(
      DEFAULT_TENANT_ID,
      "Default tenant",
      now,
    );
  }

  const skuInsert = db.prepare(
    "insert or ignore into agent_skus (id, name, category, price_monthly_usd, created_at) values (?, ?, ?, ?, ?)",
  );
  for (const sku of agentCatalog) {
    skuInsert.run(sku.id, sku.name, sku.category, sku.priceMonthlyUsd, now);
  }

  seedCatalogIfEmpty();

  return { tenantId: DEFAULT_TENANT_ID };
}

export function listSkus(): AgentSku[] {
  return agentCatalog;
}

export function provisionFleet(input: {
  tenantId: string;
  items: Array<{ skuId: string; qty: number }>;
}) {
  const db = getDb();
  const now = new Date().toISOString();

  const insert = db.prepare(
    `insert into fleet_agents
      (id, tenant_id, sku_id, display_name, provider, status, last_handshake_at, created_at)
      values (?, ?, ?, ?, ?, ?, ?, ?)`,
  );

  const created: FleetAgentRow[] = [];

  for (const item of input.items) {
    for (let i = 0; i < item.qty; i++) {
      const id = randomId("ag");
      const displayName = `${item.skuId} · ${String(i + 1).padStart(2, "0")}`;
      const provider =
        item.skuId === "sku-brand"
          ? "anthropic"
          : item.skuId === "sku-router"
            ? "router"
            : "openai";
      const status = "standby";
      insert.run(id, input.tenantId, item.skuId, displayName, provider, status, null, now);
      created.push({
        id,
        tenantId: input.tenantId,
        skuId: item.skuId,
        displayName,
        provider,
        status,
        lastHandshakeAt: null,
        createdAt: now,
      });
    }
  }

  return created;
}

export function listFleet(tenantId: string): FleetAgentRow[] {
  const db = getDb();
  const rows = db
    .prepare(
      `select
        id,
        tenant_id as tenantId,
        sku_id as skuId,
        display_name as displayName,
        provider,
        status,
        last_handshake_at as lastHandshakeAt,
        created_at as createdAt
      from fleet_agents
      where tenant_id = ?
      order by created_at desc`,
    )
    .all(tenantId) as FleetAgentRow[];
  return rows;
}

export function issueAgentKey(input: { tenantId: string; agentId: string }) {
  const db = getDb();
  const now = new Date().toISOString();

  const secret =
    process.env.A2A_SIGNING_SECRET ??
    (process.env.A2A_SIGNING_SECRET = "dev-a2a-signing-secret-change-me");

  const rawKey = `a2a_${randomId("key")}`;
  const keyHash = sha256Base64Url(rawKey);
  const keyId = randomId("k");

  db.prepare(
    "insert into agent_keys (id, tenant_id, agent_id, key_hash, created_at, revoked_at) values (?, ?, ?, ?, ?, ?)",
  ).run(keyId, input.tenantId, input.agentId, keyHash, now, null);

  const tokenPayload = JSON.stringify({
    v: "a2a-token/0.1",
    tenantId: input.tenantId,
    agentId: input.agentId,
    keyId,
    iat: now,
  });
  const sig = signHmacSha256Base64Url(secret, tokenPayload);
  const token = Buffer.from(tokenPayload).toString("base64url") + "." + sig;

  return { keyId, rawKey, token };
}

export function listTraces(tenantId: string, limit = 50): TraceRow[] {
  const db = getDb();
  return db
    .prepare(
      `select
        id,
        tenant_id as tenantId,
        created_at as createdAt,
        root_intent as rootIntent,
        status
      from traces
      where tenant_id = ?
      order by created_at desc
      limit ?`,
    )
    .all(tenantId, limit) as TraceRow[];
}

export function getTrace(traceId: string): { trace: TraceRow; events: TraceEventRow[] } {
  const db = getDb();
  const trace = db
    .prepare(
      `select
        id,
        tenant_id as tenantId,
        created_at as createdAt,
        root_intent as rootIntent,
        status
      from traces where id = ?`,
    )
    .get(traceId) as TraceRow | undefined;
  if (!trace) throw new Error("Trace not found");

  const events = db
    .prepare(
      `select
        id,
        trace_id as traceId,
        tenant_id as tenantId,
        ts,
        direction,
        from_agent as fromAgent,
        to_agent as toAgent,
        type,
        intent,
        body_json as bodyJson
      from trace_events
      where trace_id = ?
      order by ts asc`,
    )
    .all(traceId) as TraceEventRow[];

  return { trace, events };
}

