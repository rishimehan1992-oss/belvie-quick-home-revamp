"use client";

import { useState } from "react";
import { FIELD_META, PRESETS } from "@/model/defaults";
import type { Params, ParamsAction, PresetName } from "@/model/types";

const PRESET_LABELS: Record<PresetName, string> = {
  base: "Base case",
  worst: "Bangalore worst",
  fixed: "Kit fixed (k=3)",
};

function NumberField({
  id,
  label,
  hint,
  value,
  onChange,
}: {
  id: keyof Params;
  label: string;
  hint?: string;
  value: number;
  onChange: (key: keyof Params, value: number) => void;
}) {
  const meta = FIELD_META[id as Exclude<keyof Params, "incCap">];
  return (
    <div className="num-row mb-1.5 grid grid-cols-[1fr_82px] items-center gap-2">
      <label htmlFor={id} className="text-[12.5px] leading-[1.25] text-charcoal">
        {label}
        {hint ? <span className="block text-[11px] text-gray">{hint}</span> : null}
      </label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={meta.min}
        max={meta.max}
        step={meta.step}
        value={Number.isFinite(value) ? value : ""}
        onChange={(e) => {
          const next = e.target.value === "" ? meta.min : Number(e.target.value);
          onChange(id, next);
        }}
        onBlur={(e) => {
          const raw = Number(e.target.value);
          const clamped = Math.min(meta.max, Math.max(meta.min, Number.isFinite(raw) ? raw : meta.min));
          if (clamped !== value) onChange(id, clamped);
        }}
        className="w-full rounded-[5px] border border-line bg-white px-[7px] py-[5px] text-right text-[12.5px] text-ink tabular-nums focus:border-terracotta focus:outline-2 focus:outline-offset-1 focus:outline-terracotta"
      />
    </div>
  );
}

export function InputPanel({
  params,
  dispatch,
}: {
  params: Params;
  dispatch: (action: ParamsAction) => void;
}) {
  const [open, setOpen] = useState(false);
  const set = (key: keyof Params, value: number | boolean) =>
    dispatch({ type: "set", key, value });

  return (
    <aside className="rounded-[10px] border border-line bg-white p-[14px_15px]">
      <button
        type="button"
        className="mb-3 flex w-full items-center justify-between rounded-md border border-line px-3 py-2 text-left text-[13px] font-semibold text-charcoal min-[900px]:hidden"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        Assumptions
        <span className="text-[11px] uppercase tracking-[0.12em] text-terracotta">
          {open ? "Hide" : "Show"}
        </span>
      </button>

      <div className={`${open ? "block" : "hidden"} min-[900px]:block`}>
        <div className="mb-3.5 flex flex-wrap gap-1.5">
          {(Object.keys(PRESETS) as PresetName[]).map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => dispatch({ type: "preset", name })}
              className="cursor-pointer rounded-full border border-line bg-white px-2.5 py-1.5 text-[11.5px] text-gray hover:border-terracotta hover:text-terracotta"
            >
              {PRESET_LABELS[name]}
            </button>
          ))}
        </div>

        <fieldset className="mb-4 border-0 p-0">
          <legend className="mb-1.5 p-0 text-[10px] font-bold uppercase tracking-[0.12em] text-terracotta">
            The lever
          </legend>
          <div className="-my-0.5 mb-2.5 rounded-[7px] bg-card px-2.5 py-2 [&_.num-row]:mb-0">
            <NumberField
              id="k"
              label="k — consults per kit load"
              hint="before returning to the spoke"
              value={params.k}
              onChange={set}
            />
          </div>
        </fieldset>

        <fieldset className="mb-4 border-0 p-0">
          <legend className="mb-1.5 p-0 text-[10px] font-bold uppercase tracking-[0.12em] text-terracotta">
            Demand
          </legend>
          <NumberField id="D" label="Orders / month" value={params.D} onChange={set} />
          <NumberField id="A" label="Serviceable area" hint="km²" value={params.A} onChange={set} />
          <NumberField id="rho" label="Reorder share" hint="% no visit" value={params.rho} onChange={set} />
          <NumberField id="phi" label="Conversion" hint="%" value={params.phi} onChange={set} />
          <NumberField id="peak" label="Peak-day factor" value={params.peak} onChange={set} />
          <NumberField id="ddel" label="Delivery days / mo" value={params.ddel} onChange={set} />
          <NumberField id="dadv" label="Advisor days / mo" value={params.dadv} onChange={set} />
        </fieldset>

        <fieldset className="mb-4 border-0 p-0">
          <legend className="mb-1.5 p-0 text-[10px] font-bold uppercase tracking-[0.12em] text-terracotta">
            Advisor
          </legend>
          <NumberField id="mkAdv" label="Travel" hint="min / km" value={params.mkAdv} onChange={set} />
          <NumberField id="Tc" label="In-home consult" hint="min" value={params.Tc} onChange={set} />
          <NumberField id="Tkit" label="Kit rebuild at spoke" hint="min" value={params.Tkit} onChange={set} />
          <NumberField id="tintra" label="Home to home" hint="min" value={params.tintra} onChange={set} />
          <NumberField id="Tshift" label="Shift" hint="min" value={params.Tshift} onChange={set} />
          <NumberField id="Tadmin" label="Daily admin" hint="min" value={params.Tadmin} onChange={set} />
          <NumberField id="w" label="Cost" hint="₹ / month" value={params.w} onChange={set} />
        </fieldset>

        <fieldset className="mb-4 border-0 p-0">
          <legend className="mb-1.5 p-0 text-[10px] font-bold uppercase tracking-[0.12em] text-terracotta">
            Delivery
          </legend>
          <NumberField id="mkVan" label="Van travel" hint="min / km" value={params.mkVan} onChange={set} />
          <NumberField id="ct" label="Cost per trip" hint="₹" value={params.ct} onChange={set} />
          <NumberField id="Tslot" label="Slot length" hint="min" value={params.Tslot} onChange={set} />
          <NumberField id="thd" label="Handover / drop" hint="min" value={params.thd} onChange={set} />
          <NumberField id="thst" label="Society entry" hint="min" value={params.thst} onChange={set} />
          <NumberField id="qsoc" label="Orders / society / trip" value={params.qsoc} onChange={set} />
        </fieldset>

        <fieldset className="mb-4 border-0 p-0">
          <legend className="mb-1.5 p-0 text-[10px] font-bold uppercase tracking-[0.12em] text-terracotta">
            Network
          </legend>
          <NumberField id="fH" label="Hub opex" hint="₹ / month" value={params.fH} onChange={set} />
          <NumberField id="fS" label="Spoke opex" hint="₹ / month" value={params.fS} onChange={set} />
          <NumberField id="kapS" label="Spoke capacity" hint="orders / day" value={params.kapS} onChange={set} />
          <NumberField id="kapH" label="Hub capacity" hint="orders / mo" value={params.kapH} onChange={set} />
          <NumberField id="KH" label="Hub capex" hint="₹" value={params.KH} onChange={set} />
          <NumberField id="KS" label="Spoke capex" hint="₹" value={params.KS} onChange={set} />
          <NumberField id="Lam" label="Hub→spoke limit" hint="min" value={params.Lam} onChange={set} />
          <NumberField id="mkLine" label="Line-haul" hint="min / km" value={params.mkLine} onChange={set} />
          <NumberField id="tau" label="Road circuity τ" value={params.tau} onChange={set} />
          <NumberField id="beta" label="Tour constant β" value={params.beta} onChange={set} />
        </fieldset>

        <fieldset className="mb-0 border-0 p-0">
          <legend className="mb-1.5 p-0 text-[10px] font-bold uppercase tracking-[0.12em] text-terracotta">
            Capex treatment
          </legend>
          <label className="mb-1.5 flex items-center gap-1.5 text-[12.5px] text-charcoal">
            <input
              id="incCap"
              type="checkbox"
              checked={params.incCap}
              onChange={(e) => set("incCap", e.target.checked)}
              className="accent-terracotta"
            />
            Include capex in the objective
          </label>
          <NumberField id="coc" label="Cost of capital" hint="% p.a." value={params.coc} onChange={set} />
          <NumberField id="life" label="Asset life" hint="years" value={params.life} onChange={set} />
        </fieldset>
      </div>
    </aside>
  );
}
