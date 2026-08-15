"use client";

import { useMemo, useState } from "react";
import { AppNav } from "@/components/AppNav";
import { MethodologyDrawer } from "@/components/MethodologyDrawer";
import { useModel } from "@/components/ModelProvider";
import { SweepChart } from "@/components/SweepChart";
import { integer } from "@/model/format";
import {
  commercialFromNetwork,
  nonConsultsPerConsult,
  pnlVsAov,
  pnlVsConversion,
  pnlVsGm,
  pnlVsK,
  pnlVsNonConsultAov,
  pnlVsNonConsultsPerConsult,
  pnlVsVisitCost,
} from "@/model/pnl";
import type { SweepPoint } from "@/model/pnl";

function kSeries(commercial: ReturnType<typeof commercialFromNetwork>, network: Parameters<typeof pnlVsK>[1]): SweepPoint[] {
  return pnlVsK(commercial, network).map((p, i) => ({ ...p, x: i + 1 }));
}

export function SensitivityApp() {
  const { params, commercial } = useModel();
  const [methodOpen, setMethodOpen] = useState(false);

  const linked = useMemo(
    () => commercialFromNetwork(params, commercial),
    [params, commercial],
  );
  const n = nonConsultsPerConsult(params.rho);

  const vsAov = useMemo(() => pnlVsAov(linked, params), [linked, params]);
  const vsNcAov = useMemo(() => pnlVsNonConsultAov(linked, params), [linked, params]);
  const vsN = useMemo(() => pnlVsNonConsultsPerConsult(linked, params), [linked, params]);
  const vsConv = useMemo(() => pnlVsConversion(linked, params), [linked, params]);
  const vsVisit = useMemo(() => pnlVsVisitCost(linked, params), [linked, params]);
  const vsGm = useMemo(() => pnlVsGm(linked, params), [linked, params]);
  const vsK = useMemo(() => kSeries(linked, params), [linked, params]);

  const rupee = (v: number) => `₹${Math.round(v).toLocaleString("en-IN")}`;

  return (
    <div className="mx-auto max-w-[1180px] px-3.5 pb-[60px] pt-[18px]">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-terracotta">
            Belvie · Bengaluru
          </div>
          <h1 className="mt-1 font-serif text-[clamp(22px,3vw,32px)] font-normal text-charcoal">
            Sensitivity
          </h1>
          <p className="mt-0.5 text-[13.5px] text-gray">
            P&L against each lever, re-using the Network cost optimum at every point.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <AppNav active="sensitivity" />
          <button
            type="button"
            onClick={() => setMethodOpen(true)}
            className="rounded-full border border-line bg-white px-3 py-1.5 text-[12.5px] text-gray hover:border-terracotta hover:text-terracotta"
          >
            Methodology
          </button>
        </div>
      </header>

      <div className="mb-3.5 rounded-[10px] border border-line bg-card px-3.5 py-2.5 text-[12.5px] leading-[1.45] text-charcoal">
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-terracotta">
          Now
        </span>
        <div className="mt-1 font-serif text-[17px]">
          Consult AOV {rupee(commercial.aov)} · non-consult AOV {rupee(commercial.nonConsultAov)} ·{" "}
          {n.toFixed(2)} non-consults / consult · φ {params.phi}% · visit ₹{commercial.visitCost} · GM{" "}
          {commercial.gm}% · k={params.k}
        </div>
        <div className="mt-0.5 text-[11.5px] text-gray">
          {integer(params.D)} orders / month from model 1. Dashed line is the current setting.
          Change levers on Network cost or P&L.
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3.5 min-[760px]:grid-cols-2">
        <SweepChart
          title="Sensitivity to consult AOV"
          caption="First-order ticket. Network cost does not move; gross profit and P&L do."
          xLabel="consult AOV · ₹"
          pts={vsAov}
          markX={commercial.aov}
          xFormat={rupee}
        />
        <SweepChart
          title="Sensitivity to non-consult AOV"
          caption="Reorder ticket. Same consult volume; only non-consult revenue changes."
          xLabel="non-consult AOV · ₹"
          pts={vsNcAov}
          markX={commercial.nonConsultAov}
          xFormat={rupee}
        />
        <SweepChart
          title="Sensitivity to non-consults per consult"
          caption="How many no-visit reorders follow one consult order. Demand and network re-solve."
          xLabel="non-consults per consult"
          pts={vsN}
          markX={Number(n.toFixed(2))}
        />
        <SweepChart
          title="Sensitivity to conversion"
          caption="Higher conversion means fewer consults for the same orders, so CAC and advisor load fall."
          xLabel="conversion · %"
          pts={vsConv}
          markX={params.phi}
          xFormat={(v) => `${v}%`}
        />
        <SweepChart
          title="Sensitivity to visit cost"
          caption="Acquisition cost per consult. Network is unchanged; P&L falls one-for-one with CAC."
          xLabel="visit cost · ₹"
          pts={vsVisit}
          markX={commercial.visitCost}
          xFormat={rupee}
        />
        <SweepChart
          title="Sensitivity to gross margin"
          caption="After COGS, before network and visit cost."
          xLabel="gross margin · %"
          pts={vsGm}
          markX={commercial.gm}
          xFormat={(v) => `${v}%`}
        />
        <SweepChart
          title="Sensitivity to k"
          caption="Consults per kit load. Network cost is the optimiser at each k."
          xLabel="k — consults per kit load"
          pts={vsK}
          markX={params.k}
        />
      </div>

      <p className="mt-[18px] border-t border-line pt-2.5 text-[11.5px] leading-[1.55] text-gray">
        <b className="text-charcoal">Reading:</b> terracotta is monthly P&L, sage is gross profit,
        charcoal is network cost. Axes are zoomed and include zero so a sign change is visible.
        Non-consults per consult is ρ/(1−ρ); two non-consults per consult means each acquired
        customer places one visit order and two reorders. All figures are planning estimates.
      </p>

      <MethodologyDrawer open={methodOpen} onClose={() => setMethodOpen(false)} />
    </div>
  );
}
