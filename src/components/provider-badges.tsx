import type { LlmProvider } from "@/lib/types";
import { providerLabels } from "@/lib/mock-data";

const styles: Record<LlmProvider, string> = {
  openai: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  anthropic: "border-orange-400/30 bg-orange-400/10 text-orange-100",
  google: "border-sky-400/30 bg-sky-400/10 text-sky-100",
  mistral: "border-violet-400/30 bg-violet-400/10 text-violet-100",
  cohere: "border-amber-400/30 bg-amber-400/10 text-amber-100",
  meta: "border-blue-400/30 bg-blue-400/10 text-blue-100",
};

export function ProviderBadges({
  providers,
  compact,
}: {
  providers: LlmProvider[];
  compact?: boolean;
}) {
  return (
    <ul className={`flex flex-wrap gap-1.5 ${compact ? "" : "mt-3"}`}>
      {providers.map((p) => (
        <li key={p}>
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${styles[p]}`}
          >
            {providerLabels[p] ?? p}
          </span>
        </li>
      ))}
    </ul>
  );
}
