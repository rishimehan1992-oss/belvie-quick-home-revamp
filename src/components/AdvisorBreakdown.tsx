"use client";

import { useMemo } from "react";
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
import { integer, rupees } from "@/model/format";
import { advisorBreakdown, advisorCostVsVolume } from "@/model/advisorBreakdown";
import type { Params, Solution } from "@/model/types";

const GY = "#6B6560";
const LN = "#E4D8D0";
const TE = "#BA5D42";
const CH = "#2B2622";
const GP = "#4A7A5C";

function rupeeTip(v: unknown): [string, string] {
  return [rupees(Number(v ?? 0)), "₹ / order"];
}

export function AdvisorBreakdown({
  best,
  params,
  consults,
  visitCost,
}: {
  best: Solution | null;
  params: Params;
  consults: number;
  visitCost: number;
}) {
  const row = useMemo(
    () => (best ? advisorBreakdown(best, params, consults, visitCost) : null),
    [best, params, consults, visitCost],
  );
  const volume = useMemo(
    () => advisorCostVsVolume(params, visitCost),
    [params, visitCost],
  );

  if (!best || !row || !(params.D > 0)) return null;

  const timeBars = row.slices
    .filter((l) => l.minutesDay > 0.05)
    .map((l) => ({
      name: l.label,
      minutes: Math.round(l.minutesDay),
      fill: l.color,
    }));
  const moneyBars = row.slices
    .filter((l) => Number.isFinite(l.perOrder) && l.perOrder > 0.4)
    .map((l) => ({
      name: l.label,
      perOrder: Math.round(l.perOrder),
      fill: l.color,
    }));
  const volData = volume
    .filter((p) => p.feasible && p.advisorPerOrder != null)
    .map((p) => ({
      D: p.D,
      advisor: Math.round(p.advisorPerOrder ?? 0),
      visit: Math.round(p.visitCacPerOrder ?? 0),
      S: p.S,
      N: p.N,
      cday: p.cday,
      travel: p.travel,
    }));

  return (
    <div className="mb-3.5 space-y-3.5">
      <div className="grid grid-cols-1 gap-3.5 min-[900px]:grid-cols-2">
        <div className="rounded-[10px] border border-line bg-white px-3.5 pt-3 pb-2">
          <h3 className="m-0 font-serif text-sm font-normal text-charcoal">
            Advisor paid day — where time goes
          </h3>
          <p className="mb-2 mt-0.5 text-[11.5px] leading-[1.4] text-gray">
            {row.shiftMin} min shift ({(row.shiftMin / 60).toFixed(0)}h) minus {row.adminMin} min
            admin leaves {row.productiveMin} min on the road. One kit cycle is{" "}
            {Math.round(row.cycleMin)} min, so she starts {row.cyclesDay.toFixed(2)} cycles / day.
            Home-to-home ({params.tintra} min) only appears when k≥2.
          </p>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={timeBars}
                layout="vertical"
                margin={{ top: 8, right: 28, left: 8, bottom: 4 }}
              >
                <CartesianGrid stroke="#F2EAE5" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: GY, fontSize: 10 }}
                  axisLine={{ stroke: LN }}
                  tickLine={false}
                  tickFormatter={(v: number) => `${v}m`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={118}
                  tick={{ fill: GY, fontSize: 10 }}
                  axisLine={{ stroke: LN }}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(43,38,34,0.04)" }}
                  formatter={(v: unknown) => [`${Number(v ?? 0)} min`, "paid day"]}
                />
                <Bar dataKey="minutes" radius={[0, 3, 3, 0]} maxBarSize={18} isAnimationActive={false}>
                  {timeBars.map((d) => (
                    <Cell key={d.name} fill={d.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[10px] border border-line bg-white px-3.5 pt-3 pb-2">
          <h3 className="m-0 font-serif text-sm font-normal text-charcoal">
            Advisor pay — where the rupee goes
          </h3>
          <p className="mb-2 mt-0.5 text-[11.5px] leading-[1.4] text-gray">
            {integer(row.paidFte)} advisors × {rupees(params.w)} = {rupees(best.Cadv)} / month, or{" "}
            {rupees(row.advisorPerOrder)} / order ({rupees(row.advisorPerVisit)} / visit). Wage is
            split by the paid-day mix. Paid idle is the leftover from rounding up to a whole person.
          </p>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={moneyBars}
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
                  width={118}
                  tick={{ fill: GY, fontSize: 10 }}
                  axisLine={{ stroke: LN }}
                  tickLine={false}
                />
                <Tooltip cursor={{ fill: "rgba(43,38,34,0.04)" }} formatter={rupeeTip} />
                <Bar dataKey="perOrder" radius={[0, 3, 3, 0]} maxBarSize={18} isAnimationActive={false}>
                  {moneyBars.map((d) => (
                    <Cell key={d.name} fill={d.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-2">
        <Mini
          label="Productive window"
          value={`${(row.productiveMin / 60).toFixed(0)}h`}
          sub={`${row.adminMin} min admin of ${(row.shiftMin / 60).toFixed(0)}h`}
        />
        <Mini
          label="Travel in cycle"
          value={`${Math.round(row.travelShareCycle * 100)}%`}
          sub={`${Math.round(best.rt)} min of ${Math.round(best.cycle)}`}
        />
        <Mini
          label="Advisors on book"
          value={`${row.requiredFte.toFixed(1)} / ${integer(row.paidFte)}`}
          sub={`${Math.round(row.utilisation * 100)}% of last FTE used`}
        />
        <Mini
          label="Visit CAC / order"
          value={rupees(row.visitCacPerOrder)}
          sub={`${rupees(row.visitCacPerVisit)} × visits / orders · flat`}
        />
      </div>

      <div className="rounded-[10px] border border-line bg-white px-3.5 pt-3 pb-2">
        <h3 className="m-0 font-serif text-sm font-normal text-charcoal">
          Why advisor ₹ / order falls as orders rise
        </h3>
        <p className="mb-2 mt-0.5 text-[11.5px] leading-[1.4] text-gray">
          Visit CAC does not fall — it is {rupees(visitCost)} per consult, so{" "}
          {rupees(row.visitCacPerOrder)} per order at this mix. Advisor payroll per order does fall
          because higher volume buys more spokes, shortens spoke↔home travel, and each advisor fits
          more consults into the 8 productive hours. Headcount is also ceiled, so filling the last
          person&apos;s book drops ₹/order until you hire the next one.
        </p>
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={volData} margin={{ top: 12, right: 16, left: 4, bottom: 8 }}>
              <CartesianGrid stroke="#F2EAE5" vertical={false} />
              <XAxis
                type="number"
                dataKey="D"
                domain={["dataMin", "dataMax"]}
                tick={{ fill: GY, fontSize: 10 }}
                axisLine={{ stroke: LN }}
                tickLine={false}
                tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
                label={{
                  value: "orders / month",
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
                tickFormatter={(v: number) => `₹${v}`}
              />
              <Tooltip
                formatter={(v: unknown, name: unknown) => [
                  rupees(Number(v ?? 0)),
                  name === "advisor" ? "advisor / order" : "visit CAC / order",
                ]}
                labelFormatter={(v: unknown) => `${integer(Number(v))} orders / month`}
              />
              <Legend
                wrapperStyle={{ fontSize: 11, color: GY }}
                formatter={(value) =>
                  value === "advisor" ? "Advisor payroll / order" : "Visit CAC / order"
                }
              />
              <ReferenceLine
                x={params.D}
                stroke={CH}
                strokeDasharray="3 3"
                label={{ value: "now", fill: GY, fontSize: 10, position: "insideTopRight" }}
              />
              <Line
                type="monotone"
                dataKey="advisor"
                stroke={TE}
                strokeWidth={2}
                dot={{ r: 3, fill: TE }}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="visit"
                stroke={GP}
                strokeWidth={2}
                dot={{ r: 3, fill: GP }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function Mini({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-[9px] border border-line bg-white px-3 py-2">
      <div className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-gray">{label}</div>
      <div className="mt-0.5 font-serif text-[20px] leading-[1.2] text-charcoal tabular-nums">
        {value}
      </div>
      <div className="mt-0.5 text-[11px] text-gray">{sub}</div>
    </div>
  );
}
