import type { Params, Solution } from "./types";

export type SplitLine = {
  id: string;
  label: string;
  month: number;
  color: string;
  inServe: boolean;
  perOrder: number;
};

export function orderSplit(
  best: Solution,
  params: Params,
  consults: number,
  samplingCost: number,
  visitCost: number,
) {
  const D = params.D;
  const hub = best.H * params.fH;
  const spoke = best.S * params.fS;
  const sampling = consults * samplingCost;
  const visitAcq = consults * visitCost;
  const raw = [
    { id: "adv", label: "Advisor", month: best.Cadv, color: "#BA5D42", inServe: true },
    { id: "sample", label: "Sampling", month: sampling, color: "#C4A574", inServe: true },
    { id: "hub", label: "Hub opex", month: hub, color: "#2B2622", inServe: true },
    { id: "spoke", label: "Spoke opex", month: spoke, color: "#6B6560", inServe: true },
    { id: "del", label: "Delivery", month: best.Cdel, color: "#C9BEB6", inServe: true },
    { id: "cap", label: "Amortised capex", month: best.Ccap, color: "#8C9A8E", inServe: true },
    { id: "cac", label: "Visit CAC", month: visitAcq, color: "#4A7A5C", inServe: false },
  ];
  const per = (month: number) => (D > 0 && Number.isFinite(month) ? month / D : NaN);
  const lines: SplitLine[] = raw.map((l) => ({ ...l, perOrder: per(l.month) }));
  const serveMonth = lines
    .filter((l) => l.inServe)
    .reduce((s, l) => s + (Number.isFinite(l.month) ? l.month : 0), 0);
  const allInMonth = serveMonth + (Number.isFinite(visitAcq) ? visitAcq : 0);
  return {
    D,
    lines,
    serveMonth,
    servePerOrder: per(serveMonth),
    networkPerOrder: per(best.total),
    samplingPerOrder: per(sampling),
    allInMonth,
    allInPerOrder: per(allInMonth),
  };
}
