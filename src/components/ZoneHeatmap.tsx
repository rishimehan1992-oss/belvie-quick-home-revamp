"use client";

import { FAVORABLE_AOV, FAVORABLE_N, heatColor, type FavorableSlice } from "@/model/favorable";
import { lakhs } from "@/model/format";

export function ZoneHeatmap({
  slice,
  maxAbs,
  markAov,
  markN,
}: {
  slice: FavorableSlice;
  maxAbs: number;
  markAov: number;
  markN: number;
}) {
  const rows = [...FAVORABLE_N].reverse();

  return (
    <div className="overflow-x-auto rounded-[10px] border border-line bg-white px-3 pt-3 pb-2">
      <h3 className="m-0 font-serif text-sm font-normal text-charcoal">
        k = {slice.k} · consults per kit load
      </h3>
      <p className="mb-2 mt-0.5 text-[11px] text-gray">
        Columns are consult AOV. Rows are non-consults per consult. Green is profit at scale.
      </p>
      <table className="w-full border-collapse text-[10.5px]">
        <thead>
          <tr>
            <th className="px-1 py-1 text-left text-[10px] font-bold uppercase tracking-[0.04em] text-gray">
              n \ AOV
            </th>
            {FAVORABLE_AOV.map((aov) => (
              <th
                key={aov}
                className="px-0.5 py-1 text-center text-[10px] font-bold text-gray"
              >
                ₹{(aov / 1000).toFixed(aov % 1000 === 0 ? 0 : 1)}k
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((n) => (
            <tr key={n}>
              <th className="whitespace-nowrap px-1 py-0.5 text-left font-serif text-[11px] font-normal text-charcoal">
                {n.toFixed(2)}
              </th>
              {FAVORABLE_AOV.map((aov) => {
                const cell = slice.cells.find((c) => c.aov === aov && c.n === n);
                const pnl = cell?.pnl.pnl ?? NaN;
                const feasible = Boolean(cell?.pnl.feasible);
                const marked = aov === markAov && n === markN;
                const t = Number.isFinite(pnl) && maxAbs > 0 ? pnl / maxAbs : 0;
                const ink = feasible && Math.abs(t) > 0.38 ? "#fff" : "#2B2622";
                return (
                  <td key={aov} className="p-0.5">
                    <div
                      className={`rounded-sm px-0.5 py-1.5 text-center font-serif tabular-nums ${
                        marked ? "ring-2 ring-charcoal ring-offset-1" : ""
                      }`}
                      style={{
                        background: heatColor(pnl, feasible, maxAbs),
                        color: ink,
                      }}
                      title={
                        cell
                          ? `AOV ₹${aov.toLocaleString("en-IN")} · n=${n} · k=${slice.k} · ${
                              feasible ? `₹${lakhs(pnl)}L` : "infeasible"
                            }`
                          : ""
                      }
                    >
                      {feasible && Number.isFinite(pnl) ? lakhs(pnl) : "—"}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
