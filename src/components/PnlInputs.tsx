"use client";

import { useState } from "react";
import { COMMERCIAL_META, NON_CONSULTS_PER_CONSULT_META, nonConsultsPerConsult } from "@/model/pnl";
import type { CommercialLevers } from "@/components/ModelProvider";

function SliderField({
  id,
  label,
  hint,
  value,
  min,
  max,
  step,
  unit,
  format,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  format?: (v: number) => string;
  onChange: (value: number) => void;
}) {
  const shown = format ? format(value) : String(value);

  return (
    <div className="mb-4">
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-[12.5px] leading-[1.25] text-charcoal">
          {label}
          {hint ? <span className="block text-[11px] text-gray">{hint}</span> : null}
        </label>
        <span className="font-serif text-[15px] tabular-nums text-charcoal">
          {shown}
          {unit ? <span className="text-[11px] text-gray"> {unit}</span> : null}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
      <input
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        aria-label={`${label} numeric`}
        value={Number.isInteger(step) ? Math.round(value) : value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1.5 w-full rounded-[5px] border border-line bg-white px-[7px] py-[5px] text-right text-[12.5px] text-ink tabular-nums focus:border-terracotta focus:outline-2 focus:outline-offset-1 focus:outline-terracotta"
      />
    </div>
  );
}

export function PnlInputs({
  consults,
  conversion,
  k,
  rho,
  orders,
  commercial,
  onConsults,
  onConversion,
  onK,
  onNonConsultsPerConsult,
  onCommercial,
}: {
  consults: number;
  conversion: number;
  k: number;
  rho: number;
  orders: number;
  commercial: CommercialLevers;
  onConsults: (value: number) => void;
  onConversion: (value: number) => void;
  onK: (value: number) => void;
  onNonConsultsPerConsult: (value: number) => void;
  onCommercial: (key: keyof CommercialLevers, value: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const c = COMMERCIAL_META.consults;
  const v = COMMERCIAL_META.visitCost;
  const s = COMMERCIAL_META.samplingCost;
  const a = COMMERCIAL_META.aov;
  const na = COMMERCIAL_META.nonConsultAov;
  const g = COMMERCIAL_META.gm;

  return (
    <aside className="rounded-[10px] border border-line bg-white p-[14px_15px]">
      <button
        type="button"
        className="mb-3 flex w-full items-center justify-between rounded-md border border-line px-3 py-2 text-left text-[13px] font-semibold text-charcoal min-[900px]:hidden"
        aria-expanded={open}
        onClick={() => setOpen((x) => !x)}
      >
        Unit economics
        <span className="text-[11px] uppercase tracking-[0.12em] text-terracotta">
          {open ? "Hide" : "Show"}
        </span>
      </button>

      <div className={`${open ? "block" : "hidden"} min-[900px]:block`}>
        <p className="mb-3 text-[11.5px] leading-[1.4] text-gray">
          Start here. Consults, conversion and non-consults per consult set order volume for the
          network. Visit cost, sampling, AOV and margin stay on this page; S* comes back from
          step 2.
        </p>
        <p className="mb-3 rounded-md bg-card px-2.5 py-2 text-[11.5px] text-charcoal">
          Feeds the network with{" "}
          <b className="font-serif">{Math.round(orders).toLocaleString("en-IN")}</b> orders / month
        </p>

        <fieldset className="mb-2 border-0 p-0">
          <legend className="mb-1.5 p-0 text-[10px] font-bold uppercase tracking-[0.12em] text-terracotta">
            Demand mix
          </legend>
          <div className="-my-0.5 mb-2 rounded-[7px] bg-card px-2.5 pt-2">
            <SliderField
              id="consults"
              label="Monthly consults"
              hint="sets network demand"
              value={consults}
              min={c.min}
              max={c.max}
              step={c.step}
              format={(n) => Math.round(n).toLocaleString("en-IN")}
              onChange={onConsults}
            />
          </div>
          <SliderField
            id="conversion"
            label="Conversion per visit"
            hint="feeds the network"
            value={conversion}
            min={5}
            max={100}
            step={1}
            unit="%"
            onChange={onConversion}
          />
          <SliderField
            id="k"
            label="k — consults per kit load"
            hint="feeds the network"
            value={k}
            min={1}
            max={10}
            step={1}
            onChange={onK}
          />
          <SliderField
            id="n"
            label="Non-consults per consult"
            hint={`${rho.toFixed(0)}% of all orders are non-consult`}
            value={Number(nonConsultsPerConsult(rho).toFixed(2))}
            min={NON_CONSULTS_PER_CONSULT_META.min}
            max={NON_CONSULTS_PER_CONSULT_META.max}
            step={NON_CONSULTS_PER_CONSULT_META.step}
            onChange={onNonConsultsPerConsult}
          />
        </fieldset>

        <fieldset className="mb-0 border-0 p-0">
          <legend className="mb-1.5 p-0 text-[10px] font-bold uppercase tracking-[0.12em] text-terracotta">
            Commercial
          </legend>
          <SliderField
            id="visitCost"
            label="Cost of one visit"
            hint="acquisition / ₹ per consult"
            value={commercial.visitCost}
            min={v.min}
            max={v.max}
            step={v.step}
            unit="₹"
            format={(n) => n.toLocaleString("en-IN")}
            onChange={(value) => onCommercial("visitCost", value)}
          />
          <SliderField
            id="samplingCost"
            label="Sampling cost per visit"
            hint="testers / kit given on the consult"
            value={commercial.samplingCost}
            min={s.min}
            max={s.max}
            step={s.step}
            unit="₹"
            format={(n) => n.toLocaleString("en-IN")}
            onChange={(value) => onCommercial("samplingCost", value)}
          />
          <SliderField
            id="aov"
            label="Consult AOV"
            hint="first order after a visit"
            value={commercial.aov}
            min={a.min}
            max={a.max}
            step={a.step}
            unit="₹"
            format={(n) => n.toLocaleString("en-IN")}
            onChange={(value) => onCommercial("aov", value)}
          />
          <SliderField
            id="nonConsultAov"
            label="Non-consult AOV"
            hint="reorder / no visit"
            value={commercial.nonConsultAov}
            min={na.min}
            max={na.max}
            step={na.step}
            unit="₹"
            format={(n) => n.toLocaleString("en-IN")}
            onChange={(value) => onCommercial("nonConsultAov", value)}
          />
          <SliderField
            id="gm"
            label="Gross margin"
            hint="after COGS, before network"
            value={commercial.gm}
            min={g.min}
            max={g.max}
            step={g.step}
            unit="%"
            onChange={(value) => onCommercial("gm", value)}
          />
        </fieldset>
      </div>
    </aside>
  );
}
