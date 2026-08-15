"use client";

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
import { lakhs } from "@/model/format";
import {
  CITIES,
  CITY_COLORS,
  GROWTH_MAX_DAY,
  GROWTH_MIN_DAY,
  type GrowthSnapshot,
} from "@/model/growth";

const CH = "#2B2622";
const TE = "#BA5D42";
const GY = "#6B6560";
const LN = "#E4D8D0";
const GP = "#4A7A5C";

function dayTick(v: number): string {
  if (v >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
  return String(v);
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

function PnlTip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: GrowthSnapshot }> | null;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  if (!row) return null;
  return (
    <div className="rounded-md border border-line bg-white px-2.5 py-2 text-[11.5px] text-charcoal shadow-sm">
      <div className="mb-1 font-serif">
        {row.ordersDay.toLocaleString("en-IN")} orders / day · {row.citiesLive}{" "}
        {row.citiesLive === 1 ? "city" : "cities"}
      </div>
      <div>{row.phase.label}</div>
      <div>Gross profit · ₹{lakhs(row.grossProfit)}L</div>
      <div>Network · {row.feasible ? `₹${lakhs(row.network)}L` : "infeasible"}</div>
      <div className="mt-1 font-semibold">
        P&L · {row.feasible ? `₹${lakhs(row.pnl)}L` : "—"}
      </div>
    </div>
  );
}

export function GrowthPnlChart({
  path,
  current,
}: {
  path: GrowthSnapshot[];
  current: number;
}) {
  const data = path.map((p) => ({
    ...p,
    gpL: Number.isFinite(p.grossProfit) ? p.grossProfit / 1e5 : null,
    netL: p.feasible ? p.network / 1e5 : null,
    pnlL: p.feasible && Number.isFinite(p.pnl) ? p.pnl / 1e5 : null,
  }));
  const [yMin, yMax] = paddedDomain(
    data.flatMap((d) => [d.gpL, d.netL, d.pnlL].filter((v): v is number => v != null)),
  );

  return (
    <div className="rounded-[10px] border border-line bg-white px-3.5 pt-3 pb-2">
      <h3 className="m-0 font-serif text-sm font-normal text-charcoal">
        National P&L as daily orders grow
      </h3>
      <p className="mb-2 mt-0 text-[11.5px] leading-[1.4] text-gray">
        Each city is its own hub–spoke optimiser. Opening a metro adds a hub, so network
        cost steps up, then density pays it down.
      </p>
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 18, right: 12, left: 4, bottom: 8 }}>
            <CartesianGrid stroke="#F2EAE5" vertical={false} />
            <XAxis
              type="number"
              dataKey="ordersDay"
              domain={[GROWTH_MIN_DAY, GROWTH_MAX_DAY]}
              tick={{ fill: GY, fontSize: 10 }}
              axisLine={{ stroke: LN }}
              tickLine={false}
              tickFormatter={dayTick}
              label={{
                value: "orders / day · national",
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
            <Tooltip content={<PnlTip />} />
            <Legend
              wrapperStyle={{ fontSize: 11, color: GY }}
              iconType="plainline"
              iconSize={12}
            />
            <ReferenceLine x={current} stroke={TE} strokeDasharray="3 3" />
            <Line
              type="monotone"
              dataKey="gpL"
              name="Gross profit"
              stroke={GP}
              dot={false}
              strokeWidth={1.6}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="netL"
              name="Network"
              stroke={CH}
              dot={false}
              strokeWidth={1.6}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="pnlL"
              name="P&L"
              stroke={TE}
              dot={false}
              strokeWidth={2}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function MixTip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ name?: string; value?: number; color?: string }> | null;
  label?: number;
}) {
  if (!active || !payload?.length) return null;
  const live = payload.filter((p) => (p.value ?? 0) > 0);
  return (
    <div className="rounded-md border border-line bg-white px-2.5 py-2 text-[11.5px] text-charcoal shadow-sm">
      <div className="mb-1 font-serif">{Number(label).toLocaleString("en-IN")} orders / day</div>
      {live.map((p) => (
        <div key={p.name} className="flex justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="tabular-nums">{Math.round(p.value ?? 0)}</span>
        </div>
      ))}
    </div>
  );
}

export function GrowthCityMixChart({
  path,
  current,
}: {
  path: GrowthSnapshot[];
  current: number;
}) {
  const data = path.map((p) => ({
    ordersDay: p.ordersDay,
    ...Object.fromEntries(CITIES.map((c) => [c.id, p.byCity[c.id] ?? 0])),
  }));

  return (
    <div className="rounded-[10px] border border-line bg-white px-3.5 pt-3 pb-2">
      <h3 className="m-0 font-serif text-sm font-normal text-charcoal">
        Where the orders sit
      </h3>
      <p className="mb-2 mt-0 text-[11.5px] leading-[1.4] text-gray">
        Bengaluru fills first to 2,500 / day. Then Mumbai, Delhi NCR, Hyderabad, Chennai.
        Then Pune, Ahmedabad, Kolkata, Kochi, Jaipur — 2,500 each, 25,000 national. A new
        city opens only when it can start at 100 orders / day.
      </p>
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 18, right: 12, left: 4, bottom: 8 }}>
            <CartesianGrid stroke="#F2EAE5" vertical={false} />
            <XAxis
              type="number"
              dataKey="ordersDay"
              domain={[GROWTH_MIN_DAY, GROWTH_MAX_DAY]}
              tick={{ fill: GY, fontSize: 10 }}
              axisLine={{ stroke: LN }}
              tickLine={false}
              tickFormatter={dayTick}
              label={{
                value: "orders / day · national",
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
              width={40}
              tickFormatter={dayTick}
              label={{ value: "/day", position: "top", offset: 8, fill: GY, fontSize: 10 }}
            />
            <Tooltip content={<MixTip />} />
            <ReferenceLine x={current} stroke={TE} strokeDasharray="3 3" />
            {CITIES.map((c) => (
              <Area
                key={c.id}
                type="monotone"
                dataKey={c.id}
                name={c.short}
                stackId="orders"
                stroke={CITY_COLORS[c.id]}
                fill={CITY_COLORS[c.id]}
                fillOpacity={c.tier === "major" ? 0.85 : 0.55}
                isAnimationActive={false}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
