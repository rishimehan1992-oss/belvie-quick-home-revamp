"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { rupees } from "@/model/format";
import { orderSplit } from "@/model/orderSplit";
import type { Params, Solution } from "@/model/types";

const GY = "#6B6560";
const LN = "#E4D8D0";

function rupeeTip(v: unknown): [string, string] {
  return [rupees(Number(v ?? 0)), "₹ / order"];
}

export function CostSplitCharts({
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
  if (!best || !(params.D > 0)) return null;

  const split = orderSplit(best, params, consults, samplingCost, visitCost);
  const bars = split.lines
    .filter((l) => l.inServe && Number.isFinite(l.perOrder) && l.perOrder > 0)
    .map((l) => ({
      name: l.label,
      perOrder: Math.round(l.perOrder),
      fill: l.color,
    }));
  const pie = bars.map((l) => ({
    name: l.name,
    value: l.perOrder,
    fill: l.fill,
  }));
  const compare = [
    { name: "Network S*", value: Math.round(split.networkPerOrder) },
    { name: "Serve · + sample", value: Math.round(split.servePerOrder) },
    { name: "All-in · + CAC", value: Math.round(split.allInPerOrder) },
  ];

  return (
    <div className="mb-3.5 grid grid-cols-1 gap-3.5 min-[900px]:grid-cols-2">
      <div className="rounded-[10px] border border-line bg-white px-3.5 pt-3 pb-2">
        <h3 className="m-0 font-serif text-sm font-normal text-charcoal">
          ₹ / order by line
        </h3>
        <p className="mb-2 mt-0.5 text-[11.5px] leading-[1.4] text-gray">
          How a serve cost of {rupees(split.servePerOrder)} breaks: advisor, sample, hub, spoke,
          delivery, capex.
        </p>
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={bars}
              layout="vertical"
              margin={{ top: 8, right: 28, left: 8, bottom: 4 }}
            >
              <CartesianGrid stroke="#F2EAE5" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: GY, fontSize: 10 }}
                axisLine={{ stroke: LN }}
                tickLine={false}
                tickFormatter={(v: number) => `₹${v}`}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={88}
                tick={{ fill: GY, fontSize: 10 }}
                axisLine={{ stroke: LN }}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(43,38,34,0.04)" }}
                formatter={rupeeTip}
              />
              <Bar dataKey="perOrder" radius={[0, 3, 3, 0]} maxBarSize={18} isAnimationActive={false}>
                {bars.map((d) => (
                  <Cell key={d.name} fill={d.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-[10px] border border-line bg-white px-3.5 pt-3 pb-2">
        <h3 className="m-0 font-serif text-sm font-normal text-charcoal">Share of serve / order</h3>
        <p className="mb-2 mt-0.5 text-[11.5px] leading-[1.4] text-gray">
          Same pieces as a share of {rupees(split.servePerOrder)}. Visit CAC is not in this pie.
        </p>
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pie}
                dataKey="value"
                nameKey="name"
                cx="46%"
                cy="50%"
                innerRadius={48}
                outerRadius={78}
                paddingAngle={1.5}
                isAnimationActive={false}
              >
                {pie.map((d) => (
                  <Cell key={d.name} fill={d.fill} />
                ))}
              </Pie>
              <Tooltip formatter={rupeeTip} />
              <Legend
                wrapperStyle={{ fontSize: 11, color: GY }}
                formatter={(value) => {
                  const row = pie.find((p) => p.name === value);
                  return row ? `${value} ${rupees(row.value)}` : value;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-[10px] border border-line bg-white px-3.5 pt-3 pb-2 min-[900px]:col-span-2">
        <h3 className="m-0 font-serif text-sm font-normal text-charcoal">
          Blended ₹ / order vs serve vs all-in
        </h3>
        <p className="mb-2 mt-0.5 text-[11.5px] leading-[1.4] text-gray">
          Left is the hero blended network number (S* only). Middle adds sampling. Right adds visit
          CAC.
        </p>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={compare} margin={{ top: 12, right: 12, left: 4, bottom: 4 }}>
              <CartesianGrid stroke="#F2EAE5" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: GY, fontSize: 11 }}
                axisLine={{ stroke: LN }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: GY, fontSize: 10 }}
                axisLine={{ stroke: LN }}
                tickLine={false}
                width={40}
                tickFormatter={(v: number) => `₹${v}`}
              />
              <Tooltip formatter={rupeeTip} />
              <Bar dataKey="value" maxBarSize={56} radius={[3, 3, 0, 0]} isAnimationActive={false}>
                <Cell fill="#2B2622" />
                <Cell fill="#BA5D42" />
                <Cell fill="#4A7A5C" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
