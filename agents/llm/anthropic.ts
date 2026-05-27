export async function anthropicMessage(input: {
  apiKey: string;
  model?: string;
  system: string;
  user: string;
}) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": input.apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: input.model ?? "claude-3-5-sonnet-20241022",
      max_tokens: 500,
      system: input.system,
      messages: [{ role: "user", content: input.user }],
      temperature: 0.4,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Anthropic error ${res.status}: ${text}`);
  }

  const json = (await res.json()) as any;
  const content = json?.content?.[0]?.text;
  if (typeof content !== "string") throw new Error("Anthropic: missing content");
  return content.trim();
}

