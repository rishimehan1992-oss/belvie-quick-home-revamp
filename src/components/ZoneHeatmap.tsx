"use client";

import {
  LEVER_META,
  heatColor,
  type FavorableCell,
  type FavorableSlice,
  type LeverId,
} from "@/model/favorable";
import { lakhs } from "@/model/format";

export function ZoneHeatmap({
  slice,
  xs,
  ys,
  xId,
  yId,
  maxAbs,
  markX,
  markY,
  compact,
  onPick,
}: {
  slice: FavorableSlice;
  xs: number[];
  ys: number[];
  xId: LeverId;
  yId: LeverId;
  maxAbs: number;
  markX: number;
  markY: number;
  compact?: boolean;
  onPick?: (cell: FavorableCell) => void;
}) {
  const rows = [...ys].reverse();
  const xMeta = LEVER_META[xId];
  const yMeta = LEVER_META[yId];

  return (
    <div className="overflow-x-auto rounded-[10px] border border-line bg-white px-3 pt-3 pb-2">
      <h3 className="m-0 font-serif text-sm font-normal text-charcoal">{slice.label}</h3>
      <p className="mb-2 mt-0.5 text-[11px] text-gray">
        Columns {xMeta.label}. Rows {yMeta.label}. Click a cell to inspect.
      </p>
      <table className="w-full border-collapse text-[10.5px]">
        <thead>
          <tr>
            <th className="px-1 py-1 text-left text-[10px] font-bold uppercase tracking-[0.04em] text-gray">
              {yMeta.short} \ {xMeta.short}
            </th>
            {xs.map((x) => (
              <th key={x} className="px-0.5 py-1 text-center text-[10px] font-bold text-gray">
                {xMeta.format(x)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((y) => (
            <tr key={y}>
              <th className="whitespace-nowrap px-1 py-0.5 text-left font-serif text-[11px] font-normal text-charcoal">
                {yMeta.format(y)}
              </th>
              {xs.map((x) => {
                const cell = slice.cells.find((c) => c.x === x && c.y === y);
                const pnl = cell?.pnl.pnl ?? NaN;
                const feasible = Boolean(cell?.pnl.feasible);
                const marked = x === markX && y === markY;
                const t = Number.isFinite(pnl) && maxAbs > 0 ? pnl / maxAbs : 0;
                const ink = feasible && Math.abs(t) > 0.38 ? "#fff" : "#2B2622";
                return (
                  <td key={x} className="p-0.5">
                    <button
                      type="button"
                      onClick={() => cell && onPick?.(cell)}
                      className={`block w-full rounded-sm px-0.5 text-center font-serif tabular-nums ${
                        compact ? "py-1" : "py-1.5"
                      } ${marked ? "ring-2 ring-charcoal ring-offset-1" : ""}`}
                      style={{
                        background: heatColor(pnl, feasible, maxAbs),
                        color: ink,
                      }}
                      title={
                        cell
                          ? `${xMeta.format(x)} · ${yMeta.format(y)} · ${
                              feasible ? `₹${lakhs(pnl)}L` : "infeasible"
                            }`
                          : ""
                      }
                    >
                      {feasible && Number.isFinite(pnl) ? lakhs(pnl) : "—"}
                    </button>
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
