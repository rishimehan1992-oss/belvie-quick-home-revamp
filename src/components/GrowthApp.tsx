"use client";

import { useMemo, useState } from "react";
import { AppNav } from "@/components/AppNav";
import { GrowthCityMixChart, GrowthPnlChart } from "@/components/GrowthCharts";
import { MethodologyDrawer } from "@/components/MethodologyDrawer";
import { useModel } from "@/components/ModelProvider";
import { integer, lakhs, rupees } from "@/model/format";
import {
  CITY_COLORS,
  GROWTH_JUMPS,
  GROWTH_MAX_DAY,
  GROWTH_MIN_DAY,
  evaluateGrowth,
  growthPath,
  type CitySnapshot,
} from "@/model/growth";

export function GrowthApp() {
  const { params, commercial } = useModel();
  const [methodOpen, setMethodOpen] = useState(false);
  const [ordersDay, setOrdersDay] = useState(GROWTH_MIN_DAY);

  const path = useMemo(() => growthPath(params, commercial), [params, commercial]);
  const snap = useMemo(
    () => evaluateGrowth(ordersDay, params, commercial),
    [ordersDay, params, commercial],
  );

  const positive = snap.feasible && snap.pnl >= 0;
  const majors = snap.rows.filter((r) => r.city.tier === "major");
  const next = snap.rows.filter((r) => r.city.tier === "next");

  return (
    <div className="mx-auto max-w-[1180px] px-3.5 pb-[60px] pt-[18px]">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-terracotta">
            Belvie · India
          </div>
          <h1 className="mt-1 font-serif text-[clamp(22px,3vw,32px)] font-normal text-charcoal">
            Growth
          </h1>
          <p className="mt-0.5 text-[13.5px] text-gray">
            Step 5 — 100 orders a day in Bengaluru, then 2,500 a day in each of ten cities:
            five major metros, then five more, to 25,000 a day.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <AppNav active="growth" />
          <button
            type="button"
            onClick={() => setMethodOpen(true)}
            className="rounded-full border border-line bg-white px-3 py-1.5 text-[12.5px] text-gray hover:border-terracotta hover:text-terracotta"
          >
            Methodology
          </button>
        </div>
      </header>

      <div className="mb-3.5 rounded-[10px] border border-line bg-card px-3.5 py-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-terracotta">
              National volume
            </span>
            <div className="mt-1 font-serif text-[22px] leading-none text-charcoal">
              {integer(ordersDay)} orders / day
            </div>
            <div className="mt-1 text-[12px] text-gray">
              {snap.phase.label} · {snap.citiesLive}{" "}
              {snap.citiesLive === 1 ? "city" : "cities"} · {integer(snap.orders)} orders /
              month
            </div>
          </div>
          <div className="font-serif text-[13px] text-charcoal">
            {GROWTH_MIN_DAY} → {integer(GROWTH_MAX_DAY)} / day
          </div>
        </div>
        <input
          type="range"
          min={GROWTH_MIN_DAY}
          max={GROWTH_MAX_DAY}
          step={50}
          value={ordersDay}
          onChange={(e) => setOrdersDay(Number(e.target.value))}
          className="mt-3 h-1.5 w-full cursor-pointer accent-terracotta"
          aria-label="National orders per day"
        />
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {GROWTH_JUMPS.map((j) => (
            <button
              key={j.day}
              type="button"
              onClick={() => setOrdersDay(j.day)}
              className={`rounded-full border px-2.5 py-1 text-[11.5px] ${
                ordersDay === j.day
                  ? "border-charcoal bg-charcoal text-white"
                  : "border-line bg-white text-gray hover:border-terracotta hover:text-terracotta"
              }`}
            >
              {j.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3.5 grid grid-cols-[repeat(auto-fit,minmax(128px,1fr))] gap-2.5">
        <Stat
          lead
          label="National P&L / month"
          value={snap.feasible ? `₹${lakhs(snap.pnl)}L` : "—"}
          sub={
            snap.feasible
              ? positive
                ? "GP − visits − city networks"
                : "loss at this volume"
              : "a city network is infeasible"
          }
          tone={snap.feasible ? (positive ? "good" : "bad") : "lead"}
        />
        <Stat
          label="Revenue"
          value={`₹${lakhs(snap.revenue)}L`}
          sub={`${integer(snap.consults)} consults / month`}
        />
        <Stat
          label="Network"
          value={snap.feasible ? `₹${lakhs(snap.network)}L` : "—"}
          sub={
            snap.feasible
              ? `${snap.S} spokes · ${snap.H} hubs · ${integer(snap.N)} advisors`
              : "—"
          }
        />
        <Stat
          label="₹ / order"
          value={snap.feasible ? rupees(snap.networkCpo) : "—"}
          sub="sum of city optima / national orders"
        />
        <Stat
          label="Cities live"
          value={`${snap.majorsLive} + ${snap.nextLive}`}
          sub="major metros + next metros"
        />
      </div>

      <div className="mb-3.5 grid grid-cols-1 gap-3.5 min-[760px]:grid-cols-2">
        <GrowthPnlChart path={path} current={ordersDay} />
        <GrowthCityMixChart path={path} current={ordersDay} />
      </div>

      <CityGroup title="Five major metros" rows={majors} />
      <CityGroup title="Next five metros" rows={next} />

      <p className="mt-[18px] border-t border-line pt-2.5 text-[11.5px] leading-[1.55] text-gray">
        <b className="text-charcoal">Path:</b> fill Bengaluru to 2,500 orders / day, copy the
        playbook across Mumbai, Delhi NCR, Hyderabad and Chennai (12,500 / day together), then
        Pune, Ahmedabad, Kolkata, Kochi and Jaipur (another 12,500). Ten cities × 2,500 = 25,000
        / day. A city does not open until it can start at 100 orders / day — the same seed as
        early Bengaluru.{" "}
        <b className="text-charcoal">Each city</b> is an independent hub–spoke run with this
        session’s conversion, mix, AOV, visit cost, wages and factors. Bengaluru’s catchment
        follows Network; other catchments are planning envelopes, not municipal limits. Same
        cost stack in every city — no city wage index. All figures are planning estimates.
      </p>

      <MethodologyDrawer open={methodOpen} onClose={() => setMethodOpen(false)} />
    </div>
  );
}

function CityGroup({ title, rows }: { title: string; rows: CitySnapshot[] }) {
  return (
    <div className="mb-3.5 overflow-x-auto rounded-[10px] border border-line bg-white">
      <h3 className="m-0 border-b border-line px-3.5 py-2.5 font-serif text-sm font-normal text-charcoal">
        {title}
      </h3>
      <table className="w-full border-collapse text-[12.5px]">
        <thead>
          <tr>
            {["City", "Catchment", "Orders / day", "S*", "Hubs", "Advisors", "₹ / order", "Network / mo"].map(
              (h, i) => (
                <th
                  key={h}
                  className={`bg-charcoal px-2.5 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.05em] text-card ${
                    i === 0 ? "text-left" : "text-right"
                  }`}
                >
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const muted = !row.live;
            return (
              <tr key={row.city.id} className={muted ? "text-gray" : "text-charcoal"}>
                <td className="border-b border-line px-2.5 py-2 text-left">
                  <span
                    className="mr-1.5 inline-block h-2 w-2 rounded-full"
                    style={{ background: muted ? "#E4D8D0" : CITY_COLORS[row.city.id] }}
                  />
                  <span className="font-semibold">{row.city.name}</span>
                  <span className="ml-1.5 text-[11px] text-gray">{row.city.short}</span>
                  {row.live && row.mature ? (
                    <span className="ml-1.5 text-[10.5px] uppercase tracking-[0.06em] text-good">
                      filled
                    </span>
                  ) : row.live ? (
                    <span className="ml-1.5 text-[10.5px] uppercase tracking-[0.06em] text-terracotta">
                      ramping
                    </span>
                  ) : (
                    <span className="ml-1.5 text-[10.5px] uppercase tracking-[0.06em] text-gray">
                      locked
                    </span>
                  )}
                </td>
                <td className="border-b border-line px-2.5 py-2 text-right tabular-nums">
                  {row.city.A} km²
                </td>
                <td className="border-b border-line px-2.5 py-2 text-right font-serif tabular-nums">
                  {row.live ? integer(row.ordersDay) : "—"}
                  {row.live ? (
                    <span className="block text-[10.5px] font-sans text-gray">
                      of {row.city.targetDay}
                    </span>
                  ) : null}
                </td>
                <td className="border-b border-line px-2.5 py-2 text-right font-serif tabular-nums">
                  {row.live ? row.pnl?.S ?? "—" : "—"}
                </td>
                <td className="border-b border-line px-2.5 py-2 text-right font-serif tabular-nums">
                  {row.live ? row.pnl?.H ?? "—" : "—"}
                </td>
                <td className="border-b border-line px-2.5 py-2 text-right font-serif tabular-nums">
                  {row.live ? integer(row.pnl?.N ?? 0) : "—"}
                </td>
                <td className="border-b border-line px-2.5 py-2 text-right font-serif tabular-nums">
                  {row.live && row.pnl?.feasible ? rupees(row.pnl.networkCpo) : "—"}
                </td>
                <td className="border-b border-line px-2.5 py-2 text-right font-serif tabular-nums">
                  {row.live && row.pnl?.feasible ? `₹${lakhs(row.pnl.network)}L` : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  lead = false,
  tone = "plain",
}: {
  label: string;
  value: string;
  sub: string;
  lead?: boolean;
  tone?: "plain" | "lead" | "good" | "bad";
}) {
  const box =
    tone === "good"
      ? "border-good bg-good"
      : tone === "bad"
        ? "border-bad bg-bad"
        : lead || tone === "lead"
          ? "border-charcoal bg-charcoal"
          : "border-line bg-white";
  const inverted = tone !== "plain";

  return (
    <div className={`rounded-[9px] border px-3 py-2.5 ${box}`}>
      <div
        className={`text-[9.5px] font-bold uppercase tracking-[0.1em] ${
          inverted ? "text-white/80" : "text-gray"
        }`}
      >
        {label}
      </div>
      <div
        className={`mt-0.5 font-serif text-[25px] leading-[1.15] tabular-nums ${
          inverted ? "text-white" : "text-charcoal"
        }`}
      >
        {value}
      </div>
      <div className={`mt-0.5 text-[11px] ${inverted ? "text-white/75" : "text-gray"}`}>{sub}</div>
    </div>
  );
}
