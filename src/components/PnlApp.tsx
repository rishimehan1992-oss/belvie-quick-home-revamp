"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AppNav } from "@/components/AppNav";
import { CustomerMetrics } from "@/components/CustomerMetrics";
import { MethodologyDrawer } from "@/components/MethodologyDrawer";
import { useModel } from "@/components/ModelProvider";
import { PnlVsConsultsChart, PnlVsKChart } from "@/components/PnlCharts";
import { PnlHero } from "@/components/PnlHero";
import { PnlInputs } from "@/components/PnlInputs";
import { integer, lakhs, rupees } from "@/model/format";
import {
  COMMERCIAL_META,
  breakEvenConsults,
  commercialFromNetwork,
  consultsFromNetwork,
  customerEconomics,
  nonConsultsPerConsult,
  ordersFromConsults,
  pnlVsConsults,
  pnlVsK,
  rhoFromNonConsultsPerConsult,
  solvePnl,
} from "@/model/pnl";
import type { CommercialLevers } from "@/components/ModelProvider";

function clamp(key: keyof typeof COMMERCIAL_META, value: number): number {
  const meta = COMMERCIAL_META[key];
  if (!Number.isFinite(value)) return meta.min;
  return Math.min(meta.max, Math.max(meta.min, value));
}

export function PnlApp() {
  const { params, dispatch, commercial, setCommercial } = useModel();
  const [methodOpen, setMethodOpen] = useState(false);

  const linked = useMemo(
    () => commercialFromNetwork(params, commercial),
    [params, commercial],
  );
  const point = useMemo(() => solvePnl(linked, params), [linked, params]);
  const eco = useMemo(
    () => customerEconomics(commercial, params, point.networkCpo),
    [commercial, params, point.networkCpo],
  );
  const vsConsults = useMemo(() => pnlVsConsults(linked, params), [linked, params]);
  const vsK = useMemo(() => pnlVsK(linked, params), [linked, params]);
  const breakEven = useMemo(() => breakEvenConsults(vsConsults), [vsConsults]);
  const consults = consultsFromNetwork(params);

  function setConsults(next: number) {
    const value = clamp("consults", next);
    dispatch({
      type: "set",
      key: "D",
      value: ordersFromConsults(value, params.phi, params.rho),
    });
  }

  function setLever(key: keyof CommercialLevers, value: number) {
    setCommercial(key, clamp(key, value));
  }

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
            Step 1 — set the commercial inputs. They become demand and mix for the network model.
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
          consults={consults}
          conversion={params.phi}
          k={params.k}
          rho={params.rho}
          orders={params.D}
          commercial={commercial}
          onConsults={setConsults}
          onConversion={(phi) => dispatch({ type: "set", key: "phi", value: phi })}
          onK={(k) => dispatch({ type: "set", key: "k", value: k })}
          onNonConsultsPerConsult={(n) =>
            dispatch({ type: "set", key: "rho", value: rhoFromNonConsultsPerConsult(n) })
          }
          onCommercial={setLever}
        />
        <div>
          <div className="mb-3.5 rounded-[10px] border border-line bg-card px-3.5 py-2.5 text-[12.5px] leading-[1.45] text-charcoal">
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-terracotta">
              Network optimum from these P&L inputs
            </span>
            <div className="mt-1 font-serif text-[17px]">
              {point.feasible
                ? `S* ${point.S} · ${point.H} hub${point.H === 1 ? "" : "s"} · ${integer(point.N ?? 0)} advisors · ₹${Math.round(point.networkCpo)} / order · ₹${lakhs(point.network)}L network`
                : "No feasible network at these P&L inputs"}
            </div>
            <div className="mt-0.5 text-[11.5px] text-gray">
              k={params.k} · {integer(params.D)} orders · {integer(consults)} consults · φ{" "}
              {params.phi}% · {nonConsultsPerConsult(params.rho).toFixed(2)} non-consults / consult.
              Next:{" "}
              <Link href="/network" className="text-terracotta no-underline hover:underline">
                size the network
              </Link>
              {" · "}
              <Link href="/sensitivity" className="text-terracotta no-underline hover:underline">
                sensitivity
              </Link>
              {" · "}
              <Link href="/favorable" className="text-terracotta no-underline hover:underline">
                favorable zones
              </Link>
              {" · "}
              <Link href="/growth" className="text-terracotta no-underline hover:underline">
                growth
              </Link>
            </div>
          </div>

          <PnlHero point={point} eco={eco} breakEven={breakEven} />
          <CustomerMetrics eco={eco} />

          <PnlVsConsultsChart series={vsConsults} current={consults} />
          <PnlVsKChart series={vsK} currentK={params.k} />

          <div className="mt-3.5 overflow-x-auto rounded-[10px] border border-line bg-white px-3.5 py-3">
            <h3 className="m-0 font-serif text-sm font-normal text-charcoal">
              P&L at the optimiser’s volume
            </h3>
            <table className="mt-2 w-full border-collapse text-xs">
              <thead>
                <tr>
                  {["Line", "₹ lakh / month", "₹ / customer"].map((h, i) => (
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
                <Row
                  label="Revenue"
                  month={point.revenue}
                  per={eco.revenueLtv}
                />
                <Row
                  label="COGS"
                  month={-point.cogs}
                  per={-(eco.revenueLtv - eco.gpLtv)}
                />
                <Row label="Gross profit" month={point.grossProfit} per={eco.gpLtv} strong />
                <Row
                  label="  Consult GP"
                  month={eco.consultGpLtv * eco.customersPerMonth}
                  per={eco.consultGpLtv}
                />
                <Row
                  label="  Non-consult GP"
                  month={eco.nonConsultGpLtv * eco.customersPerMonth}
                  per={eco.nonConsultGpLtv}
                />
                <Row
                  label="Visit CAC"
                  month={-point.visitAcq}
                  per={-eco.cac}
                />
                <Row
                  label="Sampling"
                  month={-point.sampling}
                  per={-eco.samplingPerCustomer}
                />
                <Row
                  label="Network (optimum)"
                  month={point.feasible ? -point.network : NaN}
                  per={point.feasible ? -eco.networkPerCustomer : NaN}
                />
                <Row
                  label="P&L"
                  month={point.feasible ? point.pnl : NaN}
                  per={point.feasible ? eco.contributionPerCustomer : NaN}
                  strong
                />
              </tbody>
            </table>
          </div>

          <p className="mt-[18px] border-t border-line pt-2.5 text-[11.5px] leading-[1.55] text-gray">
            <b className="text-charcoal">Flow:</b> P&L inputs set consults, conversion and
            non-consults per consult, which become order volume for the network. Network ₹ is that
            model’s cost-optimal S*.{" "}
            <b className="text-charcoal">Customer:</b> CAC = visit cost / conversion. Sampling is
            testers given on the visit, ₹{commercial.samplingCost} each, so ₹
            {Math.round(eco.samplingPerCustomer).toLocaleString("en-IN")} per acquired customer.
            Each acquired customer places 1 consult order plus N non-consult orders. Contribution /
            customer = GP LTV − CAC − sampling − network ₹/order × her orders. All figures are
            planning estimates.{" "}
            {breakEven
              ? `Break-even is about ${integer(breakEven)} consults / month at these settings.`
              : null}{" "}
            Per consult P&L {point.feasible ? rupees(point.pnlPerConsult) : "—"}.
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
  per,
  strong = false,
}: {
  label: string;
  month: number;
  per: number;
  strong?: boolean;
}) {
  return (
    <tr className={strong ? "bg-card font-bold text-charcoal" : "text-ink"}>
      <td className="border-b border-line px-2 py-1.5 text-left">{label}</td>
      <td className="border-b border-line px-2 py-1.5 text-right font-serif tabular-nums">
        {Number.isFinite(month) ? lakhs(month) : "—"}
      </td>
      <td className="border-b border-line px-2 py-1.5 text-right tabular-nums">
        {Number.isFinite(per) ? rupees(per) : "—"}
      </td>
    </tr>
  );
}
