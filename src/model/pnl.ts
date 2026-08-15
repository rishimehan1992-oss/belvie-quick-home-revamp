import type { CommercialParams, Params, PnlPoint } from "./types";
import { normalise, optimise } from "./solver";

export const COMMERCIAL_DEFAULTS: CommercialParams = {
  consults: 27000,
  visitCost: 400,
  aov: 4000,
  conversion: 60,
  gm: 35,
};

export const COMMERCIAL_META: Record<
  keyof CommercialParams,
  { min: number; max: number; step: number }
> = {
  consults: { min: 1000, max: 150000, step: 500 },
  visitCost: { min: 0, max: 2000, step: 10 },
  aov: { min: 500, max: 15000, step: 50 },
  conversion: { min: 5, max: 100, step: 1 },
  gm: { min: 5, max: 80, step: 1 },
};

/** First orders = consults × conversion; reorders inflate total orders by 1/(1−ρ). */
export function ordersFromConsults(
  consults: number,
  conversionPct: number,
  rhoPct: number,
): number {
  const conv = conversionPct / 100;
  const rho = Math.min(Math.max(rhoPct / 100, 0), 0.99);
  return (consults * conv) / (1 - rho);
}

export function solvePnl(commercial: CommercialParams, network: Params): PnlPoint {
  const orders = ordersFromConsults(
    commercial.consults,
    commercial.conversion,
    network.rho,
  );
  const gm = commercial.gm / 100;
  const revenue = orders * commercial.aov;
  const grossProfit = revenue * gm;
  const cogs = revenue - grossProfit;
  const visitAcq = commercial.consults * commercial.visitCost;

  const { best } = optimise(
    normalise({
      ...network,
      D: orders,
      phi: commercial.conversion,
    }),
  );

  const feasible = Boolean(best && Number.isFinite(best.total));
  const networkCost = feasible && best ? best.total : Infinity;
  const pnl = grossProfit - visitAcq - networkCost;
  const pnlPerConsult =
    commercial.consults > 0 && Number.isFinite(pnl) ? pnl / commercial.consults : NaN;

  return {
    consults: commercial.consults,
    orders,
    revenue,
    cogs,
    grossProfit,
    visitAcq,
    network: networkCost,
    networkCpo: feasible && best ? best.cpo : Infinity,
    S: best?.S ?? null,
    N: best?.N ?? null,
    pnl,
    pnlPerConsult,
    feasible,
  };
}

export function consultScale(current: number): number[] {
  const base = [
    2000, 5000, 8000, 10000, 15000, 20000, 25000, 27000, 30000, 40000, 50000, 60000, 80000,
    100000, 120000,
  ];
  const rounded = Math.round(current);
  const values = new Set(base.filter((v) => v >= 1000));
  if (rounded >= 1000) values.add(rounded);
  return [...values].sort((a, b) => a - b);
}

export function pnlVsConsults(
  commercial: CommercialParams,
  network: Params,
): PnlPoint[] {
  return consultScale(commercial.consults).map((consults) =>
    solvePnl({ ...commercial, consults }, network),
  );
}

export function pnlVsK(commercial: CommercialParams, network: Params): PnlPoint[] {
  const out: PnlPoint[] = [];
  for (let k = 1; k <= 6; k++) {
    out.push(solvePnl(commercial, { ...network, k }));
  }
  return out;
}

export function breakEvenConsults(series: PnlPoint[]): number | null {
  const ok = series.filter((p) => p.feasible && Number.isFinite(p.pnl));
  if (!ok.length) return null;
  if (ok[0].pnl >= 0) return ok[0].consults;
  for (let i = 1; i < ok.length; i++) {
    const a = ok[i - 1];
    const b = ok[i];
    if (a.pnl < 0 && b.pnl >= 0) {
      const t = (0 - a.pnl) / (b.pnl - a.pnl);
      return Math.round(a.consults + t * (b.consults - a.consults));
    }
  }
  return null;
}
