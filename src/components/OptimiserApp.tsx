"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AppNav } from "@/components/AppNav";
import { CostBySpokeChart } from "@/components/CostBySpokeChart";
import { CostStack } from "@/components/CostStack";
import { HeroStats } from "@/components/HeroStats";
import { InputPanel } from "@/components/InputPanel";
import { InsightBanners } from "@/components/InsightBanners";
import { MethodologyDrawer } from "@/components/MethodologyDrawer";
import { useModel } from "@/components/ModelProvider";
import { SensitivityChart } from "@/components/SensitivityChart";
import { SolutionTable } from "@/components/SolutionTable";
import { getInsights } from "@/model/insights";
import { consultsFromNetwork } from "@/model/pnl";
import { normalise, optimise } from "@/model/solver";

export function OptimiserApp() {
  const { params, dispatch, commercial } = useModel();
  const consults = consultsFromNetwork(params);
  const [methodOpen, setMethodOpen] = useState(false);

  const solverParams = useMemo(() => normalise(params), [params]);
  const result = useMemo(() => optimise(solverParams), [solverParams]);
  const insights = useMemo(
    () => getInsights(solverParams, result),
    [solverParams, result],
  );

  return (
    <div className="mx-auto max-w-[1180px] px-3.5 pb-[60px] pt-[18px]">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-terracotta">
            Belvie · Bengaluru
          </div>
          <h1 className="mt-1 font-serif text-[clamp(22px,3vw,32px)] font-normal text-charcoal">
            Network cost
          </h1>
          <p className="mt-0.5 text-[13.5px] text-gray">
            Step 2 — size the network from the P&L demand mix. S* and ₹/order feed P&L and sensitivity.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <AppNav active="network" />
          <button
            type="button"
            onClick={() => setMethodOpen(true)}
            className="rounded-full border border-line bg-white px-3 py-1.5 text-[12.5px] text-gray hover:border-terracotta hover:text-terracotta"
          >
            Methodology
          </button>
        </div>
      </header>

      <div className="grid items-start gap-5 min-[900px]:grid-cols-[308px_1fr]">
        <InputPanel params={params} dispatch={dispatch} />
        <div>
          <HeroStats
            best={result.best}
            params={params}
            samplingCost={commercial.samplingCost}
            consults={consults}
          />
          <CostStack
            best={result.best}
            consults={consults}
            samplingCost={commercial.samplingCost}
            visitCost={commercial.visitCost}
          />
          <InsightBanners insights={insights} />
          <CostBySpokeChart
            rows={result.rows}
            best={result.best}
            kapS={params.kapS}
            peak={params.peak}
          />
          <SensitivityChart params={solverParams} />
          <SolutionTable rows={result.rows} best={result.best} />
          <p className="mt-[18px] border-t border-line pt-2.5 text-[11.5px] leading-[1.55] text-gray">
            <b className="text-charcoal">What is optimised:</b> hub opex + spoke opex + advisor
            payroll + delivery, plus amortised capex if enabled. Sampling ({consults.toLocaleString("en-IN")}{" "}
            visits × ₹{commercial.samplingCost}) and visit CAC sit on P&L — they are in the stack
            above but they do not move S*. Demand comes from consults × conversion / (1 − reorder
            mix).{" "}
            <b className="text-charcoal">Next:</b>{" "}
            <Link href="/sensitivity" className="text-terracotta no-underline hover:underline">
              sensitivity
            </Link>{" "}
            sweeps those same P&L inputs across this optimum.{" "}
            <Link href="/growth" className="text-terracotta no-underline hover:underline">
              Growth
            </Link>{" "}
            copies the city model from 100 to 25,000 orders a day across ten metros.{" "}
            <b className="text-charcoal">Binding constraints:</b> spoke throughput on a peak day,
            and van route duration inside the delivery slot. All figures are planning estimates
            derived from the inputs above, not observed operating data.
          </p>
        </div>
      </div>

      <MethodologyDrawer open={methodOpen} onClose={() => setMethodOpen(false)} />
    </div>
  );
}
