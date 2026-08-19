"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { integer } from "@/model/format";
import {
  HUB_EXTRA_TARGET,
  HUB_SKU_TARGET,
  ROLE_LABEL,
  SPOKE_SKU_TARGET,
  type AssortmentInsight,
  type AssortmentLevers,
} from "@/model/assortment";

const GY = "#6B6560";
const LN = "#E4D8D0";
const TE = "#BA5D42";
const CH = "#2B2622";
const DE = "#C9BEB6";
const CLASS_COLOR = { A: TE, B: CH, C: "#8C9A8E" };

export function InventoryCharts({ row }: { row: AssortmentInsight }) {
  const cats = row.tree.categories.map((c) => ({
    name: c.name.replace(" & ", " / "),
    spoke: c.spokeSkus,
    extra: c.hubExtraSkus,
  }));
  const classes = row.classes.map((c) => ({
    name: c.id,
    waves: Math.round(c.wavesNetworkMonth),
    fill: CLASS_COLOR[c.id],
  }));

  return (
    <div className="mb-3.5 grid grid-cols-1 gap-3.5 min-[900px]:grid-cols-2">
      <div className="rounded-[10px] border border-line bg-white px-3.5 pt-3 pb-2">
        <h3 className="m-0 font-serif text-sm font-normal text-charcoal">
          SKUs by category · spoke vs hub extra
        </h3>
        <p className="mb-2 mt-0.5 text-[11.5px] leading-[1.4] text-gray">
          Stacked bars add to {integer(HUB_SKU_TARGET)} (inside 1,200–1,300). Terracotta is the{" "}
          {integer(SPOKE_SKU_TARGET)} fast movers (inside 800–900).
        </p>
        <div className="h-[340px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={cats}
              layout="vertical"
              margin={{ top: 8, right: 16, left: 4, bottom: 4 }}
            >
              <CartesianGrid stroke="#F2EAE5" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: GY, fontSize: 10 }}
                axisLine={{ stroke: LN }}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={148}
                tick={{ fill: GY, fontSize: 10 }}
                axisLine={{ stroke: LN }}
                tickLine={false}
              />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11, color: GY }} />
              <Bar dataKey="spoke" name="Fast moving" stackId="s" fill={TE} isAnimationActive={false} />
              <Bar dataKey="extra" name="Slow extra" stackId="s" fill={DE} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-[10px] border border-line bg-white px-3.5 pt-3 pb-2">
        <h3 className="m-0 font-serif text-sm font-normal text-charcoal">
          Replenishment waves / month
        </h3>
        <p className="mb-2 mt-0.5 text-[11.5px] leading-[1.4] text-gray">
          SKUs × locations × (30 / days of cover). A moves ~3× a month; C less than once.
        </p>
        <div className="h-[340px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={classes} margin={{ top: 12, right: 12, left: 4, bottom: 4 }}>
              <CartesianGrid stroke="#F2EAE5" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: GY, fontSize: 11 }} axisLine={{ stroke: LN }} tickLine={false} />
              <YAxis tick={{ fill: GY, fontSize: 10 }} axisLine={{ stroke: LN }} tickLine={false} width={44} />
              <Tooltip formatter={(v: unknown) => [integer(Number(v ?? 0)), "waves / month"]} />
              <Bar dataKey="waves" maxBarSize={56} radius={[3, 3, 0, 0]} isAnimationActive={false}>
                {classes.map((d) => (
                  <Cell key={d.name} fill={d.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export function SkuSumTable({ row }: { row: AssortmentInsight }) {
  return (
    <div className="mb-3.5 overflow-x-auto rounded-[10px] border border-line bg-white">
      <div className="border-b border-line px-3.5 py-3">
        <h2 className="m-0 font-serif text-base font-normal text-charcoal">
          How it adds to {integer(HUB_SKU_TARGET)}
        </h2>
        <p className="mb-0 mt-1 text-[13px] leading-[1.5] text-gray">
          Fast moving {integer(SPOKE_SKU_TARGET)} (inside 800–900) + slow extra{" "}
          {integer(HUB_EXTRA_TARGET)} = catalog {integer(HUB_SKU_TARGET)} (inside 1,200–1,300). Colour
          cosmetics first: lips, complexion, cheeks, eyes. Nail colour, tinted primer and limited
          drops sit at the edge.
        </p>
      </div>
      <table className="w-full border-collapse text-[12.5px]">
        <thead>
          <tr>
            {["Category", "Fast moving", "Slow extra", "Catalog"].map((h, i) => (
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
          {row.tree.categories.map((c) => (
            <tr key={c.id} className="text-ink">
              <td className="border-b border-line px-2 py-1.5">{c.name}</td>
              <td className="border-b border-line px-2 py-1.5 text-right font-serif tabular-nums">
                {integer(c.spokeSkus)}
              </td>
              <td className="border-b border-line px-2 py-1.5 text-right font-serif tabular-nums">
                {integer(c.hubExtraSkus)}
              </td>
              <td className="border-b border-line px-2 py-1.5 text-right font-serif tabular-nums">
                {integer(c.spokeSkus + c.hubExtraSkus)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-card text-charcoal">
            <td className="px-2 py-2 font-semibold">
              Total · {integer(SPOKE_SKU_TARGET)} + {integer(HUB_EXTRA_TARGET)} = {integer(HUB_SKU_TARGET)}
            </td>
            <td className="px-2 py-2 text-right font-serif tabular-nums font-semibold">
              {integer(row.tree.spokeSkus)}
            </td>
            <td className="px-2 py-2 text-right font-serif tabular-nums font-semibold">
              {integer(row.tree.hubExtraSkus)}
            </td>
            <td className="px-2 py-2 text-right font-serif tabular-nums font-semibold">
              {integer(row.tree.hubSkus)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export function InventoryLevers({
  levers,
  onChange,
}: {
  levers: AssortmentLevers;
  onChange: (next: AssortmentLevers) => void;
}) {
  const set = (key: keyof AssortmentLevers, value: number) => onChange({ ...levers, [key]: value });
  return (
    <div className="mb-3.5 grid grid-cols-2 gap-2 min-[700px]:grid-cols-5">
      <Lever
        label="Units / order"
        value={levers.unitsPerOrder}
        min={1}
        max={3}
        step={0.1}
        onChange={(v) => set("unitsPerOrder", v)}
      />
      <Lever label="A cover · days" value={levers.coverA} min={5} max={21} step={1} onChange={(v) => set("coverA", v)} />
      <Lever label="B cover · days" value={levers.coverB} min={10} max={40} step={1} onChange={(v) => set("coverB", v)} />
      <Lever label="C cover · days" value={levers.coverC} min={21} max={60} step={1} onChange={(v) => set("coverC", v)} />
      <Lever
        label="Spoke unit share"
        value={Math.round(levers.spokeUnitShare * 100)}
        min={70}
        max={95}
        step={1}
        suffix="%"
        onChange={(v) => set("spokeUnitShare", v / 100)}
      />
    </div>
  );
}

function Lever({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="rounded-[9px] border border-line bg-white px-3 py-2 text-[11px] text-gray">
      {label}
      <div className="font-serif text-[16px] text-charcoal tabular-nums">
        {suffix ? `${value}${suffix}` : value}
      </div>
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

export function InventoryTables({ row }: { row: AssortmentInsight }) {
  const [open, setOpen] = useState<string | null>(row.tree.categories[0]?.id ?? null);
  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-[10px] border border-line bg-white">
        <table className="w-full border-collapse text-[12.5px]">
          <thead>
            <tr>
              {["Class", "Place", "SKUs", "Unit share", "Cover", "Units / SKU / mo", "Replace / SKU / mo", "Waves / mo"].map(
                (h, i) => (
                  <th
                    key={h}
                    className={`bg-charcoal px-2 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.05em] text-card ${
                      i === 0 || i === 1 ? "text-left" : "text-right"
                    }`}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {row.classes.map((c) => (
              <tr key={c.id} className="text-ink">
                <td className="border-b border-line px-2 py-1.5">
                  {c.id} · {c.label}
                </td>
                <td className="border-b border-line px-2 py-1.5 text-gray">{c.place}</td>
                <td className="border-b border-line px-2 py-1.5 text-right font-serif tabular-nums">
                  {integer(c.skus)}
                </td>
                <td className="border-b border-line px-2 py-1.5 text-right tabular-nums">
                  {Math.round(c.unitShare * 100)}%
                </td>
                <td className="border-b border-line px-2 py-1.5 text-right tabular-nums">{c.coverDays} d</td>
                <td className="border-b border-line px-2 py-1.5 text-right font-serif tabular-nums">
                  {c.unitsPerSkuMonth.toFixed(1)}
                </td>
                <td className="border-b border-line px-2 py-1.5 text-right font-serif tabular-nums">
                  {c.replenishPerSkuMonth.toFixed(2)}×
                </td>
                <td className="border-b border-line px-2 py-1.5 text-right font-serif tabular-nums">
                  {integer(c.wavesNetworkMonth)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-[10px] border border-line bg-white px-3.5 py-3">
        <h3 className="m-0 font-serif text-sm font-normal text-charcoal">Lines in the colour edit</h3>
        <p className="mb-2 mt-0.5 text-[11.5px] text-gray">
          Planning line roles, not signed contracts. Open a category to see house / lab partner / artist
          collab / value / specialist.
        </p>
        <div className="flex flex-wrap gap-1.5">
          {row.tree.categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setOpen(c.id)}
              className={`rounded-full border px-2.5 py-1 text-[11.5px] ${
                open === c.id
                  ? "border-charcoal bg-charcoal text-white"
                  : "border-line bg-white text-gray hover:border-terracotta hover:text-terracotta"
              }`}
            >
              {c.name} · {c.spokeSkus + c.hubExtraSkus}
            </button>
          ))}
        </div>
        {row.tree.categories
          .filter((c) => c.id === open)
          .map((c) => (
            <div key={c.id} className="mt-3">
              <p className="mt-0 mb-2 text-[12px] text-gray">{c.meaning}</p>
              <table className="w-full border-collapse text-[12.5px]">
                <thead>
                  <tr>
                    {["Line", "Role", "Fast moving", "Slow extra", "Catalog"].map((h, i) => (
                      <th
                        key={h}
                        className={`bg-card px-2 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.05em] text-charcoal ${
                          i < 2 ? "text-left" : "text-right"
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {c.brands.map((b) => (
                    <tr key={b.name}>
                      <td className="border-b border-line px-2 py-1.5">{b.name}</td>
                      <td className="border-b border-line px-2 py-1.5 text-gray">{ROLE_LABEL[b.role]}</td>
                      <td className="border-b border-line px-2 py-1.5 text-right font-serif tabular-nums">
                        {b.spokeSkus}
                      </td>
                      <td className="border-b border-line px-2 py-1.5 text-right font-serif tabular-nums">
                        {b.hubExtraSkus}
                      </td>
                      <td className="border-b border-line px-2 py-1.5 text-right font-serif tabular-nums">
                        {b.spokeSkus + b.hubExtraSkus}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
      </div>
    </div>
  );
}
