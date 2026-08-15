"use client";

import { useState } from "react";
import { COMMERCIAL_META } from "@/model/pnl";
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
  onRho,
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
  onRho: (value: number) => void;
  onCommercial: (key: keyof CommercialLevers, value: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const c = COMMERCIAL_META.consults;
  const v = COMMERCIAL_META.visitCost;
  const a = COMMERCIAL_META.aov;
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
          Linked to Network cost. Volume, conversion, k and reorder share write into that model;
          network ₹, S* and advisors are its optimum.
        </p>
        <p className="mb-3 rounded-md bg-card px-2.5 py-2 text-[11.5px] text-charcoal">
          Model 1 demand{" "}
          <b className="font-serif">{Math.round(orders).toLocaleString("en-IN")}</b> orders / month
        </p>

        <fieldset className="mb-2 border-0 p-0">
          <legend className="mb-1.5 p-0 text-[10px] font-bold uppercase tracking-[0.12em] text-terracotta">
            From the optimiser
          </legend>
          <div className="-my-0.5 mb-2 rounded-[7px] bg-card px-2.5 pt-2">
            <SliderField
              id="consults"
              label="Monthly consults"
              hint="sets model-1 order volume"
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
            hint="model 1 · φ"
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
            hint="model 1 lever"
            value={k}
            min={1}
            max={10}
            step={1}
            onChange={onK}
          />
          <SliderField
            id="rho"
            label="Reorder share"
            hint="non-consult orders · model 1"
            value={rho}
            min={0}
            max={90}
            step={5}
            unit="%"
            onChange={onRho}
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
            id="aov"
            label="Average order value"
            value={commercial.aov}
            min={a.min}
            max={a.max}
            step={a.step}
            unit="₹"
            format={(n) => n.toLocaleString("en-IN")}
            onChange={(value) => onCommercial("aov", value)}
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
