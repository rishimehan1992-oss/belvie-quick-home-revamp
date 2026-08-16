"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
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
import { advisorTravelBySpoke, spokeStep } from "@/model/advisorTravel";
import type { Params, Solution } from "@/model/types";

const GY = "#6B6560";
const LN = "#E4D8D0";
const TE = "#BA5D42";
const CH = "#2B2622";
const KIT = "#8C9A8E";
const INTRA = "#C4A574";

function km(n: number): string {
  return Number.isFinite(n) ? `${n.toFixed(1)} km` : "—";
}

function mins(n: number): string {
  return Number.isFinite(n) ? `${Math.round(n)} min` : "—";
}

export function AdvisorTravelSim({
  rows,
  best,
  params,
}: {
  rows: Solution[];
  best: Solution | null;
  params: Params;
}) {
  const pts = useMemo(
    () => advisorTravelBySpoke(rows, params, best?.S ?? null),
    [rows, params, best?.S],
  );
  const here = pts.find((p) => p.isBest) ?? pts.find((p) => p.S === best?.S);
  const prev = here ? pts.find((p) => p.S === here.S - 1) : undefined;
  const next = here ? pts.find((p) => p.S === here.S + 1) : undefined;
  const added = here && next ? spokeStep(here, next) : null;
  const fromPrev = here && prev ? spokeStep(prev, here) : null;

  if (!pts.length) return null;

  const dist = pts.map((p) => ({
    S: p.S,
    oneWay: Number(p.dBar.toFixed(2)),
    roundTrip: Number(p.rtKm.toFixed(2)),
    catchment: Number(p.catchment.toFixed(1)),
  }));
  const time = pts.map((p) => ({
    S: p.S,
    cycle: Math.round(p.travelMin),
    day: Math.round(p.travelDayMin),
    kmDay: Number(p.kmDay.toFixed(1)),
  }));
  const stack = pts.map((p) => ({
    S: p.S,
    travel: Math.round(p.travelMin),
    consult: Math.round(p.consultMin),
    kit: Math.round(p.kitMin),
    intra: Math.round(p.intraMin),
  }));

  return (
    <div className="mb-3.5 space-y-3.5">
      <div className="rounded-[10px] border border-line bg-white px-3.5 pt-3 pb-2">
        <h3 className="m-0 font-serif text-sm font-normal text-charcoal">
          Why a new spoke cuts advisor travel
        </h3>
        <p className="mb-2 mt-0.5 text-[11.5px] leading-[1.4] text-gray">
          Homes are treated as uniform over {params.A} km². Mean road distance to the nearest of S
          spokes is 0.40 · τ · √(A/S). Each extra spoke shrinks the catchment (A/S), so distance
          falls as 1/√S — doubling spokes cuts travel by √2 ≈ 29%, not half. That is why the tenth
          spoke saves less than the second. Round-trip minutes = 2 · d̄ · {params.mkAdv} min/km.
        </p>
        {here ? (
          <div className="mb-3 grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-2">
            <Mini
              label={`At S* = ${here.S}`}
              value={km(here.dBar)}
              sub={`one way · catchment ${here.catchment.toFixed(0)} km²`}
            />
            <Mini
              label="Round trip"
              value={km(here.rtKm)}
              sub={`${mins(here.travelMin)} · ${here.kmDay.toFixed(1)} km / day`}
            />
            {fromPrev ? (
              <Mini
                label={`S ${fromPrev.fromS} → ${fromPrev.toS}`}
                value={`−${Math.round(fromPrev.pctShorter * 100)}%`}
                sub={`${km(fromPrev.kmSaved)} / cycle · ${mins(fromPrev.minSaved)}`}
              />
            ) : null}
            {added ? (
              <Mini
                label={`One more spoke → ${added.toS}`}
                value={`−${Math.round(added.pctShorter * 100)}%`}
                sub={`${km(added.kmSaved)} / cycle · ${mins(added.minSaved)}`}
              />
            ) : null}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-3.5 min-[900px]:grid-cols-2">
          <div className="h-[240px] w-full">
            <p className="mb-1 text-[11px] font-semibold text-charcoal">Distance vs spokes</p>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dist} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                <CartesianGrid stroke="#F2EAE5" vertical={false} />
                <XAxis
                  type="number"
                  dataKey="S"
                  domain={["dataMin", "dataMax"]}
                  tick={{ fill: GY, fontSize: 10 }}
                  axisLine={{ stroke: LN }}
                  tickLine={false}
                  label={{ value: "spokes", position: "insideBottom", offset: -4, fill: GY, fontSize: 10 }}
                />
                <YAxis
                  tick={{ fill: GY, fontSize: 10 }}
                  axisLine={{ stroke: LN }}
                  tickLine={false}
                  width={36}
                  tickFormatter={(v: number) => `${v}`}
                />
                <Tooltip
                  formatter={(v: unknown, name: unknown) => [
                    `${Number(v ?? 0).toFixed(1)} km`,
                    name === "oneWay" ? "mean home → spoke" : "round trip",
                  ]}
                  labelFormatter={(v: unknown) => `${v} spokes`}
                />
                <Legend
                  wrapperStyle={{ fontSize: 11, color: GY }}
                  formatter={(value) => (value === "oneWay" ? "One way d̄" : "Round trip")}
                />
                {best ? (
                  <ReferenceLine x={best.S} stroke={CH} strokeDasharray="3 3" />
                ) : null}
                <Line
                  type="monotone"
                  dataKey="oneWay"
                  stroke={CH}
                  strokeWidth={2}
                  dot={{ r: 2, fill: CH }}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="roundTrip"
                  stroke={TE}
                  strokeWidth={2}
                  dot={{ r: 2, fill: TE }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="h-[240px] w-full">
            <p className="mb-1 text-[11px] font-semibold text-charcoal">Travel time vs spokes</p>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={time} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                <CartesianGrid stroke="#F2EAE5" vertical={false} />
                <XAxis
                  type="number"
                  dataKey="S"
                  domain={["dataMin", "dataMax"]}
                  tick={{ fill: GY, fontSize: 10 }}
                  axisLine={{ stroke: LN }}
                  tickLine={false}
                  label={{ value: "spokes", position: "insideBottom", offset: -4, fill: GY, fontSize: 10 }}
                />
                <YAxis
                  yAxisId="min"
                  tick={{ fill: GY, fontSize: 10 }}
                  axisLine={{ stroke: LN }}
                  tickLine={false}
                  width={36}
                />
                <YAxis
                  yAxisId="km"
                  orientation="right"
                  tick={{ fill: GY, fontSize: 10 }}
                  axisLine={{ stroke: LN }}
                  tickLine={false}
                  width={36}
                />
                <Tooltip
                  formatter={(v: unknown, name: unknown) => {
                    const n = Number(v ?? 0);
                    if (name === "kmDay") return [`${n.toFixed(1)} km`, "km / advisor / day"];
                    if (name === "day") return [`${n} min`, "travel / paid day"];
                    return [`${n} min`, "travel / cycle"];
                  }}
                  labelFormatter={(v: unknown) => `${v} spokes`}
                />
                <Legend
                  wrapperStyle={{ fontSize: 11, color: GY }}
                  formatter={(value) =>
                    value === "cycle"
                      ? "Min / cycle"
                      : value === "day"
                        ? "Min / day"
                        : "Km / day"
                  }
                />
                {best ? (
                  <ReferenceLine yAxisId="min" x={best.S} stroke={CH} strokeDasharray="3 3" />
                ) : null}
                <Line
                  yAxisId="min"
                  type="monotone"
                  dataKey="cycle"
                  stroke={TE}
                  strokeWidth={2}
                  dot={{ r: 2, fill: TE }}
                  isAnimationActive={false}
                />
                <Line
                  yAxisId="min"
                  type="monotone"
                  dataKey="day"
                  stroke={CH}
                  strokeWidth={2}
                  dot={{ r: 2, fill: CH }}
                  isAnimationActive={false}
                />
                <Line
                  yAxisId="km"
                  type="monotone"
                  dataKey="kmDay"
                  stroke={KIT}
                  strokeWidth={2}
                  dot={{ r: 2, fill: KIT }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-[10px] border border-line bg-white px-3.5 pt-3 pb-2">
        <h3 className="m-0 font-serif text-sm font-normal text-charcoal">
          Time in one kit cycle as spokes are added
        </h3>
        <p className="mb-2 mt-0.5 text-[11.5px] leading-[1.4] text-gray">
          In-home, kit rebuild and home-to-home do not change with S. Only spoke↔home travel
          shrinks. The leftover minutes become extra cycles, which is why consults/day rise.
        </p>
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stack} margin={{ top: 12, right: 12, left: 0, bottom: 8 }}>
              <CartesianGrid stroke="#F2EAE5" vertical={false} />
              <XAxis
                type="number"
                dataKey="S"
                domain={["dataMin", "dataMax"]}
                tick={{ fill: GY, fontSize: 10 }}
                axisLine={{ stroke: LN }}
                tickLine={false}
                label={{ value: "spokes", position: "insideBottom", offset: -4, fill: GY, fontSize: 10 }}
              />
              <YAxis
                tick={{ fill: GY, fontSize: 10 }}
                axisLine={{ stroke: LN }}
                tickLine={false}
                width={36}
                tickFormatter={(v: number) => `${v}m`}
              />
              <Tooltip
                formatter={(v: unknown, name: unknown) => {
                  const labels: Record<string, string> = {
                    travel: "spoke ↔ home",
                    consult: "in-home",
                    kit: "kit rebuild",
                    intra: "home to home",
                  };
                  return [`${Number(v ?? 0)} min`, labels[String(name)] ?? String(name)];
                }}
                labelFormatter={(v: unknown) => `${v} spokes`}
              />
              <Legend
                wrapperStyle={{ fontSize: 11, color: GY }}
                formatter={(value) =>
                  value === "travel"
                    ? "Travel"
                    : value === "consult"
                      ? "In-home"
                      : value === "kit"
                        ? "Kit"
                        : "Home to home"
                }
              />
              {best ? (
                <ReferenceLine x={best.S} stroke={CH} strokeDasharray="3 3" />
              ) : null}
              <Area
                type="monotone"
                dataKey="travel"
                stackId="c"
                stroke={TE}
                fill={TE}
                fillOpacity={0.85}
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="consult"
                stackId="c"
                stroke={CH}
                fill={CH}
                fillOpacity={0.85}
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="kit"
                stackId="c"
                stroke={KIT}
                fill={KIT}
                fillOpacity={0.9}
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="intra"
                stackId="c"
                stroke={INTRA}
                fill={INTRA}
                fillOpacity={0.9}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function Mini({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-[9px] border border-line bg-card px-3 py-2">
      <div className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-gray">{label}</div>
      <div className="mt-0.5 font-serif text-[20px] leading-[1.2] text-charcoal tabular-nums">
        {value}
      </div>
      <div className="mt-0.5 text-[11px] text-gray">{sub}</div>
    </div>
  );
}
