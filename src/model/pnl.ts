import type { CommercialParams, CustomerEconomics, Params, PnlPoint } from "./types";
import { normalise, optimise } from "./solver";

export const COMMERCIAL_DEFAULTS: CommercialParams = {
  consults: 27083,
  visitCost: 400,
  aov: 4000,
  nonConsultAov: 4000,
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
  nonConsultAov: { min: 0, max: 15000, step: 50 },
  conversion: { min: 5, max: 100, step: 1 },
  gm: { min: 5, max: 80, step: 1 },
};

export const NON_CONSULTS_PER_CONSULT_META = { min: 0, max: 5, step: 0.05 };

/** ρ = n / (1+n). n = non-consult orders per consult order. */
export function nonConsultsPerConsult(rhoPct: number): number {
  const rho = Math.min(Math.max(rhoPct / 100, 0), 0.99);
  return rho / (1 - rho);
}

export function rhoFromNonConsultsPerConsult(n: number): number {
  const x = Math.max(n, 0);
  return (x / (1 + x)) * 100;
}

export function consultsFromNetwork(network: Params): number {
  return (network.D * (1 - network.rho / 100)) / (network.phi / 100);
}

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

export type CommercialLevers = Pick<
  CommercialParams,
  "visitCost" | "aov" | "nonConsultAov" | "gm"
>;

export function commercialFromNetwork(
  network: Params,
  levers: CommercialLevers,
): CommercialParams {
  return {
    consults: consultsFromNetwork(network),
    conversion: network.phi,
    visitCost: levers.visitCost,
    aov: levers.aov,
    nonConsultAov: levers.nonConsultAov,
    gm: levers.gm,
  };
}

function reorderAov(c: CommercialParams): number {
  return Number.isFinite(c.nonConsultAov) ? c.nonConsultAov : c.aov;
}

export function solvePnl(
  commercial: CommercialParams,
  network: Params,
  maxS = 28,
): PnlPoint {
  const orders = ordersFromConsults(
    commercial.consults,
    commercial.conversion,
    network.rho,
  );
  const rho = Math.min(Math.max(network.rho / 100, 0), 0.99);
  const consultOrders = orders * (1 - rho);
  const nonConsultOrders = orders * rho;
  const gm = commercial.gm / 100;
  const revenue = consultOrders * commercial.aov + nonConsultOrders * reorderAov(commercial);
  const grossProfit = revenue * gm;
  const cogs = revenue - grossProfit;
  const visitAcq = commercial.consults * commercial.visitCost;

  const { best } = optimise(
    normalise({
      ...network,
      D: orders,
      phi: commercial.conversion,
    }),
    maxS,
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
    H: best?.H ?? null,
    pnl,
    pnlPerConsult,
    feasible,
  };
}

export function customerEconomics(
  commercial: CommercialLevers,
  network: Params,
  networkCpo: number,
): CustomerEconomics {
  const conv = network.phi / 100;
  const rho = Math.min(Math.max(network.rho / 100, 0), 0.99);
  const gm = commercial.gm / 100;
  const n = rho / (1 - rho);
  const ordersPerCustomer = 1 + n;
  const consultOrdersPerCustomer = 1;
  const nonConsultOrdersPerCustomer = n;
  const visitsPerCustomer = conv > 0 ? 1 / conv : Infinity;
  const cac = conv > 0 ? commercial.visitCost / conv : Infinity;
  const ncAov = Number.isFinite(commercial.nonConsultAov)
    ? commercial.nonConsultAov
    : commercial.aov;
  const consultRevenueLtv = commercial.aov;
  const nonConsultRevenueLtv = ncAov * n;
  const revenueLtv = consultRevenueLtv + nonConsultRevenueLtv;
  const consultGpLtv = consultRevenueLtv * gm;
  const nonConsultGpLtv = nonConsultRevenueLtv * gm;
  const gpLtv = revenueLtv * gm;
  const customersPerMonth = network.D * (1 - rho);
  const consultOrdersPerMonth = customersPerMonth;
  const nonConsultOrdersPerMonth = network.D * rho;
  const networkPerCustomer = Number.isFinite(networkCpo)
    ? networkCpo * ordersPerCustomer
    : Infinity;
  const contributionPerCustomer = gpLtv - cac - networkPerCustomer;
  const unitGp = commercial.aov * gm;
  const paybackOrders = unitGp > 0 && Number.isFinite(cac) ? cac / unitGp : Infinity;

  return {
    conversion: conv,
    reorderShare: rho,
    visitsPerCustomer,
    consultOrdersPerCustomer,
    nonConsultOrdersPerCustomer,
    ordersPerCustomer,
    cac,
    consultRevenueLtv,
    nonConsultRevenueLtv,
    revenueLtv,
    consultGpLtv,
    nonConsultGpLtv,
    gpLtv,
    ltvCac: cac > 0 && Number.isFinite(gpLtv) ? gpLtv / cac : Infinity,
    networkPerCustomer,
    contributionPerCustomer,
    customersPerMonth,
    consultOrdersPerMonth,
    nonConsultOrdersPerMonth,
    paybackOrders,
    consultAov: commercial.aov,
    nonConsultAov: ncAov,
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

function withCurrent(base: number[], current: number): number[] {
  const values = new Set(base);
  if (Number.isFinite(current)) values.add(current);
  return [...values].sort((a, b) => a - b);
}

export const AOV_SCALE = [1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 6000, 8000, 10000];
export const N_SCALE = [0, 0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4];
export const CONV_SCALE = [20, 30, 40, 50, 60, 70, 80, 90];
export const VISIT_COST_SCALE = [100, 200, 300, 400, 500, 600, 800, 1000, 1200];
export const GM_SCALE = [15, 20, 25, 30, 35, 40, 45, 50, 60];

export type SweepPoint = PnlPoint & { x: number };

export function sweepPnl(
  xs: number[],
  commercial: CommercialParams,
  network: Params,
  override: (x: number) => {
    commercial?: Partial<CommercialParams>;
    network?: Partial<Params>;
  },
): SweepPoint[] {
  return xs.map((x) => {
    const o = override(x);
    return {
      x,
      ...solvePnl({ ...commercial, ...o.commercial }, { ...network, ...o.network }),
    };
  });
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

export function pnlVsAov(commercial: CommercialParams, network: Params): SweepPoint[] {
  return sweepPnl(withCurrent(AOV_SCALE, commercial.aov), commercial, network, (aov) => ({
    commercial: { aov },
  }));
}

export function pnlVsNonConsultAov(
  commercial: CommercialParams,
  network: Params,
): SweepPoint[] {
  return sweepPnl(
    withCurrent(AOV_SCALE, reorderAov(commercial)),
    commercial,
    network,
    (nonConsultAov) => ({ commercial: { nonConsultAov } }),
  );
}

export function pnlVsNonConsultsPerConsult(
  commercial: CommercialParams,
  network: Params,
): SweepPoint[] {
  const current = nonConsultsPerConsult(network.rho);
  return sweepPnl(withCurrent(N_SCALE, Number(current.toFixed(2))), commercial, network, (n) => ({
    network: { rho: rhoFromNonConsultsPerConsult(n) },
  }));
}

export function pnlVsConversion(
  commercial: CommercialParams,
  network: Params,
): SweepPoint[] {
  return sweepPnl(
    withCurrent(CONV_SCALE, commercial.conversion),
    commercial,
    network,
    (conversion) => ({
      commercial: { conversion },
      network: { phi: conversion },
    }),
  );
}

export function pnlVsVisitCost(
  commercial: CommercialParams,
  network: Params,
): SweepPoint[] {
  return sweepPnl(
    withCurrent(VISIT_COST_SCALE, commercial.visitCost),
    commercial,
    network,
    (visitCost) => ({ commercial: { visitCost } }),
  );
}

export function pnlVsGm(commercial: CommercialParams, network: Params): SweepPoint[] {
  return sweepPnl(withCurrent(GM_SCALE, commercial.gm), commercial, network, (gm) => ({
    commercial: { gm },
  }));
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
