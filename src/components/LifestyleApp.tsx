"use client";

import { useMemo, useState } from "react";
import { AppNav } from "@/components/AppNav";
import {
  LifestyleMixChart,
  LifestyleSweepChart,
  LifestyleVsConsultsChart,
} from "@/components/LifestyleCharts";
import { MethodologyDrawer } from "@/components/MethodologyDrawer";
import { useModel } from "@/components/ModelProvider";
import { integer, lakhs, rupees } from "@/model/format";
import {
  LIFESTYLE_AOV_MAX,
  LIFESTYLE_AOV_MIN,
  LIFESTYLE_DEFAULTS,
  clampLifestyleAov,
  lifestyleVsAttach,
  lifestyleVsConsults,
  lifestyleVsTicket,
  simulateLifestyle,
  type LifestyleLevers,
} from "@/model/lifestyle";
import { consultsFromNetwork } from "@/model/pnl";

export function LifestyleApp() {
  const { params, commercial } = useModel();
  const [methodOpen, setMethodOpen] = useState(false);
  const [levers, setLevers] = useState<LifestyleLevers>(LIFESTYLE_DEFAULTS);
  const consults = consultsFromNetwork(params);

  const sim = useMemo(
    () => simulateLifestyle(params, commercial, levers),
    [params, commercial, levers],
  );
  const vsConsults = useMemo(
    () => lifestyleVsConsults(params, commercial, levers),
    [params, commercial, levers],
  );
  const vsAttach = useMemo(() => lifestyleVsAttach(consults, levers), [consults, levers]);
  const vsTicket = useMemo(() => lifestyleVsTicket(consults, levers), [consults, levers]);

  function setAttach(v: number) {
    setLevers((prev) => ({ ...prev, attachPerConsult: v }));
  }
  function setGm(v: number) {
    setLevers((prev) => ({ ...prev, gm: v }));
  }
  function setAov(id: string, v: number) {
    setLevers((prev) => ({
      ...prev,
      categories: prev.categories.map((c) =>
        c.id === id ? { ...c, aov: clampLifestyleAov(v) } : c,
      ),
    }));
  }

  const { beauty, lifestyle } = sim;

  return (
    <div className="mx-auto max-w-[1180px] px-3.5 pb-[60px] pt-[18px]">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-terracotta">
            Belvie · Bengaluru
          </div>
          <h1 className="mt-1 font-serif text-[clamp(22px,3vw,32px)] font-normal text-charcoal">
            Lifestyle
          </h1>
          <p className="mt-0.5 max-w-[52rem] text-[13.5px] leading-[1.45] text-gray">
            Premium handbags, footwear and watches delivered to the same consulted customer.
            Frequency is lower than beauty — default 0.5 pieces per consult, ticket ₹8,000–20,000,
            margin 40%. This sits on top of existing P&L. It does not move S* or beauty inventory.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <AppNav active="lifestyle" />
          <button
            type="button"
            onClick={() => setMethodOpen(true)}
            className="rounded-full border border-line bg-white px-3 py-1.5 text-[12.5px] text-gray hover:border-terracotta hover:text-terracotta"
          >
            Methodology
          </button>
        </div>
      </header>

      <div className="mb-3.5 grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-2.5">
        <Stat
          lead
          label="Combined / month"
          value={`₹${lakhs(sim.combinedPnl)}L`}
          sub="beauty P&L + lifestyle GP"
        />
        <Stat
          label="Lifestyle GP"
          value={`₹${lakhs(lifestyle.gp)}L`}
          sub={`${rupees(lifestyle.gpPerConsult)} / consult · ${lifestyle.gm}% GM`}
        />
        <Stat
          label="Lifestyle revenue"
          value={`₹${lakhs(lifestyle.revenue)}L`}
          sub={`${integer(lifestyle.units)} pieces · AOV ${rupees(lifestyle.blendedAov)}`}
        />
        <Stat
          label="Beauty P&L"
          value={beauty.feasible ? `₹${lakhs(beauty.pnl)}L` : "—"}
          sub="unchanged · same S* and CAC"
        />
        <Stat
          label="Attach"
          value={`${lifestyle.attachPerConsult.toFixed(2)}`}
          sub={`pieces / consult · ${integer(consults)} visits`}
        />
      </div>

      <div className="mb-3.5 grid grid-cols-2 gap-2 min-[800px]:grid-cols-4">
        <Lever
          label="Pieces / consult"
          value={levers.attachPerConsult}
          min={0.1}
          max={1}
          step={0.05}
          format={(v) => v.toFixed(2)}
          onChange={setAttach}
        />
        <Lever
          label="Margin"
          value={levers.gm}
          min={25}
          max={55}
          step={1}
          format={(v) => `${v}%`}
          onChange={setGm}
        />
        {levers.categories.map((c) => (
          <Lever
            key={c.id}
            label={`${c.name} AOV`}
            value={c.aov}
            min={LIFESTYLE_AOV_MIN}
            max={LIFESTYLE_AOV_MAX}
            step={500}
            format={(v) => rupees(v)}
            onChange={(v) => setAov(c.id, v)}
          />
        ))}
      </div>

      <div className="mb-3.5 overflow-x-auto rounded-[10px] border border-line bg-white">
        <table className="w-full border-collapse text-[12.5px]">
          <thead>
            <tr>
              {["Line", "Share of 0.5", "AOV", "Pieces / mo", "Revenue", "GP"].map((h, i) => (
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
            {lifestyle.lines.map((l) => (
              <tr key={l.id}>
                <td className="border-b border-line px-2 py-1.5">
                  {l.name}
                  <span className="block text-[11px] text-gray">{l.meaning}</span>
                </td>
                <td className="border-b border-line px-2 py-1.5 text-right tabular-nums">
                  {(l.share * levers.attachPerConsult).toFixed(2)}
                </td>
                <td className="border-b border-line px-2 py-1.5 text-right font-serif tabular-nums">
                  {rupees(l.aov)}
                </td>
                <td className="border-b border-line px-2 py-1.5 text-right font-serif tabular-nums">
                  {integer(l.units)}
                </td>
                <td className="border-b border-line px-2 py-1.5 text-right font-serif tabular-nums">
                  ₹{lakhs(l.revenue)}L
                </td>
                <td className="border-b border-line px-2 py-1.5 text-right font-serif tabular-nums">
                  ₹{lakhs(l.gp)}L
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-3.5 grid grid-cols-1 gap-3.5 min-[900px]:grid-cols-2">
        <LifestyleMixChart row={lifestyle} />
        <LifestyleSweepChart
          title="Lifestyle GP vs attach rate"
          caption="How much extra GP if one consult sells 0.1 to 1.0 lifestyle pieces."
          xLabel="pieces / consult"
          pts={vsAttach}
          xKey="attachPerConsult"
          markX={levers.attachPerConsult}
          xFormat={(v) => v.toFixed(1)}
        />
        <LifestyleSweepChart
          title="Lifestyle GP vs ticket"
          caption="If every line sat at the same ticket inside ₹8,000–20,000."
          xLabel="ticket · ₹"
          pts={vsTicket}
          xKey="blendedAov"
          markX={lifestyle.blendedAov}
          xFormat={(v) => `₹${Math.round(v / 1000)}k`}
        />
        <LifestyleVsConsultsChart series={vsConsults} current={consults} />
      </div>

      <p className="mt-[18px] border-t border-line pt-2.5 text-[11.5px] leading-[1.55] text-gray">
        <b className="text-charcoal">What is not modelled:</b> extra van drops from lifestyle
        pieces, warehouse for bags/shoes/watches, or a second CAC. Pieces ride the existing
        consulted customer. Beauty GM, visit cost and S* stay on their own tabs.
      </p>

      <MethodologyDrawer open={methodOpen} onClose={() => setMethodOpen(false)} />
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  lead = false,
}: {
  label: string;
  value: string;
  sub: string;
  lead?: boolean;
}) {
  return (
    <div
      className={`rounded-[9px] border px-3 py-2.5 ${
        lead ? "border-charcoal bg-charcoal" : "border-line bg-white"
      }`}
    >
      <div
        className={`text-[9.5px] font-bold uppercase tracking-[0.1em] ${
          lead ? "text-delivery" : "text-gray"
        }`}
      >
        {label}
      </div>
      <div
        className={`mt-0.5 font-serif text-[25px] leading-[1.15] tabular-nums ${
          lead ? "text-white" : "text-charcoal"
        }`}
      >
        {value}
      </div>
      <div className={`mt-0.5 text-[11px] ${lead ? "text-delivery" : "text-gray"}`}>{sub}</div>
    </div>
  );
}

function Lever({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="rounded-[9px] border border-line bg-white px-3 py-2 text-[11px] text-gray">
      {label}
      <div className="font-serif text-[16px] text-charcoal tabular-nums">{format(value)}</div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full"
      />
    </label>
  );
}
