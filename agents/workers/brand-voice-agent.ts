import { anthropicMessage } from "../llm/anthropic";
import { openaiChat } from "../llm/openai";

export async function handleBrandVoiceIntent(input: {
  provider: "openai" | "anthropic";
  intent: string;
  payload: any;
}) {
  if (input.intent !== "copy.review") {
    return { error: "unsupported_intent", intent: input.intent };
  }

  const copy = String(input.payload?.copy ?? "");
  const policy = String(
    input.payload?.policy ??
      "Avoid absolute superlatives, avoid medical claims, keep tone friendly and factual.",
  );

  const system =
    "You are a brand voice compliance agent. Return concise JSON only with keys: verdict (pass|revise), issues (array), rewrite (string).";
  const user = `Policy:\n${policy}\n\nCopy:\n${copy}\n\nReturn JSON.`;

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

