"use client";

import { useMemo, useState } from "react";
import { AppNav } from "@/components/AppNav";
import { InventoryCharts, InventoryLevers, InventoryTables, SkuSumTable } from "@/components/InventoryCharts";
import { MethodologyDrawer } from "@/components/MethodologyDrawer";
import { useModel } from "@/components/ModelProvider";
import {
  ASSORTMENT_DEFAULTS,
  HUB_EXTRA_TARGET,
  HUB_SKU_TARGET,
  SPOKE_SKU_TARGET,
  assortmentInsight,
  type AssortmentLevers,
} from "@/model/assortment";
import { integer, lakhs, rupees } from "@/model/format";

export function InventoryApp() {
  const { params, commercial } = useModel();
  const [methodOpen, setMethodOpen] = useState(false);
  const [levers, setLevers] = useState<AssortmentLevers>(ASSORTMENT_DEFAULTS);
  const row = useMemo(
    () => assortmentInsight(params, commercial, levers),
    [params, commercial, levers],
  );
  const floorCatalog = HUB_SKU_TARGET * row.S * row.unitCost;
  const floorFast = SPOKE_SKU_TARGET * row.S * row.unitCost;

  return (
    <div className="mx-auto max-w-[1180px] px-3.5 pb-[60px] pt-[18px]">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-terracotta">
            Belvie · Bengaluru
          </div>
          <h1 className="mt-1 font-serif text-[clamp(22px,3vw,32px)] font-normal text-charcoal">
            Inventory
          </h1>
          <p className="mt-0.5 max-w-[52rem] text-[13.5px] leading-[1.45] text-gray">
            BPC colour cosmetics only. Fast-moving spoke edit {integer(SPOKE_SKU_TARGET)} SKUs
            (inside 800–900). Full catalog {integer(HUB_SKU_TARGET)} (inside 1,200–1,300). Testers on
            the visit stay on the sampling slider; they are not in these counts.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <AppNav active="inventory" />
          <button
            type="button"
            onClick={() => setMethodOpen(true)}
            className="rounded-full border border-line bg-white px-3 py-1.5 text-[12.5px] text-gray hover:border-terracotta hover:text-terracotta"
          >
            Methodology
          </button>
        </div>
      </header>

      <div className="mb-3.5 rounded-[10px] border border-line bg-card px-3.5 py-3 text-[13px] leading-[1.55] text-ink">
        <b className="text-charcoal">The split:</b> {integer(SPOKE_SKU_TARGET)} fast-moving colour
        SKUs live on every spoke so the van can leave the same day — lips, complexion, cheeks, eyes.
        {integer(HUB_SKU_TARGET)} is the hub catalog: those {integer(SPOKE_SKU_TARGET)} plus{" "}
        {integer(HUB_EXTRA_TARGET)} slow shades and limited drops. Lines are house / lab partner /
        artist collab / value / specialist, not signed contracts.{" "}
        <b className="text-charcoal">Replacement:</b> A movers ~{row.classes[0].replenishPerSkuMonth.toFixed(1)}×
        / month ({row.classes[0].coverDays} day cover), B ~{row.classes[1].replenishPerSkuMonth.toFixed(1)}×,
        C ~{row.classes[2].replenishPerSkuMonth.toFixed(1)}× at the hub. Catalog churn is a separate
        {Math.round(row.catalogChurnYear * 100)}% / year on the tail.
      </div>

      <div className="mb-3.5 grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-2.5">
        <Stat
          lead
          label="Fast moving"
          value={integer(row.tree.spokeSkus)}
          sub={`inside 800–900 · ${row.tree.categories.length} colour categories`}
        />
        <Stat
          label="Full catalog"
          value={integer(row.tree.hubSkus)}
          sub={`inside 1,200–1,300 · ${integer(row.tree.hubExtraSkus)} slow extra`}
        />
        <Stat
          label="Spoke unit fill"
          value={`${Math.round(levers.spokeUnitShare * 100)}%`}
          sub={`${integer(row.spokeUnitsMonth)} units / mo from the ${integer(SPOKE_SKU_TARGET)}`}
        />
        <Stat
          label="A replace rate"
          value={`${row.classes[0].replenishPerSkuMonth.toFixed(1)}×`}
          sub={`${row.classes[0].coverDays} day cover · ${integer(row.classes[0].skus)} SKUs`}
        />
        <Stat
          label="Stock on hand"
          value={`₹${lakhs(row.inventoryTotal)}L`}
          sub={`spoke ₹${lakhs(row.inventorySpoke)}L · hub ₹${lakhs(row.inventoryHub)}L`}
        />
      </div>

      <InventoryLevers levers={levers} onChange={setLevers} />

      <div className="mb-3.5 rounded-[10px] border border-line bg-white px-3.5 py-3">
        <h2 className="m-0 font-serif text-base font-normal text-charcoal">
          Why {integer(SPOKE_SKU_TARGET)} fast movers at the spoke, not {integer(HUB_SKU_TARGET)}
        </h2>
        <p className="mb-2 mt-1 text-[13px] leading-[1.55] text-gray">
          The {integer(SPOKE_SKU_TARGET)} is colour categories × line roles below — inside the 800–900
          band. Putting the extra {integer(HUB_EXTRA_TARGET)} on every spoke would plant a onesie of
          each SKU at {row.S} locations — about {rupees(floorCatalog)} of floor stock versus{" "}
          {rupees(floorFast)} for the fast edit, before any days-of-cover. At this volume the range
          floor {row.spokeFloorBinds ? "is already binding" : "is not yet binding"} on A+B. Hub-only
          shades take the remaining {Math.round((1 - levers.spokeUnitShare) * 100)}% of units on a
          longer SLA. Demand is {integer(params.D)} orders / month from P&L, S* {row.S}, {row.H} hub
          {row.H > 1 ? "s" : ""}.
        </p>
      </div>

      <SkuSumTable row={row} />
      <InventoryCharts row={row} />
      <InventoryTables row={row} />

      <p className="mt-[18px] border-t border-line pt-2.5 text-[11.5px] leading-[1.55] text-gray">
        <b className="text-charcoal">What this is not:</b> it does not change S* or P&L. Unit cost
        is AOV × (1 − GM) / units per order, so stock value moves when you change P&L. Cover days
        and units/order are local levers on this tab. Replace the brand names when contracts are
        real. Sampling testers remain a per-visit cost, not a catalog SKU.
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
