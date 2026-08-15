"use client";

import {
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { integer, lakhs } from "@/model/format";
import type { PnlPoint } from "@/model/types";

const CH = "#2B2622";
const TE = "#BA5D42";
const GY = "#6B6560";
const LN = "#E4D8D0";
const GP = "#4A7A5C";
const DE = "#C9BEB6";

function toLakhs(pts: PnlPoint[]) {
  return pts.map((p) => ({
    ...p,
    gpL: Number.isFinite(p.grossProfit) ? p.grossProfit / 1e5 : null,
    visitL: Number.isFinite(p.visitAcq) ? p.visitAcq / 1e5 : null,
    netL: p.feasible ? p.network / 1e5 : null,
    costL: p.feasible ? (p.visitAcq + p.network) / 1e5 : null,
    pnlL: p.feasible ? p.pnl / 1e5 : null,
  }));
}

function paddedDomain(values: number[]): [number, number] {
  const ok = values.filter((v) => Number.isFinite(v));
  if (!ok.length) return [-10, 10];
  const lo = Math.min(0, ...ok);
  const hi = Math.max(0, ...ok);
  const span = Math.max(hi - lo, 1);
  const pad = span * 0.12;
  return [Math.floor(lo - pad), Math.ceil(hi + pad)];
}

function Tip({
  active,
  payload,
  xLabel,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: PnlPoint }> | null;
  xLabel: string;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  if (!row) return null;
  return (
    <div className="rounded-md border border-line bg-white px-2.5 py-2 text-[11.5px] text-charcoal shadow-sm">
      <div className="mb-1 font-serif">
        {xLabel} {integer(row.consults ?? 0)}
      </div>
      <div>Gross profit · ₹{lakhs(row.grossProfit)}L</div>
      <div>Visit cost · ₹{lakhs(row.visitAcq)}L</div>
      <div>Network · {row.feasible ? `₹${lakhs(row.network)}L` : "infeasible"}</div>
      <div className="mt-1 font-semibold">
        P&L · {row.feasible ? `₹${lakhs(row.pnl)}L` : "—"}
      </div>
    </div>
  );
}

export function PnlVsConsultsChart({
  series,
  current,
}: {
  series: PnlPoint[];
  current: number;
}) {
  const data = toLakhs(series);
  const [yMin, yMax] = paddedDomain(
    data.flatMap((d) => [d.gpL, d.costL, d.pnlL].filter((v): v is number => v != null)),
  );

  return (
    <div className="mb-3.5 rounded-[10px] border border-line bg-white px-3.5 pt-3 pb-2">
      <h3 className="m-0 font-serif text-sm font-normal text-charcoal">
        P&L as monthly consults increase
      </h3>
      <p className="mb-2 mt-0 text-[11.5px] leading-[1.4] text-gray">
        Network is re-optimised at each volume. Gross profit scales with orders; visit cost is
        linear in consults; network cost steps with spokes and advisors.
      </p>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 18, right: 12, left: 4, bottom: 8 }}>
            <CartesianGrid stroke="#F2EAE5" vertical={false} />
            <XAxis
              type="number"
              dataKey="consults"
              domain={["dataMin", "dataMax"]}
              tick={{ fill: GY, fontSize: 10 }}
              axisLine={{ stroke: LN }}
              tickLine={false}
              tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
              label={{
                value: "monthly consults",
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
              content={({ active, payload }) => (
                <Tip
                  active={active}
                  payload={payload as ReadonlyArray<{ payload?: PnlPoint }> | undefined}
                  xLabel="Consults"
                />
              )}
            />
            <Legend wrapperStyle={{ fontSize: 11, color: GY }} />
            <ReferenceLine y={0} stroke={LN} />
            <ReferenceLine
              x={current}
              stroke={LN}
              strokeDasharray="3 3"
              label={{ value: "now", position: "top", fill: GY, fontSize: 10 }}
            />
            <Line
              type="linear"
              dataKey="gpL"
              name="Gross profit"
              stroke={GP}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              connectNulls={false}
            />
            <Line
              type="linear"
              dataKey="costL"
              name="Visit + network"
              stroke={DE}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="linear"
              dataKey="pnlL"
              name="P&L"
              stroke={TE}
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function PnlVsKChart({
  series,
  currentK,
}: {
  series: PnlPoint[];
  currentK: number;
}) {
  const data = series.map((p, i) => ({
    ...p,
    k: i + 1,
    pnlL: p.feasible ? p.pnl / 1e5 : null,
    netL: p.feasible ? p.network / 1e5 : null,
  }));
  const [yMin, yMax] = paddedDomain(
    data.flatMap((d) => [d.pnlL, d.netL].filter((v): v is number => v != null)),
  );

  return (
    <div className="rounded-[10px] border border-line bg-white px-3.5 pt-3 pb-2">
      <h3 className="m-0 font-serif text-sm font-normal text-charcoal">
        P&L as consults per kit load (k) increase
      </h3>
      <p className="mb-2 mt-0 text-[11.5px] leading-[1.4] text-gray">
        Same consult volume and unit economics; only advisor productivity changes, so network
        cost falls and contribution rises.
      </p>
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 18, right: 12, left: 4, bottom: 8 }}>
            <CartesianGrid stroke="#F2EAE5" vertical={false} />
            <XAxis
              type="number"
              dataKey="k"
              domain={[1, 6]}
              ticks={[1, 2, 3, 4, 5, 6]}
              tick={{ fill: GY, fontSize: 10 }}
              axisLine={{ stroke: LN }}
              tickLine={false}
              label={{
                value: "k — consults per kit load",
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
                const row = payload[0].payload as PnlPoint & { k: number };
                return (
                  <div className="rounded-md border border-line bg-white px-2.5 py-2 text-[11.5px] text-charcoal shadow-sm">
                    <div className="mb-1 font-serif">k = {row.k}</div>
                    <div>Network · ₹{lakhs(row.network)}L</div>
                    <div className="font-semibold">P&L · ₹{lakhs(row.pnl)}L</div>
                  </div>
                );
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11, color: GY }} />
            <ReferenceLine y={0} stroke={LN} />
            <ReferenceLine
              x={currentK}
              stroke={LN}
              strokeDasharray="3 3"
              label={{ value: "now", position: "top", fill: GY, fontSize: 10 }}
            />
            <Line
              type="linear"
              dataKey="netL"
              name="Network cost"
              stroke={CH}
              strokeWidth={2}
              dot={{ r: 3, fill: CH }}
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
