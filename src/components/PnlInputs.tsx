"use client";

import { useState } from "react";
import { COMMERCIAL_META } from "@/model/pnl";
import type { CommercialParams } from "@/model/types";

function SliderField({
  id,
  label,
  hint,
  value,
  unit,
  format,
  onChange,
}: {
  id: keyof CommercialParams;
  label: string;
  hint?: string;
  value: number;
  unit?: string;
  format?: (v: number) => string;
  onChange: (key: keyof CommercialParams, value: number) => void;
}) {
  const meta = COMMERCIAL_META[id];
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
        min={meta.min}
        max={meta.max}
        step={meta.step}
        value={value}
        aria-valuemin={meta.min}
        aria-valuemax={meta.max}
        aria-valuenow={value}
        onChange={(e) => onChange(id, Number(e.target.value))}
        className="w-full"
      />
      <input
        type="number"
        inputMode="decimal"
        min={meta.min}
        max={meta.max}
        step={meta.step}
        aria-label={`${label} numeric`}
        value={value}
        onChange={(e) => onChange(id, Number(e.target.value))}
        className="mt-1.5 w-full rounded-[5px] border border-line bg-white px-[7px] py-[5px] text-right text-[12.5px] text-ink tabular-nums focus:border-terracotta focus:outline-2 focus:outline-offset-1 focus:outline-terracotta"
      />
    </div>
  );
}

export function PnlInputs({
  commercial,
  k,
  rho,
  onCommercial,
  onK,
  onRho,
}: {
  commercial: CommercialParams;
  k: number;
  rho: number;
  onCommercial: (key: keyof CommercialParams, value: number) => void;
  onK: (value: number) => void;
  onRho: (value: number) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <aside className="rounded-[10px] border border-line bg-white p-[14px_15px]">
      <button
        type="button"
        className="mb-3 flex w-full items-center justify-between rounded-md border border-line px-3 py-2 text-left text-[13px] font-semibold text-charcoal min-[900px]:hidden"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        Unit economics
        <span className="text-[11px] uppercase tracking-[0.12em] text-terracotta">
          {open ? "Hide" : "Show"}
        </span>
      </button>

      <div className={`${open ? "block" : "hidden"} min-[900px]:block`}>
      <p className="mb-3 text-[11.5px] leading-[1.4] text-gray">
        Every commercial lever is live. Network cost re-solves as consults, conversion, or k
        change.
      </p>

      <fieldset className="mb-2 border-0 p-0">
        <legend className="mb-1.5 p-0 text-[10px] font-bold uppercase tracking-[0.12em] text-terracotta">
          Volume
        </legend>
        <div className="-my-0.5 mb-2 rounded-[7px] bg-card px-2.5 pt-2">
          <SliderField
            id="consults"
            label="Monthly consults"
            hint="in-home visits"
            value={commercial.consults}
            format={(v) => v.toLocaleString("en-IN")}
            onChange={onCommercial}
          />
        </div>
      </fieldset>

      <fieldset className="mb-2 border-0 p-0">
        <legend className="mb-1.5 p-0 text-[10px] font-bold uppercase tracking-[0.12em] text-terracotta">
          Unit economics
        </legend>
        <SliderField
          id="visitCost"
          label="Cost of one visit"
          hint="acquisition / ₹ per consult"
          value={commercial.visitCost}
          unit="₹"
          format={(v) => v.toLocaleString("en-IN")}
          onChange={onCommercial}
        />
        <SliderField
          id="aov"
          label="Average order value"
          value={commercial.aov}
          unit="₹"
          format={(v) => v.toLocaleString("en-IN")}
          onChange={onCommercial}
        />
        <SliderField
          id="conversion"
          label="Conversion per visit"
          value={commercial.conversion}
          unit="%"
          onChange={onCommercial}
        />
        <SliderField
          id="gm"
          label="Gross margin"
          hint="after COGS, before network"
          value={commercial.gm}
          unit="%"
          onChange={onCommercial}
        />
      </fieldset>

      <fieldset className="mb-0 border-0 p-0">
        <legend className="mb-1.5 p-0 text-[10px] font-bold uppercase tracking-[0.12em] text-terracotta">
          Network levers
        </legend>
        <div className="mb-4">
          <div className="mb-1 flex items-baseline justify-between gap-2">
            <label htmlFor="pnl-k" className="text-[12.5px] text-charcoal">
              k — consults per kit load
              <span className="block text-[11px] text-gray">before returning to the spoke</span>
            </label>
            <span className="font-serif text-[15px] tabular-nums text-charcoal">{k}</span>
          </div>
          <input
            id="pnl-k"
            type="range"
            min={1}
            max={10}
            step={1}
            value={k}
            onChange={(e) => onK(Number(e.target.value))}
          />
        </div>
        <div>
          <div className="mb-1 flex items-baseline justify-between gap-2">
            <label htmlFor="pnl-rho" className="text-[12.5px] text-charcoal">
              Reorder share
              <span className="block text-[11px] text-gray">% of orders with no visit</span>
            </label>
            <span className="font-serif text-[15px] tabular-nums text-charcoal">{rho}%</span>
          </div>
          <input
            id="pnl-rho"
            type="range"
            min={0}
            max={90}
            step={5}
            value={rho}
            onChange={(e) => onRho(Number(e.target.value))}
          />
        </div>
      </fieldset>
      </div>
    </aside>
  );
}
