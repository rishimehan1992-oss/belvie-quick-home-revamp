import { integer, rupees } from "@/model/format";
import type { CustomerEconomics } from "@/model/types";

function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-[9px] border border-line bg-white px-3 py-2.5">
      <div className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-gray">{label}</div>
      <div className="mt-0.5 font-serif text-[22px] leading-[1.15] tabular-nums text-charcoal">
        {value}
      </div>
      <div className="mt-0.5 text-[11px] text-gray">{hint}</div>
    </div>
  );
}

export function CustomerMetrics({ eco }: { eco: CustomerEconomics }) {
  return (
    <div className="mb-3.5">
      <h3 className="mb-1 font-serif text-sm font-normal text-charcoal">
        Per acquired customer
      </h3>
      <p className="mb-2.5 mt-0 text-[11.5px] leading-[1.4] text-gray">
        One converting visit is one customer. Reorders are the non-consult share of her lifetime
        orders. CAC is visit cost ÷ conversion. LTV is gross profit unless labelled revenue.
      </p>
      <div className="mb-3.5 grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-2.5">
        <Metric
          label="CAC"
          value={rupees(eco.cac)}
          hint={`${eco.visitsPerCustomer.toFixed(2)} visits to acquire`}
        />
        <Metric
          label="LTV (gross profit)"
          value={rupees(eco.gpLtv)}
          hint={`${eco.ordersPerCustomer.toFixed(2)} orders × AOV × GM`}
        />
        <Metric
          label="LTV : CAC"
          value={Number.isFinite(eco.ltvCac) ? `${eco.ltvCac.toFixed(2)}×` : "—"}
          hint="gross-profit LTV / CAC"
        />
        <Metric
          label="Orders / customer"
          value={eco.ordersPerCustomer.toFixed(2)}
          hint="1 / (1 − reorder share)"
        />
        <Metric
          label="Consult orders"
          value={eco.consultOrdersPerCustomer.toFixed(2)}
          hint={`LTV ${rupees(eco.consultGpLtv)} GP · ${rupees(eco.consultRevenueLtv)} revenue`}
        />
        <Metric
          label="Non-consult orders"
          value={eco.nonConsultOrdersPerCustomer.toFixed(2)}
          hint={`LTV ${rupees(eco.nonConsultGpLtv)} GP · ${rupees(eco.nonConsultRevenueLtv)} revenue`}
        />
        <Metric
          label="Non-consult LTV"
          value={rupees(eco.nonConsultGpLtv)}
          hint="reorder gross profit only"
        />
        <Metric
          label="Revenue LTV"
          value={rupees(eco.revenueLtv)}
          hint="before COGS and network"
        />
        <Metric
          label="Network / customer"
          value={Number.isFinite(eco.networkPerCustomer) ? rupees(eco.networkPerCustomer) : "—"}
          hint="optimised ₹/order × her orders"
        />
        <Metric
          label="Contribution / customer"
          value={
            Number.isFinite(eco.contributionPerCustomer)
              ? rupees(eco.contributionPerCustomer)
              : "—"
          }
          hint="GP LTV − CAC − network"
        />
        <Metric
          label="Payback"
          value={
            Number.isFinite(eco.paybackOrders) ? `${eco.paybackOrders.toFixed(2)} orders` : "—"
          }
          hint="CAC / (AOV × gross margin)"
        />
      </div>

      <h3 className="mb-1 font-serif text-sm font-normal text-charcoal">
        Monthly mix from the optimiser
      </h3>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-2.5">
        <Metric
          label="Customers / month"
          value={integer(eco.customersPerMonth)}
          hint="converting consults"
        />
        <Metric
          label="Consult orders / month"
          value={integer(eco.consultOrdersPerMonth)}
          hint="first orders from visits"
        />
        <Metric
          label="Non-consult orders / month"
          value={integer(eco.nonConsultOrdersPerMonth)}
          hint={`${(eco.reorderShare * 100).toFixed(0)}% reorder share`}
        />
      </div>
    </div>
  );
}
