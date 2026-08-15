"use client";

import { useMemo, useState } from "react";
import { AppNav } from "@/components/AppNav";
import { MethodologyDrawer } from "@/components/MethodologyDrawer";
import { useModel } from "@/components/ModelProvider";
import { ZoneHeatmap } from "@/components/ZoneHeatmap";
import {
  ZONE_COLORS,
  cellAt,
  favorableGrid,
  minProfitableAov,
  minProfitableN,
  nearestGridAov,
  nearestGridK,
  nearestGridN,
  scaleOrdersMonth,
} from "@/model/favorable";
import { CITY_TARGET_DAY } from "@/model/growth";
import { integer, lakhs, rupees } from "@/model/format";
import { COMMERCIAL_META, nonConsultsPerConsult } from "@/model/pnl";

export function FavorableApp() {
  const { params, commercial, setCommercial } = useModel();
  const [methodOpen, setMethodOpen] = useState(false);
  const [scale, setScale] = useState<"city" | "session">("city");

  const n = nonConsultsPerConsult(params.rho);
  const scaleOrders =
    scale === "city" ? scaleOrdersMonth(params) : params.D;
  const scaleDay = scaleOrders / params.ddel;

  const grid = useMemo(
    () => favorableGrid(params, commercial, scaleOrders),
    [params, commercial, scaleOrders],
  );

  const markAov = nearestGridAov(commercial.aov);
  const markN = nearestGridN(n);
  const markK = nearestGridK(params.k);
  const here = cellAt(grid, markAov, markN, markK);
  const kSlice = grid.slices.find((s) => s.k === markK);
  const beAov = kSlice ? minProfitableAov(kSlice) : null;
  const beN = kSlice ? minProfitableN(kSlice, commercial.aov) : null;
  const best = grid.best;
  const samplingMeta = COMMERCIAL_META.samplingCost;

  return (
    <div className="mx-auto max-w-[1180px] px-3.5 pb-[60px] pt-[18px]">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-terracotta">
            Belvie · Bengaluru
          </div>
          <h1 className="mt-1 font-serif text-[clamp(22px,3vw,32px)] font-normal text-charcoal">
            Favorable
          </h1>
          <p className="mt-0.5 text-[13.5px] text-gray">
            Step 4 — green pockets of AOV, reorders and k where a mature city is profitable.
            Sampling is the fourth lever.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <AppNav active="favorable" />
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
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-terracotta">
              At scale
            </span>
            <div className="mt-1 font-serif text-[20px] leading-none text-charcoal">
              {integer(scaleDay)} orders / day · {integer(scaleOrders)} / month
            </div>
            <div className="mt-1 text-[12px] text-gray">
              φ {params.phi}% · visit ₹{commercial.visitCost} · GM {commercial.gm}% · ring is
              this session (nearest grid cell)
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setScale("city")}
              className={`rounded-full border px-2.5 py-1 text-[11.5px] ${
                scale === "city"
                  ? "border-charcoal bg-charcoal text-white"
                  : "border-line bg-white text-gray"
              }`}
            >
              Mature city · {CITY_TARGET_DAY.toLocaleString("en-IN")}/day
            </button>
            <button
              type="button"
              onClick={() => setScale("session")}
              className={`rounded-full border px-2.5 py-1 text-[11.5px] ${
                scale === "session"
                  ? "border-charcoal bg-charcoal text-white"
                  : "border-line bg-white text-gray"
              }`}
            >
              This P&L volume
            </button>
          </div>
        </div>
        <label className="mt-3 block text-[12px] text-charcoal">
          Sampling cost per visit · {rupees(commercial.samplingCost)}
          <input
            type="range"
            min={samplingMeta.min}
            max={samplingMeta.max}
            step={samplingMeta.step}
            value={commercial.samplingCost}
            onChange={(e) => setCommercial("samplingCost", Number(e.target.value))}
            className="mt-1 h-1.5 w-full cursor-pointer accent-terracotta"
          />
          <span className="flex justify-between text-[11px] text-gray">
            <span>₹{samplingMeta.min}</span>
            <span>₹{samplingMeta.max}</span>
          </span>
        </label>
      </div>

      <div className="mb-3.5 grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-2.5">
        <div
          className={`rounded-[9px] border px-3 py-2.5 ${
            here?.pnl.feasible && here.pnl.pnl >= 0
              ? "border-good bg-good text-white"
              : "border-bad bg-bad text-white"
          }`}
        >
          <div className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-white/80">
            This session on the grid
          </div>
          <div className="mt-0.5 font-serif text-[22px] leading-[1.15]">
            {here?.pnl.feasible ? `₹${lakhs(here.pnl.pnl)}L` : "—"}
          </div>
          <div className="mt-0.5 text-[11px] text-white/80">
            AOV ₹{markAov.toLocaleString("en-IN")} · n {markN} · k={markK}
          </div>
        </div>
        <div className="rounded-[9px] border border-line bg-white px-3 py-2.5">
          <div className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-gray">
            Best pocket
          </div>
          <div className="mt-0.5 font-serif text-[22px] leading-[1.15] text-charcoal">
            {best ? `₹${lakhs(best.pnl.pnl)}L` : "—"}
          </div>
          <div className="mt-0.5 text-[11px] text-gray">
            {best
              ? `k=${best.k} · AOV ₹${best.aov.toLocaleString("en-IN")} · n ${best.n}`
              : "no feasible cell"}
          </div>
        </div>
        <div className="rounded-[9px] border border-line bg-white px-3 py-2.5">
          <div className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-gray">
            Break-even at k={markK}
          </div>
          <div className="mt-0.5 font-serif text-[18px] leading-[1.2] text-charcoal">
            {beAov != null ? `AOV ≥ ${rupees(beAov)}` : "none in range"}
          </div>
          <div className="mt-0.5 text-[11px] text-gray">
            {beN != null
              ? `at your AOV, n ≥ ${beN}`
              : "your AOV is not green at this k for any n"}
          </div>
        </div>
        <div className="rounded-[9px] border border-line bg-white px-3 py-2.5">
          <div className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-gray">
            Green share
          </div>
          <div className="mt-0.5 font-serif text-[22px] leading-[1.15] text-charcoal">
            {Math.round(grid.greenShare * 100)}%
          </div>
          <div className="mt-0.5 text-[11px] text-gray">of feasible AOV × n × k cells</div>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] text-gray">
        {(
          [
            ["deep-red", "heavy loss"],
            ["red", "loss"],
            ["amber", "thin / zero"],
            ["green", "profit"],
            ["deep-green", "strong"],
            ["infeasible", "no network"],
          ] as const
        ).map(([z, label]) => (
          <span key={z} className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ background: ZONE_COLORS[z] }}
            />
            {label}
          </span>
        ))}
        <span className="text-charcoal">· numbers are ₹ lakh / month</span>
      </div>

      <div className="grid grid-cols-1 gap-3.5 min-[900px]:grid-cols-2">
        {grid.slices.map((slice) => (
          <ZoneHeatmap
            key={slice.k}
            slice={slice}
            maxAbs={grid.maxAbs}
            markAov={markAov}
            markN={markN}
          />
        ))}
      </div>

      <p className="mt-[18px] border-t border-line pt-2.5 text-[11.5px] leading-[1.55] text-gray">
        <b className="text-charcoal">Reading:</b> four heatmaps are k = 1…4. Across them you
        have AOV, non-consults per consult, k, and sampling (the slider) — a 4-way map of where
        the city P&amp;L turns green. Order volume is held at scale; mix changes consults and
        therefore visit + sampling + advisors. Non-consult AOV moves in proportion to consult
        AOV from this session. The charcoal ring is the nearest grid cell to your P&amp;L
        settings.{" "}
        {best
          ? `The most favorable cell here is k=${best.k}, AOV ₹${best.aov.toLocaleString("en-IN")}, ${best.n} non-consults per consult.`
          : null}{" "}
        All figures are planning estimates.
      </p>

      <MethodologyDrawer open={methodOpen} onClose={() => setMethodOpen(false)} />
    </div>
  );
}
