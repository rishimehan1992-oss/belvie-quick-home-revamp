import { CITY_TARGET_DAY } from "./growth";
import {
  commercialFromNetwork,
  nonConsultsPerConsult,
  rhoFromNonConsultsPerConsult,
  solvePnl,
  type CommercialLevers,
} from "./pnl";
import type { Params, PnlPoint } from "./types";

export type LeverId =
  | "aov"
  | "nonConsultAov"
  | "n"
  | "k"
  | "conversion"
  | "visitCost"
  | "samplingCost"
  | "gm";

export type HoldState = Record<LeverId, number>;

export type SweepSpec = {
  x: LeverId;
  y: LeverId;
  facet: LeverId | null;
};

export type Zone = "infeasible" | "deep-red" | "red" | "amber" | "green" | "deep-green";

export interface LeverMeta {
  label: string;
  short: string;
  scale: number[];
  format: (v: number) => string;
}

function inr(n: number): string {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

export const LEVER_META: Record<LeverId, LeverMeta> = {
  aov: {
    label: "Consult AOV",
    short: "AOV",
    scale: [2000, 2500, 3000, 3500, 4000, 4500, 5000, 6000, 8000],
    format: (v) => inr(v),
  },
  nonConsultAov: {
    label: "Non-consult AOV",
    short: "nc AOV",
    scale: [1500, 2000, 2500, 3000, 3500, 4000, 5000, 6000, 8000],
    format: (v) => inr(v),
  },
  n: {
    label: "Non-consults per consult",
    short: "n",
    scale: [0, 0.25, 0.5, 0.75, 1, 1.5, 2, 3],
    format: (v) => v.toFixed(2),
  },
  k: {
    label: "k — consults per kit load",
    short: "k",
    scale: [1, 2, 3, 4],
    format: (v) => String(v),
  },
  conversion: {
    label: "Conversion",
    short: "φ",
    scale: [30, 40, 50, 60, 70, 80],
    format: (v) => `${v}%`,
  },
  visitCost: {
    label: "Visit cost",
    short: "visit",
    scale: [200, 300, 400, 500, 600, 800, 1000],
    format: (v) => inr(v),
  },
  samplingCost: {
    label: "Sampling / visit",
    short: "sample",
    scale: [50, 75, 100, 125, 150, 200, 250],
    format: (v) => inr(v),
  },
  gm: {
    label: "Gross margin",
    short: "GM",
    scale: [20, 25, 30, 35, 40, 45, 50],
    format: (v) => `${v}%`,
  },
};

export const LEVER_IDS = Object.keys(LEVER_META) as LeverId[];

export const FAVORABLE_AOV = LEVER_META.aov.scale;
export const FAVORABLE_N = LEVER_META.n.scale;
export const FAVORABLE_K = LEVER_META.k.scale;

export interface Combo {
  id: string;
  label: string;
  hint: string;
  spec: SweepSpec;
}

export const COMBOS: Combo[] = [
  {
    id: "aov-n-k",
    label: "AOV × reorders, by k",
    hint: "Ticket vs mix, one panel per kit load",
    spec: { x: "aov", y: "n", facet: "k" },
  },
  {
    id: "aov-n",
    label: "AOV × reorders",
    hint: "Single map at the held k",
    spec: { x: "aov", y: "n", facet: null },
  },
  {
    id: "aov-phi-k",
    label: "AOV × conversion, by k",
    hint: "Can a better close rate save a thin ticket?",
    spec: { x: "aov", y: "conversion", facet: "k" },
  },
  {
    id: "visit-phi",
    label: "Visit cost × conversion",
    hint: "CAC pocket — acquire cheaper or convert more",
    spec: { x: "visitCost", y: "conversion", facet: null },
  },
  {
    id: "sample-aov",
    label: "Sampling × AOV",
    hint: "How much tester cost a ticket can carry",
    spec: { x: "samplingCost", y: "aov", facet: null },
  },
  {
    id: "sample-n",
    label: "Sampling × reorders",
    hint: "Do reorders pay for samples?",
    spec: { x: "samplingCost", y: "n", facet: null },
  },
  {
    id: "n-k",
    label: "Reorders × k",
    hint: "Mix vs kit load at the held AOV",
    spec: { x: "n", y: "k", facet: null },
  },
  {
    id: "gm-aov",
    label: "Gross margin × AOV",
    hint: "Take-rate vs ticket",
    spec: { x: "gm", y: "aov", facet: null },
  },
  {
    id: "aov-ncaov",
    label: "Consult AOV × reorder AOV",
    hint: "Split tickets, mix held",
    spec: { x: "aov", y: "nonConsultAov", facet: null },
  },
  {
    id: "visit-sample",
    label: "Visit cost × sampling",
    hint: "Both cash costs of a consult",
    spec: { x: "visitCost", y: "samplingCost", facet: null },
  },
  {
    id: "phi-n",
    label: "Conversion × reorders",
    hint: "Acquire vs retain",
    spec: { x: "conversion", y: "n", facet: null },
  },
  {
    id: "gm-n-k",
    label: "Margin × reorders, by k",
    hint: "Thin GM needs mix and kit efficiency",
    spec: { x: "gm", y: "n", facet: "k" },
  },
];

export interface FavorableCell {
  x: number;
  y: number;
  facet: number | null;
  hold: HoldState;
  aov: number;
  n: number;
  k: number;
  pnl: PnlPoint;
  zone: Zone;
}

export interface FavorableSlice {
  facet: number | null;
  label: string;
  cells: FavorableCell[];
}

export interface FavorableGrid {
  spec: SweepSpec;
  scaleOrders: number;
  xs: number[];
  ys: number[];
  slices: FavorableSlice[];
  maxAbs: number;
  best: FavorableCell | null;
  greenShare: number;
}

export const ZONE_COLORS: Record<Zone, string> = {
  infeasible: "#C9BEB6",
  "deep-red": "#8A2A22",
  red: "#B03A2E",
  amber: "#C4A574",
  green: "#4A7A5C",
  "deep-green": "#2F5A3E",
};

export function scaleOrdersMonth(params: Params, ordersDay = CITY_TARGET_DAY): number {
  return ordersDay * params.ddel;
}

export function holdFromSession(params: Params, commercial: CommercialLevers): HoldState {
  return {
    aov: commercial.aov,
    nonConsultAov: commercial.nonConsultAov,
    n: Number(nonConsultsPerConsult(params.rho).toFixed(2)),
    k: params.k,
    conversion: params.phi,
    visitCost: commercial.visitCost,
    samplingCost: commercial.samplingCost,
    gm: commercial.gm,
  };
}

export function nearestOnScale(scale: number[], value: number): number {
  return scale.reduce((best, x) => (Math.abs(x - value) < Math.abs(best - value) ? x : best));
}

export function comboIdFor(spec: SweepSpec): string {
  const hit = COMBOS.find(
    (c) => c.spec.x === spec.x && c.spec.y === spec.y && c.spec.facet === spec.facet,
  );
  return hit?.id ?? "custom";
}

export function heldLevers(spec: SweepSpec): LeverId[] {
  return LEVER_IDS.filter((id) => id !== spec.x && id !== spec.y && id !== spec.facet);
}

function zoneOf(pnl: PnlPoint, maxAbs: number): Zone {
  if (!pnl.feasible || !Number.isFinite(pnl.pnl)) return "infeasible";
  if (pnl.pnl < 0) return pnl.pnl < -0.4 * maxAbs ? "deep-red" : "red";
  if (pnl.pnl === 0) return "amber";
  if (maxAbs <= 0) return "green";
  if (pnl.pnl < 0.08 * maxAbs) return "amber";
  if (pnl.pnl < 0.45 * maxAbs) return "green";
  return "deep-green";
}

export function heatColor(pnl: number, feasible: boolean, maxAbs: number): string {
  if (!feasible || !Number.isFinite(pnl)) return ZONE_COLORS.infeasible;
  const span = Math.max(maxAbs, 1);
  const t = Math.max(-1, Math.min(1, pnl / span));
  if (t < 0) {
    return lerpRgb([246, 237, 232], [176, 58, 46], Math.pow(-t, 0.7));
  }
  return lerpRgb([246, 237, 232], [47, 90, 62], Math.pow(t, 0.7));
}

function lerpRgb(a: number[], b: number[], t: number): string {
  const x = Math.max(0, Math.min(1, t));
  const r = Math.round(a[0] + (b[0] - a[0]) * x);
  const g = Math.round(a[1] + (b[1] - a[1]) * x);
  const bl = Math.round(a[2] + (b[2] - a[2]) * x);
  return `rgb(${r},${g},${bl})`;
}

export function applyPoint(
  base: HoldState,
  overrides: Partial<HoldState>,
  lockNcAov: boolean,
): HoldState {
  const next = { ...base, ...overrides };
  if (lockNcAov && overrides.aov != null && overrides.nonConsultAov == null && base.aov > 0) {
    next.nonConsultAov = Math.round(next.aov * (base.nonConsultAov / base.aov));
  }
  return next;
}

export function materialize(
  hold: HoldState,
  params: Params,
  scaleOrders: number,
): { network: Params; levers: CommercialLevers } {
  return {
    network: {
      ...params,
      D: scaleOrders,
      k: hold.k,
      rho: rhoFromNonConsultsPerConsult(hold.n),
      phi: hold.conversion,
    },
    levers: {
      visitCost: hold.visitCost,
      samplingCost: hold.samplingCost,
      aov: hold.aov,
      nonConsultAov: hold.nonConsultAov,
      gm: hold.gm,
    },
  };
}

export function sweepFavorable(
  params: Params,
  hold: HoldState,
  scaleOrders: number,
  spec: SweepSpec,
  lockNcAov = true,
): FavorableGrid {
  const xs = LEVER_META[spec.x].scale;
  const ys = LEVER_META[spec.y].scale;
  const facets = spec.facet ? LEVER_META[spec.facet].scale : [null];
  const minS = Math.ceil(((scaleOrders / params.ddel) * params.peak) / params.kapS);
  const maxS = Math.min(80, Math.max(28, minS + 8));

  const raw: Omit<FavorableCell, "zone">[] = [];
  for (const facet of facets) {
    for (const y of ys) {
      for (const x of xs) {
        const overrides: Partial<HoldState> = { [spec.x]: x, [spec.y]: y };
        if (spec.facet && facet != null) overrides[spec.facet] = facet;
        const point = applyPoint(hold, overrides, lockNcAov && spec.x !== "nonConsultAov" && spec.y !== "nonConsultAov");
        const { network, levers } = materialize(point, params, scaleOrders);
        const pnl = solvePnl(commercialFromNetwork(network, levers), network, maxS);
        raw.push({
          x,
          y,
          facet,
          hold: point,
          aov: point.aov,
          n: point.n,
          k: point.k,
          pnl,
        });
      }
    }
  }

  const pnls = raw.filter((c) => c.pnl.feasible && Number.isFinite(c.pnl.pnl)).map((c) => c.pnl.pnl);
  const maxAbs = pnls.length ? Math.max(...pnls.map((v) => Math.abs(v)), 1) : 1;
  const cells: FavorableCell[] = raw.map((c) => ({ ...c, zone: zoneOf(c.pnl, maxAbs) }));
  const slices: FavorableSlice[] = facets.map((facet) => ({
    facet,
    label:
      spec.facet && facet != null
        ? `${LEVER_META[spec.facet].short} = ${LEVER_META[spec.facet].format(facet)}`
        : `${LEVER_META[spec.y].short} \\ ${LEVER_META[spec.x].short}`,
    cells: cells.filter((c) => c.facet === facet),
  }));
  const feasible = cells.filter((c) => c.pnl.feasible && Number.isFinite(c.pnl.pnl));
  const best = feasible.length
    ? feasible.reduce((a, b) => (b.pnl.pnl > a.pnl.pnl ? b : a))
    : null;
  const greenShare =
    feasible.length === 0
      ? 0
      : feasible.filter((c) => c.zone === "green" || c.zone === "deep-green").length /
        feasible.length;

  return { spec, scaleOrders, xs, ys, slices, maxAbs, best, greenShare };
}

/** Default AOV × n × k map used by older callers and tests. */
export function favorableGrid(
  params: Params,
  commercial: CommercialLevers,
  scaleOrders: number,
): FavorableGrid {
  return sweepFavorable(
    params,
    holdFromSession(params, commercial),
    scaleOrders,
    { x: "aov", y: "n", facet: "k" },
  );
}

export function cellAt(grid: FavorableGrid, x: number, y: number, facet: number | null): FavorableCell | null {
  const slice =
    grid.slices.find((s) => s.facet === facet) ??
    grid.slices.find((s) => s.facet === nearestOnScale(
      grid.slices.map((s) => s.facet).filter((v): v is number => v != null),
      facet ?? 0,
    ));
  if (!slice) return grid.slices[0]?.cells[0] ?? null;
  const nx = nearestOnScale(grid.xs, x);
  const ny = nearestOnScale(grid.ys, y);
  return slice.cells.find((c) => c.x === nx && c.y === ny) ?? slice.cells[0] ?? null;
}

export function nearestGridAov(aov: number): number {
  return nearestOnScale(FAVORABLE_AOV, aov);
}

export function nearestGridN(n: number): number {
  return nearestOnScale(FAVORABLE_N, n);
}

export function nearestGridK(k: number): number {
  return nearestOnScale(FAVORABLE_K, k);
}

export function minProfitableX(slice: FavorableSlice): number | null {
  const ok = slice.cells.filter((c) => c.pnl.feasible && c.pnl.pnl >= 0);
  if (!ok.length) return null;
  return Math.min(...ok.map((c) => c.x));
}

export function minProfitableY(slice: FavorableSlice, x: number): number | null {
  const nx = nearestOnScale(
    [...new Set(slice.cells.map((c) => c.x))],
    x,
  );
  const ok = slice.cells.filter((c) => c.x === nx && c.pnl.feasible && c.pnl.pnl >= 0);
  if (!ok.length) return null;
  return Math.min(...ok.map((c) => c.y));
}

export function minProfitableAov(slice: FavorableSlice): number | null {
  return minProfitableX(slice);
}

export function minProfitableN(slice: FavorableSlice, aov: number): number | null {
  return minProfitableY(slice, aov);
}

export function describeHold(hold: HoldState): string {
  return [
    `AOV ${LEVER_META.aov.format(hold.aov)}`,
    `nc ${LEVER_META.nonConsultAov.format(hold.nonConsultAov)}`,
    `n ${LEVER_META.n.format(hold.n)}`,
    `k=${hold.k}`,
    `φ ${hold.conversion}%`,
    `visit ${LEVER_META.visitCost.format(hold.visitCost)}`,
    `sample ${LEVER_META.samplingCost.format(hold.samplingCost)}`,
    `GM ${hold.gm}%`,
  ].join(" · ");
}
