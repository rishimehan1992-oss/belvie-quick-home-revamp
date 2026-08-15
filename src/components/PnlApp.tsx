"use client";

import { useMemo, useState } from "react";
import { AppNav } from "@/components/AppNav";
import { MethodologyDrawer } from "@/components/MethodologyDrawer";
import { PnlVsConsultsChart, PnlVsKChart } from "@/components/PnlCharts";
import { PnlHero } from "@/components/PnlHero";
import { PnlInputs } from "@/components/PnlInputs";
import { DEFAULTS } from "@/model/defaults";
import { integer, lakhs, rupees } from "@/model/format";
import {
  COMMERCIAL_DEFAULTS,
  COMMERCIAL_META,
  breakEvenConsults,
  pnlVsConsults,
  pnlVsK,
  solvePnl,
} from "@/model/pnl";
import type { CommercialParams, Params } from "@/model/types";

function clampCommercial(key: keyof CommercialParams, value: number): number {
  const meta = COMMERCIAL_META[key];
  if (!Number.isFinite(value)) return meta.min;
  return Math.min(meta.max, Math.max(meta.min, value));
}

export function PnlApp() {
  const [commercial, setCommercial] = useState<CommercialParams>(COMMERCIAL_DEFAULTS);
  const [network, setNetwork] = useState<Params>(DEFAULTS);
  const [methodOpen, setMethodOpen] = useState(false);

  const point = useMemo(() => solvePnl(commercial, network), [commercial, network]);
  const vsConsults = useMemo(
    () => pnlVsConsults(commercial, network),
    [commercial, network],
  );
  const vsK = useMemo(() => pnlVsK(commercial, network), [commercial, network]);
  const breakEven = useMemo(() => breakEvenConsults(vsConsults), [vsConsults]);

  const gpPerConsult =
    commercial.consults > 0 ? point.grossProfit / commercial.consults : 0;
  const contribBeforeNetwork = gpPerConsult - commercial.visitCost;

  return (
    <div className="mx-auto max-w-[1180px] px-3.5 pb-[60px] pt-[18px]">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-terracotta">
            Belvie · Bengaluru
          </div>
          <h1 className="mt-1 font-serif text-[clamp(22px,3vw,32px)] font-normal text-charcoal">
            Network P&L
          </h1>
          <p className="mt-0.5 text-[13.5px] text-gray">
            Contribution as consults scale — visit cost, AOV, conversion, and margin are live.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <AppNav active="pnl" />
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
        <PnlInputs
          commercial={commercial}
          k={network.k}
          rho={network.rho}
          onCommercial={(key, value) =>
            setCommercial((prev) => ({ ...prev, [key]: clampCommercial(key, value) }))
          }
          onK={(k) => setNetwork((prev) => ({ ...prev, k }))}
          onRho={(rho) => setNetwork((prev) => ({ ...prev, rho }))}
        />
        <div>
          <PnlHero point={point} breakEven={breakEven} />

          <div className="mb-3.5 rounded-[10px] border border-line bg-white px-3.5 py-3 text-[12.5px] leading-[1.5] text-charcoal">
            <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-terracotta">
              Per consult
            </div>
            Expected orders {((commercial.conversion / 100) / (1 - network.rho / 100)).toFixed(2)}
            {" · "}
            Gross profit {rupees(gpPerConsult)}
            {" · "}
            Visit cost {rupees(commercial.visitCost)}
            {" · "}
            After visit {rupees(contribBeforeNetwork)}
            {" · "}
            Network {point.feasible ? rupees(point.network / commercial.consults) : "—"}
            {" · "}
            P&L {point.feasible ? rupees(point.pnlPerConsult) : "—"}
          </div>

          <PnlVsConsultsChart series={vsConsults} current={commercial.consults} />
          <PnlVsKChart series={vsK} currentK={network.k} />

          <div className="mt-3.5 overflow-x-auto rounded-[10px] border border-line bg-white px-3.5 py-3">
            <h3 className="m-0 font-serif text-sm font-normal text-charcoal">
              P&L at this volume
            </h3>
            <table className="mt-2 w-full border-collapse text-xs">
              <thead>
                <tr>
                  {["Line", "₹ lakh / month", "₹ / consult"].map((h, i) => (
                    <th
                      key={h}
                      className={`bg-charcoal px-2 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.05em] text-card ${
                        i === 0 ? "text-left" : "text-right"
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <Row label="Revenue" month={point.revenue} consult={point.revenue / commercial.consults} />
                <Row label="COGS" month={-point.cogs} consult={-point.cogs / commercial.consults} />
                <Row
                  label="Gross profit"
                  month={point.grossProfit}
                  consult={gpPerConsult}
                  strong
                />
                <Row
                  label="Visit acquisition"
                  month={-point.visitAcq}
                  consult={-commercial.visitCost}
                />
                <Row
                  label="Network (optimised)"
                  month={point.feasible ? -point.network : NaN}
                  consult={point.feasible ? -point.network / commercial.consults : NaN}
                />
                <Row
                  label="P&L"
                  month={point.feasible ? point.pnl : NaN}
                  consult={point.feasible ? point.pnlPerConsult : NaN}
                  strong
                />
              </tbody>
            </table>
          </div>

          <p className="mt-[18px] border-t border-line pt-2.5 text-[11.5px] leading-[1.55] text-gray">
            <b className="text-charcoal">Identity:</b> orders = consults × conversion / (1 − reorder
            share). Revenue = orders × AOV. Gross profit = revenue × gross margin. P&L = gross
            profit − (consults × visit cost) − network cost. Network cost is the optimiser at that
            order volume, using current k. Visit acquisition is a planning input, not an observed
            CAC. All figures are estimates, not operating data.{" "}
            {breakEven
              ? `Break-even is about ${integer(breakEven)} consults / month at these settings.`
              : null}
          </p>
        </div>
      </div>

      <MethodologyDrawer open={methodOpen} onClose={() => setMethodOpen(false)} />
    </div>
  );
}

function Row({
  label,
  month,
  consult,
  strong = false,
}: {
  label: string;
  month: number;
  consult: number;
  strong?: boolean;
}) {
  return (
    <tr className={strong ? "bg-card font-bold text-charcoal" : "text-ink"}>
      <td className="border-b border-line px-2 py-1.5 text-left">{label}</td>
      <td className="border-b border-line px-2 py-1.5 text-right font-serif tabular-nums">
        {Number.isFinite(month) ? lakhs(month) : "—"}
      </td>
      <td className="border-b border-line px-2 py-1.5 text-right tabular-nums">
        {Number.isFinite(consult) ? rupees(consult) : "—"}
      </td>
    </tr>
  );
}
