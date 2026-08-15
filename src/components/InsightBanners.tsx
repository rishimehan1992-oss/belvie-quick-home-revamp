import type { Insight } from "@/model/types";

export function InsightBanners({ insights }: { insights: Insight[] }) {
  if (!insights.length) return null;
  return (
    <div className="mb-2.5">
      {insights.map((insight) => (
        <div
          key={insight.text}
          className={`mb-2 rounded-lg px-3 py-2 text-[12.5px] leading-[1.45] ${
            insight.severity === "critical"
              ? "border-l-[3px] border-bad bg-[#FBECEA] text-bad"
              : "border-l-[3px] border-terracotta bg-card text-charcoal"
          }`}
        >
          {insight.text}
        </div>
      ))}
    </div>
  );
}
