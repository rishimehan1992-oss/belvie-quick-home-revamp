import type { ReactNode } from "react";
import { integer, lakhs, rupees } from "@/model/format";
import type { CustomerEconomics, PnlPoint } from "@/model/types";

export function PnlHero({
  point,
  eco,
  breakEven,
}: {
  point: PnlPoint;
  eco: CustomerEconomics;
  breakEven: number | null;
}) {
  const positive = point.feasible && point.pnl >= 0;

  return (
    <div className="mb-3.5 grid grid-cols-[repeat(auto-fit,minmax(128px,1fr))] gap-2.5">
      <Stat
        lead
        label="Network P&L / month"
        value={point.feasible ? `₹${lakhs(point.pnl)}L` : "—"}
        sub={
          point.feasible
            ? positive
              ? "GP − CAC visits − optimiser network"
              : "loss at this volume"
            : "no feasible network"
        }
        tone={point.feasible ? (positive ? "good" : "bad") : "lead"}
      />
      <Stat
        label="Revenue"
        value={`₹${lakhs(point.revenue)}L`}
        sub={`${integer(point.orders)} orders from model 1`}
      />
      <Stat
        label="CAC"
        value={rupees(eco.cac)}
        sub={`${eco.visitsPerCustomer.toFixed(2)} visits / customer`}
      />
      <Stat
        label="LTV"
        value={rupees(eco.gpLtv)}
        sub={Number.isFinite(eco.ltvCac) ? `${eco.ltvCac.toFixed(2)}× CAC · GP` : "—"}
      />
      <Stat
        label="Network (S*)"
        value={point.feasible ? `₹${lakhs(point.network)}L` : "—"}
        sub={
          point.S != null
            ? `S* ${point.S} · ${integer(point.N ?? 0)} advisors · ₹${Math.round(point.networkCpo)}/order`
            : "infeasible"
        }
      />
      <Stat
        label="P&L / customer"
        value={point.feasible ? rupees(eco.contributionPerCustomer) : "—"}
        sub={
          breakEven
            ? `break-even ~ ${integer(breakEven)} consults`
            : "break-even not in range"
        }
      />
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  lead = false,
  tone = "plain",
}: {
  label: string;
  value: ReactNode;
  sub: string;
  lead?: boolean;
  tone?: "plain" | "lead" | "good" | "bad";
}) {
  const box =
    tone === "good"
      ? "border-good bg-good"
      : tone === "bad"
        ? "border-bad bg-bad"
        : lead || tone === "lead"
          ? "border-charcoal bg-charcoal"
          : "border-line bg-white";
  const inverted = tone !== "plain";

  return (
    <div className={`rounded-[9px] border px-3 py-2.5 ${box}`}>
      <div
        className={`text-[9.5px] font-bold uppercase tracking-[0.1em] ${
          inverted ? "text-white/80" : "text-gray"
        }`}
      >
        {label}
      </div>
      <div
        className={`mt-0.5 font-serif text-[25px] leading-[1.15] tabular-nums ${
          inverted ? "text-white" : "text-charcoal"
        }`}
      >
        {value}
      </div>
      <div className={`mt-0.5 text-[11px] ${inverted ? "text-white/75" : "text-gray"}`}>
        {sub}
      </div>
    </div>
  );
}
