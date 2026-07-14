import crypto from "node:crypto";
import { anthropicMessage } from "../llm/anthropic";
import { openaiChat } from "../llm/openai";
import { agentSearchCatalog } from "../catalog-store";

export async function handleConciergeIntent(input: {
  provider: "openai" | "anthropic";
  intent: string;
  payload: any;
}) {
  if (input.intent === "product.search") {
    const query = String(input.payload?.query ?? "");
    const maxPrice =
      typeof input.payload?.maxPrice === "number"
        ? input.payload.maxPrice
        : undefined;
    const matches = agentSearchCatalog(query, maxPrice);

    const apiKey =
      input.provider === "openai"
        ? process.env.OPENAI_API_KEY
        : process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return {
        provider: input.provider,
        mode: "catalog_only",
        query,
        results: matches,
        note: "Set OPENAI_API_KEY or ANTHROPIC_API_KEY for LLM ranking copy.",
      };
    }

    const system =
      "You are a commerce concierge. Rank the provided real catalog matches for the shopper. Return JSON only with keys: picks (array of {sku,title,reason,confidence}), followUps (string[]).";
    const user = `Query: ${query}\nMax price: ${maxPrice ?? "none"}\nCatalog matches: ${JSON.stringify(matches)}`;

    const raw =
      input.provider === "openai"
        ? await openaiChat({ apiKey, system, user })
        : await anthropicMessage({ apiKey, system, user });

    return {
      provider: input.provider,
      mode: "catalog_plus_llm",
      query,
      results: matches,
      llm: raw,
    };
  }

  if (input.intent === "checkout.handoff") {
    return {
      ok: true,
      handoffToken: `handoff_${crypto.randomUUID()}`,
      cart: input.payload?.cart ?? null,
      checkoutUrlHint: "/checkout",
      notes: "Handoff token ready for your payment agent.",
    };
  }

  return { error: "unsupported_intent", intent: input.intent };
}
