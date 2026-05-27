import { anthropicMessage } from "../llm/anthropic";
import { openaiChat } from "../llm/openai";
import crypto from "node:crypto";

export async function handleConciergeIntent(input: {
  provider: "openai" | "anthropic";
  intent: string;
  payload: any;
}) {
  if (input.intent === "product.search") {
    const query = String(input.payload?.query ?? "");
    const constraints = String(input.payload?.constraints ?? "");

    const system =
      "You are a commerce concierge agent. Return concise JSON only with keys: results (array of {title,reason,confidence}), followUps (array of strings).";
    const user = `Query: ${query}\nConstraints: ${constraints}\nReturn JSON.`;

    const apiKey =
      input.provider === "openai"
        ? process.env.OPENAI_API_KEY
        : process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return {
        error: "missing_api_key",
        provider: input.provider,
      };
    }

    const text =
      input.provider === "openai"
        ? await openaiChat({ apiKey, system, user })
        : await anthropicMessage({ apiKey, system, user });

    return { provider: input.provider, raw: text };
  }

  if (input.intent === "checkout.handoff") {
    return {
      ok: true,
      handoffToken: `handoff_${crypto.randomUUID()}`,
      notes: "Demo token; integrate your real checkout + policies.",
    };
  }

  return { error: "unsupported_intent", intent: input.intent };
}

