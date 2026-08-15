"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { lakhs } from "@/model/format";
import type { SweepPoint } from "@/model/pnl";

const CH = "#2B2622";
const TE = "#BA5D42";
const GY = "#6B6560";
const LN = "#E4D8D0";
const GP = "#4A7A5C";

function paddedDomain(values: number[]): [number, number] {
  const ok = values.filter((v) => Number.isFinite(v));
  if (!ok.length) return [-10, 10];
  const lo = Math.min(0, ...ok);
  const hi = Math.max(0, ...ok);
  const span = Math.max(hi - lo, 1);
  const pad = span * 0.12;
  return [Math.floor(lo - pad), Math.ceil(hi + pad)];
}

export function SweepChart({
  title,
  caption,
  xLabel,
  pts,
  markX,
  xFormat,
}: {
  title: string;
  caption: string;
  xLabel: string;
  pts: SweepPoint[];
  markX: number;
  xFormat?: (v: number) => string;
}) {
  const data = pts.map((p) => ({
    ...p,
    gpL: Number.isFinite(p.grossProfit) ? p.grossProfit / 1e5 : null,
    pnlL: p.feasible ? p.pnl / 1e5 : null,
    netL: p.feasible ? p.network / 1e5 : null,
  }));
  const [yMin, yMax] = paddedDomain(
    data.flatMap((d) => [d.gpL, d.pnlL, d.netL].filter((v): v is number => v != null)),
  );
  const xs = pts.map((p) => p.x);
  const xLo = Math.min(...xs);
  const xHi = Math.max(...xs);

  return (
    <div className="rounded-[10px] border border-line bg-white px-3.5 pt-3 pb-2">
      <h3 className="m-0 font-serif text-sm font-normal text-charcoal">{title}</h3>
      <p className="mb-2 mt-0 text-[11.5px] leading-[1.4] text-gray">{caption}</p>
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 18, right: 12, left: 4, bottom: 8 }}>
            <CartesianGrid stroke="#F2EAE5" vertical={false} />
            <XAxis
              type="number"
              dataKey="x"
              domain={["dataMin", "dataMax"]}
              ticks={xs.length <= 8 ? xs : undefined}
              tick={{ fill: GY, fontSize: 10 }}
              axisLine={{ stroke: LN }}
              tickLine={false}
              tickFormatter={xFormat}
              label={{
                value: xLabel,
                position: "insideBottom",
                offset: -4,
                fill: GY,
                fontSize: 10,
              }}
            />
            <YAxis
              domain={[yMin, yMax]}
              tick={{ fill: GY, fontSize: 10 }}
              axisLine={{ stroke: LN }}
              tickLine={false}
              width={40}
              label={{ value: "₹L", position: "top", offset: 8, fill: GY, fontSize: 10 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const row = payload[0].payload as SweepPoint;
                return (
                  <div className="rounded-md border border-line bg-white px-2.5 py-2 text-[11.5px] text-charcoal shadow-sm">
                    <div className="mb-1 font-serif">
                      {xLabel} {xFormat ? xFormat(row.x) : row.x}
                    </div>
                    <div>Gross profit · ₹{lakhs(row.grossProfit)}L</div>
                    <div>Network · {row.feasible ? `₹${lakhs(row.network)}L` : "infeasible"}</div>
                    <div className="font-semibold">
                      P&L · {row.feasible ? `₹${lakhs(row.pnl)}L` : "—"}
                    </div>
                    {row.S != null ? <div className="text-gray">S* {row.S}</div> : null}
                  </div>
                );
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11, color: GY }} />
            <ReferenceLine y={0} stroke={LN} />
            {markX >= xLo && markX <= xHi ? (
              <ReferenceLine
                x={markX}
                stroke={LN}
                strokeDasharray="3 3"
                label={{ value: "now", position: "top", fill: GY, fontSize: 10 }}
              />
            ) : null}
            <Line
              type="linear"
              dataKey="gpL"
              name="Gross profit"
              stroke={GP}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="linear"
              dataKey="netL"
              name="Network"
              stroke={CH}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="linear"
              dataKey="pnlL"
              name="P&L"
              stroke={TE}
              strokeWidth={2.5}
              dot={{ r: 3, fill: TE }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
