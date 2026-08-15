import type { ReactNode } from "react";
import { crores, integer, lakhs } from "@/model/format";
import type { Params, Solution } from "@/model/types";

export function HeroStats({ best, params }: { best: Solution | null; params: Params }) {
  if (!best) {
    return (
      <div className="mb-3.5 grid grid-cols-[repeat(auto-fit,minmax(128px,1fr))] gap-2.5">
        <div className="rounded-[9px] border border-charcoal bg-charcoal px-3 py-2.5">
          <div className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-delivery">
            No feasible network
          </div>
          <div className="mt-0.5 font-serif text-[25px] leading-[1.15] text-white">—</div>
          <div className="mt-0.5 text-[11px] text-delivery">relax a constraint below</div>
        </div>
      </div>
    );
  }

  const travelPct = Math.round((best.rt / best.cycle) * 100);

  return (
    <div className="mb-3.5 grid grid-cols-[repeat(auto-fit,minmax(128px,1fr))] gap-2.5">
      <Stat
        lead
        label="Optimal spokes"
        value={String(best.S)}
        sub={`${best.H} hub${best.H > 1 ? "s" : ""} · capacity floor ${best.minS}`}
      />
      <Stat
        label="Total / month"
        value={`₹${lakhs(best.total)}L`}
        sub={params.incCap ? "incl. amortised capex" : "opex only"}
      />
      <Stat
        label="Cost / order"
        value={`₹${Math.round(best.cpo)}`}
        sub={`${integer(params.D)} orders / month`}
      />
      <Stat
        label="Advisors"
        value={integer(best.N)}
        sub={`${best.cday.toFixed(2)} consults / day`}
      />
      <Stat
        label="Advisor cycle"
        value={
          <>
            {Math.round(best.cycle)}
            <span className="text-sm"> min</span>
          </>
        }
        sub={`${Math.round(best.rt)} min travel (${travelPct}%)`}
      />
      <Stat
        label="Delivery"
        value={`₹${Math.round(best.cdelOrder)}`}
        sub={`${best.n} drops / trip`}
      />
      <Stat
        label="Capex"
        value={`₹${crores(best.capexTotal)} Cr`}
        sub={`${best.H}×hub + ${best.S}×spoke`}
      />
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
  value: ReactNode;
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
