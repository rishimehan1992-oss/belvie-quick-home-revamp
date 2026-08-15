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
        One converting visit is one customer. She then places N non-consult (no-visit) orders.
        CAC is visit cost ÷ conversion. Sampling is testers on the visit. Consult and
        non-consult AOV can differ.
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
          hint={`${eco.ordersPerCustomer.toFixed(2)} orders · mixed AOV`}
        />
        <Metric
          label="Sampling / customer"
          value={rupees(eco.samplingPerCustomer)}
          hint={`${rupees(eco.samplingPerVisit)} × ${eco.visitsPerCustomer.toFixed(2)} visits`}
        />
        <Metric
          label="LTV : CAC"
          value={Number.isFinite(eco.ltvCac) ? `${eco.ltvCac.toFixed(2)}×` : "—"}
          hint="gross-profit LTV / CAC"
        />
        <Metric
          label="Non-consults / consult"
          value={eco.nonConsultOrdersPerCustomer.toFixed(2)}
          hint="reorders after one consult order"
        />
        <Metric
          label="Consult AOV"
          value={rupees(eco.consultAov)}
          hint={`1 consult order · LTV ${rupees(eco.consultGpLtv)} GP`}
        />
        <Metric
          label="Non-consult AOV"
          value={rupees(eco.nonConsultAov)}
          hint={`${eco.nonConsultOrdersPerCustomer.toFixed(2)} orders · LTV ${rupees(eco.nonConsultGpLtv)} GP`}
        />
        <Metric
          label="Consult LTV"
          value={rupees(eco.consultGpLtv)}
          hint={`${rupees(eco.consultRevenueLtv)} revenue`}
        />
        <Metric
          label="Non-consult LTV"
          value={rupees(eco.nonConsultGpLtv)}
          hint={`${rupees(eco.nonConsultRevenueLtv)} revenue`}
        />
        <Metric
          label="Orders / customer"
          value={eco.ordersPerCustomer.toFixed(2)}
          hint="1 consult + non-consults per consult"
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
          hint="GP LTV − CAC − sampling − network"
        />
        <Metric
          label="Payback"
          value={
            Number.isFinite(eco.paybackOrders) ? `${eco.paybackOrders.toFixed(2)} consult orders` : "—"
          }
          hint="CAC / (consult AOV × gross margin)"
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
          hint={`${eco.nonConsultOrdersPerCustomer.toFixed(2)} per consult`}
        />
      </div>
    </div>
  );
}
