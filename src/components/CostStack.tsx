import { integer, lakhs, rupees } from "@/model/format";
import { orderSplit } from "@/model/orderSplit";
import type { Params, Solution } from "@/model/types";

export function CostStack({
  best,
  params,
  consults,
  samplingCost,
  visitCost,
}: {
  best: Solution | null;
  params: Params;
  consults: number;
  samplingCost: number;
  visitCost: number;
}) {
  if (!best || !(params.D > 0)) {
    return (
      <div className="mb-3.5 rounded-[10px] border border-line bg-white px-3.5 py-3 text-[12.5px] text-gray">
        No feasible network — cost / order split needs S*.
      </div>
    );
  }

  const split = orderSplit(best, params, consults, samplingCost, visitCost);
  const serve = split.lines.filter((l) => l.inServe && Number.isFinite(l.perOrder) && l.perOrder > 0);
  const serveAbs = Math.max(split.servePerOrder, 1);

  return (
    <div className="mb-3.5 rounded-[10px] border border-line bg-white px-3.5 py-3">
      <h3 className="m-0 font-serif text-sm font-normal text-charcoal">Cost / order split</h3>
      <p className="mb-2.5 mt-0.5 text-[11.5px] leading-[1.4] text-gray">
        If cost / order is {rupees(split.servePerOrder)}, it is these pieces. Sampling is in this
        total. Visit CAC is shown under it and is not in the {rupees(split.servePerOrder)}. S*
        only minimises the network rows.
      </p>

      <div
        className="mb-3 flex h-7 overflow-hidden rounded-md border border-line"
        role="img"
        aria-label="Cost per order stacked bar"
      >
        {serve.map((l) => (
          <div
            key={l.id}
            title={`${l.label} ${rupees(l.perOrder)}`}
            style={{
              width: `${(l.perOrder / serveAbs) * 100}%`,
              background: l.color,
            }}
          />
        ))}
      </div>
      <div className="mb-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray">
        {serve.map((l) => (
          <span key={l.id} className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-sm" style={{ background: l.color }} />
            {l.label} {rupees(l.perOrder)}
          </span>
        ))}
      </div>

      <table className="w-full border-collapse text-[12.5px]">
        <thead>
          <tr>
            {["Line", "₹ / order", "Share", "₹ lakh / month"].map((h, i) => (
              <th
                key={h}
                className={`bg-charcoal px-2 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.05em] text-card ${
                  i === 0 ? "text-left" : "text-right"
                }`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {split.lines
            .filter((l) => l.inServe)
            .map((l) => (
              <SplitRow
                key={l.id}
                label={l.label}
                perOrder={l.perOrder}
                month={l.month}
                share={split.servePerOrder > 0 ? l.perOrder / split.servePerOrder : NaN}
              />
            ))}
          <SplitRow
            label="Cost / order"
            perOrder={split.servePerOrder}
            month={split.serveMonth}
            share={1}
            strong
          />
          {split.lines
            .filter((l) => !l.inServe)
            .map((l) => (
              <SplitRow
                key={l.id}
                label={`${l.label} · not in ${rupees(split.servePerOrder)}`}
                perOrder={l.perOrder}
                month={l.month}
                share={NaN}
              />
            ))}
          <SplitRow
            label="All-in / order · serve + CAC"
            perOrder={split.allInPerOrder}
            month={split.allInMonth}
            share={NaN}
            strong
          />
        </tbody>
      </table>
      <p className="mb-0 mt-2 text-[11px] text-gray">
        {integer(params.D)} orders / month · {integer(consults)} visits × {rupees(samplingCost)}{" "}
        sample · {integer(consults)} × {rupees(visitCost)} visit CAC. Hub {best.H} × {rupees(params.fH)}{" "}
        · spoke {best.S} × {rupees(params.fS)}.
      </p>
    </div>
  );
}

function SplitRow({
  label,
  perOrder,
  month,
  share,
  strong = false,
}: {
  label: string;
  perOrder: number;
  month: number;
  share: number;
  strong?: boolean;
}) {
  return (
    <tr className={strong ? "bg-card font-semibold text-charcoal" : "text-ink"}>
      <td className="border-b border-line px-2 py-1.5 text-left">{label}</td>
      <td className="border-b border-line px-2 py-1.5 text-right font-serif tabular-nums">
        {Number.isFinite(perOrder) ? rupees(perOrder) : "—"}
      </td>
      <td className="border-b border-line px-2 py-1.5 text-right tabular-nums text-gray">
        {Number.isFinite(share) ? `${Math.round(share * 100)}%` : "—"}
      </td>
      <td className="border-b border-line px-2 py-1.5 text-right font-serif tabular-nums">
        {Number.isFinite(month) ? `₹${lakhs(month)}L` : "—"}
      </td>
    </tr>
  );
}
