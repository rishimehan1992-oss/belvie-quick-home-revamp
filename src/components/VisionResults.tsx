import type { RevampVision } from "@/lib/types";

function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

type VisionResultsProps = {
  vision: RevampVision;
  previewItemCount?: number;
  showFullCostTable?: boolean;
  onGetFullPlan?: () => void;
};

export function VisionResults({
  vision,
  previewItemCount = 3,
  showFullCostTable = false,
  onGetFullPlan,
}: VisionResultsProps) {
  const costLines = showFullCostTable
    ? vision.costLineItems
    : vision.costLineItems.slice(0, previewItemCount);
  const hiddenCostLines = vision.costLineItems.length - costLines.length;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-medium text-ink">Room analysis</h2>
        <p className="mt-2 leading-relaxed text-ink-soft">
          {vision.roomAnalysis}
        </p>
        {vision.assumptions.length > 0 ? (
          <ul className="mt-3 space-y-1 border-l-2 border-saffron/40 pl-4 text-sm text-stone">
            {vision.assumptions.map((a) => (
              <li key={a}>Assumption: {a}</li>
            ))}
          </ul>
        ) : null}
      </div>

      <div>
        <h2 className="font-medium text-ink">Design concept</h2>
        <p className="mt-1 text-sm font-medium text-saffron">
          {vision.primaryTheme}
        </p>
        <p className="mt-2 leading-relaxed text-ink-soft">
          {vision.designConcept}
        </p>
        <p className="mt-3 text-sm text-ink-soft">
          <span className="font-medium text-ink">Alternative:</span>{" "}
          {vision.alternativeTheme}
        </p>
      </div>

      <p className="text-lg leading-relaxed text-ink">{vision.visionSummary}</p>

      <div className="border border-line bg-mist/40 p-5">
        <p className="text-xs uppercase tracking-widest text-sage">
          Cost estimate (Bengaluru)
        </p>
        <p className="mt-2 font-display text-3xl text-ink">
          {formatINR(vision.costTotals.grandTotal)}
        </p>
        <p className="mt-1 text-sm text-ink-soft">
          Subtotal {formatINR(vision.costTotals.subtotal)} · Labor{" "}
          {formatINR(vision.costTotals.laborTotal)} ·{" "}
          {vision.costTotals.contingencyPercent}% contingency{" "}
          {formatINR(vision.costTotals.contingency)}
        </p>
        <p className="mt-3 text-sm text-ink-soft">
          <span className="font-medium text-ink">Budget version:</span>{" "}
          {formatINR(vision.costTotals.budgetVersionTotal)} —{" "}
          {vision.costTotals.budgetVersionNote}
        </p>
        <p className="mt-2 text-sm text-ink-soft">
          {vision.estimatedBudget.breakdown}
        </p>
      </div>

      <div className="overflow-x-auto border border-line">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-mist text-xs uppercase tracking-wider text-sage">
            <tr>
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Item</th>
              <th className="px-3 py-2">Spec</th>
              <th className="px-3 py-2">Qty</th>
              <th className="px-3 py-2">Unit (₹)</th>
              <th className="px-3 py-2">Total (₹)</th>
              <th className="px-3 py-2">Where to buy</th>
            </tr>
          </thead>
          <tbody>
            {costLines.map((line) => (
              <tr key={line.lineNumber} className="border-t border-line">
                <td className="px-3 py-2 text-stone">{line.lineNumber}</td>
                <td className="px-3 py-2 font-medium text-ink">
                  {line.item}
                  {line.isLabor ? (
                    <span className="ml-1 text-xs text-sage">(labor)</span>
                  ) : null}
                </td>
                <td className="px-3 py-2 text-ink-soft">{line.description}</td>
                <td className="px-3 py-2">{line.qty}</td>
                <td className="px-3 py-2 text-ink-soft">
                  {line.unitCostRange ?? formatINR(line.estimatedUnitCost)}
                </td>
                <td className="px-3 py-2 text-ink">
                  {formatINR(line.estimatedTotal)}
                </td>
                <td className="px-3 py-2 text-ink-soft">{line.whereToBuy}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {hiddenCostLines > 0 ? (
          <p className="border-t border-line px-3 py-2 text-sm text-stone">
            + {hiddenCostLines} more line items in your full plan
          </p>
        ) : null}
      </div>

      <div>
        <h2 className="font-medium text-ink">Phasing plan</h2>
        <ul className="mt-3 space-y-2">
          {vision.phasingPlan.map((phase) => (
            <li key={phase} className="flex gap-3 text-sm text-ink-soft">
              <span className="text-saffron">→</span>
              {phase}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center gap-3 border border-saffron/30 bg-saffron/8 px-5 py-4">
        <span className="text-2xl">⚡</span>
        <div>
          <p className="font-medium text-ink">
            Done in ~{vision.timelineHours} hours · No room vacation
          </p>
          <p className="mt-1 text-sm text-ink-soft">{vision.noVacationNote}</p>
        </div>
      </div>

      <div>
        <h2 className="font-medium text-ink">Key cosmetic changes</h2>
        <ul className="mt-3 space-y-2">
          {vision.keyChanges.map((change) => (
            <li key={change} className="flex gap-3 text-ink-soft">
              <span className="text-saffron">✦</span>
              {change}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="font-medium text-ink">Colour palette</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {vision.colorPalette.map((color) => (
            <span
              key={color}
              className="border border-line bg-paper px-3 py-1.5 text-sm text-ink-soft"
            >
              {color}
            </span>
          ))}
        </div>
      </div>

      <p className="text-sm italic text-ink-soft">💡 {vision.bangaloreTip}</p>

      {onGetFullPlan ? (
        <button
          type="button"
          onClick={onGetFullPlan}
          className="w-full bg-saffron px-6 py-4 text-sm font-medium tracking-wide text-paper"
        >
          Get full plan on WhatsApp
        </button>
      ) : null}
    </div>
  );
}
