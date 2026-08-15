import type { ReactNode } from "react";
import { feasibilityReason, integer, lakhs } from "@/model/format";
import type { Solution } from "@/model/types";

const HEAD = [
  "S",
  "Peak/day/spoke",
  "Consults/day",
  "Advisors",
  "Drops/trip",
  "₹/order del",
  "Infra ₹L",
  "Advisor ₹L",
  "Delivery ₹L",
  "Capex ₹L",
  "Total ₹L",
  "₹/order",
  "Feasible",
] as const;

export function SolutionTable({
  rows,
  best,
}: {
  rows: Solution[];
  best: Solution | null;
}) {
  const show = rows.filter((r) => r.S >= 2 && r.S <= 20);

  return (
    <div className="mb-3.5 rounded-[10px] border border-line bg-white px-3.5 py-3">
      <h3 className="m-0 font-serif text-sm font-normal text-charcoal">Full solution table</h3>
      <p className="mb-2 mt-0 text-[11.5px] leading-[1.4] text-gray">
        Shaded row is the cost-optimal feasible network. Greyed rows fail the spoke capacity constraint.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              {HEAD.map((h, i) => (
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
            {show.map((r) => {
              const isOpt = Boolean(best && r.S === best.S);
              const cls = isOpt
                ? "bg-card font-bold text-charcoal"
                : r.feasible
                  ? "text-ink"
                  : "text-[#B9AFA8]";
              return (
                <tr key={r.S} className={cls}>
                  <Td left>{r.S}</Td>
                  <Td>{integer(r.peakSpoke)}</Td>
                  <Td>{Number.isFinite(r.cday) ? r.cday.toFixed(2) : "—"}</Td>
                  <Td>{integer(r.N)}</Td>
                  <Td>{r.n || "—"}</Td>
                  <Td>{Number.isFinite(r.cdelOrder) ? Math.round(r.cdelOrder) : "—"}</Td>
                  <Td>{lakhs(r.Cinf)}</Td>
                  <Td>{lakhs(r.Cadv)}</Td>
                  <Td>{lakhs(r.Cdel)}</Td>
                  <Td>{r.Ccap ? lakhs(r.Ccap) : "—"}</Td>
                  <Td className="font-serif">{lakhs(r.total)}</Td>
                  <Td>{Number.isFinite(r.cpo) ? Math.round(r.cpo) : "—"}</Td>
                  <Td>{feasibilityReason(r)}</Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Td({
  children,
  left = false,
  className = "",
}: {
  children: ReactNode;
  left?: boolean;
  className?: string;
}) {
  return (
    <td
      className={`border-b border-line px-2 py-1.5 tabular-nums ${left ? "text-left" : "text-right"} ${className}`}
    >
      {children}
    </td>
  );
}
