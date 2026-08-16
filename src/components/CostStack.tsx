import { integer, lakhs, rupees } from "@/model/format";
import type { Solution } from "@/model/types";

export function CostStack({
  best,
  consults,
  samplingCost,
  visitCost,
}: {
  best: Solution | null;
  consults: number;
  samplingCost: number;
  visitCost: number;
}) {
  const sampling = consults * samplingCost;
  const visitAcq = consults * visitCost;
  const network = best && Number.isFinite(best.total) ? best.total : NaN;
  const withSamples = Number.isFinite(network) ? network + sampling : NaN;
  const fullCash = Number.isFinite(withSamples) ? withSamples + visitAcq : NaN;

  return (
    <div className="mb-3.5 rounded-[10px] border border-line bg-white px-3.5 py-3">
      <h3 className="m-0 font-serif text-sm font-normal text-charcoal">
        Monthly cost stack
      </h3>
      <p className="mb-2 mt-0.5 text-[11.5px] leading-[1.4] text-gray">
        The optimiser only minimises the network block. Sampling and visit CAC come from P&L
        and do not change S*.
      </p>
      <table className="w-full border-collapse text-[12.5px]">
        <tbody>
          <Row label="Hub + spoke opex" value={best ? best.Cinf : NaN} />
          <Row label="Advisors" value={best ? best.Cadv : NaN} />
          <Row label="Delivery" value={best ? best.Cdel : NaN} />
          <Row label="Amortised capex" value={best ? best.Ccap : NaN} />
          <Row label="Network (S*)" value={network} strong />
          <Row
            label={`Sampling · ${integer(consults)} visits × ${rupees(samplingCost)}`}
            value={sampling}
          />
          <Row label="Network + sampling" value={withSamples} strong />
          <Row
            label={`Visit CAC · ${integer(consults)} × ${rupees(visitCost)}`}
            value={visitAcq}
          />
          <Row label="Network + sampling + CAC" value={fullCash} strong />
        </tbody>
      </table>
    </div>
  );
}

function Row({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: number;
  strong?: boolean;
}) {
  return (
    <tr className={strong ? "bg-card font-semibold text-charcoal" : "text-ink"}>
      <td className="border-b border-line px-2 py-1.5 text-left">{label}</td>
      <td className="border-b border-line px-2 py-1.5 text-right font-serif tabular-nums">
        {Number.isFinite(value) ? `₹${lakhs(value)}L` : "—"}
      </td>
    </tr>
  );
}
