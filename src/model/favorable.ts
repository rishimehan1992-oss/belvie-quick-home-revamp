import { CITY_TARGET_DAY } from "./growth";
import {
  commercialFromNetwork,
  rhoFromNonConsultsPerConsult,
  solvePnl,
  type CommercialLevers,
} from "./pnl";
import type { Params, PnlPoint } from "./types";

export const FAVORABLE_AOV = [2000, 2500, 3000, 3500, 4000, 4500, 5000, 6000, 8000];
export const FAVORABLE_N = [0, 0.25, 0.5, 0.75, 1, 1.5, 2, 3];
export const FAVORABLE_K = [1, 2, 3, 4];

export type Zone = "infeasible" | "deep-red" | "red" | "amber" | "green" | "deep-green";

export interface FavorableCell {
  aov: number;
  n: number;
  k: number;
  pnl: PnlPoint;
  zone: Zone;
}

export interface FavorableSlice {
  k: number;
  cells: FavorableCell[];
}

export interface FavorableGrid {
  scaleOrders: number;
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
    const u = -t;
    return lerpRgb([246, 237, 232], [176, 58, 46], Math.pow(u, 0.7));
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

export function favorableGrid(
  params: Params,
  commercial: CommercialLevers,
  scaleOrders: number,
): FavorableGrid {
  const ratio =
    commercial.aov > 0 ? commercial.nonConsultAov / commercial.aov : 1;
  const minS = Math.ceil((scaleOrders / params.ddel) * params.peak / params.kapS);
  const maxS = Math.min(80, Math.max(28, minS + 8));

  const raw: Omit<FavorableCell, "zone">[] = [];
  for (const k of FAVORABLE_K) {
    for (const n of FAVORABLE_N) {
      for (const aov of FAVORABLE_AOV) {
        const network: Params = {
          ...params,
          D: scaleOrders,
          k,
          rho: rhoFromNonConsultsPerConsult(n),
        };
        const levers: CommercialLevers = {
          ...commercial,
          aov,
          nonConsultAov: Math.round(aov * ratio),
        };
        const pnl = solvePnl(commercialFromNetwork(network, levers), network, maxS);
        raw.push({ aov, n, k, pnl });
      }
    }
  }

  const pnls = raw.filter((c) => c.pnl.feasible && Number.isFinite(c.pnl.pnl)).map((c) => c.pnl.pnl);
  const maxAbs = pnls.length ? Math.max(...pnls.map((v) => Math.abs(v)), 1) : 1;
  const cells: FavorableCell[] = raw.map((c) => ({ ...c, zone: zoneOf(c.pnl, maxAbs) }));
  const slices: FavorableSlice[] = FAVORABLE_K.map((k) => ({
    k,
    cells: cells.filter((c) => c.k === k),
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

  return { scaleOrders, slices, maxAbs, best, greenShare };
}

export function cellAt(
  grid: FavorableGrid,
  aov: number,
  n: number,
  k: number,
): FavorableCell | null {
  const slice = grid.slices.find((s) => s.k === k);
  if (!slice) return null;
  return (
    slice.cells.find((c) => c.aov === aov && c.n === n) ??
    nearestCell(slice.cells, aov, n)
  );
}

function nearestCell(cells: FavorableCell[], aov: number, n: number): FavorableCell | null {
  if (!cells.length) return null;
  return cells.reduce((best, c) => {
    const d = Math.abs(c.aov - aov) + Math.abs(c.n - n) * 2000;
    const bd = Math.abs(best.aov - aov) + Math.abs(best.n - n) * 2000;
    return d < bd ? c : best;
  });
}

export function nearestGridAov(aov: number): number {
  return FAVORABLE_AOV.reduce((best, x) => (Math.abs(x - aov) < Math.abs(best - aov) ? x : best));
}

export function nearestGridN(n: number): number {
  return FAVORABLE_N.reduce((best, x) => (Math.abs(x - n) < Math.abs(best - n) ? x : best));
}

export function nearestGridK(k: number): number {
  const clamped = Math.min(4, Math.max(1, Math.round(k)));
  return FAVORABLE_K.includes(clamped) ? clamped : 1;
}

/** Lowest AOV that is profitable at this k, for some n. */
export function minProfitableAov(slice: FavorableSlice): number | null {
  const ok = slice.cells.filter((c) => c.pnl.feasible && c.pnl.pnl >= 0);
  if (!ok.length) return null;
  return Math.min(...ok.map((c) => c.aov));
}

/** Lowest n that is profitable at this k and AOV. */
export function minProfitableN(slice: FavorableSlice, aov: number): number | null {
  const a = nearestGridAov(aov);
  const ok = slice.cells.filter((c) => c.aov === a && c.pnl.feasible && c.pnl.pnl >= 0);
  if (!ok.length) return null;
  return Math.min(...ok.map((c) => c.n));
}
