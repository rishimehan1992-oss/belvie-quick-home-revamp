"use client";

import { useMemo, useReducer, useState } from "react";
import { CostBySpokeChart } from "@/components/CostBySpokeChart";
import { HeroStats } from "@/components/HeroStats";
import { InputPanel } from "@/components/InputPanel";
import { InsightBanners } from "@/components/InsightBanners";
import { MethodologyDrawer } from "@/components/MethodologyDrawer";
import { SensitivityChart } from "@/components/SensitivityChart";
import { SolutionTable } from "@/components/SolutionTable";
import { DEFAULTS, PRESETS } from "@/model/defaults";
import { getInsights } from "@/model/insights";
import { normalise, optimise } from "@/model/solver";
import type { Params, ParamsAction } from "@/model/types";

function reducer(state: Params, action: ParamsAction): Params {
  switch (action.type) {
    case "set":
      return { ...state, [action.key]: action.value };
    case "preset":
      return { ...state, ...PRESETS[action.name] };
    default:
      return state;
  }
}

export function OptimiserApp() {
  const [params, dispatch] = useReducer(reducer, DEFAULTS);
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
            Network Cost Optimiser
          </h1>
          <p className="mt-0.5 text-[13.5px] text-gray">
            Change any input; the model re-solves.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setMethodOpen(true)}
          className="rounded-full border border-line bg-white px-3 py-1.5 text-[12.5px] text-gray hover:border-terracotta hover:text-terracotta"
        >
          Methodology
        </button>
      </header>

      <div className="grid items-start gap-5 min-[900px]:grid-cols-[308px_1fr]">
        <InputPanel params={params} dispatch={dispatch} />
        <div>
          <HeroStats best={result.best} params={params} />
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
            <b className="text-charcoal">What is optimised:</b> total recurring monthly cost = hub
            opex + spoke opex + advisor payroll + delivery, plus amortised capex if enabled. Demand
            is exogenous — the model chooses how cheaply to serve a fixed order volume, not how many
            orders to chase.{" "}
            <b className="text-charcoal">Binding constraints:</b> spoke throughput on a peak day,
            and van route duration inside the delivery slot.{" "}
            <b className="text-charcoal">Excluded:</b> COGS, kit BOM and tester replacement,
            marketing, technology, overhead, statutory loading on advisor cost. All figures are
            planning estimates derived from the inputs above, not observed operating data.
          </p>
        </div>
      </div>

      <MethodologyDrawer open={methodOpen} onClose={() => setMethodOpen(false)} />
    </div>
  );
}
