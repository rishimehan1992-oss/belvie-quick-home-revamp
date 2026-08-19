"use client";

import { useMemo, useState } from "react";
import { AppNav } from "@/components/AppNav";
import {
  LifestyleCompareChart,
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
  type PnlCompareRow,
  type UnitCompareRow,
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

  const { beauty, lifestyle, compare } = sim;
  const beautyPnl = beauty.feasible ? beauty.pnl : NaN;

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
            Beauty only vs beauty + handbags on the same consult. Attach is 0.2 handbags per visit
            — not 0.2 of each line, and not a bags+footwear+watches mix. Footwear and watches are
            out. Ticket ₹8,000–20,000, margin 40%. Visit CAC, sampling and S* stay on beauty.
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
          label="Beauty only"
          value={beauty.feasible ? `₹${lakhs(beautyPnl)}L` : "—"}
          sub={`P&L · S* ${beauty.S ?? "—"} · ${rupees(beauty.pnlPerConsult)} / consult`}
        />
        <Stat
          label="Beauty + handbags"
          value={beauty.feasible ? `₹${lakhs(compare.combinedPnl)}L` : "—"}
          sub={`${rupees(beauty.feasible ? beauty.pnlPerConsult + lifestyle.gpPerConsult : NaN)} / consult`}
        />
        <Stat
          label="Lift"
          value={beauty.feasible ? `+₹${lakhs(compare.lift)}L` : "—"}
          sub="handbag GP on the same visits"
        />
        <Stat
          label="Handbag GP"
          value={`₹${lakhs(lifestyle.gp)}L`}
          sub={`${integer(lifestyle.units)} pieces · AOV ${rupees(lifestyle.blendedAov)}`}
        />
        <Stat
          label="Handbags / consult"
          value={`${lifestyle.attachPerConsult.toFixed(2)}`}
          sub={`not a mix · ${integer(consults)} visits`}
        />
      </div>

      <div className="mb-3.5 rounded-[10px] border border-line bg-card px-3.5 py-3 text-[13px] leading-[1.55] text-ink">
        <b className="text-charcoal">What stays the same:</b> visit CAC {rupees(beauty.visitAcq)}{" "}
        / month, sampling {rupees(beauty.sampling)}, network {beauty.feasible ? rupees(beauty.network) : "—"}{" "}
        (S* {beauty.S ?? "—"} · {integer(beauty.N ?? 0)} advisors · {rupees(beauty.networkCpo)} / order).{" "}
        <b className="text-charcoal">What changes:</b> extra revenue {rupees(lifestyle.revenue)}, extra
        GP {rupees(lifestyle.gp)}, P&L / consult {rupees(beauty.pnlPerConsult)} →{" "}
        {rupees(beauty.feasible ? beauty.pnlPerConsult + lifestyle.gpPerConsult : NaN)}, contribution /
        customer {rupees(sim.eco.contributionPerCustomer)} →{" "}
        {rupees(sim.eco.contributionPerCustomer + lifestyle.gp / compare.customers)}. No second CAC.
      </div>

      <div className="mb-3.5 grid grid-cols-2 gap-2 min-[800px]:grid-cols-3">
        <Lever
          label="Handbags / consult"
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

      <ComparePnlTable rows={compare.pnl} />
      <CompareUnitTable rows={compare.units} />

      <div className="mb-3.5 overflow-x-auto rounded-[10px] border border-line bg-white">
        <table className="w-full border-collapse text-[12.5px]">
          <thead>
            <tr>
              {["Line", "Bags / consult", "AOV", "Pieces / mo", "Revenue", "GP"].map((h, i) => (
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
        <LifestyleCompareChart compare={compare} />
        <LifestyleMixChart row={lifestyle} />
        <LifestyleSweepChart
          title="Handbag GP vs attach rate"
          caption="Extra GP if one consult sells 0.1 to 1.0 handbags — handbags only, not a mix."
          xLabel="handbags / consult"
          pts={vsAttach}
          xKey="attachPerConsult"
          markX={levers.attachPerConsult}
          xFormat={(v) => v.toFixed(1)}
        />
        <LifestyleSweepChart
          title="Handbag GP vs ticket"
          caption="If the handbag sat at the same ticket inside ₹8,000–20,000."
          xLabel="ticket · ₹"
          pts={vsTicket}
          xKey="blendedAov"
          markX={lifestyle.blendedAov}
          xFormat={(v) => `₹${Math.round(v / 1000)}k`}
        />
        <LifestyleVsConsultsChart series={vsConsults} current={consults} />
      </div>

      <p className="mt-[18px] border-t border-line pt-2.5 text-[11.5px] leading-[1.55] text-gray">
        <b className="text-charcoal">What is not modelled:</b> extra van drops from handbags,
        a bag warehouse, footwear, watches, or a second CAC. Attach is 0.2 handbags / consult on
        the existing visit. Per-customer LTV puts funnel GP (including visits that do not convert)
        on acquired customers, same as visit CAC. Beauty GM, visit cost and S* stay on their own tabs.
      </p>

      <MethodologyDrawer open={methodOpen} onClose={() => setMethodOpen(false)} />
    </div>
  );
}

function signedLakhs(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (Math.abs(n) < 0.5) return "0";
  return `${n > 0 ? "+" : "−"}₹${lakhs(Math.abs(n))}L`;
}

function signedRupees(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (Math.abs(n) < 0.5) return "0";
  const mag = `₹${Math.round(Math.abs(n)).toLocaleString("en-IN")}`;
  if (n > 0) return `+${mag}`;
  if (n < 0) return `−${mag}`;
  return mag;
}

function unitValue(n: number, format: UnitCompareRow["format"]): string {
  if (!Number.isFinite(n)) return "—";
  if (format === "x") return `${n.toFixed(2)}×`;
  if (format === "num") return n.toFixed(2);
  return rupees(n);
}

function unitDelta(n: number, format: UnitCompareRow["format"]): string {
  if (!Number.isFinite(n)) return "—";
  if (Math.abs(n) < 1e-9) return "0";
  if (format === "x") return `${n > 0 ? "+" : ""}${n.toFixed(2)}×`;
  if (format === "num") return `${n > 0 ? "+" : ""}${n.toFixed(2)}`;
  return signedRupees(n);
}

function deltaTone(n: number, unchanged?: boolean): string {
  if (unchanged || !Number.isFinite(n) || Math.abs(n) < 1e-9) return "text-gray";
  return n > 0 ? "text-[#4A7A5C]" : "text-terracotta";
}

function ComparePnlTable({ rows }: { rows: PnlCompareRow[] }) {
  return (
    <div className="mb-3.5 overflow-x-auto rounded-[10px] border border-line bg-white">
      <div className="border-b border-line px-3.5 py-3">
        <h2 className="m-0 font-serif text-base font-normal text-charcoal">
          Complete P&L · beauty only vs beauty + lifestyle
        </h2>
        <p className="mb-0 mt-1 text-[13px] leading-[1.5] text-gray">
          ₹ lakh / month. Visit CAC, sampling and network do not move. Combined P&L = beauty P&L +
          lifestyle GP.
        </p>
      </div>
      <table className="w-full border-collapse text-[12.5px]">
        <thead>
          <tr>
            {["Line", "Beauty only", "Lifestyle", "Combined", "Δ"].map((h, i) => (
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
          {rows.map((r) => (
            <tr
              key={r.key}
              className={r.strong ? "bg-card font-bold text-charcoal" : "text-ink"}
            >
              <td className="border-b border-line px-2 py-1.5">
                {r.label}
                {r.unchanged ? (
                  <span className="ml-1.5 text-[10px] font-normal uppercase tracking-[0.06em] text-gray">
                    same
                  </span>
                ) : null}
              </td>
              <td className="border-b border-line px-2 py-1.5 text-right font-serif tabular-nums">
                {Number.isFinite(r.beauty) ? `₹${lakhs(r.beauty)}L` : "—"}
              </td>
              <td className="border-b border-line px-2 py-1.5 text-right font-serif tabular-nums text-gray">
                {r.unchanged ? "—" : `₹${lakhs(r.lifestyle)}L`}
              </td>
              <td className="border-b border-line px-2 py-1.5 text-right font-serif tabular-nums">
                {Number.isFinite(r.combined) ? `₹${lakhs(r.combined)}L` : "—"}
              </td>
              <td
                className={`border-b border-line px-2 py-1.5 text-right font-serif tabular-nums ${deltaTone(r.delta, r.unchanged)}`}
              >
                {r.unchanged ? "0" : signedLakhs(r.delta)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CompareUnitTable({ rows }: { rows: UnitCompareRow[] }) {
  return (
    <div className="mb-3.5 overflow-x-auto rounded-[10px] border border-line bg-white">
      <div className="border-b border-line px-3.5 py-3">
        <h2 className="m-0 font-serif text-base font-normal text-charcoal">
          Unit economics · what changes on the same visit
        </h2>
        <p className="mb-0 mt-1 text-[13px] leading-[1.5] text-gray">
          Per consult is the visit. Per customer puts funnel GP on acquired customers, same as CAC =
          visit cost / conversion. Network ₹/order and beauty AOV stay put.
        </p>
      </div>
      <table className="w-full border-collapse text-[12.5px]">
        <thead>
          <tr>
            {["Metric", "Beauty only", "Beauty + lifestyle", "Δ"].map((h, i) => (
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
          {rows.map((r) => (
            <tr
              key={r.key}
              className={r.strong ? "bg-card font-bold text-charcoal" : "text-ink"}
            >
              <td className="border-b border-line px-2 py-1.5">
                {r.label}
                {r.unchanged ? (
                  <span className="ml-1.5 text-[10px] font-normal uppercase tracking-[0.06em] text-gray">
                    same
                  </span>
                ) : null}
              </td>
              <td className="border-b border-line px-2 py-1.5 text-right font-serif tabular-nums">
                {unitValue(r.beauty, r.format)}
              </td>
              <td className="border-b border-line px-2 py-1.5 text-right font-serif tabular-nums">
                {unitValue(r.combined, r.format)}
              </td>
              <td
                className={`border-b border-line px-2 py-1.5 text-right font-serif tabular-nums ${deltaTone(r.delta, r.unchanged)}`}
              >
                {unitDelta(r.delta, r.format)}
              </td>
            </tr>
          ))}
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
