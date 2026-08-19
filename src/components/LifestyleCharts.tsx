"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { integer, lakhs, rupees } from "@/model/format";
import type { LifestyleCompare, LifestylePoint } from "@/model/lifestyle";

const GY = "#6B6560";
const LN = "#E4D8D0";
const TE = "#BA5D42";
const CH = "#2B2622";
const GP = "#4A7A5C";
const DE = "#C9BEB6";
const FILL = [TE, CH, "#8C9A8E"];

export function LifestyleMixChart({ row }: { row: LifestylePoint }) {
  const data = row.lines.map((l, i) => ({
    name: l.name,
    gp: Math.round(l.gp / 1e5 * 100) / 100,
    units: l.units,
    aov: l.aov,
    fill: FILL[i] ?? DE,
  }));
  return (
    <div className="rounded-[10px] border border-line bg-white px-3.5 pt-3 pb-2">
      <h3 className="m-0 font-serif text-sm font-normal text-charcoal">Handbag gross profit</h3>
      <p className="mb-2 mt-0.5 text-[11.5px] leading-[1.4] text-gray">
        {row.attachPerConsult} handbags / consult. Not split with footwear or watches. Ticket in
        ₹8,000–20,000. Margin {row.gm}%.
      </p>
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 12, right: 12, left: 4, bottom: 4 }}>
            <CartesianGrid stroke="#F2EAE5" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: GY, fontSize: 11 }} axisLine={{ stroke: LN }} tickLine={false} />
            <YAxis
              tick={{ fill: GY, fontSize: 10 }}
              axisLine={{ stroke: LN }}
              tickLine={false}
              width={40}
              tickFormatter={(v: number) => `${v}`}
            />
            <Tooltip
              formatter={(v: unknown) => [`₹${lakhs(Number(v) * 1e5)}L`, "GP"]}
              labelFormatter={(n) => String(n)}
            />
            <Bar dataKey="gp" maxBarSize={56} radius={[3, 3, 0, 0]} isAnimationActive={false}>
              {data.map((d) => (
                <Cell key={d.name} fill={d.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function LifestyleVsConsultsChart({
  series,
  current,
}: {
  series: { consults: number; beautyPnl: number | null; lifestyleGp: number; combined: number | null }[];
  current: number;
}) {
  const data = series.map((p) => ({
    consults: p.consults,
    beauty: p.beautyPnl == null ? null : p.beautyPnl / 1e5,
    life: p.lifestyleGp / 1e5,
    combined: p.combined == null ? null : p.combined / 1e5,
  }));
  return (
    <div className="rounded-[10px] border border-line bg-white px-3.5 pt-3 pb-2 min-[900px]:col-span-2">
      <h3 className="m-0 font-serif text-sm font-normal text-charcoal">
        Beauty P&L vs beauty + lifestyle as consults rise
      </h3>
      <p className="mb-2 mt-0.5 text-[11.5px] leading-[1.4] text-gray">
        Existing network P&L is unchanged. Lifestyle GP sits on top — no extra CAC, no new S*.
      </p>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 12, right: 16, left: 4, bottom: 8 }}>
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
              tick={{ fill: GY, fontSize: 10 }}
              axisLine={{ stroke: LN }}
              tickLine={false}
              width={44}
              tickFormatter={(v: number) => `${v}`}
            />
            <Tooltip
              formatter={(v: unknown, name: unknown) => [
                `₹${lakhs(Number(v) * 1e5)}L`,
                name === "beauty" ? "beauty P&L" : name === "life" ? "lifestyle GP" : "combined",
              ]}
              labelFormatter={(v: unknown) => `${integer(Number(v))} consults`}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, color: GY }}
              formatter={(v) =>
                v === "beauty" ? "Beauty P&L" : v === "life" ? "Lifestyle GP" : "Combined"
              }
            />
            <ReferenceLine x={current} stroke={CH} strokeDasharray="3 3" />
            <Line type="monotone" dataKey="beauty" stroke={CH} strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="life" stroke={TE} strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="combined" stroke={GP} strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function LifestyleSweepChart({
  title,
  caption,
  xLabel,
  pts,
  xKey,
  markX,
  xFormat,
}: {
  title: string;
  caption: string;
  xLabel: string;
  pts: LifestylePoint[];
  xKey: "attachPerConsult" | "blendedAov";
  markX: number;
  xFormat?: (v: number) => string;
}) {
  const data = pts.map((p) => ({
    x: xKey === "attachPerConsult" ? p.attachPerConsult : p.blendedAov,
    gp: p.gp / 1e5,
    units: p.units,
  }));
  return (
    <div className="rounded-[10px] border border-line bg-white px-3.5 pt-3 pb-2">
      <h3 className="m-0 font-serif text-sm font-normal text-charcoal">{title}</h3>
      <p className="mb-2 mt-0.5 text-[11.5px] leading-[1.4] text-gray">{caption}</p>
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 12, right: 12, left: 4, bottom: 8 }}>
            <CartesianGrid stroke="#F2EAE5" vertical={false} />
            <XAxis
              type="number"
              dataKey="x"
              domain={["dataMin", "dataMax"]}
              tick={{ fill: GY, fontSize: 10 }}
              axisLine={{ stroke: LN }}
              tickLine={false}
              tickFormatter={xFormat ?? ((v: number) => String(v))}
              label={{ value: xLabel, position: "insideBottom", offset: -4, fill: GY, fontSize: 10 }}
            />
            <YAxis
              tick={{ fill: GY, fontSize: 10 }}
              axisLine={{ stroke: LN }}
              tickLine={false}
              width={40}
            />
            <Tooltip
              formatter={(v: unknown) => [`₹${lakhs(Number(v) * 1e5)}L`, "lifestyle GP"]}
              labelFormatter={(v: unknown) => (xFormat ? xFormat(Number(v)) : String(v))}
            />
            <ReferenceLine x={markX} stroke={CH} strokeDasharray="3 3" />
            <Line type="monotone" dataKey="gp" stroke={TE} strokeWidth={2} dot={{ r: 3, fill: TE }} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export { rupees };

export function LifestyleCompareChart({
  compare,
}: {
  compare: LifestyleCompare;
}) {
  const keys = new Set(["rev", "gp", "pnl"]);
  const data = compare.pnl
    .filter((r) => keys.has(r.key))
    .map((r) => ({
      name: r.key === "rev" ? "Revenue" : r.key === "gp" ? "Gross profit" : "P&L",
      beauty: Number.isFinite(r.beauty) ? r.beauty / 1e5 : null,
      combined: Number.isFinite(r.combined) ? r.combined / 1e5 : null,
    }));
  return (
    <div className="rounded-[10px] border border-line bg-white px-3.5 pt-3 pb-2 min-[900px]:col-span-2">
      <h3 className="m-0 font-serif text-sm font-normal text-charcoal">
        Beauty only vs beauty + lifestyle
      </h3>
      <p className="mb-2 mt-0.5 text-[11.5px] leading-[1.4] text-gray">
        Same visits, same S*, same CAC. Lifestyle GP stacks on beauty P&L — costs do not move.
      </p>
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 12, right: 12, left: 4, bottom: 4 }}>
            <CartesianGrid stroke="#F2EAE5" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: GY, fontSize: 11 }} axisLine={{ stroke: LN }} tickLine={false} />
            <YAxis
              tick={{ fill: GY, fontSize: 10 }}
              axisLine={{ stroke: LN }}
              tickLine={false}
              width={44}
              tickFormatter={(v: number) => `${v}`}
            />
            <Tooltip
              formatter={(v: unknown, name: unknown) => [
                `₹${lakhs(Number(v) * 1e5)}L`,
                name === "beauty" ? "beauty only" : "beauty + lifestyle",
              ]}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, color: GY }}
              formatter={(v) => (v === "beauty" ? "Beauty only" : "Beauty + lifestyle")}
            />
            <Bar dataKey="beauty" fill={CH} maxBarSize={36} radius={[3, 3, 0, 0]} isAnimationActive={false} />
            <Bar dataKey="combined" fill={GP} maxBarSize={36} radius={[3, 3, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
