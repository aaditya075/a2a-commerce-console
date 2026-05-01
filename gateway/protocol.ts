import { z } from "zod";

export const A2A_VERSION = "a2a/0.1" as const;

export const EnvelopeSchema = z.object({
  v: z.literal(A2A_VERSION),
  type: z.enum([
    "hello",
    "welcome",
    "advertise",
    "send",
    "deliver",
    "error",
    "ping",
    "pong",
  ]),
  traceId: z.string().min(1),
  from: z.string().min(1),
  to: z.string().min(1),
  tenantId: z.string().min(1),
  ts: z.string().min(1),
  body: z.unknown(),
});

export type Envelope = z.infer<typeof EnvelopeSchema>;

export const HelloBodySchema = z.object({
  agentId: z.string().min(1),
  provider: z.string().min(1),
  capabilities: z.array(z.string()).default([]),
  token: z.string().min(10),
});

export const AdvertiseBodySchema = z.object({
  capabilities: z.array(z.string()).default([]),
});

export const SendBodySchema = z.object({
  intent: z.string().min(1),
  payload: z.unknown(),
});

export const ErrorBodySchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
});

