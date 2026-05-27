import WebSocket from "ws";
import crypto from "node:crypto";
import {
  A2A_VERSION,
  type Envelope,
  EnvelopeSchema,
  HelloBodySchema,
} from "../gateway/protocol";

export type A2AClientConfig = {
  gatewayUrl: string;
  tenantId: string;
  agentId: string;
  provider: string;
  token: string;
  capabilities: string[];
};

export type DeliverHandler = (msg: {
  traceId: string;
  from: string;
  intent: string;
  payload: unknown;
}) => Promise<unknown> | unknown;

export class A2AClient {
  private ws: WebSocket | null = null;
  private ready = false;

  constructor(
    private cfg: A2AClientConfig,
    private onDeliver: DeliverHandler,
  ) {}

  async connect() {
    if (this.ws) return;
    this.ws = new WebSocket(this.cfg.gatewayUrl);

    this.ws.on("message", async (data) => {
      const raw = data.toString("utf8");
      let json: unknown;
      try {
        json = JSON.parse(raw);
      } catch {
        return;
      }

      const parsed = EnvelopeSchema.safeParse(json);
      if (!parsed.success) return;
      const env = parsed.data;

      if (env.type === "welcome") {
        this.ready = true;
        // Advertise immediately after welcome.
        this.sendEnvelope({
          type: "advertise",
          traceId: crypto.randomUUID(),
          to: "gateway",
          body: { capabilities: this.cfg.capabilities },
        });
        return;
      }

      if (env.type === "deliver") {
        const body = env.body as any;
        if (body && typeof body.intent === "string") {
          const result = await this.onDeliver({
            traceId: env.traceId,
            from: env.from,
            intent: body.intent,
            payload: body.payload,
          });

          // Send result back to caller.
          this.sendEnvelope({
            type: "send",
            traceId: env.traceId,
            to: env.from,
            body: { intent: `${body.intent}.result`, payload: result },
          });
        }
      }
    });

    await new Promise<void>((resolve, reject) => {
      if (!this.ws) return reject(new Error("ws missing"));
      this.ws.once("open", () => resolve());
      this.ws.once("error", (err) => reject(err));
    });

    this.sendHello();
  }

  close() {
    try {
      this.ws?.close();
    } catch {
      // ignore
    }
    this.ws = null;
    this.ready = false;
  }

  isReady() {
    return this.ready;
  }

  sendIntent(to: string, intent: string, payload: unknown) {
    this.sendEnvelope({
      type: "send",
      traceId: crypto.randomUUID(),
      to,
      body: { intent, payload },
    });
  }

  private sendHello() {
    const helloBody = HelloBodySchema.parse({
      agentId: this.cfg.agentId,
      provider: this.cfg.provider,
      capabilities: this.cfg.capabilities,
      token: this.cfg.token,
    });

    this.sendEnvelope({
      type: "hello",
      traceId: crypto.randomUUID(),
      to: "gateway",
      body: helloBody,
    });
  }

  private sendEnvelope(input: {
    type: Envelope["type"];
    traceId: string;
    to: string;
    body: unknown;
  }) {
    if (!this.ws) return;
    const env: Envelope = {
      v: A2A_VERSION,
      type: input.type,
      traceId: input.traceId,
      from: this.cfg.agentId,
      to: input.to,
      tenantId: this.cfg.tenantId,
      ts: new Date().toISOString(),
      body: input.body,
    };
    this.ws.send(JSON.stringify(env));
  }
}

