export interface Params {
  D: number;
  A: number;
  rho: number;
  phi: number;
  peak: number;
  ddel: number;
  dadv: number;
  k: number;
  mkAdv: number;
  Tc: number;
  Tkit: number;
  tintra: number;
  Tshift: number;
  Tadmin: number;
  w: number;
  mkVan: number;
  ct: number;
  Tslot: number;
  thd: number;
  thst: number;
  qsoc: number;
  fH: number;
  fS: number;
  kapS: number;
  kapH: number;
  KH: number;
  KS: number;
  Lam: number;
  mkLine: number;
  tau: number;
  beta: number;
  incCap: boolean;
  coc: number;
  life: number;
}

/** Params after rho/phi/coc are converted from percentages to fractions. */
export type SolverParams = Params;

export interface Solution {
  S: number;
  H: number;
  a: number;
  peakSpoke: number;
  ordersDaySpoke: number;
  rt: number;
  cycle: number;
  cday: number;
  N: number;
  n: number;
  tripsDay: number;
  cdelOrder: number;
  Cinf: number;
  Cadv: number;
  Cdel: number;
  Ccap: number;
  capexTotal: number;
  total: number;
  cpo: number;
  capOK: boolean;
  slaOK: boolean;
  routeOK: boolean;
  lineHaul: number;
  feasible: boolean;
  minS: number;
}

export interface SolveResult {
  rows: Solution[];
  best: Solution | null;
}

export type InsightSeverity = "critical" | "info";

export interface Insight {
  severity: InsightSeverity;
  text: string;
}

export type PresetName = "base" | "worst" | "fixed";

export type ParamsAction =
  | { type: "set"; key: keyof Params; value: number | boolean }
  | { type: "preset"; name: PresetName };

export interface CommercialParams {
  consults: number;
  visitCost: number;
  aov: number;
  conversion: number;
  gm: number;
}

export interface PnlPoint {
  consults: number;
  orders: number;
  revenue: number;
  cogs: number;
  grossProfit: number;
  visitAcq: number;
  network: number;
  networkCpo: number;
  S: number | null;
  N: number | null;
  H: number | null;
  pnl: number;
  pnlPerConsult: number;
  feasible: boolean;
}

export interface CustomerEconomics {
  conversion: number;
  reorderShare: number;
  visitsPerCustomer: number;
  consultOrdersPerCustomer: number;
  nonConsultOrdersPerCustomer: number;
  ordersPerCustomer: number;
  cac: number;
  consultRevenueLtv: number;
  nonConsultRevenueLtv: number;
  revenueLtv: number;
  consultGpLtv: number;
  nonConsultGpLtv: number;
  gpLtv: number;
  ltvCac: number;
  networkPerCustomer: number;
  contributionPerCustomer: number;
  customersPerMonth: number;
  consultOrdersPerMonth: number;
  nonConsultOrdersPerMonth: number;
  paybackOrders: number;
}
