"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { feasibilityReason, integer, lakhs } from "@/model/format";
import type { Solution } from "@/model/types";

const CH = "#2B2622";
const TE = "#BA5D42";
const DE = "#C9BEB6";
const CP = "#8C9A8E";
const GY = "#6B6560";
const LN = "#E4D8D0";

type Row = {
  S: number;
  infra: number;
  adv: number;
  del: number;
  cap: number;
  totalL: number;
  total: number;
  feasible: boolean;
  isBest: boolean;
  N: number;
  n: number;
  cdelOrder: number;
  reason: string;
  star: string;
};

export function CostBySpokeChart({
  rows,
  best,
  kapS,
  peak,
}: {
  rows: Solution[];
  best: Solution | null;
  kapS: number;
  peak: number;
}) {
  const data: Row[] = rows
    .filter((r) => r.S >= 2 && r.S <= 20 && Number.isFinite(r.total))
    .map((r) => ({
      S: r.S,
      infra: r.Cinf / 1e5,
      adv: r.Cadv / 1e5,
      del: r.Cdel / 1e5,
      cap: r.Ccap / 1e5,
      totalL: r.total / 1e5,
      total: r.total,
      feasible: r.feasible,
      isBest: Boolean(best && r.S === best.S),
      N: r.N,
      n: r.n,
      cdelOrder: r.cdelOrder,
      reason: feasibilityReason(r),
      star: best && r.S === best.S ? "S*" : "",
    }));

  const yMax =
    data.length === 0
      ? 10
      : Math.ceil(Math.max(...data.map((r) => r.total)) / 1e5 / 10) * 10 + 10;

  return (
    <div className="mb-3.5 rounded-[10px] border border-line bg-white px-3.5 pt-3 pb-2">
      <h3 className="m-0 font-serif text-sm font-normal text-charcoal">
        Total monthly cost by spoke count
      </h3>
      <p className="mb-2 mt-0 text-[11.5px] leading-[1.4] text-gray">
        {best
          ? `Faded bars fail the spoke capacity constraint (${kapS} orders/day at a ${peak}× peak). Optimum at S=${best.S}.`
          : "No feasible configuration at these inputs."}
      </p>
      <div className="mb-1.5 flex flex-wrap gap-3.5 text-[11.5px] text-gray">
        <span>
          <i className="mr-1 inline-block h-2.5 w-2.5 rounded-sm align-[-1px]" style={{ background: CH }} />
          Hub + spoke opex
        </span>
        <span>
          <i className="mr-1 inline-block h-2.5 w-2.5 rounded-sm align-[-1px]" style={{ background: TE }} />
          Advisors
        </span>
        <span>
          <i className="mr-1 inline-block h-2.5 w-2.5 rounded-sm align-[-1px]" style={{ background: DE }} />
          Delivery
        </span>
        <span>
          <i className="mr-1 inline-block h-2.5 w-2.5 rounded-sm align-[-1px]" style={{ background: CP }} />
          Capex (amortised)
        </span>
      </div>
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 18, right: 8, left: 4, bottom: 4 }} barCategoryGap="28%">
            <CartesianGrid stroke="#F2EAE5" vertical={false} />
            <XAxis
              dataKey="S"
              tick={{ fill: GY, fontSize: 10 }}
              axisLine={{ stroke: LN }}
              tickLine={false}
              label={{ value: "Spokes (S)", position: "insideBottom", offset: -2, fill: GY, fontSize: 10 }}
            />
            <YAxis
              domain={[0, yMax]}
              tick={{ fill: GY, fontSize: 10 }}
              axisLine={{ stroke: LN }}
              tickLine={false}
              width={36}
              label={{ value: "₹L", position: "top", offset: 8, fill: GY, fontSize: 10 }}
            />
            <Tooltip
              cursor={{ fill: "rgba(43,38,34,0.04)" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const row = payload[0].payload as Row;
                return (
                  <div className="rounded-md border border-line bg-white px-2.5 py-2 text-[11.5px] text-charcoal shadow-sm">
                    <div className="mb-1 font-serif">S = {row.S}{row.isBest ? " · optimum" : ""}</div>
                    <div>Hub + spoke opex · ₹{row.infra.toFixed(2)}L</div>
                    <div>Advisors · ₹{row.adv.toFixed(2)}L ({integer(row.N)})</div>
                    <div>Delivery · ₹{row.del.toFixed(2)}L · {row.n || "—"} drops/trip</div>
                    {row.cap > 0 ? <div>Amortised capex · ₹{row.cap.toFixed(2)}L</div> : null}
                    <div className="mt-1 font-semibold">Total · ₹{lakhs(row.total)}L</div>
                    <div className="text-gray">Feasible: {row.reason}</div>
                  </div>
                );
              }}
            />
            <Bar dataKey="infra" stackId="cost" fill={CH} isAnimationActive={false} maxBarSize={28}>
              {data.map((d) => (
                <Cell key={`i-${d.S}`} fill={CH} fillOpacity={d.feasible ? 1 : 0.3} />
              ))}
            </Bar>
            <Bar dataKey="adv" stackId="cost" fill={TE} isAnimationActive={false} maxBarSize={28}>
              {data.map((d) => (
                <Cell key={`a-${d.S}`} fill={TE} fillOpacity={d.feasible ? 1 : 0.3} />
              ))}
            </Bar>
            <Bar dataKey="del" stackId="cost" fill={DE} isAnimationActive={false} maxBarSize={28}>
              {data.map((d) => (
                <Cell key={`d-${d.S}`} fill={DE} fillOpacity={d.feasible ? 1 : 0.3} />
              ))}
            </Bar>
            <Bar dataKey="cap" stackId="cost" fill={CP} isAnimationActive={false} maxBarSize={28}>
              {data.map((d) => (
                <Cell key={`c-${d.S}`} fill={CP} fillOpacity={d.feasible ? 1 : 0.3} />
              ))}
            </Bar>
            <Bar dataKey="totalL" fill="none" legendType="none" isAnimationActive={false} maxBarSize={28}>
              {data.map((d) => (
                <Cell
                  key={`t-${d.S}`}
                  stroke={d.isBest ? TE : "none"}
                  strokeWidth={d.isBest ? 2 : 0}
                />
              ))}
              <LabelList dataKey="star" position="top" fill={TE} fontSize={10} fontWeight={700} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
