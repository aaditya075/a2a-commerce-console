import { WebSocketServer, type WebSocket } from "ws";
import { z } from "zod";
import { getGatewayDb } from "./db";
import { verifyToken } from "./auth";
import {
  A2A_VERSION,
  AdvertiseBodySchema,
  EnvelopeSchema,
  ErrorBodySchema,
  HelloBodySchema,
  SendBodySchema,
  type Envelope,
} from "./protocol";
import crypto from "node:crypto";

type ConnState = {
  connectionId: string;
  tenantId: string;
  agentId: string;
  provider: string;
  capabilities: string[];
};

const connections = new Map<WebSocket, ConnState>();
const byTenantAgent = new Map<string, WebSocket>(); // `${tenantId}:${agentId}`

function nowIso() {
  return new Date().toISOString();
}

function wsKey(tenantId: string, agentId: string) {
  return `${tenantId}:${agentId}`;
}

function send(ws: WebSocket, env: Envelope) {
  ws.send(JSON.stringify(env));
}

function errorEnvelope(base: Partial<Envelope>, code: string, message: string): Envelope {
  return {
    v: A2A_VERSION,
    type: "error",
    traceId: base.traceId ?? crypto.randomUUID(),
    from: base.from ?? "gateway",
    to: base.to ?? "unknown",
    tenantId: base.tenantId ?? "unknown",
    ts: nowIso(),
    body: ErrorBodySchema.parse({ code, message }),
  };
}

function recordTraceEvent(input: {
  traceId: string;
  tenantId: string;
  direction: "in" | "out";
  fromAgent: string;
  toAgent: string;
  type: string;
  intent?: string | null;
  body: unknown;
}) {
  const db = getGatewayDb();
  const ts = nowIso();
  const id = crypto.randomUUID();
  db.prepare(
    `insert into trace_events
      (id, trace_id, tenant_id, ts, direction, from_agent, to_agent, type, intent, body_json)
      values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    input.traceId,
    input.tenantId,
    ts,
    input.direction,
    input.fromAgent,
    input.toAgent,
    input.type,
    input.intent ?? null,
    JSON.stringify(input.body ?? null),
  );
}

function ensureTrace(traceId: string, tenantId: string, rootIntent: string) {
  const db = getGatewayDb();
  const exists = db
    .prepare("select id from traces where id = ? and tenant_id = ?")
    .get(traceId, tenantId) as { id: string } | undefined;
  if (exists) return;
  db.prepare(
    "insert into traces (id, tenant_id, created_at, root_intent, status) values (?, ?, ?, ?, ?)",
  ).run(traceId, tenantId, nowIso(), rootIntent, "open");
}

function upsertConnectionRow(state: ConnState, remoteAddr?: string | null) {
  const db = getGatewayDb();
  const ts = nowIso();
  db.prepare(
    `insert into connections
      (id, tenant_id, agent_id, provider, capabilities_json, remote_addr, connected_at, last_seen_at, disconnected_at)
      values (?, ?, ?, ?, ?, ?, ?, ?, null)`,
  ).run(
    state.connectionId,
    state.tenantId,
    state.agentId,
    state.provider,
    JSON.stringify(state.capabilities),
    remoteAddr ?? null,
    ts,
    ts,
  );
}

function touchConnection(connectionId: string) {
  const db = getGatewayDb();
  db.prepare("update connections set last_seen_at = ? where id = ?").run(nowIso(), connectionId);
}

function disconnectConnection(connectionId: string) {
  const db = getGatewayDb();
  db.prepare("update connections set disconnected_at = ? where id = ?").run(nowIso(), connectionId);
}

function updateFleetOnHandshake(tenantId: string, agentId: string, provider: string) {
  const db = getGatewayDb();
  db.prepare(
    "update fleet_agents set status = ?, provider = ?, last_handshake_at = ? where tenant_id = ? and id = ?",
  ).run("healthy", provider, nowIso(), tenantId, agentId);
}

const PORT = Number(process.env.A2A_GATEWAY_PORT ?? "8787");

const wss = new WebSocketServer({ port: PORT });
console.log(`[a2a-gateway] listening on ws://localhost:${PORT}`);

wss.on("connection", (ws, req) => {
  ws.on("message", (data) => {
    const raw = data.toString("utf8");
    let json: unknown;
    try {
      json = JSON.parse(raw);
    } catch {
      send(ws, errorEnvelope({}, "bad_json", "Message must be valid JSON"));
      return;
    }

    const parsed = EnvelopeSchema.safeParse(json);
    if (!parsed.success) {
      send(ws, errorEnvelope({}, "bad_envelope", "Invalid A2A envelope"));
      return;
    }

    const env = parsed.data;

    // Ping/pong can be pre-auth (helps health checks)
    if (env.type === "ping") {
      send(ws, { ...env, type: "pong", ts: nowIso(), body: { ok: true } });
      return;
    }

    if (env.type === "hello") {
      const bodyParsed = HelloBodySchema.safeParse(env.body);
      if (!bodyParsed.success) {
        send(ws, errorEnvelope(env, "bad_hello", "Invalid hello body"));
        return;
      }

      const secret = process.env.A2A_SIGNING_SECRET;
      if (!secret) {
        send(ws, errorEnvelope(env, "server_misconfig", "Missing A2A_SIGNING_SECRET"));
        return;
      }

      const db = getGatewayDb();
      const auth = verifyToken(db, bodyParsed.data.token, secret);
      if (!auth.ok) {
        send(ws, errorEnvelope(env, "unauthorized", `Token rejected: ${auth.error}`));
        return;
      }

      if (auth.claims.tenantId !== env.tenantId || auth.claims.agentId !== bodyParsed.data.agentId) {
        send(ws, errorEnvelope(env, "unauthorized", "Token does not match tenant/agent"));
        return;
      }

      const connectionId = crypto.randomUUID();
      const state: ConnState = {
        connectionId,
        tenantId: env.tenantId,
        agentId: bodyParsed.data.agentId,
        provider: bodyParsed.data.provider,
        capabilities: bodyParsed.data.capabilities ?? [],
      };

      // Replace any previous socket for this agent.
      const key = wsKey(state.tenantId, state.agentId);
      const prev = byTenantAgent.get(key);
      if (prev && prev !== ws) {
        try {
          prev.close(4000, "replaced");
        } catch {
          // ignore
        }
      }

      connections.set(ws, state);
      byTenantAgent.set(key, ws);
      upsertConnectionRow(state, req.socket.remoteAddress ?? null);
      updateFleetOnHandshake(state.tenantId, state.agentId, state.provider);

      recordTraceEvent({
        traceId: env.traceId,
        tenantId: env.tenantId,
        direction: "in",
        fromAgent: env.from,
        toAgent: env.to,
        type: "hello",
        body: env.body,
      });

      send(ws, {
        v: A2A_VERSION,
        type: "welcome",
        traceId: env.traceId,
        from: "gateway",
        to: state.agentId,
        tenantId: state.tenantId,
        ts: nowIso(),
        body: { sessionId: connectionId, features: ["routing", "tracing"] },
      });
      return;
    }

    const state = connections.get(ws);
    if (!state) {
      send(ws, errorEnvelope(env, "unauthorized", "Must hello before sending other messages"));
      return;
    }
    touchConnection(state.connectionId);

    if (env.tenantId !== state.tenantId) {
      send(ws, errorEnvelope(env, "forbidden", "Tenant mismatch"));
      return;
    }

    if (env.type === "advertise") {
      const bodyParsed = AdvertiseBodySchema.safeParse(env.body);
      if (!bodyParsed.success) {
        send(ws, errorEnvelope(env, "bad_advertise", "Invalid advertise body"));
        return;
      }
      state.capabilities = bodyParsed.data.capabilities ?? [];

      const db = getGatewayDb();
      db.prepare("update connections set capabilities_json = ? where id = ?").run(
        JSON.stringify(state.capabilities),
        state.connectionId,
      );

      recordTraceEvent({
        traceId: env.traceId,
        tenantId: state.tenantId,
        direction: "in",
        fromAgent: state.agentId,
        toAgent: "gateway",
        type: "advertise",
        body: env.body,
      });

      send(ws, {
        v: A2A_VERSION,
        type: "deliver",
        traceId: env.traceId,
        from: "gateway",
        to: state.agentId,
        tenantId: state.tenantId,
        ts: nowIso(),
        body: { ok: true, advertised: state.capabilities.length },
      });
      return;
    }

    if (env.type === "send") {
      const bodyParsed = SendBodySchema.safeParse(env.body);
      if (!bodyParsed.success) {
        send(ws, errorEnvelope(env, "bad_send", "Invalid send body"));
        return;
      }

      ensureTrace(env.traceId, state.tenantId, bodyParsed.data.intent);

      recordTraceEvent({
        traceId: env.traceId,
        tenantId: state.tenantId,
        direction: "in",
        fromAgent: state.agentId,
        toAgent: env.to,
        type: "send",
        intent: bodyParsed.data.intent,
        body: env.body,
      });

      const target = byTenantAgent.get(wsKey(state.tenantId, env.to));
      if (!target) {
        send(ws, errorEnvelope(env, "not_found", "Target agent not connected"));
        return;
      }

      const deliverEnv: Envelope = {
        v: A2A_VERSION,
        type: "deliver",
        traceId: env.traceId,
        from: state.agentId,
        to: env.to,
        tenantId: state.tenantId,
        ts: nowIso(),
        body: { intent: bodyParsed.data.intent, payload: bodyParsed.data.payload },
      };

      recordTraceEvent({
        traceId: env.traceId,
        tenantId: state.tenantId,
        direction: "out",
        fromAgent: state.agentId,
        toAgent: env.to,
        type: "deliver",
        intent: bodyParsed.data.intent,
        body: deliverEnv.body,
      });

      send(target, deliverEnv);
      send(ws, {
        v: A2A_VERSION,
        type: "deliver",
        traceId: env.traceId,
        from: "gateway",
        to: state.agentId,
        tenantId: state.tenantId,
        ts: nowIso(),
        body: { ok: true, routedTo: env.to },
      });
      return;
    }

    send(ws, errorEnvelope(env, "unsupported", `Unsupported type: ${env.type}`));
  });

  ws.on("close", () => {
    const state = connections.get(ws);
    if (!state) return;
    connections.delete(ws);
    byTenantAgent.delete(wsKey(state.tenantId, state.agentId));
    disconnectConnection(state.connectionId);
  });
});

