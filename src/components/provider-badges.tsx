import type { LlmProvider } from "@/lib/types";
import { providerLabels } from "@/lib/mock-data";

const styles: Record<LlmProvider, string> = {
  openai: "border-emerald-200 bg-emerald-50 text-emerald-800",
  anthropic: "border-orange-200 bg-orange-50 text-orange-800",
  google: "border-sky-200 bg-sky-50 text-sky-800",
  mistral: "border-violet-200 bg-violet-50 text-violet-800",
  cohere: "border-amber-200 bg-amber-50 text-amber-800",
  meta: "border-blue-200 bg-blue-50 text-blue-800",
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
