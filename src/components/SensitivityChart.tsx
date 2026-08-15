"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { lakhs } from "@/model/format";
import { optimise } from "@/model/solver";
import type { SolverParams } from "@/model/types";

const CH = "#2B2622";
const TE = "#BA5D42";
const GY = "#6B6560";
const LN = "#E4D8D0";

type Point = {
  x: number;
  y: number;
  tag: string;
  showTag: boolean;
};

function series(
  xs: number[],
  params: SolverParams,
  override: (x: number) => Partial<SolverParams>,
): Point[] {
  const pts: Point[] = xs.map((x) => {
    const best = optimise({ ...params, ...override(x) }).best;
    return {
      x,
      y: best ? best.total : NaN,
      tag: best ? `S${best.S}` : "",
      showTag: false,
    };
  });
  let lastTag: string | null = null;
  for (const pt of pts) {
    if (pt.tag && pt.tag !== lastTag) {
      pt.showTag = true;
      lastTag = pt.tag;
    }
  }
  return pts;
}

function yDomain(pts: Point[]): [number, number] {
  const ok = pts.filter((p) => Number.isFinite(p.y));
  if (!ok.length) return [0, 10];
  const lo = Math.min(...ok.map((p) => p.y)) / 1e5;
  const hi = Math.max(...ok.map((p) => p.y)) / 1e5;
  const span = Math.max(hi - lo, 1);
  const padY = span * 0.18;
  return [Math.max(0, Math.floor(lo - padY)), Math.ceil(hi + padY)];
}

function Chart({
  title,
  caption,
  xLabel,
  pts,
  markX,
}: {
  title: string;
  caption: string;
  xLabel: string;
  pts: Point[];
  markX: number;
}) {
  const ok = pts.filter((p) => Number.isFinite(p.y));
  const [yMin, yMax] = yDomain(pts);
  const minY = ok.length ? Math.min(...ok.map((p) => p.y)) : NaN;
  const chartData = pts.map((p) => ({
    ...p,
    lakh: Number.isFinite(p.y) ? p.y / 1e5 : null,
  }));

  return (
    <div className="rounded-[10px] border border-line bg-white px-3.5 pt-3 pb-2">
      <h3 className="m-0 font-serif text-sm font-normal text-charcoal">{title}</h3>
      <p className="mb-2 mt-0 text-[11.5px] leading-[1.4] text-gray">{caption}</p>
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 22, right: 12, left: 4, bottom: 8 }}>
            <CartesianGrid stroke="#F2EAE5" vertical={false} />
            <XAxis
              type="number"
              dataKey="x"
              domain={["dataMin", "dataMax"]}
              tick={{ fill: GY, fontSize: 10 }}
              axisLine={{ stroke: LN }}
              tickLine={false}
              ticks={pts.map((p) => p.x)}
              label={{ value: xLabel, position: "insideBottom", offset: -4, fill: GY, fontSize: 10 }}
            />
            <YAxis
              domain={[yMin, yMax]}
              tick={{ fill: GY, fontSize: 10 }}
              axisLine={{ stroke: LN }}
              tickLine={false}
              width={40}
              allowDecimals={false}
              label={{
                value: "₹L  ·  does not start at zero",
                position: "top",
                offset: 10,
                fill: GY,
                fontSize: 9,
              }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const row = payload[0].payload as Point & { lakh: number | null };
                if (row.lakh == null) return null;
                return (
                  <div className="rounded-md border border-line bg-white px-2.5 py-2 text-[11.5px] text-charcoal shadow-sm">
                    <div>
                      {xLabel.split("—")[0].trim()} = {row.x}
                    </div>
                    <div className="font-semibold">₹{lakhs(row.y)}L</div>
                    {row.tag ? <div className="text-gray">Optimum {row.tag}</div> : null}
                  </div>
                );
              }}
            />
            {markX >= pts[0].x && markX <= pts[pts.length - 1].x ? (
              <ReferenceLine
                x={markX}
                stroke={LN}
                strokeDasharray="3 3"
                label={{ value: "now", position: "top", fill: GY, fontSize: 10 }}
              />
            ) : null}
            <Line
              type="linear"
              dataKey="lakh"
              stroke={TE}
              strokeWidth={2}
              connectNulls={false}
              isAnimationActive={false}
              dot={(props) => {
                const { cx, cy, payload, index } = props;
                if (cx == null || cy == null || payload.lakh == null) {
                  return <g key={index} />;
                }
                const isMin = payload.y === minY;
                return (
                  <g key={index}>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isMin ? 4.5 : 3}
                      fill={isMin ? CH : TE}
                    />
                    {payload.showTag ? (
                      <text
                        x={cx}
                        y={cy - 9}
                        textAnchor="middle"
                        fill={CH}
                        fontSize={9.5}
                        fontWeight={700}
                      >
                        {payload.tag}
                      </text>
                    ) : null}
                  </g>
                );
              }}
              activeDot={{ r: 5, fill: CH }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function SensitivityChart({ params }: { params: SolverParams }) {
  const kPts = series([1, 2, 3, 4, 5, 6], params, (k) => ({ k }));
  const speedPts = series([3, 4, 5, 6, 8, 10, 12, 15], params, (mkAdv) => ({ mkAdv }));

  return (
    <div className="mb-3.5 grid grid-cols-1 gap-3.5 min-[760px]:grid-cols-2">
      <Chart
        title="Sensitivity to k"
        caption="Total cost if the advisor could do k consults per kit load, re-optimising spokes each time."
        xLabel="k — consults per kit load"
        pts={kPts}
        markX={params.k}
      />
      <Chart
        title="Sensitivity to advisor travel speed"
        caption="Total cost across the 3–15 min/km band, re-optimising spokes each time."
        xLabel="advisor travel — min / km"
        pts={speedPts}
        markX={params.mkAdv}
      />
    </div>
  );
}
